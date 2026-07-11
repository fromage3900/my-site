/* Melodia stage character — hydrate Asset Passport + depth tilt from Blender pipeline. */
(function () {
  'use strict';

  const PASSPORT_URL = '../generated/passports/melusina_passport.json';
  const PASSPORT_HTML = '../generated/passports/melusina_passport.html';
  const COLOR_URL = '../generated/assets/character/melusina_diorama_beauty.png';
  const DEPTH_URL = '../generated/assets/character/melusina_beauty_depth_color.png';
  const BEAUTY_URL = '../generated/assets/character/melusina_beauty_34.png';
  const INTAKE_URL = '../generated/blender_portfolio_intake.json';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  }

  function renderPassportFallback(mount, passport) {
    const rows = Array.isArray(passport.rows) ? passport.rows : [];
    mount.innerHTML =
      `<div class="stage-passport-fallback passport-inline" role="group" aria-label="Asset Passport">` +
      `<div class="pp-head"><span>Asset Passport</span><span>${esc(passport.version || 'v1')}</span></div>` +
      `<div class="pp-title">${esc(passport.project || 'Melusina')}</div>` +
      `<div class="pp-cat">${esc(passport.category || '')}</div>` +
      rows
        .map(
          (r) =>
            `<div class="pp-row"><span>${esc(r[0])}</span><span>${esc(r[1])}</span></div>`
        )
        .join('') +
      `</div>`;
  }

  async function hydratePassport() {
    const mount = document.getElementById('stagePassportMount');
    if (!mount) return;
    try {
      const passport = await fetchJson(PASSPORT_URL);
      // Prefer iframe embed (design-system HTML); fallback to inline rows
      const iframe = document.createElement('iframe');
      iframe.src = PASSPORT_HTML;
      iframe.title = 'Melusina Asset Passport';
      iframe.loading = 'lazy';
      iframe.style.height = '520px';
      iframe.className = 'passport-inline';
      mount.innerHTML = '';
      mount.appendChild(iframe);
      iframe.addEventListener('error', () => renderPassportFallback(mount, passport));
    } catch (_err) {
      try {
        const intake = await fetchJson(INTAKE_URL);
        const card = (intake.render_cards || []).find((c) => c.passport && c.asset_id === 'melusina');
        if (card && card.passport) {
          renderPassportFallback(mount, card.passport);
          return;
        }
      } catch (_e2) {
        /* ignore */
      }
      mount.innerHTML = '<p class="body-copy">Passport not generated yet. Run Tools/melodia_asset_passport.py on the stage.</p>';
    }
  }

  function hydrateDepthTilt() {
    const root = document.getElementById('stageDepthTilt');
    if (!root) return;
    const color = root.querySelector('[data-stage-color]');
    const depth = root.querySelector('[data-stage-depth]');
    if (color) color.src = color.getAttribute('data-src') || COLOR_URL;
    if (depth) depth.src = depth.getAttribute('data-src') || DEPTH_URL;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    root.addEventListener(
      'pointermove',
      (event) => {
        const rect = root.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / Math.max(rect.width, 1);
        const ny = (event.clientY - rect.top) / Math.max(rect.height, 1);
        const x = (nx - 0.5) * 18;
        const y = (ny - 0.5) * 14;
        root.style.setProperty('--tilt-x', `${x.toFixed(2)}px`);
        root.style.setProperty('--tilt-y', `${y.toFixed(2)}px`);
      },
      { passive: true }
    );
    root.addEventListener(
      'pointerleave',
      () => {
        root.style.setProperty('--tilt-x', '0px');
        root.style.setProperty('--tilt-y', '0px');
      },
      { passive: true }
    );
  }

  async function hydratePlateStrip() {
    const mount = document.getElementById('stagePlateStrip');
    if (!mount) return;
    const fallback = [
      { web_path: BEAUTY_URL, title: 'Beauty 34' },
      { web_path: COLOR_URL, title: 'Diorama postcard' },
      { web_path: DEPTH_URL, title: 'Depth companion' },
    ];
    let cards = fallback;
    try {
      const intake = await fetchJson(INTAKE_URL);
      const mel = (intake.render_cards || []).filter(
        (c) => c.asset_id === 'melusina' || String(c.id || '').startsWith('melusina')
      );
      if (mel.length) {
        cards = mel.slice(0, 6).map((c) => ({
          web_path: c.web_path,
          title: c.title || c.filename,
        }));
      }
    } catch (_err) {
      /* use fallback */
    }
    mount.innerHTML = cards
      .map(
        (c) =>
          `<a class="holo-plate mg-ribbon-card" href="${esc(c.web_path)}"><img src="${esc(c.web_path)}" alt="${esc(c.title)}" loading="lazy" /><span class="meta-label">${esc(c.title)}</span></a>`
      )
      .join('');
    if (window.MelodiaDreamShaders && window.MelodiaDreamShaders.initHoloPlates) {
      window.MelodiaDreamShaders.initHoloPlates();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    hydratePassport();
    hydrateDepthTilt();
    hydratePlateStrip();
  });
})();
