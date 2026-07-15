/* Melodia stage character — hydrate Asset Passport + depth tilt + plate strip from site-plates.json. */
(function () {
  'use strict';

  const PASSPORT_URL = '../generated/passports/melusina_passport.json';
  const PASSPORT_HTML = '../generated/passports/melusina_passport.html';
  const PLATES_URL = '../content/site-plates.json';
  const COLOR_URL = '../generated/assets/character/melusina_diorama_beauty.png';
  const DEPTH_URL = '../generated/assets/character/melusina_beauty_depth_color.png';
  const INTAKE_URL = '../generated/blender_portfolio_intake.json';

  // Fallbacks until site-plates.json loads
  let BEAUTY_URL = '../generated/assets/character/melusina_beauty_eevee_20260715_01.png';
  let FULL_BEAUTY_URL = BEAUTY_URL;
  let HERO_BEAUTY = BEAUTY_URL;
  let HERO_FRONT = '../generated/assets/character/melusina_eevee_glam_20260715_02.png';
  let HERO_JEWELRY = '../generated/assets/character/melusina_eevee_glam_20260715_03.png';
  let HERO_SILHOUETTE = '../generated/assets/character/hero_20260712/melusina_hero_silhouette_silhouette.png';

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

  async function loadPlateSlots() {
    try {
      const data = await fetchJson(PLATES_URL);
      const s = data.slots || {};
      if (s['stage.beauty'] && s['stage.beauty'].path) {
        HERO_BEAUTY = s['stage.beauty'].path;
        BEAUTY_URL = HERO_BEAUTY;
        FULL_BEAUTY_URL = HERO_BEAUTY;
      }
      if (s['stage.front'] && s['stage.front'].path) HERO_FRONT = s['stage.front'].path;
      if (s['stage.jewelry'] && s['stage.jewelry'].path) HERO_JEWELRY = s['stage.jewelry'].path;
      if (s['stage.silhouette'] && s['stage.silhouette'].path) HERO_SILHOUETTE = s['stage.silhouette'].path;
      if (s['stage.diorama'] && s['stage.diorama'].path) {
        /* diorama used in strip */
      }
    } catch (_err) {
      /* keep fallbacks */
    }
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
    const color = root.querySelector('[data-depth-color]') || root.querySelector('img');
    if (color && color.tagName === 'IMG') color.src = DEPTH_URL;
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
    await loadPlateSlots();
    // No bangs card. Do not append solid mauve *_001 blanks.
    const heroPack = [
      { web_path: HERO_BEAUTY, title: 'Hero beauty · Nikki' },
      { web_path: HERO_FRONT, title: 'Front · Nikki' },
      { web_path: HERO_JEWELRY, title: 'Three-quarter · Jewelry' },
      { web_path: FULL_BEAUTY_URL, title: 'Beauty · Stage v7' },
      { web_path: HERO_SILHOUETTE, title: 'Silhouette' },
      { web_path: COLOR_URL, title: 'Diorama postcard' },
    ];
    let cards = heroPack;
    try {
      const intake = await fetchJson(INTAKE_URL);
      const mel = (intake.render_cards || []).filter(
        (c) => c.asset_id === 'melusina' || String(c.id || '').startsWith('melusina')
      );
      if (mel.length) {
        const seen = new Set(cards.map((c) => c.web_path));
        const deny = ['_001.png', 'mauve', '/hero_sim/', 'bangs', 'profile_bangs'];
        for (const c of mel) {
          const path = c.web_path;
          if (!path || seen.has(path)) continue;
          if (deny.some((d) => String(path).toLowerCase().includes(d))) continue;
          cards.push({ web_path: path, title: c.title || c.filename });
          seen.add(path);
          if (cards.length >= 8) break;
        }
      }
    } catch (_err) {
      /* use heroPack */
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
