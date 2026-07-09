/**
 * Melodia Magical Girl Layer — Madoka-adjacent contract aesthetic.
 * Soul gems, grief shards, contract rings; bow toggles wish density.
 */
(function (global) {
  'use strict';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function contractRingSvg() {
    const ticks = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const x1 = 210 + Math.cos(a) * 168;
      const y1 = 210 + Math.sin(a) * 168;
      const x2 = 210 + Math.cos(a) * 182;
      const y2 = 210 + Math.sin(a) * 182;
      return `<line class="tick" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
    }).join('');
    return `
      <svg viewBox="0 0 420 420" aria-hidden="true">
        <circle cx="210" cy="210" r="178" />
        <circle class="inner" cx="210" cy="210" r="132" />
        <circle class="inner" cx="210" cy="210" r="88" />
        ${ticks}
      </svg>
    `;
  }

  function mount(shell) {
    if (!shell || shell.querySelector(':scope > .mg-layer')) return;

    const layer = document.createElement('div');
    layer.className = 'mg-layer is-wish';
    layer.setAttribute('aria-hidden', 'true');

    layer.innerHTML = `
      <div class="mg-halftone" aria-hidden="true"></div>
      <div class="mg-contract-ring" aria-hidden="true">${contractRingSvg()}</div>
      <div class="mg-shards" aria-hidden="true">
        <div class="mg-shard s1"></div>
        <div class="mg-shard s2"></div>
        <div class="mg-shard s3"></div>
        <div class="mg-shard s4"></div>
      </div>
      <div class="mg-ribbon r1" aria-hidden="true">
        <svg viewBox="0 0 600 600" role="img" aria-hidden="true">
          <path class="rose" d="M70 220 C 160 110, 280 110, 380 190 C 470 260, 540 360, 520 460" />
          <path class="gold" d="M40 260 C 160 120, 300 140, 380 220 C 470 300, 540 390, 510 500" />
          <path class="cyan" d="M90 180 C 190 90, 320 110, 410 210 C 500 310, 560 400, 540 520" />
        </svg>
      </div>
      <div class="mg-ribbon r2" aria-hidden="true">
        <svg viewBox="0 0 600 600" role="img" aria-hidden="true">
          <path class="rose" d="M90 120 C 210 80, 340 110, 440 200 C 520 270, 560 360, 540 500" />
          <path class="gold" d="M60 160 C 220 90, 360 140, 450 240 C 520 320, 570 420, 520 540" />
          <path class="cyan" d="M120 90 C 250 60, 380 120, 470 220 C 540 300, 580 390, 540 560" />
        </svg>
      </div>
      <div class="mg-soul-gem g1" aria-hidden="true"></div>
      <div class="mg-soul-gem g2" aria-hidden="true"></div>
      <div class="mg-soul-gem g3" aria-hidden="true"></div>
      <div class="mg-crystal c1" aria-hidden="true"></div>
      <div class="mg-crystal c2" aria-hidden="true"></div>
    `;

    shell.appendChild(layer);

    const toggle = document.createElement('button');
    toggle.className = 'mg-bow-toggle is-wish';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Toggle wish-mode magical overlays');
    toggle.innerHTML = `
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <path class="bow-fill" d="M8 22 C 8 14, 16 10, 22 14 C 28 10, 36 14, 36 22 C 36 30, 28 34, 22 30 C 16 34, 8 30, 8 22 Z" />
        <path class="bow-fill" d="M14 22 C 10 20, 10 24, 14 22" opacity="0.5" />
        <path class="bow-fill" d="M30 22 C 34 20, 34 24, 30 22" opacity="0.5" />
        <circle class="bow-knot" cx="22" cy="22" r="2.8" />
        <path class="bow-fill" d="M22 19 L22 25" opacity="0.6" stroke-width="0.8" />
      </svg>
    `;

    document.body.appendChild(toggle);

    let on = true;
    const root = document.documentElement;
    const apply = () => {
      if (on) {
        layer.classList.remove('is-hidden');
        layer.classList.add('is-wish');
        shell.classList.add('mg-wish-mode');
        toggle.classList.add('is-wish');
        root.style.setProperty('--dream-sparkle-density', '1.25');
        root.style.setProperty('--dream-hue-shift', '8deg');
      } else {
        layer.classList.add('is-hidden');
        layer.classList.remove('is-wish');
        shell.classList.remove('mg-wish-mode');
        toggle.classList.remove('is-wish');
        root.style.setProperty('--dream-sparkle-density', '0.82');
        root.style.setProperty('--dream-hue-shift', '0deg');
      }
    };

    toggle.addEventListener('click', () => {
      on = !on;
      apply();
    });

    apply();

    document.querySelectorAll('.premium-card, .intake-card, .intake-signal').forEach((el) => {
      el.classList.add('mg-ribbon-card');
    });

    if (!prefersReducedMotion()) {
      let mx = 0;
      let my = 0;
      const onMove = (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 28;
        my = (e.clientY / window.innerHeight - 0.5) * 28;
        root.style.setProperty('--mouse-x', `${mx}px`);
        root.style.setProperty('--mouse-y', `${my}px`);
      };
      window.addEventListener('pointermove', onMove, { passive: true });
    }
  }

  function boot() {
    const shell = document.querySelector('.melodia-shell');
    if (!shell) return;
    mount(shell);
  }

  global.MelodiaMagicalGirl = { boot, mount };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
