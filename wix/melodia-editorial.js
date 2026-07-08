/* Melodia editorial shell — parallax, site copy hydration, optional intake grids. */
(function (global) {
  'use strict';

  const COPY_URL = '../content/site-copy.json';
  const INTAKE_URL = '../generated/unreal_portfolio_intake.json';

  function getByPath(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initParallax() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    const root = document.documentElement;
    let ticking = false;

    const updateScroll = () => {
      root.style.setProperty('--scroll-shift', `${Math.min(window.scrollY, 1200)}px`);
      ticking = false;
    };

    const requestScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestScroll, { passive: true });
    window.addEventListener(
      'pointermove',
      (event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 28;
        const y = (event.clientY / window.innerHeight - 0.5) * 28;
        root.style.setProperty('--mouse-x', `${x}px`);
        root.style.setProperty('--mouse-y', `${y}px`);
      },
      { passive: true }
    );
    updateScroll();
  }

  function applyCopy(copy, pageKey) {
    if (!copy) return;

    document.querySelectorAll('[data-copy]').forEach((el) => {
      const path = el.getAttribute('data-copy');
      const value = getByPath(copy, path);
      if (value == null || value === '') return;
      if (el.hasAttribute('data-copy-html')) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    const page = getByPath(copy, `pages.${pageKey}`);
    if (page && page.title) {
      document.title = page.title;
    }
    const meta = page && page.meta_description;
    if (meta) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', meta);
    }
  }

  function renderPassport(copy, pageKey) {
    const mount = document.getElementById('passportGrid');
    const cells = getByPath(copy, `pages.${pageKey}.passport`);
    if (!mount || !Array.isArray(cells)) return;
    mount.innerHTML = cells
      .map(
        (cell) =>
          `<div class="passport-cell"><span class="meta-label">${esc(cell.label)}</span><strong>${esc(cell.value)}</strong></div>`
      )
      .join('');
  }

  function renderBeats(copy, pageKey) {
    const mount = document.getElementById('intentBeats');
    const beats = getByPath(copy, `pages.${pageKey}.intent.beats`);
    if (!mount || !Array.isArray(beats)) return;
    mount.innerHTML = beats
      .map(
        (beat) =>
          `<article class="alignment-card"><span>${esc(beat.tag)}</span><div><h3>${esc(beat.title)}</h3><p>${esc(beat.body)}</p></div></article>`
      )
      .join('');
  }

  function renderAxis(copy, pageKey) {
    const mount = document.getElementById('axisSteps');
    const steps = getByPath(copy, `pages.${pageKey}.axis.steps`);
    if (!mount || !Array.isArray(steps)) return;
    mount.innerHTML = steps
      .map(
        (step) =>
          `<article class="axis-card"><span class="meta-label">${esc(step.label)}</span><h3>${esc(step.title)}</h3><p>${esc(step.body)}</p></article>`
      )
      .join('');
  }

  function renderCraft(copy, pageKey) {
    const mount = document.getElementById('craftCards');
    const cards = getByPath(copy, `pages.${pageKey}.craft.cards`);
    if (!mount || !Array.isArray(cards)) return;
    mount.innerHTML = cards
      .map(
        (card) =>
          `<article class="stack-card"><span class="meta-label">${esc(card.tag)}</span><h3>${esc(card.title)}</h3><p>${esc(card.body)}</p></article>`
      )
      .join('');
  }

  function renderNextLinks(copy, pageKey) {
    const mount = document.getElementById('nextLinks');
    const links = getByPath(copy, `pages.${pageKey}.next.links`);
    if (!mount || !Array.isArray(links)) return;
    mount.innerHTML = links
      .map(
        (link) =>
          `<a class="path-row" href="${esc(link.href)}"><span>${esc(link.step)}</span><div><h3>${esc(link.title)}</h3><p>${esc(link.body)}</p></div><b>Open</b></a>`
      )
      .join('');
  }

  async function hydrateIntakeHero() {
    const img = document.getElementById('heroLeadImage');
    if (!img) return;
    try {
      const res = await fetch(INTAKE_URL, { cache: 'no-store' });
      const intake = await res.json();
      const cards = Array.isArray(intake.render_cards) ? intake.render_cards : [];
      const heroes = cards.filter((c) => c.group === 'hero' && c.web_path);
      heroes.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      const lead = heroes[0];
      if (lead) {
        img.src = lead.web_path;
        img.alt = lead.filename || 'Sakura hero render';
      }
    } catch (_err) {
      /* keep static fallback src */
    }
  }

  async function hydrateProofGrid() {
    const mount = document.getElementById('proofGrid');
    if (!mount) return;
    try {
      const res = await fetch(INTAKE_URL, { cache: 'no-store' });
      const intake = await res.json();
      const cards = Array.isArray(intake.render_cards) ? intake.render_cards : [];
      const picks = cards.filter((c) => c.web_path).slice(0, 6);
      if (!picks.length) {
        mount.innerHTML =
          '<p class="body-copy">No web-ready plates yet. Run Unreal capture, then <code>ingest_unreal_portfolio.ps1</code>.</p>';
        return;
      }
      mount.innerHTML = picks
        .map((card) => {
          const href = esc(card.web_path);
          const title = esc(card.filename || card.group);
          const caption = esc(card.caption || `${card.group} plate`);
          return `<a class="image-card" href="${href}"><img src="${href}" alt="${title}" loading="lazy" /><div><span class="meta-label">${esc(card.group)}</span><h3>${title}</h3><p>${caption}</p></div></a>`;
        })
        .join('');
    } catch (_err) {
      mount.innerHTML = '<p class="body-copy">Intake JSON unavailable offline.</p>';
    }
  }

  async function init(options) {
    const pageKey = (options && options.page) || document.documentElement.getAttribute('data-page') || '';
    initParallax();

    let copy = null;
    try {
      const res = await fetch(COPY_URL, { cache: 'no-store' });
      copy = await res.json();
      applyCopy(copy, pageKey);
      renderPassport(copy, pageKey);
      renderBeats(copy, pageKey);
      renderAxis(copy, pageKey);
      renderCraft(copy, pageKey);
      renderNextLinks(copy, pageKey);
    } catch (_err) {
      /* static HTML fallbacks remain */
    }

    if (options && options.intake) {
      await hydrateIntakeHero();
      await hydrateProofGrid();
    }
  }

  global.MelodiaEditorial = { init, initParallax, applyCopy };
})(window);
