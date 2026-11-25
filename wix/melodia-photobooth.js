/**
 * Melodia Melusina Photobooth — Infinity Nikki Photo-Spot Engine
 * Interactive lens zoom, filter LUT switching, pose selection, and snapshot burst.
 */
(function (global) {
  'use strict';

  var POSES = [
    { id: 'glam_c01', name: 'Glam Pose I', src: '../generated/assets/character/melusina_beauty_eevee_20260715c_01.png' },
    { id: 'glam_c02', name: 'Glam Pose II', src: '../generated/assets/character/melusina_eevee_glam_20260715c_02.png' },
    { id: 'three_quarter', name: '3/4 Jewelry', src: '../generated/assets/character/hero_20260712/melusina_hero_three_quarter_jewelry.png' },
    { id: 'flip_hair', name: 'Water Hair', src: '../generated/assets/character/melusina_flip_hair_eevee_glam_20260813_01.png' },
    { id: 'wireframe', name: 'Topology Mesh', src: '../generated/assets/character/melusina_34_wireframe_grey_20260715.png' }
  ];

  var FILTERS = [
    { id: 'normal', name: 'Original', class: 'filter-normal' },
    { id: 'sakura', name: 'Sakura Bloom', class: 'filter-sakura' },
    { id: 'moonlight', name: 'Fallen Moon', class: 'filter-moonlight' },
    { id: 'gilded', name: 'Gilded Atelier', class: 'filter-gilded' },
    { id: 'celestial', name: 'Celestial Orrery', class: 'filter-celestial' }
  ];

  var LENSES = [
    { id: 'wide', name: '24mm Wide', scale: 1 },
    { id: 'portrait', name: '50mm Prime', scale: 1.25 },
    { id: 'tele', name: '85mm Close-Up', scale: 1.6 }
  ];

  function init(containerSelector) {
    var root = document.querySelector(containerSelector || '#melusina-photobooth-mount');
    if (!root) return;

    var state = {
      currentPose: POSES[0],
      currentFilter: FILTERS[0],
      currentLens: LENSES[0],
      zoom: LENSES[0].scale,
      frame: 'gilded'
    };

    function render() {
      root.innerHTML = `
        <div class="photobooth-container">
          <div class="photobooth-viewport" id="photobooth-stage">
            <img class="photobooth-stage-image ${state.currentFilter.class}" 
                 id="photobooth-img" 
                 src="${state.currentPose.src}" 
                 alt="Melusina Photobooth — ${state.currentPose.name}" 
                 onerror="this.onerror=null; this.src='../generated/assets/character/melusina_beauty_eevee_20260715c_01.png';"
                 style="transform: scale(${state.zoom});" />
            
            <div class="photobooth-viewfinder" aria-hidden="true">
              <div class="photobooth-frame-corner top-left"></div>
              <div class="photobooth-frame-corner top-right"></div>
              <div class="photobooth-frame-corner bottom-left"></div>
              <div class="photobooth-frame-corner bottom-right"></div>
              <div class="photobooth-crosshair"></div>
            </div>
            <div class="photobooth-stickers-layer" id="photobooth-stickers" aria-hidden="true"></div>
          </div>

          <div class="photobooth-controls">
            <!-- Poses -->
            <div class="photobooth-toolbar">
              <div class="photobooth-group" role="group" aria-label="Pose Selection">
                <span class="photobooth-label">Pose:</span>
                ${POSES.map(p => `
                  <button type="button" class="photobooth-chip ${p.id === state.currentPose.id ? 'active' : ''}" 
                          data-pose="${p.id}"
                          aria-pressed="${p.id === state.currentPose.id ? 'true' : 'false'}">
                    ${p.name}
                  </button>
                `).join('')}
              </div>

              <!-- Lenses -->
              <div class="photobooth-group" role="group" aria-label="Focal Length Selection">
                <span class="photobooth-label">Focal Length:</span>
                ${LENSES.map(l => `
                  <button type="button" class="photobooth-chip ${l.id === state.currentLens.id ? 'active' : ''}" 
                          data-lens="${l.id}"
                          aria-pressed="${l.id === state.currentLens.id ? 'true' : 'false'}">
                    ${l.name}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Filters & Shutter -->
            <div class="photobooth-toolbar">
              <div class="photobooth-group" role="group" aria-label="Atmosphere LUT Selection">
                <span class="photobooth-label">Atmosphere:</span>
                ${FILTERS.map(f => `
                  <button type="button" class="photobooth-chip ${f.id === state.currentFilter.id ? 'active' : ''}" 
                          data-filter="${f.id}"
                          aria-pressed="${f.id === state.currentFilter.id ? 'true' : 'false'}">
                    ${f.name}
                  </button>
                `).join('')}
              </div>

              <button type="button" class="photobooth-shutter-btn" id="photobooth-shutter" aria-label="Create a PNG postcard from this portrait">
                <span>✦ Create Postcard</span>
              </button>
            </div>
            <div class="photobooth-toolbar">
              <div class="photobooth-group" role="group" aria-label="Postcard frame">
                <span class="photobooth-label">Frame:</span>
                <button type="button" class="photobooth-chip active" data-frame="gilded" aria-pressed="true">Gilded</button>
                <button type="button" class="photobooth-chip" data-frame="pearl" aria-pressed="false">Pearl</button>
                <button type="button" class="photobooth-chip" data-frame="plain" aria-pressed="false">Unframed</button>
              </div>
              <span id="photobooth-export-status" role="status" aria-live="polite">Compose a portrait, then create a postcard.</span>
              <a id="photobooth-download" class="photobooth-chip" hidden>Save PNG postcard</a>
            </div>
          </div>
        </div>
      `;

      bindEvents();
    }

    var exportURL = null;
    var exporting = false;

    function burst(stage) {
      if (!stage || (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
      var layer = stage.querySelector('#photobooth-stickers');
      if (!layer) return;
      layer.replaceChildren();
      for (var i = 0; i < 12; i++) {
        var mote = document.createElement('span');
        mote.className = 'photobooth-mote';
        mote.textContent = i % 3 === 0 ? '✧' : i % 3 === 1 ? '·' : '✦';
        var angle = i * Math.PI / 6;
        mote.style.setProperty('--mote-x', (Math.cos(angle) * (55 + i * 4)) + 'px');
        mote.style.setProperty('--mote-y', (Math.sin(angle) * (55 + i * 4)) + 'px');
        layer.appendChild(mote);
        setTimeout(function (node) { node.remove(); }, 780, mote);
      }
    }

    // Canvas filters are not universally implemented (including older Safari).
    // A pixel fallback reproduces the CSS colour operations in order.
    function applyFilterFallback(ctx, width, height, filter) {
      var data = ctx.getImageData(0, 0, width, height);
      var pixels = data.data;
      var ops = {
        normal: [1.02, 0, 1, 1.02, 0],
        sakura: [1.15, -12, 1.06, 1.04, 0],
        moonlight: [0.85, 18, 0.92, 1.12, 0],
        gilded: [1.22, 0, 1.02, 1.08, 0.24],
        celestial: [1.28, 45, 1, 1.15, 0]
      }[filter] || [1, 0, 1, 1, 0];
      var sat = ops[0], c = Math.cos(ops[1] * Math.PI / 180), h = Math.sin(ops[1] * Math.PI / 180);
      var hue = [.213+.787*c-.213*h,.715-.715*c-.715*h,.072-.072*c+.928*h,
        .213-.213*c+.143*h,.715+.285*c+.140*h,.072-.072*c-.283*h,
        .213-.213*c-.787*h,.715-.715*c+.715*h,.072+.928*c+.072*h];
      for (var i = 0; i < pixels.length; i += 4) {
        var r=pixels[i], g=pixels[i+1], b=pixels[i+2], k=ops[4];
        if (k) {
          var sr=.393*r+.769*g+.189*b, sg=.349*r+.686*g+.168*b, sb=.272*r+.534*g+.131*b;
          r=r+(sr-r)*k; g=g+(sg-g)*k; b=b+(sb-b)*k;
        }
        var l=.213*r+.715*g+.072*b;
        r=l+(r-l)*sat; g=l+(g-l)*sat; b=l+(b-l)*sat;
        var hr=hue[0]*r+hue[1]*g+hue[2]*b, hg=hue[3]*r+hue[4]*g+hue[5]*b, hb=hue[6]*r+hue[7]*g+hue[8]*b;
        pixels[i]=(hr*ops[2]-127.5)*ops[3]+127.5;
        pixels[i+1]=(hg*ops[2]-127.5)*ops[3]+127.5;
        pixels[i+2]=(hb*ops[2]-127.5)*ops[3]+127.5;
      }
      ctx.putImageData(data, 0, 0);
    }

    function createPostcard() {
      var stage = root.querySelector('#photobooth-stage');
      var img = root.querySelector('#photobooth-img');
      var status = root.querySelector('#photobooth-export-status');
      var link = root.querySelector('#photobooth-download');
      if (exporting) return;
      if (!img || !img.complete || !img.naturalWidth || img.src !== new URL(state.currentPose.src, document.baseURI).href) {
        status.textContent = 'Please select a portrait that has finished loading.'; return;
      }
      exporting = true;
      status.textContent = 'Creating your postcard…';
      try {
        var canvas = document.createElement('canvas');
        var ratio = stage.clientWidth / Math.max(1, stage.clientHeight);
        canvas.width = Math.round(1600 * Math.min(1, ratio));
        canvas.height = Math.round(1600 * Math.min(1, 1 / ratio));
        var w=canvas.width, h=canvas.height, ctx=canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');
        ctx.fillStyle = '#241723'; ctx.fillRect(0, 0, w, h);
        var scale=Math.min(w/img.naturalWidth,h/img.naturalHeight)*state.zoom;
        var dw=img.naturalWidth*scale, dh=img.naturalHeight*scale;
        var filter=getComputedStyle(img).filter;
        var nativeFilter='filter' in ctx;
        if (nativeFilter) ctx.filter=filter;
        ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);
        if (nativeFilter) ctx.filter='none';
        else applyFilterFallback(ctx,w,h,state.currentFilter.id);
        if (state.frame !== 'plain') {
          var inset=Math.max(14,Math.round(Math.min(w,h)*.025));
          ctx.strokeStyle=state.frame==='pearl'?'#f4dce8':'#e3c394';
          ctx.lineWidth=2; ctx.strokeRect(inset,inset,w-2*inset,h-2*inset);
          ctx.lineWidth=1; ctx.strokeRect(inset+6,inset+6,w-2*inset-12,h-2*inset-12);
          ctx.fillStyle=ctx.strokeStyle;
          [ [inset,inset],[w-inset,inset],[inset,h-inset],[w-inset,h-inset] ].forEach(function (point) {
            ctx.beginPath();ctx.moveTo(point[0],point[1]-7);ctx.lineTo(point[0]+7,point[1]);ctx.lineTo(point[0],point[1]+7);ctx.lineTo(point[0]-7,point[1]);ctx.closePath();ctx.fill();
          });
          ctx.font='italic '+Math.max(18,Math.round(Math.min(w,h)*.027))+'px Georgia';
          ctx.textAlign='center'; ctx.textBaseline='bottom';
          ctx.shadowColor='#241723';ctx.shadowBlur=5;
          ctx.fillText('Melodia · Portrait Atelier',w/2,h-inset-14);
        }
        var name='melodia-'+state.currentPose.id+'-'+state.currentFilter.id+'-'+state.frame+'.png';
        canvas.toBlob(function (blob) {
          exporting=false;
          if (!blob) { status.textContent='Postcard export unavailable in this browser.'; return; }
          if (exportURL) URL.revokeObjectURL(exportURL);
          exportURL=URL.createObjectURL(blob);
          link.href=exportURL; link.download=name; link.hidden=false;
          status.textContent='Postcard ready. Save the PNG below.';
        },'image/png');
      } catch (error) {
        exporting=false;
        status.textContent='Could not create postcard. Try another portrait or browser.';
      }
    }

    function bindEvents() {
      root.querySelectorAll('[data-pose]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-pose');
          state.currentPose = POSES.find(p => p.id === id) || state.currentPose;
          var img = root.querySelector('#photobooth-img');
          if (img) {
            img.src = state.currentPose.src;
            img.alt = 'Melusina Photobooth — ' + state.currentPose.name;
          }
          root.querySelectorAll('[data-pose]').forEach(function (b) {
            var active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
        });
      });

      root.querySelectorAll('[data-lens]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-lens');
          state.currentLens = LENSES.find(l => l.id === id) || state.currentLens;
          var img = root.querySelector('#photobooth-img');
          state.zoom = state.currentLens.scale;
          if (img) img.style.transform = 'scale(' + state.zoom + ')';
          root.querySelectorAll('[data-lens]').forEach(function (b) {
            var active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
        });
      });

      root.querySelectorAll('[data-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-filter');
          state.currentFilter = FILTERS.find(f => f.id === id) || state.currentFilter;
          var img = root.querySelector('#photobooth-img');
          if (img) {
            FILTERS.forEach(f => img.classList.remove(f.class));
            img.classList.add(state.currentFilter.class);
          }
          root.querySelectorAll('[data-filter]').forEach(function (b) {
            var active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
        });
      });

      root.querySelectorAll('[data-frame]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.frame = btn.getAttribute('data-frame');
          root.querySelectorAll('[data-frame]').forEach(function (b) {
            b.classList.toggle('active', b === btn);
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });
        });
      });

      var shutter = root.querySelector('#photobooth-shutter');
      if (shutter) {
        shutter.addEventListener('click', function () {
          var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          var stage = root.querySelector('#photobooth-stage');
          if (stage && !reduceMotion) {
            stage.style.transition = 'filter 0.05s ease';
            stage.style.filter = 'brightness(1.18)';
            setTimeout(function () {
              stage.style.transition = 'filter 0.4s ease';
              stage.style.filter = '';
            }, 120);
          } else if (stage && reduceMotion) {
            stage.style.transition = 'opacity 0.1s ease';
            stage.style.opacity = '0.82';
            setTimeout(function () {
              stage.style.transition = 'opacity 0.2s ease';
              stage.style.opacity = '';
            }, 120);
          }
          burst(stage);
          createPostcard();
        });
      }

      // Touch & Pointer Gesture Integration (Pinch-to-zoom & Tap Focus)
      var stageEl = root.querySelector('#photobooth-stage');
      if (stageEl) {
        var initialDist = 0;
        var initialScale = state.currentLens.scale;

        stageEl.addEventListener('touchstart', function (e) {
          if (e.touches.length === 2) {
            initialDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = state.zoom;
          }
        }, { passive: true });

        stageEl.addEventListener('touchmove', function (e) {
          if (e.touches.length === 2 && initialDist > 0) {
            var currentDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            var factor = currentDist / initialDist;
            var newScale = Math.max(1, Math.min(2.5, initialScale * factor));
            var img = root.querySelector('#photobooth-img');
            state.zoom = newScale;
            if (img) img.style.transform = 'scale(' + state.zoom.toFixed(2) + ')';
            if (e.cancelable) e.preventDefault();
          }
        }, { passive: false });

        var resetTouchGesture = function () {
          initialDist = 0;
        };
        stageEl.addEventListener('touchend', resetTouchGesture, { passive: true });
        stageEl.addEventListener('touchcancel', resetTouchGesture, { passive: true });

        stageEl.addEventListener('click', function (e) {
          if (e.target.closest('.photobooth-controls') || e.target.closest('.photobooth-stamp')) return;
          var rect = stageEl.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;
          var crosshair = stageEl.querySelector('.photobooth-crosshair');
          if (crosshair) {
            crosshair.style.left = x + 'px';
            crosshair.style.top = y + 'px';
            crosshair.style.transition = 'left 0.25s ease, top 0.25s ease';
          }
        });
      }
    }

    render();
  }

  global.MelodiaPhotobooth = { init: init, POSES: POSES, FILTERS: FILTERS, LENSES: LENSES };
})(window);
