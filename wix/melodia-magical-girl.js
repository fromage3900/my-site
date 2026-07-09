/**
 * Melodia Magical Girl Layer — UI chrome accents (nav, cards, kickers).
 * Full wish overlays are opt-in via the bow toggle.
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

    shell.classList.add('mg-ui-chrome');

    const nav = shell.querySelector('.shell-nav');
    if (nav) nav.classList.add('mg-nav-chrome');

    const layer = document.createElement('div');
    layer.className = 'mg-layer is-hidden';
    layer.setAttribute('aria-hidden', 'true');

    layer.innerHTML = `
      <div class="mg-halftone" aria-hidden="true"></div>
      <div class="mg-wish-stage" aria-hidden="true">
        <div class="mg-contract-ring" aria-hidden="true">${contractRingSvg()}</div>
        <div class="mg-shards" aria-hidden="true">
          <div class="mg-shard s1"></div>
          <div class="mg-shard s2"></div>
          <div class="mg-shard s3"></div>
        </div>
      </div>
    `;

    shell.appendChild(layer);

    const toggle = document.createElement('button');
    toggle.className = 'mg-bow-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Toggle wish-mode UI accents');
    toggle.setAttribute('aria-pressed', 'false');
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

    let on = false;
    const root = document.documentElement;
    const apply = () => {
      toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) {
        layer.classList.remove('is-hidden');
        layer.classList.add('is-wish');
        shell.classList.add('mg-wish-mode');
        toggle.classList.add('is-wish');
        root.style.setProperty('--dream-sparkle-density', '1.18');
        root.style.setProperty('--dream-hue-shift', '6deg');
        if (global.MelodiaStarfield) global.MelodiaStarfield.setIntensity('cosmic');
      } else {
        layer.classList.add('is-hidden');
        layer.classList.remove('is-wish');
        shell.classList.remove('mg-wish-mode');
        toggle.classList.remove('is-wish');
        root.style.setProperty('--dream-sparkle-density', '0.88');
        root.style.setProperty('--dream-hue-shift', '0deg');
        if (global.MelodiaStarfield) {
          const heroType = shell.getAttribute('data-hero');
          global.MelodiaStarfield.setIntensity(heroType === 'cosmic' ? 'cosmic' : 'standard');
        }
      }
    };

    toggle.addEventListener('click', () => {
      on = !on;
      apply();
    });

    apply();

    document.querySelectorAll('.premium-card, .intake-card, .intake-signal, .portal-card').forEach((el) => {
      el.classList.add('mg-ribbon-card');
    });

    if (!prefersReducedMotion()) {
      const onMove = (e) => {
        const mx = (e.clientX / window.innerWidth - 0.5) * 14;
        const my = (e.clientY / window.innerHeight - 0.5) * 10;
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

})(window);
