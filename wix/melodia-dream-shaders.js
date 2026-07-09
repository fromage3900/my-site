/**
 * Melodia Dream Shaders — cursor-driven fresnel + ambient layer mount.
 * Maps mouse position to CSS vars for iridescent hero rims (web "shader" UX).
 */
(function (global) {
  'use strict';

  function mountDreamLayers() {
    document.querySelectorAll('.melodia-shell').forEach((shell) => {
      if (shell.querySelector(':scope > .dream-aurora-layer')) return;

      const canvas = document.createElement('canvas');
      canvas.className = 'dream-star-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      shell.insertBefore(canvas, shell.firstChild);

      const aurora = document.createElement('div');
      aurora.className = 'dream-aurora-layer';
      aurora.setAttribute('aria-hidden', 'true');

      const sparkle = document.createElement('div');
      sparkle.className = 'dream-sparkle-layer';
      sparkle.setAttribute('aria-hidden', 'true');

      shell.insertBefore(sparkle, shell.firstChild);
      shell.insertBefore(aurora, shell.firstChild);
    });
  }

  function initDreamShaders() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    mountDreamLayers();

    const root = document.documentElement;
    let ticking = false;
    let mouseNX = 0.42;
    let mouseNY = 0.38;

    // Iridescent parallax starfield (canvas) for the “dreamy magical” look.
    const shells = document.querySelectorAll('.melodia-shell');
    const canvas = shells.length ? shells[0].querySelector(':scope > .dream-star-canvas') : null;
    let ctx = null;
    let stars = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    function iqPalette(t, cycles) {
      // IQ cosine palette: 0.5 + 0.5*cos(2π*(t*cycles + phase)).
      // Phases map to RGB channels.
      const twoPi = 6.28318530718;
      const base = t * cycles;
      const r = 0.5 + 0.5 * Math.cos(twoPi * (base + 0.0));
      const g = 0.5 + 0.5 * Math.cos(twoPi * (base + 0.33));
      const b = 0.5 + 0.5 * Math.cos(twoPi * (base + 0.67));
      // Bias toward pastel-magical brightness (not full neon).
      return [r * 0.85 + 0.15, g * 0.85 + 0.15, b * 0.85 + 0.15];
    }

    function resizeStars() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx = canvas.getContext('2d', { alpha: true });

      // Regenerate stars so they match new dimensions.
      const count = 520;
      stars = new Array(count).fill(0).map(() => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(), // depth 0..1
        size: Math.random() * 1.4 + 0.35,
        tw: Math.random() * Math.PI * 2,
      }));
    }

    function drawStarfield(t) {
      if (!ctx || !canvas) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'screen';

      const mx = mouseNX - 0.5;
      const my = mouseNY - 0.5;
      const scroll = window.scrollY || 0;
      const time = t * 0.001;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const depth = s.z;
        const px = mx * 160 * depth;
        const py = my * 120 * depth + scroll * 0.02 * depth;

        const x = s.x * w + px;
        const y = s.y * h + py;

        if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue;

        const alphaWave = 0.55 + 0.45 * Math.sin(time * (0.8 + depth) + s.tw);
        const alpha = (0.03 + depth * 0.18) * alphaWave * 0.85;

        const cycles = 0.55 + depth * 0.95;
        const [pr, pg, pb] = iqPalette(time, cycles);
        const r = Math.round(255 * pr);
        const g = Math.round(255 * pg);
        const b = Math.round(255 * pb);

        const size = s.size * (0.65 + depth * 1.1);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Secondary glow disk (smaller alpha for dreamy bloom).
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(x, y, size * 2.1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    }

    function startStarfield() {
      if (!canvas) return;
      resizeStars();

      if (reduceMotion.matches) {
        drawStarfield(performance.now());
        return;
      }

      let raf = 0;
      const tick = (t) => {
        drawStarfield(t);
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
      window.addEventListener('resize', resizeStars, { passive: true });
    }

    const setVars = (x, y) => {
      const nx = Math.max(0, Math.min(1, x));
      const ny = Math.max(0, Math.min(1, y));
      root.style.setProperty('--dream-mouse-x', String(nx));
      root.style.setProperty('--dream-mouse-y', String(ny));
      mouseNX = nx;
      mouseNY = ny;
      const fresnel = 0.22 + (1 - ny) * 0.28 + Math.abs(nx - 0.5) * 0.2;
      root.style.setProperty('--dream-fresnel', fresnel.toFixed(3));
    };

    const onMove = (event) => {
      if (reduceMotion.matches) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVars(event.clientX / window.innerWidth, event.clientY / window.innerHeight);
          ticking = false;
        });
        ticking = true;
      }
    };

    setVars(0.42, 0.38);
    window.addEventListener('pointermove', onMove, { passive: true });
    startStarfield();

    if (!reduceMotion.matches) {
      let hue = 0;
      const driftHue = () => {
        hue = (hue + 0.15) % 360;
        root.style.setProperty('--dream-hue-shift', `${hue}deg`);
        window.requestAnimationFrame(driftHue);
      };
      window.requestAnimationFrame(driftHue);
    }
  }

  global.MelodiaDreamShaders = { init: initDreamShaders, mountDreamLayers };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDreamShaders);
  } else {
    initDreamShaders();
  }
})(window);
