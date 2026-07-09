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

  function detectPillar(card) {
    const blob = `${card.textContent || ''} ${card.querySelector('img')?.src || ''} ${card.querySelector('img')?.alt || ''}`.toLowerCase();
    if (/sakura|sakuradream|meadowbloom/.test(blob)) return 'sakura';
    if (/cathedral|celestial|spacecathedral|hoshi|nebula.*nasa/.test(blob)) return 'cathedral';
    if (/grotto|baroque|biogrotto|moss|castle/.test(blob)) return 'grotto';
    if (/orrery|cosmic|cosmicorrery|orbit/.test(blob)) return 'orrery';
    return null;
  }

  function applyPillarTag(el, pillar) {
    if (!pillar || el.dataset.pillar) return;
    el.dataset.pillar = pillar;
  }

  let gachaObserver = null;
  const gachaSeen = new WeakSet();

  function ensureGachaObserver() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches || !('IntersectionObserver' in window)) return;
    if (gachaObserver) return;
    gachaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.35) return;
          const card = entry.target;
          if (gachaSeen.has(card)) return;
          gachaSeen.add(card);
          card.classList.add('is-gacha-in');
          window.setTimeout(() => card.classList.remove('is-gacha-in'), 1600);
          gachaObserver.unobserve(card);
        });
      },
      { threshold: [0, 0.35, 0.6], rootMargin: '0px 0px -8% 0px' }
    );
  }

  function initHoloPlates() {
    const shell = document.querySelector('.melodia-shell');
    if (!shell) return;

    ensureGachaObserver();

    shell.querySelectorAll('.image-card').forEach((card) => {
      if (!card.querySelector('img') || card.classList.contains('holo-plate')) return;
      card.classList.add('holo-plate');
      const pillar = detectPillar(card);
      applyPillarTag(card, pillar);
      if (gachaObserver) gachaObserver.observe(card);
    });

    shell.querySelectorAll('.card.world-card-large').forEach((card) => {
      const pillar = detectPillar(card);
      applyPillarTag(card, pillar);
    });
  }

  function initWorldCardRims() {
    document.querySelectorAll('.melodia-shell .world-card').forEach((card) => {
      if (card.querySelector(':scope > .holo-rim')) return;
      const rim = document.createElement('span');
      rim.className = 'holo-rim';
      rim.setAttribute('aria-hidden', 'true');
      card.insertBefore(rim, card.firstChild);
      const pillarMap = { sakura: 'sakura', cathedral: 'cathedral', castle: 'grotto', grotto: 'orrery' };
      Object.keys(pillarMap).forEach((cls) => {
        if (card.classList.contains(cls)) applyPillarTag(card, pillarMap[cls]);
      });
      card.addEventListener(
        'pointerenter',
        () => {
          const shell = card.closest('.melodia-shell');
          if (shell && card.dataset.pillar) shell.dataset.pillar = card.dataset.pillar;
        },
        { passive: true }
      );
    });
  }

  function initScrollFresnel() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;
    const root = document.documentElement;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const p = (window.scrollY || 0) / max;
        const fresnel = 0.22 + p * 0.28 + Math.abs(0.5 - (parseFloat(root.style.getPropertyValue('--dream-mouse-x')) || 0.5)) * 0.12;
        root.style.setProperty('--dream-fresnel', fresnel.toFixed(3));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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
      const twoPi = 6.28318530718;
      const base = t * cycles;
      const r = 0.5 + 0.5 * Math.cos(twoPi * (base + 0.0));
      const g = 0.5 + 0.5 * Math.cos(twoPi * (base + 0.33));
      const b = 0.5 + 0.5 * Math.cos(twoPi * (base + 0.67));
      const mag = 0.5 + 0.5 * Math.cos(twoPi * (base + 0.12));
      return [
        r * 0.68 + mag * 0.26 + 0.12,
        g * 0.72 + 0.1,
        b * 0.7 + mag * 0.18 + 0.14,
      ];
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
      const count = 920;
      stars = new Array(count).fill(0).map(() => ({
        x: Math.random(),
        y: Math.random(),
        z: Math.pow(Math.random(), 1.35),
        size: Math.random() * 1.6 + 0.25,
        tw: Math.random() * Math.PI * 2,
        layer: Math.random() < 0.28 ? 'far' : Math.random() < 0.55 ? 'mid' : 'near',
      }));
    }

    function devinIridescence(fres) {
      const f2 = fres * fres;
      const mix = (a, b, t) => [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ];
      const c1 = [0, 0.8, 1];
      const c2 = [1, 0.9, 0.3];
      const c3 = [0.8, 0.4, 1];
      return mix(mix(c1, c2, fres), c3, f2);
    }

    function wavelengthToRgb(lambda) {
      let r = 0;
      let g = 0;
      let b = 0;
      if (lambda >= 380 && lambda < 440) {
        r = -(lambda - 440) / (440 - 380);
        b = 1;
      } else if (lambda < 490) {
        g = (lambda - 440) / (490 - 440);
        b = 1;
      } else if (lambda < 510) {
        g = 1;
        b = -(lambda - 510) / (510 - 490);
      } else if (lambda < 580) {
        r = (lambda - 510) / (580 - 510);
        g = 1;
      } else if (lambda < 645) {
        r = 1;
        g = -(lambda - 645) / (645 - 580);
      } else if (lambda <= 780) {
        r = -(lambda - 780) / (780 - 645);
      }
      const fade = lambda < 420 ? 0.35 + 0.65 * (lambda - 380) / 40 : lambda > 700 ? 0.35 + 0.65 * (780 - lambda) / 80 : 1;
      return [r * fade, g * fade, b * fade];
    }

    function thinFilmSample(thicknessNm, cosTheta) {
      const nFilm = 1.33;
      let r = 0;
      let g = 0;
      let b = 0;
      const steps = 14;
      for (let i = 0; i < steps; i++) {
        const lambda = 390 + (i / (steps - 1)) * 370;
        const phase = (4 * Math.PI * nFilm * thicknessNm * cosTheta) / lambda;
        const intensity = 0.5 + 0.5 * Math.cos(phase);
        const [lr, lg, lb] = wavelengthToRgb(lambda);
        r += lr * intensity;
        g += lg * intensity;
        b += lb * intensity;
      }
      const inv = 1 / steps;
      const fres = Math.max(0, Math.min(1, 0.28 + cosTheta * 0.55));
      const [dr, dg, db] = devinIridescence(fres);
      const bias = 0.42;
      return [
        (r * inv) * (1 - bias) + dr * bias,
        (g * inv) * (1 - bias) + dg * bias,
        (b * inv) * (1 - bias) + db * bias,
      ];
    }

    function drawThinFilmBands(t) {
      if (!ctx || !canvas) return;
      const time = t * 0.001;
      const cosTheta = 0.58 + mouseNY * 0.28 + Math.abs(mouseNX - 0.5) * 0.08;
      const bandCount = reduceMotion.matches ? 2 : 4;
      const intensityCap = 0.5;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let band = 0; band < bandCount; band++) {
        const thickness = 380 + band * 95 + Math.sin(time * 0.35 + band * 1.4) * 45;
        const [tr, tg, tb] = thinFilmSample(thickness, cosTheta);
        const alpha = (0.045 + band * 0.012) * intensityCap;
        const yCenter =
          h * (0.12 + band * 0.2) +
          Math.sin(time * 0.22 + band * 2.1) * (reduceMotion.matches ? 8 : 28) +
          (mouseNY - 0.5) * 40;
        const grad = ctx.createLinearGradient(0, yCenter - 120, w, yCenter + 120);
        grad.addColorStop(0, `rgba(${Math.round(tr * 255)},${Math.round(tg * 255)},${Math.round(tb * 255)},0)`);
        grad.addColorStop(0.42, `rgba(${Math.round(tr * 255)},${Math.round(tg * 255)},${Math.round(tb * 255)},${alpha})`);
        grad.addColorStop(0.58, `rgba(${Math.round(tr * 255)},${Math.round(tg * 255)},${Math.round(tb * 255)},${alpha * 1.1})`);
        grad.addColorStop(1, `rgba(${Math.round(tr * 255)},${Math.round(tg * 255)},${Math.round(tb * 255)},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, yCenter - 140, w, 280);
      }
      ctx.restore();
    }

    function drawWatercolorWash(t) {
      if (!ctx || !canvas || reduceMotion.matches) return;
      const time = t * 0.001;
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.filter = 'blur(28px)';

      const washes = [
        { cx: 0.22, cy: 0.18, r: 0.42, hue: [255, 110, 180], a: 0.09 },
        { cx: 0.78, cy: 0.28, r: 0.36, hue: [204, 153, 255], a: 0.08 },
        { cx: 0.52, cy: 0.72, r: 0.48, hue: [102, 217, 255], a: 0.07 },
        { cx: 0.12, cy: 0.62, r: 0.32, hue: [232, 80, 140], a: 0.065 },
      ];

      for (let i = 0; i < washes.length; i++) {
        const wash = washes[i];
        const driftX = Math.sin(time * 0.14 + i * 1.7) * wash.r * 0.04 * w;
        const driftY = Math.cos(time * 0.11 + i * 2.2) * h * 0.03;
        const cx = wash.cx * w + driftX + (mouseNX - 0.5) * 60;
        const cy = wash.cy * h + driftY + (mouseNY - 0.5) * 40;
        const rad = wash.r * Math.max(w, h);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const [hr, hg, hb] = wash.hue;
        grad.addColorStop(0, `rgba(${hr},${hg},${hb},${wash.a})`);
        grad.addColorStop(0.55, `rgba(${hr},${hg},${hb},${wash.a * 0.45})`);
        grad.addColorStop(1, `rgba(${hr},${hg},${hb},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.filter = 'none';
      ctx.restore();
    }

    function drawStarfield(t) {
      if (!ctx || !canvas) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      drawWatercolorWash(t);
      drawThinFilmBands(t);

      ctx.globalCompositeOperation = 'screen';

      const mx = mouseNX - 0.5;
      const my = mouseNY - 0.5;
      const scroll = window.scrollY || 0;
      const time = t * 0.001;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const depth = s.z;
        const parallax =
          s.layer === 'far' ? 0.35 : s.layer === 'mid' ? 0.72 : 1.15;
        const px = mx * 220 * depth * parallax;
        const py = my * 160 * depth * parallax + scroll * 0.035 * depth * parallax;

        const x = s.x * w + px;
        const y = s.y * h + py;

        if (x < -50 || x > w + 50 || y < -50 || y > h + 50) continue;

        const alphaWave = 0.5 + 0.5 * Math.sin(time * (0.7 + depth * 1.2) + s.tw);
        const layerAlpha = s.layer === 'far' ? 0.55 : s.layer === 'mid' ? 0.78 : 1;
        const alpha = (0.02 + depth * 0.22) * alphaWave * layerAlpha * 0.9;

        const cycles = 0.48 + depth * 1.05;
        const [pr, pg, pb] = iqPalette(time + depth * 0.4, cycles);
        const r = Math.round(255 * pr);
        const g = Math.round(255 * pg);
        const b = Math.round(255 * pb);

        const size = s.size * (0.5 + depth * 1.25) * (s.layer === 'near' ? 1.15 : 1);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        if (s.layer !== 'far') {
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.32})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
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

    const shellEl = document.querySelector('.melodia-shell');
    if (shellEl) {
      shellEl.dataset.dreamIntensity = reduceMotion.matches ? 'low' : 'standard';
      if (reduceMotion.matches) {
        shellEl.classList.add('dream-reduced');
      }
    }

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

    initHoloPlates();
    initWorldCardRims();
    initScrollFresnel();

    const shell = document.querySelector('.melodia-shell');
    if (shell && !shell.dataset.holoBound) {
      shell.dataset.holoBound = '1';
      shell.addEventListener(
        'pointermove',
        (event) => {
          const card = event.target.closest('.image-card.holo-plate, .world-card');
          if (!card) return;
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
          const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
          card.style.setProperty('--holo-x', x.toFixed(4));
          card.style.setProperty('--holo-y', y.toFixed(4));
        },
        { passive: true }
      );
    }

    if (typeof MutationObserver !== 'undefined' && shell) {
      let holoTimer = null;
      const mo = new MutationObserver(() => {
        window.clearTimeout(holoTimer);
        holoTimer = window.setTimeout(() => initHoloPlates(), 150);
      });
      mo.observe(shell, { childList: true, subtree: true });
    }
  }

  global.MelodiaDreamShaders = {
    init: initDreamShaders,
    mountDreamLayers,
    initHoloPlates,
    initWorldCardRims,
    detectPillar,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDreamShaders);
  } else {
    initDreamShaders();
  }
})(window);
