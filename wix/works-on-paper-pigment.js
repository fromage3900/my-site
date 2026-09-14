/**
 * Pigment Memory — Works on Paper interactive renderer.
 *
 * RULE: never modify the artwork pixels. All sampling and rendering happens
 * around the source <img>: paper field, capillary aura, SVG brush-score,
 * pigment weather, audio, and a paintbrush constellation cursor.
 */
(function (global) {
  'use strict';

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.50776405003785 * Math.PI / 180;
  var SCALE = [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88];
  var DEFAULT_PALETTE = ['#78cfd8', '#d995b6', '#8f75bc', '#c8a46a', '#24192f'];

  var state = {
    palette: DEFAULT_PALETTE.slice(),
    previousPalette: null,
    activePiece: null,
    activeIndex: -1,
    paletteCache: new WeakMap(),
    paperCanvas: null,
    paperCtx: null,
    constellationCanvas: null,
    constellationCtx: null,
    brush: null,
    trail: [],
    burstPoints: [],
    pointer: { x: -100, y: -100, down: false, lastX: -100, lastY: -100 },
    audioEnabled: false,
    audioCtx: null,
    master: null,
    lastChordAt: -Infinity,
    paletteChanges: 0,
    pixi: null,
    pixiParticles: [],
    pixiReady: false,
    frame: 0,
    redrawQueued: false
  };

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function coarsePointer() {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function hexToRgb(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    if (!Number.isFinite(n)) return { r: 120, g: 207, b: 216 };
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    function ch(v) { return clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0'); }
    return '#' + ch(r) + ch(g) + ch(b);
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return { h: h * 360, s: s, l: l };
  }

  function colorDistance(a, b) {
    var ar = hexToRgb(a), br = hexToRgb(b);
    var dr = ar.r - br.r, dg = ar.g - br.g, db = ar.b - br.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function makeSamplingCanvas() {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(40, 40);
    var canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    return canvas;
  }

  function samplePalette(img) {
    if (!img || !img.complete || !img.naturalWidth) return Promise.resolve(DEFAULT_PALETTE.slice());
    if (state.paletteCache.has(img)) return Promise.resolve(state.paletteCache.get(img));

    return new Promise(function (resolve) {
      try {
        var canvas = makeSamplingCanvas();
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, 40, 40);
        ctx.drawImage(img, 0, 0, 40, 40);
        var data = ctx.getImageData(0, 0, 40, 40).data;
        var bins = new Map();

        for (var i = 0; i < data.length; i += 4) {
          var alpha = data[i + 3];
          if (alpha < 220) continue;
          var r = data[i], g = data[i + 1], b = data[i + 2];
          var max = Math.max(r, g, b), min = Math.min(r, g, b);
          if (max > 247 && min > 242) continue;
          if (max < 18) continue;
          var key = (r >> 5) + ':' + (g >> 5) + ':' + (b >> 5);
          var entry = bins.get(key);
          if (!entry) entry = { count: 0, r: 0, g: 0, b: 0 };
          entry.count++;
          entry.r += r; entry.g += g; entry.b += b;
          bins.set(key, entry);
        }

        var ranked = Array.from(bins.values()).sort(function (a, b) { return b.count - a.count; });
        var picked = [];
        for (var j = 0; j < ranked.length && picked.length < 5; j++) {
          var e = ranked[j];
          var c = rgbToHex(e.r / e.count, e.g / e.count, e.b / e.count);
          var farEnough = picked.every(function (existing) { return colorDistance(existing, c) > 46; });
          if (farEnough) picked.push(c);
        }

        while (picked.length < 5) picked.push(DEFAULT_PALETTE[picked.length]);
        state.paletteCache.set(img, picked);
        resolve(picked);
      } catch (err) {
        resolve(DEFAULT_PALETTE.slice());
      }
    });
  }

  function paletteToNotes(colors) {
    var used = {};
    return colors.slice(0, 4).map(function (hex, index) {
      var rgb = hexToRgb(hex);
      var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      var degree = Math.floor((hsl.h / 360) * SCALE.length) % SCALE.length;
      while (used[degree]) degree = (degree + 2) % SCALE.length;
      used[degree] = true;
      var octave = hsl.l > 0.68 ? 2 : hsl.l < 0.30 ? 0.5 : 1;
      return {
        frequency: SCALE[degree] * octave,
        saturation: hsl.s,
        lightness: hsl.l,
        degree: degree
      };
    });
  }

  function writePaletteMemory(colors) {
    try {
      sessionStorage.setItem('melodia-pigment-memory', JSON.stringify({
        colors: colors.slice(0, 5),
        time: Date.now()
      }));
    } catch (err) {}
  }

  function applyPalette(colors, piece) {
    state.previousPalette = state.palette.slice();
    state.palette = colors.slice();
    var root = document.documentElement;
    colors.forEach(function (color, i) {
      root.style.setProperty('--pigment-' + (i + 1), color);
    });
    root.style.setProperty('--pigment-dominant', colors[0]);
    root.style.setProperty('--pigment-secondary', colors[1]);
    root.style.setProperty('--pigment-accent', colors[2]);
    root.style.setProperty('--pigment-light', colors[3]);
    root.style.setProperty('--pigment-shadow', colors[4]);

    if (piece) {
      piece.setAttribute('data-pigment-active', 'true');
      Array.prototype.forEach.call(document.querySelectorAll('.art-piece[data-pigment-active="true"]'), function (other) {
        if (other !== piece) other.removeAttribute('data-pigment-active');
      });
    }

    updateAllScores(piece);
    updatePixiPalette();
    writePaletteMemory(colors);
    state.paletteChanges++;
    queuePaperRedraw();

    if (state.paletteChanges === 4) triggerWetChorus();
  }

  function mountPaperCanvas() {
    if (state.paperCanvas) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'pigment-paper-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    state.paperCanvas = canvas;
    state.paperCtx = canvas.getContext('2d');
    resizeCanvases();
  }

  function resizeOne(canvas) {
    if (!canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resizeCanvases() {
    resizeOne(state.paperCanvas);
    resizeOne(state.constellationCanvas);
    queuePaperRedraw();
  }

  function seeded(index, salt) {
    var x = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function drawPaperField() {
    state.redrawQueued = false;
    if (!state.paperCtx || !state.paperCanvas) return;
    var ctx = state.paperCtx;
    var w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    var dark = document.elementFromPoint(4, Math.min(h - 4, h * 0.5));
    var darkSection = dark && dark.closest && (dark.closest('.paper-gouache') || dark.closest('.paper-exit'));

    ctx.save();
    ctx.globalAlpha = darkSection ? 0.045 : 0.085;
    ctx.strokeStyle = darkSection ? 'rgba(255,248,235,.55)' : 'rgba(56,36,63,.42)';
    ctx.lineWidth = 0.55;
    for (var i = 0; i < 55; i++) {
      var y = seeded(i, 2) * h;
      var x = seeded(i, 9) * w;
      var len = 18 + seeded(i, 4) * 92;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + len * 0.45, y + (seeded(i, 7) - 0.5) * 8, x + len, y + (seeded(i, 8) - 0.5) * 5);
      ctx.stroke();
    }
    ctx.restore();

    if (!state.activePiece) return;
    var img = state.activePiece.querySelector('img');
    if (!img) return;
    var rect = img.getBoundingClientRect();
    if (rect.bottom < -60 || rect.top > h + 60) return;

    var colors = state.palette;
    ctx.save();
    ctx.globalCompositeOperation = darkSection ? 'screen' : 'multiply';
    for (var j = 0; j < 24; j++) {
      var edge = j % 4;
      var t = seeded(j, state.activeIndex + 2);
      var x2, y2;
      if (edge === 0) { x2 = rect.left - 10 - seeded(j, 3) * 25; y2 = rect.top + rect.height * t; }
      else if (edge === 1) { x2 = rect.right + 10 + seeded(j, 3) * 25; y2 = rect.top + rect.height * t; }
      else if (edge === 2) { x2 = rect.left + rect.width * t; y2 = rect.top - 10 - seeded(j, 3) * 20; }
      else { x2 = rect.left + rect.width * t; y2 = rect.bottom + 10 + seeded(j, 3) * 20; }

      var radius = 24 + seeded(j, 11) * 62;
      var grad = ctx.createRadialGradient(x2, y2, 0, x2, y2, radius);
      var color = colors[j % Math.min(colors.length, 4)];
      var rgb = hexToRgb(color);
      grad.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (darkSection ? 0.08 : 0.055) + ')');
      grad.addColorStop(0.42, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (darkSection ? 0.04 : 0.025) + ')');
      grad.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x2, y2, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function queuePaperRedraw() {
    if (state.redrawQueued) return;
    state.redrawQueued = true;
    window.requestAnimationFrame(drawPaperField);
  }

  function brushSvg() {
    return '<svg viewBox="0 0 52 52" aria-hidden="true">' +
      '<path class="pigment-brush-handle" d="M39 4 C42 3 47 7 46 10 L27 31 L21 25 Z"></path>' +
      '<path class="pigment-brush-ferrule" d="M19 24 L29 34 L24 39 L14 29 Z"></path>' +
      '<path class="pigment-brush-bristles" d="M14 29 C10 33 8 39 8 46 C15 45 21 43 24 39 Z"></path>' +
      '<circle class="pigment-brush-drop" cx="9" cy="45" r="2.1"></circle>' +
    '</svg>';
  }

  function mountBrushCursor() {
    if (state.brush) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'pigment-constellation-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    state.constellationCanvas = canvas;
    state.constellationCtx = canvas.getContext('2d');

    if (!coarsePointer()) {
      var brush = document.createElement('div');
      brush.className = 'pigment-brush-cursor';
      brush.setAttribute('aria-hidden', 'true');
      brush.innerHTML = brushSvg();
      document.body.appendChild(brush);
      state.brush = brush;
    }

    resizeCanvases();

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });

    if (!reducedMotion()) window.requestAnimationFrame(drawConstellations);
  }

  function pointerInArtwork(x, y) {
    var el = document.elementFromPoint(x, y);
    return !!(el && el.closest && el.closest('.art-piece, .art-viewer, button, a, input, summary'));
  }

  function onPointerMove(e) {
    state.pointer.x = e.clientX;
    state.pointer.y = e.clientY;
    if (state.brush) {
      state.brush.style.transform = 'translate3d(' + (e.clientX - 8) + 'px,' + (e.clientY - 42) + 'px,0) rotate(-18deg)';
      state.brush.classList.toggle('is-over-art', pointerInArtwork(e.clientX, e.clientY));
    }

    if (reducedMotion() || pointerInArtwork(e.clientX, e.clientY)) return;
    var dx = e.clientX - state.pointer.lastX;
    var dy = e.clientY - state.pointer.lastY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 21) return;

    state.pointer.lastX = e.clientX;
    state.pointer.lastY = e.clientY;
    state.trail.push({
      x: e.clientX,
      y: e.clientY,
      born: performance.now(),
      color: state.palette[state.trail.length % Math.max(1, state.palette.length)]
    });
    if (state.trail.length > 34) state.trail.shift();
  }

  function onPointerDown(e) {
    state.pointer.down = true;
    if (pointerInArtwork(e.clientX, e.clientY)) return;
    constellationBurst(e.clientX, e.clientY);
    if (state.audioEnabled) playBrushMotif();
  }

  function onPointerUp() {
    state.pointer.down = false;
  }

  function constellationBurst(x, y) {
    var now = performance.now();
    for (var i = 0; i < 13; i++) {
      var a = i * GOLDEN_ANGLE;
      var r = 8 + 4.8 * Math.sqrt(i) * PHI;
      state.burstPoints.push({
        x: x + Math.cos(a) * r,
        y: y + Math.sin(a) * r,
        born: now + i * 18,
        color: state.palette[i % state.palette.length],
        anchor: i === 0 || i === 5 || i === 8
      });
    }
  }

  function drawStar(ctx, x, y, radius, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      var r = i % 2 === 0 ? radius : radius * 0.28;
      var px = Math.cos(a) * r;
      var py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawConstellations(now) {
    if (!state.constellationCtx || !state.constellationCanvas) return;
    var ctx = state.constellationCtx;
    var w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    var life = 1618;
    state.trail = state.trail.filter(function (p) { return now - p.born < life; });
    state.burstPoints = state.burstPoints.filter(function (p) { return now - p.born < 2618; });

    ctx.save();
    ctx.lineWidth = 0.7;
    for (var i = 1; i < state.trail.length; i++) {
      var a = state.trail[i - 1], b = state.trail[i];
      var age = now - b.born;
      var alpha = clamp(1 - age / life, 0, 1) * 0.28;
      var dx = a.x - b.x, dy = a.y - b.y;
      if (Math.sqrt(dx * dx + dy * dy) > 86) continue;
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();

    state.trail.forEach(function (p, index) {
      var age = now - p.born;
      var alpha = clamp(1 - age / life, 0, 1) * 0.72;
      drawStar(ctx, p.x, p.y, index % 5 === 0 ? 3.5 : 2.1, p.color, alpha);
    });

    var bornBurst = state.burstPoints.filter(function (p) { return now >= p.born; });
    ctx.save();
    ctx.lineWidth = 0.65;
    for (var j = 1; j < bornBurst.length; j++) {
      var p1 = bornBurst[j - 1], p2 = bornBurst[j];
      var age2 = now - p2.born;
      var alpha2 = clamp(1 - age2 / 2618, 0, 1) * 0.32;
      ctx.strokeStyle = p2.color;
      ctx.globalAlpha = alpha2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();

    bornBurst.forEach(function (p) {
      var age = now - p.born;
      var alpha = clamp(1 - age / 2618, 0, 1) * 0.85;
      drawStar(ctx, p.x, p.y, p.anchor ? 4.2 : 2.4, p.color, alpha);
    });

    state.frame = window.requestAnimationFrame(drawConstellations);
  }

  function scoreSvg(colors) {
    var notes = paletteToNotes(colors);
    var paths = [
      'M4 16 C52 13 103 18 154 15 S256 14 316 17',
      'M4 26 C60 22 108 29 166 25 S262 24 316 27',
      'M4 36 C51 34 112 40 166 35 S268 33 316 37',
      'M4 46 C54 43 117 50 174 45 S269 43 316 47',
      'M4 56 C59 53 115 61 176 55 S266 54 316 57'
    ];
    var lineHtml = paths.map(function (d, i) {
      return '<path class="pigment-score-line l' + i + '" d="' + d + '"></path>';
    }).join('');
    var noteHtml = notes.map(function (note, i) {
      var x = 42 + i * 70;
      var y = 16 + (note.degree % 5) * 10;
      return '<g class="pigment-score-note n' + i + '" transform="translate(' + x + ' ' + y + ')">' +
        '<ellipse rx="4.2" ry="3.1" transform="rotate(-17)" style="fill:' + colors[i % colors.length] + '"></ellipse>' +
        '<path d="M3 0 L3 -15" style="stroke:' + colors[(i + 1) % colors.length] + '"></path>' +
      '</g>';
    }).join('');
    return '<svg viewBox="0 0 320 70" preserveAspectRatio="none" aria-hidden="true">' + lineHtml + noteHtml + '</svg>';
  }

  function mountPieceMarginalia(piece, palette) {
    var mark = piece.querySelector(':scope > .pigment-marginalia');
    if (!mark) {
      mark = document.createElement('div');
      mark.className = 'pigment-marginalia';
      mark.setAttribute('aria-hidden', 'true');
      piece.appendChild(mark);
    }
    mark.innerHTML =
      '<div class="pigment-swatches">' +
        palette.slice(0, 4).map(function (color) { return '<i style="--swatch:' + color + '"></i>'; }).join('') +
      '</div>' +
      '<div class="pigment-score">' + scoreSvg(palette) + '</div>' +
      '<span class="pigment-register-mark">✦ ' + (piece.classList.contains('documentary') ? 'ARTIFACT' : 'PLATE') + '</span>';
  }

  function updateAllScores(activePiece) {
    if (activePiece && state.paletteCache.has(activePiece.querySelector('img'))) {
      mountPieceMarginalia(activePiece, state.paletteCache.get(activePiece.querySelector('img')));
    }
  }

  function initPieceSampling() {
    var pieces = Array.prototype.slice.call(document.querySelectorAll('.art-piece'));
    pieces.forEach(function (piece) {
      var img = piece.querySelector('img');
      if (!img) return;
      function ready() {
        samplePalette(img).then(function (palette) {
          mountPieceMarginalia(piece, palette);
        });
      }
      if (img.complete) ready();
      else img.addEventListener('load', ready, { once: true });
    });

    if (!('IntersectionObserver' in window)) {
      if (pieces[0]) activatePiece(pieces[0], 0);
      return;
    }

    var ratios = new Map();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      var bestPiece = null, bestRatio = 0, bestIndex = -1;
      pieces.forEach(function (piece, index) {
        var ratio = ratios.get(piece) || 0;
        if (ratio > bestRatio) {
          bestPiece = piece; bestRatio = ratio; bestIndex = index;
        }
      });
      if (bestPiece && bestRatio >= 0.28 && bestPiece !== state.activePiece) {
        activatePiece(bestPiece, bestIndex);
      }
    }, { threshold: [0.18, 0.28, 0.42, 0.618, 0.82] });

    pieces.forEach(function (piece) { observer.observe(piece); });
  }

  function activatePiece(piece, index) {
    state.activePiece = piece;
    state.activeIndex = index;
    var img = piece.querySelector('img');
    samplePalette(img).then(function (palette) {
      applyPalette(palette, piece);
      if (state.audioEnabled && performance.now() - state.lastChordAt > 2618) {
        playPaletteChord(palette, true);
        state.lastChordAt = performance.now();
      }
    });
  }

  function ensureAudio() {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!state.audioCtx) {
      state.audioCtx = new AudioContext();
      state.master = state.audioCtx.createGain();
      state.master.gain.value = 0.075;
      var compressor = state.audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 22;
      compressor.ratio.value = 6;
      state.master.connect(compressor);
      compressor.connect(state.audioCtx.destination);
    }
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
    return state.audioCtx;
  }

  function playVoice(frequency, when, duration, brightness, gainValue) {
    var ctx = ensureAudio();
    if (!ctx || !state.master) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    var filter = ctx.createBiquadFilter();

    osc.type = brightness > 0.64 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(frequency, when);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900 + brightness * 3600, when);
    filter.Q.value = 0.65;

    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(gainValue, when + 0.055);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue * 0.45), when + duration * 0.618);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(state.master);
    osc.start(when);
    osc.stop(when + duration + 0.03);
  }

  function playPaletteChord(colors, quiet) {
    if (!state.audioEnabled) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var notes = paletteToNotes(colors || state.palette);
    var now = ctx.currentTime + 0.02;
    notes.slice(0, 3).forEach(function (note, index) {
      playVoice(note.frequency, now + index * 0.055, quiet ? 1.0 : PHI, note.saturation, quiet ? 0.12 : 0.2);
    });
  }

  function playBrushMotif() {
    if (!state.audioEnabled) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var notes = paletteToNotes(state.palette);
    var now = ctx.currentTime + 0.01;
    [0, 2, 1].forEach(function (idx, step) {
      var note = notes[idx % notes.length];
      playVoice(note.frequency * (step === 2 ? 2 : 1), now + step * 0.09, 0.48, note.saturation, 0.13);
    });
  }

  function mountControls() {
    if (document.querySelector('.pigment-controls')) return;
    var wrap = document.createElement('div');
    wrap.className = 'pigment-controls';
    wrap.innerHTML =
      '<button class="pigment-sound-toggle" type="button" aria-pressed="false">♪ wake pigment</button>' +
      '<button class="pigment-contact-toggle" type="button" aria-pressed="false">⌗ contact sheet</button>';
    document.body.appendChild(wrap);

    var sound = wrap.querySelector('.pigment-sound-toggle');
    var contact = wrap.querySelector('.pigment-contact-toggle');

    sound.addEventListener('click', function () {
      state.audioEnabled = !state.audioEnabled;
      sound.setAttribute('aria-pressed', state.audioEnabled ? 'true' : 'false');
      sound.textContent = state.audioEnabled ? '♪ pigment awake' : '♪ wake pigment';
      if (state.audioEnabled) {
        ensureAudio();
        playPaletteChord(state.palette, false);
      }
    });

    contact.addEventListener('click', function () {
      var on = !document.body.classList.contains('paper-contact-sheet');
      document.body.classList.toggle('paper-contact-sheet', on);
      contact.setAttribute('aria-pressed', on ? 'true' : 'false');
      contact.textContent = on ? '✕ exhibition view' : '⌗ contact sheet';
      queuePaperRedraw();
    });
  }

  function triggerWetChorus() {
    var seen = false;
    try { seen = sessionStorage.getItem('melodia-wet-chorus-seen') === '1'; } catch (err) {}
    if (seen || reducedMotion() || !state.previousPalette) return;
    try { sessionStorage.setItem('melodia-wet-chorus-seen', '1'); } catch (err2) {}

    var event = document.createElement('div');
    event.className = 'pigment-wet-chorus';
    event.setAttribute('aria-hidden', 'true');
    event.style.setProperty('--wet-a', state.previousPalette[0] || DEFAULT_PALETTE[0]);
    event.style.setProperty('--wet-b', state.palette[1] || DEFAULT_PALETTE[1]);
    event.innerHTML = '<span class="wet-bloom a"></span><span class="wet-bloom b"></span><span class="wet-seam"></span>';
    document.body.appendChild(event);

    if (state.audioEnabled) {
      playPaletteChord(state.previousPalette, true);
      window.setTimeout(function () { playPaletteChord(state.palette, true); }, 382);
    }

    window.setTimeout(function () {
      if (event.parentNode) event.parentNode.removeChild(event);
    }, 2800);
  }

  function canUsePixi() {
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return !reducedMotion() && !(connection && connection.saveData);
  }

  function loadScript(src, marker) {
    return new Promise(function (resolve, reject) {
      if (global[marker]) { resolve(global[marker]); return; }
      var existing = document.querySelector('script[data-pigment-lib="' + marker + '"]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(global[marker]); }, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.pigmentLib = marker;
      script.onload = function () { resolve(global[marker]); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function mountPixiWeather() {
    if (state.pixiReady || !canUsePixi()) return;
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/pixi.js@8.20.1/dist/pixi.min.js', 'PIXI');
      if (!global.PIXI) return;

      var app = new global.PIXI.Application();
      await app.init({
        backgroundAlpha: 0,
        resizeTo: window,
        antialias: false,
        preference: 'webgl',
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 1.5)
      });
      app.canvas.className = 'pigment-pixi-weather';
      app.canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(app.canvas);

      var dot = document.createElement('canvas');
      dot.width = 32; dot.height = 32;
      var dctx = dot.getContext('2d');
      var gradient = dctx.createRadialGradient(16, 16, 1, 16, 16, 14);
      gradient.addColorStop(0, 'rgba(255,255,255,.92)');
      gradient.addColorStop(0.45, 'rgba(255,255,255,.48)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      dctx.fillStyle = gradient;
      dctx.fillRect(0, 0, 32, 32);
      var texture = global.PIXI.Texture.from(dot);

      for (var i = 0; i < 28; i++) {
        var sprite = new global.PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.16 + Math.random() * 0.38);
        sprite.alpha = 0.07 + Math.random() * 0.16;
        sprite.x = Math.random() * window.innerWidth;
        sprite.y = Math.random() * window.innerHeight;
        sprite._vx = (Math.random() - 0.5) * 0.15;
        sprite._vy = -0.03 - Math.random() * 0.13;
        sprite._phase = Math.random() * Math.PI * 2;
        app.stage.addChild(sprite);
        state.pixiParticles.push(sprite);
      }

      app.ticker.add(function (ticker) {
        var dt = ticker.deltaTime;
        var rect = state.activePiece ? state.activePiece.getBoundingClientRect() : null;
        state.pixiParticles.forEach(function (p, index) {
          p._phase += 0.008 * dt;
          p.x += (p._vx + Math.sin(p._phase) * 0.035) * dt;
          p.y += p._vy * dt;

          if (rect && p.x > rect.left - 28 && p.x < rect.right + 28 && p.y > rect.top - 28 && p.y < rect.bottom + 28) {
            p.x += p.x < rect.left + rect.width * 0.5 ? -0.55 * dt : 0.55 * dt;
          }

          if (p.y < -24) { p.y = window.innerHeight + 24; p.x = Math.random() * window.innerWidth; }
          if (p.x < -24) p.x = window.innerWidth + 24;
          if (p.x > window.innerWidth + 24) p.x = -24;
          p.alpha = (0.07 + (index % 5) * 0.018) * (document.body.classList.contains('art-silence-active') ? 0.25 : 1);
        });
      });

      state.pixi = app;
      state.pixiReady = true;
      updatePixiPalette();
    } catch (err) {
      state.pixiReady = false;
    }
  }

  function updatePixiPalette() {
    if (!state.pixiReady || !state.pixiParticles.length) return;
    state.pixiParticles.forEach(function (p, index) {
      p.tint = parseInt(state.palette[index % state.palette.length].slice(1), 16);
    });
  }

  function boot() {
    if (!document.documentElement.matches('[data-page="works-on-paper"]')) return;
    document.documentElement.classList.add('pigment-memory-ready');
    mountPaperCanvas();
    mountBrushCursor();
    mountControls();
    initPieceSampling();

    window.addEventListener('resize', resizeCanvases, { passive: true });
    window.addEventListener('scroll', queuePaperRedraw, { passive: true });

    var wakePixi = function () {
      mountPixiWeather();
      window.removeEventListener('pointerdown', wakePixi);
      window.removeEventListener('keydown', wakePixi);
    };
    window.addEventListener('pointerdown', wakePixi, { passive: true });
    window.addEventListener('keydown', wakePixi, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.MelodiaPigmentMemory = {
    samplePalette: samplePalette,
    applyPalette: applyPalette,
    playPaletteChord: playPaletteChord,
    constellationBurst: constellationBurst,
    triggerWetChorus: triggerWetChorus,
    mountPixiWeather: mountPixiWeather
  };
})(window);
