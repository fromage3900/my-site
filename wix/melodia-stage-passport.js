/* Melodia stage character — hydrate Asset Passport + depth tilt + plate strip from site-plates.json. */
(function () {
  'use strict';

  const PASSPORT_URL = '../generated/passports/melusina_passport.json';
  const PASSPORT_HTML = '../generated/passports/melusina_passport.html';
  const PLATES_URL = '../content/site-plates.json';
  const LOOPS_URL = '../generated/character_loops_manifest.json';
  const DEPTH_URL = '../generated/assets/character/melusina_beauty_depth_color.png';
  const INTAKE_URL = '../generated/blender_portfolio_intake.json';

  // Fallbacks until site-plates.json loads
  let BEAUTY_URL = '../generated/assets/character/melusina_beauty_eevee_20260715c_01.png';
  let HERO_BEAUTY = BEAUTY_URL;
  let HERO_FRONT = '../generated/assets/character/melusina_eevee_glam_20260715c_02.png';
  let HERO_WIRE_FRONT = '../generated/assets/character/melusina_front_wireframe_grey_20260715.png';
  let HERO_WIRE_34 = '../generated/assets/character/melusina_34_wireframe_grey_20260715.png';
  let HERO_GLAM_CLOSE = '../generated/assets/character/melusina_eevee_glam_20260715c_04.png';
  let HERO_GLAM_34 = '../generated/assets/character/melusina_eevee_glam_20260715c_05.png';
  let HERO_SILHOUETTE = ''; // retired wrong medallion plate
  // HERO_DIORAMA retired from public plate strip (Miraland postcard)

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
      }
      if (s['stage.front'] && s['stage.front'].path) HERO_FRONT = s['stage.front'].path;
      if (s['stage.wire_front'] && s['stage.wire_front'].path) HERO_WIRE_FRONT = s['stage.wire_front'].path;
      if (s['stage.wire_34'] && s['stage.wire_34'].path) HERO_WIRE_34 = s['stage.wire_34'].path;
      if (s['melusina.glam_04'] && s['melusina.glam_04'].path) HERO_GLAM_CLOSE = s['melusina.glam_04'].path;
      if (s['melusina.glam_05'] && s['melusina.glam_05'].path) HERO_GLAM_34 = s['melusina.glam_05'].path;
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

  async function hydrateHairLoop() {
    const mount = document.getElementById('stageHairLoop');
    if (!mount) return;
    const video = mount.querySelector('video');
    const caption = mount.querySelector('figcaption');
    try {
      const data = await fetchJson(LOOPS_URL);
      const entry = (data.entries || []).find((e) => e.status === 'web_ready' && e.webm_path) ||
        (data.entries || [])[0];
      if (!entry || !entry.webm_path) {
        mount.hidden = true;
        return;
      }
      if (video) {
        if (entry.poster) video.setAttribute('poster', entry.poster);
        video.src = entry.webm_path;
      }
      if (caption) {
        const label = entry.label || 'Hair loop';
        const meta = [
          entry.frame_count ? `${entry.frame_count} frames` : null,
          entry.fps ? `${entry.fps}fps` : null,
          entry.duration_sec ? `${entry.duration_sec}s` : null,
        ]
          .filter(Boolean)
          .join(' · ');
        caption.innerHTML =
          `<span class="meta-label">${esc(label)}</span>` +
          `<strong>${esc(meta || 'EEVEE loop')}</strong>` +
          `<p>${esc(entry.caption || '')}</p>`;
      }
      mount.hidden = false;
    } catch (_err) {
      /* keep static markup fallback */
    }
  }

  async function hydratePlateStrip() {
    const mount = document.getElementById('stagePlateStrip');
    if (!mount) return;
    await loadPlateSlots();
    // Unique plates only — no jewelry, no diorama postcard, no legacy beauty_34.
    const heroPack = [
      { web_path: HERO_BEAUTY, title: 'Hero beauty · EEVEE' },
      { web_path: HERO_FRONT, title: 'Glam bust · EEVEE' },
      { web_path: HERO_GLAM_CLOSE, title: 'Glam close · EEVEE' },
      { web_path: HERO_GLAM_34, title: 'Glam three-quarter · EEVEE' },
      { web_path: HERO_WIRE_FRONT, title: 'Wireframe · front grey' },
      { web_path: HERO_WIRE_34, title: 'Wireframe · ¾ grey' },
    ];
    const seen = new Set();
    const deny = [
      '_001.png',
      'mauve',
      '/hero_sim/',
      'bangs',
      'profile_bangs',
      'glam_20260715c_03',
      'jewelry',
      'sculpt_melusina',
      '20260714',
      'silhouette_silhouette',
      'diorama',
      'melusina_eevee_beauty_34',
      'melusina_beauty_34',
    ];
    let cards = [];
    for (const c of heroPack) {
      const path = c.web_path;
      if (!path || seen.has(path)) continue;
      if (deny.some((d) => String(path).toLowerCase().includes(d))) continue;
      cards.push(c);
      seen.add(path);
    }
    try {
      const intake = await fetchJson(INTAKE_URL);
      const mel = (intake.render_cards || []).filter(
        (c) => c.asset_id === 'melusina' || String(c.id || '').startsWith('melusina')
      );
      for (const c of mel) {
        const path = c.web_path;
        const title = String(c.title || c.filename || '');
        if (!path || seen.has(path)) continue;
        if (deny.some((d) => String(path).toLowerCase().includes(d))) continue;
        if (/diorama/i.test(title) || /beauty\s*34/i.test(title)) continue;
        cards.push({ web_path: path, title: title || c.filename });
        seen.add(path);
        if (cards.length >= 8) break;
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
    hydrateHairLoop();
    hydratePlateStrip();
  });
})();
