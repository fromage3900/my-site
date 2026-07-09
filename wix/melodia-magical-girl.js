/**
 * Melodia Magical Girl Layer — bows/ribbons/crystals.
 * Editorial + subtle: click bow toggles extra magic density.
 */
(function (global) {
  'use strict';

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function mount(shell) {
    if (!shell || shell.querySelector(':scope > .mg-layer')) return;

    const layer = document.createElement('div');
    layer.className = 'mg-layer';
    layer.setAttribute('aria-hidden', 'true');

    layer.innerHTML = `
      <div class="mg-ribbon r1" aria-hidden="true">
        <svg viewBox="0 0 600 600" role="img" aria-hidden="true">
          <path d="M70 220 C 160 110, 280 110, 380 190 C 470 260, 540 360, 520 460" />
          <path class="gold" d="M40 260 C 160 120, 300 140, 380 220 C 470 300, 540 390, 510 500" />
          <path class="cyan" d="M90 180 C 190 90, 320 110, 410 210 C 500 310, 560 400, 540 520" />
        </svg>
      </div>
      <div class="mg-ribbon r2" aria-hidden="true">
        <svg viewBox="0 0 600 600" role="img" aria-hidden="true">
          <path d="M90 120 C 210 80, 340 110, 440 200 C 520 270, 560 360, 540 500" />
          <path class="gold" d="M60 160 C 220 90, 360 140, 450 240 C 520 320, 570 420, 520 540" />
          <path class="cyan" d="M120 90 C 250 60, 380 120, 470 220 C 540 300, 580 390, 540 560" />
        </svg>
      </div>
      <div class="mg-crystal c1" aria-hidden="true"></div>
      <div class="mg-crystal c2" aria-hidden="true"></div>
    `;

    shell.appendChild(layer);

    // Bow toggle (small, near nav).
    const toggle = document.createElement('button');
    toggle.className = 'mg-bow-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Toggle magical girl overlays');
    toggle.innerHTML = `
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <path d="M14 22 C 8 17, 8 27, 14 22 C 18 18, 20 20, 22 22 C 24 20, 26 18, 30 22 C 36 27, 36 17, 30 22" />
        <path d="M22 20 L22 24" opacity="0.7"/>
      </svg>
    `;

    document.body.appendChild(toggle);

    // State: “more magic” increases sparkle density and aurora opacity.
    let on = true;
    const root = document.documentElement;
    const apply = () => {
      if (on) {
        layer.classList.remove('is-hidden');
        root.style.setProperty('--dream-sparkle-density', '1.1');
      } else {
        layer.classList.add('is-hidden');
        root.style.setProperty('--dream-sparkle-density', '0.85');
      }
    };

    toggle.addEventListener('click', () => {
      on = !on;
      apply();
    });

    apply();

    if (!prefersReducedMotion()) {
      // Gentle “refraction” drift: crystal position follows pointer without being noisy.
      let mx = 0;
      let my = 0;
      const onMove = (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 28;
        my = (e.clientY / window.innerHeight - 0.5) * 28;
        // reuse existing vars so CSS stays consistent
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

