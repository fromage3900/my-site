/**
 * Pigment Memory — Works on Paper renderer.
 * Original artwork pixels remain untouched. All effects live around them.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(pointer:fine)');
  var state = {
    activePiece: null,
    activeImage: null,
    palette: ['#78cfd8','#d995b6','#8f75bc','#c8a46a','#291f33'],
    ctx: null,
    audioEnabled: false,
    lastNoteAt: 0,
    trail: [],
    wetChorusDone: false,
    pixiLoaded: false,
    pixiApp: null
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hexToRgb(hex) {
    var h = String(hex).replace('#','');
    if (h.length === 3) h = h.split('').map(function (x) { return x + x; }).join('');
    var n = parseInt(h,16);
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  }
  function rgbToHex(r,g,b) {
    return '#' + [r,g,b].map(function(v){ return clamp(Math.round(v),0,255).toString(16).padStart(2,'0'); }).join('');
  }
  function luminance(c) { return .2126*c.r + .7152*c.g + .0722*c.b; }
  function saturation(c) {
    var max = Math.max(c.r,c.g,c.b), min = Math.min(c.r,c.g,c.b);
    return max === 0 ? 0 : (max-min)/max;
  }

  function samplePalette(img) {
    if (!img) return Promise.resolve(state.palette.slice());
    if (!img.complete || !img.naturalWidth) {
      return new Promise(function (resolve) {
        var done = false;
        function finish() {
          if (done) return;
          done = true;
          img.removeEventListener('load', finish);
          img.removeEventListener('error', fail);
          samplePalette(img).then(resolve);
        }
        function fail() {
          if (done) return;
          done = true;
          img.removeEventListener('load', finish);
          img.removeEventListener('error', fail);
          resolve(state.palette.slice());
        }
        img.addEventListener('load', finish, { once: true });
        img.addEventListener('error', fail, { once: true });
      });
    }
    return new Promise(function (resolve) {
      try {
        var canvas = document.createElement('canvas');
        canvas.width = 40; canvas.height = 40;
        var ctx = canvas.getContext('2d', { willReadFrequently:true });
        ctx.drawImage(img,0,0,40,40);
        var data = ctx.getImageData(0,0,40,40).data;
        var buckets = new Map();

        for (var i=0;i<data.length;i+=4) {
          if (data[i+3] < 200) continue;
          var c = {r:data[i],g:data[i+1],b:data[i+2]};
          var l = luminance(c);
          if (l > 244 || l < 12) continue;
          var q = [c.r,c.g,c.b].map(function(v){ return Math.round(v/40)*40; });
          var key = q.join(',');
          var weight = 1 + saturation(c)*1.5;
          buckets.set(key,(buckets.get(key)||0)+weight);
        }

        var ranked = Array.from(buckets.entries()).sort(function(a,b){return b[1]-a[1];}).slice(0,14);
        var chosen = [];
        ranked.forEach(function(entry){
          var p = entry[0].split(',').map(Number);
          var c = {r:p[0],g:p[1],b:p[2]};
          var farEnough = chosen.every(function(x){
            var dx=x.r-c.r, dy=x.g-c.g, dz=x.b-c.b;
            return Math.sqrt(dx*dx+dy*dy+dz*dz) > 68;
          });
          if (farEnough && chosen.length < 5) chosen.push(c);
        });
        while (chosen.length < 5 && ranked[chosen.length]) {
          var p = ranked[chosen.length][0].split(',').map(Number);
          chosen.push({r:p[0],g:p[1],b:p[2]});
        }
        var palette = chosen.length ? chosen.map(function(c){return rgbToHex(c.r,c.g,c.b);}) : state.palette.slice();
        resolve(palette);
      } catch (e) {
        resolve(state.palette.slice());
      }
    });
  }

  function applyPalette(palette) {
    if (!palette || !palette.length) return;
    state.palette = palette.slice(0,5);
    while (state.palette.length < 5) state.palette.push(state.palette[state.palette.length-1] || '#8f75bc');
    root.style.setProperty('--pigment-1',state.palette[0]);
    root.style.setProperty('--pigment-2',state.palette[1]);
    root.style.setProperty('--pigment-3',state.palette[2]);
    root.style.setProperty('--pigment-4',state.palette[3]);
    root.style.setProperty('--pigment-5',state.palette[4]);
    var swatches = document.querySelectorAll('.pigment-swatch');
    swatches.forEach(function(s,i){ s.style.background = state.palette[i % state.palette.length]; });
    updateBrushScore();
    if (state.pixiLoaded) tintPixiWeather();
  }

  function activeMeta(piece) {
    var title = piece && piece.querySelector('figcaption span');
    var type = piece && piece.querySelector('figcaption small');
    return {
      title:title ? title.textContent.trim() : 'Untitled',
      type:type ? type.textContent.trim() : 'Artwork'
    };
  }

  function setActivePiece(piece) {
    if (!piece || piece === state.activePiece) return;
    var previousPalette = state.palette.slice();
    state.activePiece = piece;
    state.activeImage = piece.querySelector('img');
    document.querySelectorAll('.art-piece.is-pigment-active').forEach(function(p){p.classList.remove('is-pigment-active');});
    piece.classList.add('is-pigment-active');

    samplePalette(state.activeImage).then(function(palette){
      applyPalette(palette);
      drawCapillaryAura(piece);
      updateMarginalia(piece);
      if (state.audioEnabled) playPaintingChord(piece, true);
      maybeWetChorus(previousPalette,palette);
    });
  }

  function createFieldCanvas() {
    var canvas = document.createElement('canvas');
    canvas.className = 'pigment-field';
    canvas.setAttribute('aria-hidden','true');
    document.body.appendChild(canvas);
    state.ctx = canvas.getContext('2d');
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(innerWidth*dpr);
      canvas.height = Math.round(innerHeight*dpr);
      canvas.style.width = innerWidth+'px';
      canvas.style.height = innerHeight+'px';
      state.ctx.setTransform(dpr,0,0,dpr,0,0);
      drawPaperFibers();
      if (state.activePiece) drawCapillaryAura(state.activePiece);
    }
    resize();
    var redrawRaf = 0;
    function redrawActiveAura() {
      redrawRaf = 0;
      if (state.activePiece) drawCapillaryAura(state.activePiece);
      else drawPaperFibers();
    }
    function scheduleAuraRedraw() {
      if (redrawRaf) return;
      redrawRaf = window.requestAnimationFrame(redrawActiveAura);
    }
    window.addEventListener('resize',resize,{passive:true});
    window.addEventListener('scroll',scheduleAuraRedraw,{passive:true});
    return canvas;
  }

  function seeded(index) {
    var x = Math.sin(index*999.91+17.2)*43758.5453;
    return x-Math.floor(x);
  }

  function drawPaperFibers() {
    var ctx = state.ctx;
    if (!ctx) return;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    for (var i=0;i<150;i++) {
      var x=seeded(i*3)*innerWidth, y=seeded(i*3+1)*innerHeight;
      var len=8+seeded(i*3+2)*34;
      ctx.strokeStyle='rgba(120,100,126,'+(0.018+seeded(i+90)*0.022)+')';
      ctx.lineWidth=.5;
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x+len,y+(seeded(i+40)-.5)*4);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCapillaryAura(piece) {
    var ctx = state.ctx;
    if (!ctx || !piece) return;
    drawPaperFibers();
    var rect = piece.querySelector('img').getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    var colors = state.palette.map(hexToRgb);
    ctx.save();
    ctx.globalCompositeOperation='multiply';

    var spots = [
      [rect.left-20, clamp(rect.top+rect.height*.25,20,innerHeight-20), 120, rect.height*.34],
      [rect.right+18, clamp(rect.top+rect.height*.62,20,innerHeight-20), 150, rect.height*.42],
      [clamp(rect.left+rect.width*.28,20,innerWidth-20), rect.top-18, rect.width*.35, 100],
      [clamp(rect.left+rect.width*.72,20,innerWidth-20), rect.bottom+18, rect.width*.28, 110]
    ];

    spots.forEach(function(s,i){
      var c=colors[i%colors.length];
      var g=ctx.createRadialGradient(s[0],s[1],2,s[0],s[1],Math.max(s[2],s[3]));
      g.addColorStop(0,'rgba('+c.r+','+c.g+','+c.b+',.10)');
      g.addColorStop(.382,'rgba('+c.r+','+c.g+','+c.b+',.055)');
      g.addColorStop(1,'rgba('+c.r+','+c.g+','+c.b+',0)');
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.ellipse(s[0],s[1],Math.max(45,s[2]),Math.max(45,s[3]),(i-.5)*.18,0,Math.PI*2);
      ctx.fill();
    });
    ctx.restore();
  }

  function createBrushCursor() {
    var brush=document.createElement('div');
    brush.className='pigment-brush-cursor';
    brush.setAttribute('aria-hidden','true');
    brush.innerHTML='<span class="brush-handle"></span><span class="brush-ferrule"></span><span class="brush-bristles"></span>';
    document.body.appendChild(brush);
    if (!finePointer.matches || reduced.matches) return brush;

    body.classList.add('has-pigment-brush');
    var last={x:-100,y:-100,t:0};
    window.addEventListener('pointermove',function(e){
      if (body.classList.contains('art-viewer-open')) return;
      brush.style.translate=(e.clientX+8)+'px '+(e.clientY-19)+'px';
      brush.classList.add('is-visible');
      var now=performance.now();
      var dist=Math.hypot(e.clientX-last.x,e.clientY-last.y);
      if (dist>13 && now-last.t>28 && !e.target.closest('a,button,input,textarea,select,.art-piece img')) {
        addConstellationPoint(e.clientX,e.clientY, now);
        last={x:e.clientX,y:e.clientY,t:now};
      }
    },{passive:true});
    window.addEventListener('pointerleave',function(){brush.classList.remove('is-visible');});
    window.addEventListener('pointerdown',function(e){
      if (e.target.closest('a,button,input,textarea,select')) return;
      burstConstellation(e.clientX,e.clientY);
    },{passive:true});
    return brush;
  }

  function createConstellationCanvas() {
    var canvas=document.createElement('canvas');
    canvas.className='pigment-constellation-canvas';
    canvas.setAttribute('aria-hidden','true');
    document.body.appendChild(canvas);
    var ctx=canvas.getContext('2d');
    function resize(){
      var dpr=Math.min(devicePixelRatio||1,1.5);
      canvas.width=Math.round(innerWidth*dpr);
      canvas.height=Math.round(innerHeight*dpr);
      canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize();
    addEventListener('resize',resize,{passive:true});
    function frame(t){
      if (reduced.matches) {
        ctx.clearRect(0,0,innerWidth,innerHeight);
        return;
      }
      ctx.clearRect(0,0,innerWidth,innerHeight);
      state.trail = state.trail.filter(function(p){ return t-p.t < 2100; });
      for (var i=0;i<state.trail.length;i++) {
        var p=state.trail[i], age=clamp((t-p.t)/2100,0,1), alpha=(1-age)*.72;
        var rgb=hexToRgb(state.palette[p.c % state.palette.length]);
        ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+alpha+')';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(1-age*.35),0,Math.PI*2); ctx.fill();
        for (var j=Math.max(0,i-4);j<i;j++) {
          var q=state.trail[j];
          var d=Math.hypot(p.x-q.x,p.y-q.y);
          if (d<78) {
            ctx.strokeStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+(alpha*.22*(1-d/78))+')';
            ctx.lineWidth=.7;
            ctx.beginPath(); ctx.moveTo(q.x,q.y); ctx.lineTo(p.x,p.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return canvas;
  }

  function addConstellationPoint(x,y,t) {
    var idx=state.trail.length;
    state.trail.push({x:x,y:y,t:t,c:idx%state.palette.length,r:idx%8===0?3.1:1.6});
    if (state.trail.length>80) state.trail.splice(0,state.trail.length-80);
    if (state.audioEnabled && t-state.lastNoteAt>190 && idx%4===0) {
      state.lastNoteAt=t;
      playBrushNote(x,y);
    }
  }

  function burstConstellation(x,y) {
    var now=performance.now();
    var count=13;
    for (var i=0;i<count;i++) {
      var a=(Math.PI*2*i/count)+i*.22;
      var r=10+(i%5)*7;
      state.trail.push({x:x+Math.cos(a)*r,y:y+Math.sin(a)*r,t:now-i*16,c:i%state.palette.length,r:i%5===0?3.4:1.7});
    }
    if (state.audioEnabled) playBrushNote(x,y,true);
  }

  function createMarginalia() {
    var node=document.createElement('aside');
    node.className='pigment-marginalia';
    node.setAttribute('aria-hidden','true');
    node.innerHTML =
      '<div class="pigment-swatches">' +
      [0,1,2,3,4].map(function(i){return '<span class="pigment-swatch s'+i+'"></span>';}).join('') +
      '</div><span class="pigment-meta-title">Pigment memory</span><span class="pigment-meta-type">waiting for a painting</span>';
    document.body.appendChild(node);
    applyPalette(state.palette);
    return node;
  }

  function updateMarginalia(piece) {
    var meta=activeMeta(piece);
    var node=document.querySelector('.pigment-marginalia');
    if (!node) return;
    node.querySelector('.pigment-meta-title').textContent=meta.title;
    node.querySelector('.pigment-meta-type').textContent=meta.type;
  }

  function createBrushScore() {
    var node=document.createElement('div');
    node.className='pigment-brush-score';
    node.setAttribute('aria-hidden','true');
    node.innerHTML='<svg viewBox="0 0 360 86" preserveAspectRatio="none"><g class="pigment-score-lines"></g><g class="pigment-score-notes"></g></svg>';
    document.body.appendChild(node);
    updateBrushScore();
    return node;
  }

  function paletteToFrequencies() {
    var scale=[220,246.94,277.18,329.63,369.99,440,493.88];
    return state.palette.slice(0,4).map(function(hex,i){
      var c=hexToRgb(hex);
      var hue=Math.atan2(Math.sqrt(3)*(c.g-c.b),2*c.r-c.g-c.b);
      if (hue<0) hue+=Math.PI*2;
      var degree=Math.round((hue/(Math.PI*2))*(scale.length-1));
      var octave=luminance(c)>165?2:1;
      return scale[(degree+i)%scale.length]*octave;
    });
  }

  function updateBrushScore() {
    var rootScore=document.querySelector('.pigment-brush-score');
    if (!rootScore) return;
    var lines=rootScore.querySelector('.pigment-score-lines');
    var notes=rootScore.querySelector('.pigment-score-notes');
    lines.innerHTML='';
    notes.innerHTML='';
    for(var i=0;i<5;i++){
      var y=15+i*13;
      var path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d','M2 '+y+' C70 '+(y-3+i%2*4)+' 128 '+(y+3)+' 188 '+y+' S296 '+(y-2)+' 358 '+(y+(i%2?2:-1)));
      path.setAttribute('class','pigment-score-line line-'+i);
      lines.appendChild(path);
    }
    var freqs=paletteToFrequencies();
    freqs.forEach(function(f,i){
      var circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
      var x=54+i*76;
      var y=15+((Math.round(f/20)+i*2)%5)*13;
      circle.setAttribute('cx',x); circle.setAttribute('cy',y); circle.setAttribute('r',i===0?5:3.8);
      circle.setAttribute('fill',state.palette[i%state.palette.length]);
      circle.setAttribute('class','pigment-note');
      notes.appendChild(circle);
    });
  }

  function getAudio() {
    var Ctx=window.AudioContext||window.webkitAudioContext;
    if (!Ctx) return null;
    if (!state.ctxAudio) state.ctxAudio=new Ctx();
    if (state.ctxAudio.state==='suspended') state.ctxAudio.resume();
    return state.ctxAudio;
  }

  function setAudio(enabled) {
    state.audioEnabled=!!enabled;
    var b=document.querySelector('.pigment-sound-toggle');
    if (b) {
      b.setAttribute('aria-pressed',enabled?'true':'false');
      b.textContent=enabled?'♪ pigment awake':'♪ pigment asleep';
      b.classList.toggle('is-awake',enabled);
    }
    try{sessionStorage.setItem('pigment-memory-sound',enabled?'1':'0');}catch(e){}
    if (enabled) {
      getAudio();
      if (state.activePiece) playPaintingChord(state.activePiece,false);
    }
  }

  function playTone(freq, when, duration, gainValue, type) {
    var ctx=getAudio(); if(!ctx) return;
    var osc=ctx.createOscillator(), gain=ctx.createGain(), filter=ctx.createBiquadFilter();
    osc.type=type||'sine';
    osc.frequency.setValueAtTime(freq,when);
    filter.type='lowpass';
    filter.frequency.setValueAtTime(1400,when);
    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(gainValue,when+.045);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(when); osc.stop(when+duration+.04);
  }

  function playPaintingChord(piece, quiet) {
    if (!state.audioEnabled) return;
    var ctx=getAudio(); if(!ctx) return;
    var freqs=paletteToFrequencies(), now=ctx.currentTime;
    freqs.forEach(function(f,i){playTone(f,now+i*.031,quiet?1.1:1.618,quiet?.012:.022,i===1?'triangle':'sine');});
  }

  function playBrushNote(x,y,strong) {
    if (!state.audioEnabled) return;
    var ctx=getAudio(); if(!ctx) return;
    var freqs=paletteToFrequencies();
    var index=Math.floor(clamp(x/innerWidth,0,.999)*freqs.length);
    var f=freqs[index]*(y<innerHeight*.38?2:1);
    playTone(f,ctx.currentTime,strong?.42:.236,strong?.018:.008,'triangle');
  }

  function mountAudioToggle() {
    var b=document.createElement('button');
    b.type='button'; b.className='pigment-sound-toggle';
    b.setAttribute('aria-pressed','false');
    b.textContent='♪ pigment asleep';
    b.addEventListener('click',function(){setAudio(!state.audioEnabled);});
    document.body.appendChild(b);
    try{ if(sessionStorage.getItem('pigment-memory-sound')==='1') setAudio(true); }catch(e){}
  }

  function mountContactToggle() {
    var b=document.createElement('button');
    b.type='button'; b.className='pigment-contact-toggle';
    b.setAttribute('aria-pressed','false');
    b.textContent='⊞ contact sheet';
    b.addEventListener('click',function(){
      var on=body.classList.toggle('paper-contact-sheet');
      b.setAttribute('aria-pressed',on?'true':'false');
      b.textContent=on?'✦ exhibition view':'⊞ contact sheet';
    });
    document.body.appendChild(b);
  }

  function maybeWetChorus(previous,next) {
    if (reduced.matches || state.wetChorusDone || !previous || !next) return;
    try {
      if (sessionStorage.getItem('pigment-wet-chorus-seen') === '1') {
        state.wetChorusDone = true;
        return;
      }
    } catch (e) {}
    var visits=0;
    try{ visits=parseInt(sessionStorage.getItem('pigment-memory-transitions')||'0',10)||0; visits++; sessionStorage.setItem('pigment-memory-transitions',String(visits)); }catch(e){visits=1;}
    if (visits<3) return;
    state.wetChorusDone=true;
    try{sessionStorage.setItem('pigment-wet-chorus-seen','1');}catch(e){}

    var layer=document.createElement('div');
    layer.className='pigment-wet-chorus';
    layer.style.setProperty('--wet-a',previous[0]||'#78cfd8');
    layer.style.setProperty('--wet-b',next[0]||'#d995b6');
    layer.innerHTML='<span class="wet-pool a"></span><span class="wet-pool b"></span><span class="wet-seam"></span>';
    document.body.appendChild(layer);
    if (state.audioEnabled) {
      playPaintingChord(state.activePiece,true);
      window.setTimeout(function(){playBrushNote(innerWidth*.618,innerHeight*.382,true);},618);
    }
    window.setTimeout(function(){layer.remove();},2800);
  }

  function tryLoadPixi() {
    if (state.pixiLoaded || reduced.matches) return;
    state.pixiLoaded=true;
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/pixi.js@8.16.0/dist/pixi.min.js';
    s.async=true;
    s.onload=function(){ if(window.PIXI) startPixiWeather(); };
    s.onerror=function(){ state.pixiLoaded=false; };
    document.head.appendChild(s);
  }

  async function startPixiWeather() {
    if (!window.PIXI || state.pixiApp) return;
    try {
      var app=new PIXI.Application();
      await app.init({resizeTo:window,backgroundAlpha:0,antialias:true,preference:'webgl',autoDensity:true,resolution:Math.min(devicePixelRatio||1,1.5)});
      app.canvas.className='pigment-pixi-weather';
      app.canvas.setAttribute('aria-hidden','true');
      document.body.appendChild(app.canvas);
      state.pixiApp=app;
      var particles=[];
      for(var i=0;i<28;i++){
        var g=new PIXI.Graphics();
        var r=1.2+(i%5)*.6;
        g.circle(0,0,r).fill({color:parseInt(state.palette[i%state.palette.length].slice(1),16),alpha:.22});
        g.x=Math.random()*innerWidth; g.y=Math.random()*innerHeight;
        g.vx=(Math.random()-.5)*.12; g.vy=-.04-Math.random()*.1;
        app.stage.addChild(g); particles.push(g);
      }
      app.ticker.add(function(){
        particles.forEach(function(p){
          p.x+=p.vx; p.y+=p.vy;
          if(p.y<-12){p.y=innerHeight+12;p.x=Math.random()*innerWidth;}
          if(p.x<-12)p.x=innerWidth+12; if(p.x>innerWidth+12)p.x=-12;
        });
      });
      tintPixiWeather();
    } catch(e) {}
  }

  function tintPixiWeather() {
    if (!state.pixiApp) return;
    var children=state.pixiApp.stage.children;
    children.forEach(function(p,i){
      var hex=parseInt(state.palette[i%state.palette.length].slice(1),16);
      p.tint=hex;
    });
  }

  function observeArtwork() {
    var pieces=Array.prototype.slice.call(document.querySelectorAll('.art-piece'));
    if (!pieces.length) return;
    if (!('IntersectionObserver' in window)) { setActivePiece(pieces[0]); return; }

    var ratios=new Map();
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ ratios.set(entry.target,entry.isIntersecting?entry.intersectionRatio:0); });
      var best=null,bestRatio=.18;
      pieces.forEach(function(piece){
        var ratio=ratios.get(piece)||0;
        if(ratio>bestRatio){best=piece;bestRatio=ratio;}
      });
      if(best) setActivePiece(best);
    },{threshold:[.18,.32,.5,.68]});
    pieces.forEach(function(p){observer.observe(p);});
  }

  function rememberAcrossPages() {
    function save() {
      if (!state.palette || !state.palette.length) return;
      var meta=activeMeta(state.activePiece);
      try {
        sessionStorage.setItem('melodia-pigment-memory',JSON.stringify({
          color:state.palette[0], palette:state.palette, title:meta.title, at:Date.now()
        }));
      } catch(e){}
    }
    window.addEventListener('pagehide',save);
    document.addEventListener('click',function(e){
      var a=e.target.closest('a[href]');
      if(a) save();
    },true);
  }

  function boot() {
    if (!document.documentElement.matches('[data-page="works-on-paper"]')) return;
    createFieldCanvas();
    createConstellationCanvas();
    createBrushCursor();
    createMarginalia();
    createBrushScore();
    mountAudioToggle();
    mountContactToggle();
    observeArtwork();
    rememberAcrossPages();

    var engage=function(){ tryLoadPixi(); window.removeEventListener('pointerdown',engage); };
    window.addEventListener('pointerdown',engage,{passive:true});
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();

  window.PigmentMemory={
    samplePalette:samplePalette,
    setActivePiece:setActivePiece,
    playPaintingChord:playPaintingChord,
    burstConstellation:burstConstellation
  };
})();