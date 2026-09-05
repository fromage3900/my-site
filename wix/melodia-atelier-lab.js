/**
 * MELODIA ATELIER LAB & SUBSTRATE SHADER STUDIO
 * Real-time procedural Substrate Toon shader simulation, 4-world atmosphere particles,
 * interactive PCG scattering heatmap engine, TouchDesigner resonance synthesizer,
 * and 360-degree asset turntable inspection.
 */

(function (window, document) {
  'use strict';

  // --- Global State ---
  var state = {
    activeTab: 'shader-lab',
    shader: {
      preset: 'nikki-silk',
      toonHardness: 0.75,
      iridescence: 0.85,
      specularRings: 0.9,
      rimIntensity: 0.8,
      outlineWidth: 2.5,
      causticFreq: 3.2,
      lightAngleX: 0.45,
      lightAngleY: 0.65,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
      rotX: 0,
      rotY: 0
    },
    world: {
      activeId: 'sakura',
      bloom: 0.7,
      exposure: 1.0,
      lutColor: '#FFD6E0',
      particles: [],
      mousePos: { x: 0, y: 0, isHover: false }
    },
    pcg: {
      density: 450,
      seed: 1337,
      slopeFilter: 35,
      elevationMin: 10,
      activeLayer: 'petals',
      isPainting: false,
      heatmaps: [],
      instances: []
    },
    audio: {
      ctx: null,
      isPlaying: false,
      analyser: null,
      currentPad: null,
      simBands: [0.3, 0.5, 0.4, 0.6] // Sub, Mid, High, Silk
    },
    turntable: {
      viewMode: 'beauty',
      angle: 0,
      isAutoRotate: true,
      zoom: 1.0,
      isDragging: false,
      lastX: 0
    }
  };

  // --- Presets Data ---
  var SHADER_PRESETS = {
    'nikki-silk': {
      name: 'Nikki Hero Silk & Pearl',
      toonHardness: 0.65,
      iridescence: 0.95,
      specularRings: 0.85,
      rimIntensity: 0.9,
      outlineWidth: 2.0,
      causticFreq: 1.5,
      baseColor: [248, 236, 225],
      rimColor: [255, 220, 240]
    },
    'sakura-lacquer': {
      name: 'Sakura Lacquer & Gold',
      toonHardness: 0.85,
      iridescence: 0.4,
      specularRings: 0.95,
      rimIntensity: 0.7,
      outlineWidth: 2.8,
      causticFreq: 0.5,
      baseColor: [214, 169, 176],
      rimColor: [255, 235, 180]
    },
    'celestial-astral': {
      name: 'Celestial Astral Starlight',
      toonHardness: 0.45,
      iridescence: 1.0,
      specularRings: 0.7,
      rimIntensity: 1.0,
      outlineWidth: 1.5,
      causticFreq: 4.5,
      baseColor: [60, 92, 158],
      rimColor: [200, 220, 255]
    },
    'melusina-caustic': {
      name: 'Melusina Caustic Water',
      toonHardness: 0.55,
      iridescence: 0.9,
      specularRings: 0.95,
      rimIntensity: 0.85,
      outlineWidth: 1.8,
      causticFreq: 5.0,
      baseColor: [143, 201, 189],
      rimColor: [220, 255, 245]
    },
    'gothic-obsidian': {
      name: 'Gothic Obsidian & Rose SDF',
      toonHardness: 0.95,
      iridescence: 0.3,
      specularRings: 0.8,
      rimIntensity: 0.6,
      outlineWidth: 3.5,
      causticFreq: 0.8,
      baseColor: [46, 36, 56],
      rimColor: [232, 169, 161]
    }
  };

  var WORLDS_DATA = {
    'melusina': {
      name: 'Melusina Morning',
      tag: 'World 01 · L_MelusinaMorning',
      lut: '#E2F7F2',
      heroSrc: '../generated/assets/character/melusina_beauty_eevee_20260715c_01.png',
      particleType: 'dew',
      color: [160, 230, 215],
      ambientDesc: 'Morning coastal dew, lapis lazuli water caustics, and ivory ornamental filigree.'
    },
    'sakura': {
      name: 'Sakura Dream',
      tag: 'World 02 · L_SakuraDream',
      lut: '#FFD6E0',
      heroSrc: '../generated/assets/unreal/hero_l_wp_sakuradream_1920x1080.png',
      particleType: 'petal',
      color: [245, 180, 195],
      ambientDesc: 'Golden sunrise, warm lacquer architecture, and swirling cherry blossom petal vortex.'
    },
    'space-cathedral': {
      name: 'Kaleido Nave',
      tag: 'World 03 · L_KaleidoNave',
      lut: '#C9D6FF',
      heroSrc: '../generated/assets/nightshift/WP_SpaceCathedral_terrain.png',
      particleType: 'prism',
      color: [180, 200, 255],
      ambientDesc: 'Gothic sci-fi nave with iridescent rose window light prisms and stardust motes.'
    },
    'fallen-moon': {
      name: 'Fallen Moon',
      tag: 'World 04 · L_FallenMoon',
      lut: '#D8C6FF',
      heroSrc: '../generated/assets/unreal/level_fallen_moon.png',
      particleType: 'star',
      color: [210, 190, 255],
      ambientDesc: 'Astral midnight with deep space nebula veil and glowing constellation star trails.'
    }
  };

  // --- Initialize Application ---
  function init() {
    setupTabNavigation();
    initShaderLab();
    initWorldAtmosphere();
    initPcgScatter();
    initResonanceSynth();
    initTurntable();
    setupEventListeners();
  }

  // --- Tab Navigation System ---
  function setupTabNavigation() {
    var tabs = document.querySelectorAll('.atelier-tab-btn');
    var panels = document.querySelectorAll('.atelier-tab-panel');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var targetTab = tab.getAttribute('data-tab');
        state.activeTab = targetTab;

        tabs.forEach(function (t) {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });

        panels.forEach(function (panel) {
          var panelId = panel.getAttribute('id');
          panel.classList.toggle('active', panelId === 'panel-' + targetTab);
        });

        // Trigger canvas resize
        window.dispatchEvent(new Event('resize'));
      });
    });
  }

  // =========================================================================
  // 1. SUBSTRATE TOON SHADER LABORATORY
  // =========================================================================
  function initShaderLab() {
    var canvas = document.getElementById('canvas-shader-lab');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    function resizeCanvas() {
      var rect = canvas.parentElement.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse Drag for 3D Orbit
    var isDragging = false;
    var lastX = 0;
    var lastY = 0;

    canvas.parentElement.addEventListener('mousedown', function (e) {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      state.shader.rotY += dx * 0.008;
      state.shader.rotX += dy * 0.008;
      state.shader.rotX = Math.max(-1.2, Math.min(1.2, state.shader.rotX));
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener('mouseup', function () {
      isDragging = false;
    });

    // Touch support
    canvas.parentElement.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    });

    window.addEventListener('touchmove', function (e) {
      if (!isDragging || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - lastX;
      var dy = e.touches[0].clientY - lastY;
      state.shader.rotY += dx * 0.008;
      state.shader.rotX += dy * 0.008;
      state.shader.rotX = Math.max(-1.2, Math.min(1.2, state.shader.rotX));
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', function () {
      isDragging = false;
    });

    // Main Shader Render Loop
    var time = 0;
    function renderShader() {
      time += 0.02;
      var w = canvas.width / (window.devicePixelRatio || 1);
      var h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      var cx = w / 2;
      var cy = h / 2;
      var radius = Math.min(w, h) * 0.32;

      var preset = SHADER_PRESETS[state.shader.preset] || SHADER_PRESETS['nikki-silk'];

      // Ambient Space Background
      var bgGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 2.2);
      bgGrad.addColorStop(0, '#1C1426');
      bgGrad.addColorStop(1, '#0A0E22');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Light Vector
      var lx = Math.cos(state.shader.rotY + state.shader.lightAngleX) * Math.cos(state.shader.rotX);
      var ly = -Math.sin(state.shader.lightAngleY);
      var lz = Math.sin(state.shader.rotY + state.shader.lightAngleX) * Math.cos(state.shader.rotX);
      var lLen = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1;
      lx /= lLen; ly /= lLen; lz /= lLen;

      // 1. SDF Outline Layer (Outer Hull)
      var outlineW = state.shader.outlineWidth * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + outlineW, 0, Math.PI * 2);
      ctx.fillStyle = '#241B2E';
      ctx.fill();

      // 2. Base Sphere & Substrate Toon Shading
      var sphereGrad = ctx.createRadialGradient(
        cx + lx * radius * 0.5,
        cy + ly * radius * 0.5,
        radius * 0.1,
        cx,
        cy,
        radius
      );

      var baseR = preset.baseColor[0];
      var baseG = preset.baseColor[1];
      var baseB = preset.baseColor[2];

      // Toon stepped ramp colors
      var stepVal = state.shader.toonHardness;
      var litColor = 'rgb(' + Math.min(255, baseR + 30) + ',' + Math.min(255, baseG + 30) + ',' + Math.min(255, baseB + 30) + ')';
      var midColor = 'rgb(' + baseR + ',' + baseG + ',' + baseB + ')';
      var shadowColor = 'rgb(' + Math.floor(baseR * 0.45) + ',' + Math.floor(baseG * 0.45) + ',' + Math.floor(baseB * 0.55) + ')';

      sphereGrad.addColorStop(0, litColor);
      sphereGrad.addColorStop(stepVal * 0.6, midColor);
      sphereGrad.addColorStop(Math.min(0.99, stepVal * 0.85), shadowColor);
      sphereGrad.addColorStop(1, '#1C1426');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // 3. Thin-Film Iridescent Sheen Layer
      if (state.shader.iridescence > 0.05) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        var iriGrad = ctx.createLinearGradient(
          cx - radius, cy - radius,
          cx + radius, cy + radius
        );
        var phase = time * 0.8 + state.shader.rotY;
        iriGrad.addColorStop(0, 'rgba(232, 169, 161, ' + (0.35 * state.shader.iridescence) + ')');
        iriGrad.addColorStop(0.33, 'rgba(182, 166, 217, ' + (0.45 * state.shader.iridescence) + ')');
        iriGrad.addColorStop(0.66, 'rgba(143, 201, 189, ' + (0.4 * state.shader.iridescence) + ')');
        iriGrad.addColorStop(1, 'rgba(217, 165, 102, ' + (0.35 * state.shader.iridescence) + ')');

        ctx.fillStyle = iriGrad;
        ctx.fill();
        ctx.restore();
      }

      // 4. Anisotropic Specular Highlight Rings (Infinity Nikki / HoYoverse Style)
      if (state.shader.specularRings > 0.1) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        var specX = cx + lx * radius * 0.55;
        var specY = cy + ly * radius * 0.55;

        // Primary Gloss Ring
        ctx.beginPath();
        ctx.ellipse(specX, specY, radius * 0.28, radius * 0.09, state.shader.rotY + 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 248, 238, ' + (0.85 * state.shader.specularRings) + ')';
        ctx.fill();

        // Secondary Soft Aniso Ring
        ctx.beginPath();
        ctx.ellipse(specX + 8, specY + 12, radius * 0.42, radius * 0.06, state.shader.rotY + 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 230, 240, ' + (0.45 * state.shader.specularRings) + ')';
        ctx.fill();
        ctx.restore();
      }

      // 5. Water Caustic Ripples (Melusina shader pass)
      if (state.shader.causticFreq > 0.5) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.15 * (state.shader.causticFreq / 5)) + ')';
        ctx.lineWidth = 2;
        for (var i = 0; i < 4; i++) {
          ctx.beginPath();
          var waveOffset = Math.sin(time * 2 + i) * 12;
          ctx.arc(cx + waveOffset, cy + (i * 20) - 30, radius * 0.5 + (i * 10), 0, Math.PI);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 6. Anime Rim Light (Fresnel Glow)
      if (state.shader.rimIntensity > 0.05) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        var rimGrad = ctx.createRadialGradient(cx, cy, radius * 0.78, cx, cy, radius);
        var rimR = preset.rimColor[0];
        var rimG = preset.rimColor[1];
        var rimB = preset.rimColor[2];
        rimGrad.addColorStop(0, 'rgba(' + rimR + ',' + rimG + ',' + rimB + ', 0)');
        rimGrad.addColorStop(1, 'rgba(' + rimR + ',' + rimG + ',' + rimB + ', ' + (0.95 * state.shader.rimIntensity) + ')');

        ctx.fillStyle = rimGrad;
        ctx.fill();
        ctx.restore();
      }

      // Update Telemetry
      var elFrameTime = document.getElementById('telemetry-frametime');
      var elDrawCalls = document.getElementById('telemetry-drawcalls');
      var elTriangles = document.getElementById('telemetry-triangles');
      if (elFrameTime) elFrameTime.textContent = 'Interactive demo';
      if (elDrawCalls) elDrawCalls.textContent = 'Browser shader';
      if (elTriangles) elTriangles.textContent = 'Study mesh';

      requestAnimationFrame(renderShader);
    }
    renderShader();

    // Wire Shader Sliders
    setupShaderControls();
  }

  function setupShaderControls() {
    var chips = document.querySelectorAll('.atelier-preset-chip[data-preset]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var presetKey = chip.getAttribute('data-preset');
        applyShaderPreset(presetKey);
        chips.forEach(function (c) { c.classList.toggle('active', c === chip); });
      });
    });

    var sliderMap = [
      { id: 'slider-toon-hardness', prop: 'toonHardness', valId: 'val-toon-hardness', suffix: '' },
      { id: 'slider-iridescence', prop: 'iridescence', valId: 'val-iridescence', suffix: '' },
      { id: 'slider-specular', prop: 'specularRings', valId: 'val-specular', suffix: '' },
      { id: 'slider-rim', prop: 'rimIntensity', valId: 'val-rim', suffix: '' },
      { id: 'slider-outline', prop: 'outlineWidth', valId: 'val-outline', suffix: ' px' },
      { id: 'slider-caustic', prop: 'causticFreq', valId: 'val-caustic', suffix: 'x' }
    ];

    sliderMap.forEach(function (item) {
      var slider = document.getElementById(item.id);
      var valEl = document.getElementById(item.valId);
      if (!slider) return;
      slider.addEventListener('input', function () {
        var val = parseFloat(slider.value);
        state.shader[item.prop] = val;
        if (valEl) valEl.textContent = val.toFixed(1) + item.suffix;
      });
    });
  }

  function applyShaderPreset(key) {
    var p = SHADER_PRESETS[key];
    if (!p) return;
    state.shader.preset = key;
    state.shader.toonHardness = p.toonHardness;
    state.shader.iridescence = p.iridescence;
    state.shader.specularRings = p.specularRings;
    state.shader.rimIntensity = p.rimIntensity;
    state.shader.outlineWidth = p.outlineWidth;
    state.shader.causticFreq = p.causticFreq;

    // Update Slider UI
    setSliderVal('slider-toon-hardness', 'val-toon-hardness', p.toonHardness, '');
    setSliderVal('slider-iridescence', 'val-iridescence', p.iridescence, '');
    setSliderVal('slider-specular', 'val-specular', p.specularRings, '');
    setSliderVal('slider-rim', 'val-rim', p.rimIntensity, '');
    setSliderVal('slider-outline', 'val-outline', p.outlineWidth, ' px');
    setSliderVal('slider-caustic', 'val-caustic', p.causticFreq, 'x');
  }

  function setSliderVal(sliderId, valId, val, suffix) {
    var s = document.getElementById(sliderId);
    var v = document.getElementById(valId);
    if (s) s.value = val;
    if (v) v.textContent = val.toFixed(1) + suffix;
  }

  // =========================================================================
  // 2. 4-WORLD ATMOSPHERE & PARTICLE SYSTEM
  // =========================================================================
  function initWorldAtmosphere() {
    var canvas = document.getElementById('canvas-world-stage');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    function resizeWorldCanvas() {
      var rect = canvas.parentElement.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    resizeWorldCanvas();
    window.addEventListener('resize', resizeWorldCanvas);

    // Initialize 100 atmospheric particles
    var count = 90;
    state.world.particles = [];
    for (var i = 0; i < count; i++) {
      state.world.particles.push(createParticle(canvas));
    }

    // Mouse Interaction
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      state.world.mousePos.x = e.clientX - rect.left;
      state.world.mousePos.y = e.clientY - rect.top;
      state.world.mousePos.isHover = true;
    });

    canvas.addEventListener('mouseleave', function () {
      state.world.mousePos.isHover = false;
    });

    function renderWorld() {
      var w = canvas.width / (window.devicePixelRatio || 1);
      var h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      var world = WORLDS_DATA[state.world.activeId] || WORLDS_DATA['sakura'];

      // Background Sky Gradient
      var skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (state.world.activeId === 'sakura') {
        skyGrad.addColorStop(0, '#241B2E');
        skyGrad.addColorStop(0.6, '#463A54');
        skyGrad.addColorStop(1, '#D6A9B0');
      } else if (state.world.activeId === 'space-cathedral') {
        skyGrad.addColorStop(0, '#141A30');
        skyGrad.addColorStop(0.7, '#26365E');
        skyGrad.addColorStop(1, '#8AA9D6');
      } else if (state.world.activeId === 'melusina') {
        skyGrad.addColorStop(0, '#1C1426');
        skyGrad.addColorStop(0.6, '#3C5C9E');
        skyGrad.addColorStop(1, '#8FC9BD');
      } else {
        skyGrad.addColorStop(0, '#0A0E22');
        skyGrad.addColorStop(0.5, '#1C1426');
        skyGrad.addColorStop(1, '#6E5AA6');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Render & Update Particles
      state.world.particles.forEach(function (p) {
        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;

        // Mouse deflection vortex
        if (state.world.mousePos.isHover) {
          var dx = p.x - state.world.mousePos.x;
          var dy = p.y - state.world.mousePos.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 1) {
            p.x += (dx / dist) * 2.5;
            p.y += (dy / dist) * 2.5;
          }
        }

        // Boundary wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Render Particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        ctx.fillStyle = 'rgba(' + world.color[0] + ',' + world.color[1] + ',' + world.color[2] + ',' + p.alpha + ')';

        if (world.particleType === 'petal') {
          // Curved Sakura Petal
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.8, p.size * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (world.particleType === 'prism') {
          // Diamond Light Prism
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.5);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size * 1.5);
          ctx.lineTo(-p.size, 0);
          ctx.closePath();
          ctx.fill();
        } else if (world.particleType === 'dew') {
          // Shimmering Water Bubble
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,' + (p.alpha * 0.8) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // 4-Point Star
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.8);
          ctx.lineTo(p.size * 0.4, -p.size * 0.4);
          ctx.lineTo(p.size * 1.8, 0);
          ctx.lineTo(p.size * 0.4, p.size * 0.4);
          ctx.lineTo(0, p.size * 1.8);
          ctx.lineTo(-p.size * 0.4, p.size * 0.4);
          ctx.lineTo(-p.size * 1.8, 0);
          ctx.lineTo(-p.size * 0.4, -p.size * 0.4);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      // Post-Processing Bloom Vignette
      if (state.world.bloom > 0.05) {
        var vigGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.75);
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, 'rgba(10, 14, 34, 0.65)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, w, h);
      }

      requestAnimationFrame(renderWorld);
    }
    renderWorld();

    setupWorldSwitcher();
  }

  function createParticle(canvas) {
    var w = (canvas.width || 800) / (window.devicePixelRatio || 1);
    var h = (canvas.height || 500) / (window.devicePixelRatio || 1);
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.2) * 1.5,
      vy: 0.6 + Math.random() * 1.2,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.04,
      size: 3 + Math.random() * 5,
      alpha: 0.35 + Math.random() * 0.55
    };
  }

  function setupWorldSwitcher() {
    var cards = document.querySelectorAll('.atelier-world-card[data-world]');
    var descEl = document.getElementById('world-desc-text');

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var worldKey = card.getAttribute('data-world');
        state.world.activeId = worldKey;
        cards.forEach(function (c) { c.classList.toggle('active', c === card); });

        var data = WORLDS_DATA[worldKey];
        if (data && descEl) {
          descEl.textContent = data.ambientDesc;
        }
      });
    });
  }

  // =========================================================================
  // 3. PCG PROCEDURAL SCATTERING & BIOME DENSITY ENGINE
  // =========================================================================
  function initPcgScatter() {
    var canvas = document.getElementById('canvas-pcg-stage');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    function resizePcgCanvas() {
      var rect = canvas.parentElement.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      generatePcgScatter();
    }
    resizePcgCanvas();
    window.addEventListener('resize', resizePcgCanvas);

    function generatePcgScatter() {
      var w = canvas.width / (window.devicePixelRatio || 1);
      var h = canvas.height / (window.devicePixelRatio || 1);
      state.pcg.instances = [];

      var count = Math.floor(state.pcg.density * 1.2);
      var rng = seedRandom(state.pcg.seed);

      for (var i = 0; i < count; i++) {
        var x = rng() * w;
        var y = rng() * h;

        // Elevation and slope simulation
        var elevation = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 50 + 50;
        var slope = Math.abs(Math.cos(x * 0.015)) * 45;

        if (elevation >= state.pcg.elevationMin && slope <= state.pcg.slopeFilter) {
          state.pcg.instances.push({
            x: x,
            y: y,
            layer: state.pcg.activeLayer,
            scale: 0.6 + rng() * 0.8,
            rot: rng() * Math.PI * 2
          });
        }
      }

      // Update HUD count
      var countEl = document.getElementById('pcg-instance-count');
      if (countEl) countEl.textContent = state.pcg.instances.length + ' Sample Points';
    }

    function renderPcg() {
      var w = canvas.width / (window.devicePixelRatio || 1);
      var h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // Topographic Map Background
      ctx.fillStyle = '#141A30';
      ctx.fillRect(0, 0, w, h);

      // Draw Topographic Contour Lines
      ctx.strokeStyle = 'rgba(201, 168, 106, 0.15)';
      ctx.lineWidth = 1;
      for (var c = 0; c < 6; c++) {
        ctx.beginPath();
        for (var x = 0; x < w; x += 15) {
          var y = (h * 0.2 * c) + Math.sin(x * 0.02 + c) * 30;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Render Scatter Instances
      state.pcg.instances.forEach(function (inst) {
        ctx.save();
        ctx.translate(inst.x, inst.y);
        ctx.rotate(inst.rot);

        if (inst.layer === 'petals') {
          ctx.fillStyle = 'rgba(232, 169, 161, 0.85)';
          ctx.beginPath();
          ctx.ellipse(0, 0, 5 * inst.scale, 2.5 * inst.scale, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (inst.layer === 'lanterns') {
          ctx.fillStyle = 'rgba(201, 168, 106, 0.9)';
          ctx.fillRect(-3 * inst.scale, -4 * inst.scale, 6 * inst.scale, 8 * inst.scale);
          ctx.fillStyle = 'rgba(255, 235, 180, 0.8)';
          ctx.fillRect(-1.5 * inst.scale, -2 * inst.scale, 3 * inst.scale, 4 * inst.scale);
        } else if (inst.layer === 'crystals') {
          ctx.fillStyle = 'rgba(143, 201, 189, 0.85)';
          ctx.beginPath();
          ctx.moveTo(0, -6 * inst.scale);
          ctx.lineTo(3 * inst.scale, 4 * inst.scale);
          ctx.lineTo(-3 * inst.scale, 4 * inst.scale);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(182, 166, 217, 0.8)';
          ctx.beginPath();
          ctx.arc(0, 0, 3.5 * inst.scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      requestAnimationFrame(renderPcg);
    }
    renderPcg();

    // Wire PCG Sliders
    var sliderDensity = document.getElementById('slider-pcg-density');
    var valDensity = document.getElementById('val-pcg-density');
    if (sliderDensity) {
      sliderDensity.addEventListener('input', function () {
        state.pcg.density = parseInt(sliderDensity.value, 10);
        if (valDensity) valDensity.textContent = state.pcg.density + '/m²';
        generatePcgScatter();
      });
    }

    var sliderSlope = document.getElementById('slider-pcg-slope');
    var valSlope = document.getElementById('val-pcg-slope');
    if (sliderSlope) {
      sliderSlope.addEventListener('input', function () {
        state.pcg.slopeFilter = parseInt(sliderSlope.value, 10);
        if (valSlope) valSlope.textContent = state.pcg.slopeFilter + '°';
        generatePcgScatter();
      });
    }

    var btnRandomSeed = document.getElementById('btn-pcg-random-seed');
    if (btnRandomSeed) {
      btnRandomSeed.addEventListener('click', function () {
        state.pcg.seed = Math.floor(Math.random() * 99999);
        generatePcgScatter();
      });
    }

    var layerToggles = document.querySelectorAll('.atelier-toggle-btn[data-layer]');
    layerToggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var layerKey = btn.getAttribute('data-layer');
        state.pcg.activeLayer = layerKey;
        layerToggles.forEach(function (b) { b.classList.toggle('active', b === btn); });
        generatePcgScatter();
      });
    });
  }

  function seedRandom(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // =========================================================================
  // 4. TOUCHDESIGNER AUDIO RESONANCE SYNTHESIZER
  // =========================================================================
  function initResonanceSynth() {
    var canvas = document.getElementById('canvas-audio-stage');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    function resizeAudioCanvas() {
      var rect = canvas.parentElement.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    resizeAudioCanvas();
    window.addEventListener('resize', resizeAudioCanvas);

    var time = 0;
    function renderResonance() {
      time += 0.03;
      var w = canvas.width / (window.devicePixelRatio || 1);
      var h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      var cx = w / 2;
      var cy = h / 2;

      // Dark Cosmic Void Stage
      ctx.fillStyle = '#0A0E22';
      ctx.fillRect(0, 0, w, h);

      // Harmonic Lissajous Orrery Rings (Simulating 4-band TouchDesigner stream)
      var bands = state.audio.simBands;
      var subBass = bands[0];
      var midHarm = bands[1];
      var highShim = bands[2];
      var silkBreath = bands[3];

      // 1. Sub-Bass Ring (Golden Pulse)
      ctx.beginPath();
      var subRadius = 50 + subBass * 40 + Math.sin(time * 3) * 6;
      ctx.arc(cx, cy, subRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(201, 168, 106, ' + (0.4 + subBass * 0.5) + ')';
      ctx.lineWidth = 2 + subBass * 3;
      ctx.stroke();

      // 2. Mid-Harmony Astrolabe Rings (Lavender Orbitals)
      for (var r = 1; r <= 3; r++) {
        ctx.beginPath();
        var ringRadius = 70 + r * 35 * midHarm;
        ctx.ellipse(cx, cy, ringRadius, ringRadius * 0.45, time * 0.5 * (r % 2 === 0 ? 1 : -1), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(182, 166, 217, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 3. High-Shimmer Constellation Spikes (Sakura Pink)
      var spikeCount = 12;
      for (var s = 0; s < spikeCount; s++) {
        var angle = (s / spikeCount) * Math.PI * 2 + time * 0.2;
        var rLen = 130 + Math.sin(time * 5 + s) * 25 * highShim;
        var px = cx + Math.cos(angle) * rLen;
        var py = cy + Math.sin(angle) * rLen;

        ctx.beginPath();
        ctx.arc(px, py, 3 + highShim * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232, 169, 161, 0.85)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = 'rgba(232, 169, 161, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Decay synth bands
      bands[0] = Math.max(0.2, bands[0] * 0.95);
      bands[1] = Math.max(0.3, bands[1] * 0.96);
      bands[2] = Math.max(0.25, bands[2] * 0.95);
      bands[3] = Math.max(0.3, bands[3] * 0.97);

      requestAnimationFrame(renderResonance);
    }
    renderResonance();

    setupSynthPads();
  }

  function setupSynthPads() {
    var pads = document.querySelectorAll('.atelier-audio-pad-btn[data-chord]');
    var notesMap = {
      'sakura-arpeggio': [523.25, 659.25, 783.99, 1046.5], // C Major Pentatonic
      'cathedral-choir': [329.63, 392.00, 493.88, 659.25], // E Minor
      'melusina-dew': [440.00, 554.37, 659.25, 880.00],    // A Major
      'astral-fanfare': [261.63, 392.00, 523.25, 783.99]    // C Power / Astral
    };

    pads.forEach(function (pad) {
      pad.addEventListener('click', function () {
        var chordKey = pad.getAttribute('data-chord');
        playSynthChord(notesMap[chordKey]);

        // Visual trigger
        pad.classList.add('playing');
        setTimeout(function () { pad.classList.remove('playing'); }, 400);

        // Boost simulated bands
        state.audio.simBands[0] = 0.95;
        state.audio.simBands[1] = 0.85;
        state.audio.simBands[2] = 0.9;
        state.audio.simBands[3] = 0.8;
      });
    });
  }

  function playSynthChord(freqs) {
    if (!freqs) return;
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!state.audio.ctx) {
        state.audio.ctx = new AudioContext();
      }
      if (state.audio.ctx.state === 'suspended') {
        state.audio.ctx.resume();
      }

      var ctx = state.audio.ctx;
      var now = ctx.currentTime;

      freqs.forEach(function (freq, index) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = index % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 1.3);
      });
    } catch (e) {
      // Audio context fallback
    }
  }

  // =========================================================================
  // 5. REAL-TIME 3D WEBGL ASSET & WARDROBE TURNTABLE
  // =========================================================================
  var viewer3DInstance = null;

  function initTurntable() {
    var container = document.getElementById('canvas-turntable-stage');
    if (!container) return;

    if (window.Melodia3DViewer && !viewer3DInstance) {
      viewer3DInstance = new window.Melodia3DViewer('canvas-turntable-stage', {
        initialAsset: 'fabric-sphere',
        initialFabric: 'RoyalVelvet',
        initialMode: 'pbr',
        autoRotate: true
      });
    }

    setupTurntableControls();
  }

  function setupTurntableControls() {
    // 3D Asset Switcher
    var assetChips = document.querySelectorAll('.atelier-preset-chip[data-turntable-asset]');
    assetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var assetKey = chip.getAttribute('data-turntable-asset');
        if (viewer3DInstance) viewer3DInstance.loadAsset(assetKey);
        assetChips.forEach(function (c) { c.classList.toggle('active', c === chip); });
      });
    });

    // Shading Mode Switcher
    var modeChips = document.querySelectorAll('.atelier-preset-chip[data-turntable-mode]');
    modeChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var modeKey = chip.getAttribute('data-turntable-mode');
        if (viewer3DInstance) viewer3DInstance.setRenderMode(modeKey);
        modeChips.forEach(function (c) { c.classList.toggle('active', c === chip); });
      });
    });

    // Fabric Switcher
    var fabricChips = document.querySelectorAll('.atelier-preset-chip[data-turntable-fabric]');
    fabricChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var fabricKey = chip.getAttribute('data-turntable-fabric');
        if (viewer3DInstance) viewer3DInstance.setFabric(fabricKey);
        fabricChips.forEach(function (c) { c.classList.toggle('active', c === chip); });
      });
    });

    // Auto-Rotate Button
    var btnAutoRotate = document.getElementById('btn-turntable-autorotate');
    var rotStatus = document.getElementById('turntable-3d-rot-status');
    if (btnAutoRotate) {
      btnAutoRotate.addEventListener('click', function () {
        if (viewer3DInstance) {
          viewer3DInstance.isAutoRotate = !viewer3DInstance.isAutoRotate;
          if (rotStatus) rotStatus.textContent = 'Orbit: ' + (viewer3DInstance.isAutoRotate ? 'Active' : 'Paused');
          btnAutoRotate.classList.toggle('active', viewer3DInstance.isAutoRotate);
        }
      });
    }
  }

  function setupEventListeners() {
    // Global keyboard hotkeys
    window.addEventListener('keydown', function (e) {
      if (e.key === '1') switchTabDirect('shader-lab');
      if (e.key === '2') switchTabDirect('world-stage');
      if (e.key === '3') switchTabDirect('pcg-engine');
      if (e.key === '4') switchTabDirect('audio-resonance');
      if (e.key === '5') switchTabDirect('turntable-studio');
    });
  }

  function switchTabDirect(tabId) {
    var tabBtn = document.querySelector('.atelier-tab-btn[data-tab="' + tabId + '"]');
    if (tabBtn) tabBtn.click();
  }

  // --- Bootstrap on DOM Ready ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
