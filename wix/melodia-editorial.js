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
    const fixedTitle = document.documentElement.hasAttribute('data-fixed-title');
    if (!fixedTitle && page && page.title) {
      document.title = page.title;
    }
    if (document.documentElement.getAttribute('data-page') === 'index') {
      const homeTitle = getByPath(copy, 'global.home_title');
      const homeDesc = getByPath(copy, 'global.home_description');
      if (homeTitle) document.title = homeTitle;
      if (homeDesc) {
        let tag = document.querySelector('meta[name="description"]');
        if (tag) tag.setAttribute('content', homeDesc);
      }
    } else if (page && page.meta_description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', page.meta_description);
    }
  }

  function renderAtAGlance(copy, pageKey) {
    const mount = document.getElementById('atAGlanceCards');
    const cards = getByPath(copy, `pages.${pageKey}.at_a_glance.cards`);
    if (!mount || !Array.isArray(cards)) return;
    mount.innerHTML = cards
      .map(
        (card) =>
          `<article class="alignment-card"><span>${esc(card.tag)}</span><div><h3>${esc(card.title)}</h3><p>${esc(card.body)}</p></div></article>`
      )
      .join('');
  }

  function renderBestProof(copy, pageKey) {
    const mount = document.getElementById('bestProofLinks');
    const links = getByPath(copy, `pages.${pageKey}.best_proof.links`);
    if (!mount || !Array.isArray(links)) return;
    mount.innerHTML = links
      .map(
        (link) =>
          `<a class="path-row" href="${esc(link.href)}"><span>${esc(link.step)}</span><div><h3>${esc(link.title)}</h3><p>${esc(link.body)}</p></div><b>Open</b></a>`
      )
      .join('');
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

  function renderPortalLinks(copy, pageKey) {
    const mount = document.getElementById('portalGrid');
    const links = getByPath(copy, `pages.${pageKey}.portals.links`);
    if (!mount || !Array.isArray(links)) return;
    mount.innerHTML = links
      .map((link) => {
        const accent = esc(link.accent || 'gold');
        return `<a class="portal-card accent-${accent}" href="${esc(link.href)}"><span class="portal-step">${esc(link.step)}</span><div><h3>${esc(link.title)}</h3><p>${esc(link.body)}</p></div><span class="portal-open">Open →</span></a>`;
      })
      .join('');
  }

  async function hydrateHeroPlates(mountId, maxCount) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const fashion = mount.classList.contains('lookbook-grid');
    try {
      const res = await fetch(INTAKE_URL, { cache: 'no-store' });
      const intake = await res.json();
      const cards = Array.isArray(intake.render_cards) ? intake.render_cards : [];
      let heroes = cards
        .filter((c) => c.group === 'hero' && c.web_path)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));
      if (maxCount) heroes = heroes.slice(0, maxCount);
      if (!heroes.length) {
        mount.innerHTML =
          '<a class="image-card fashion-frame" href="../generated/assets/l-sakurapath-hero.png"><img src="../generated/assets/l-sakurapath-hero.png" alt="Sakura path hero" loading="lazy" /><div><h3>Sakura Path</h3></div></a>';
        return;
      }
      mount.innerHTML = heroes
        .map((card) => {
          const href = esc(card.web_path);
          const title = esc(card.filename || 'Hero plate');
          const frame = fashion ? ' fashion-frame' : '';
          const caption = fashion && card.caption ? `<p>${esc(card.caption)}</p>` : '';
          return `<a class="image-card${frame}" href="${href}"><img src="${href}" alt="${title}" loading="lazy" /><div><h3>${title}</h3>${caption}</div></a>`;
        })
        .join('');
    } catch (_err) {
      mount.innerHTML =
        '<a class="image-card" href="../generated/assets/l-sakurapath-hero.png"><img src="../generated/assets/l-sakurapath-hero.png" alt="Sakura path hero" /><div><h3>Sakura Path</h3></div></a>';
    }
  }

  async function hydrateHeroStrip(maxCount) {
    await hydrateHeroPlates('heroStrip', maxCount || 3);
  }

  function renderProcessSteps(copy, pageKey) {
    const mount = document.getElementById('processSteps');
    const steps = getByPath(copy, `pages.${pageKey}.process.steps`);
    if (!mount || !Array.isArray(steps)) return;
    mount.innerHTML = steps
      .map(
        (step) =>
          `<div class="path-row"><span>${esc(step.step)}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.body)}</p></div><b>—</b></div>`
      )
      .join('');
  }

  function renderPackageCards(copy, pageKey) {
    const mount = document.getElementById('packageCards');
    const cards = getByPath(copy, `pages.${pageKey}.packages.cards`);
    if (!mount || !Array.isArray(cards)) return;
    mount.innerHTML = cards
      .map(
        (card) =>
          `<article class="alignment-card"><span>${esc(card.tag)}</span><div><h3>${esc(card.title)}</h3><p>${esc(card.body)}</p></div><strong class="foil-caption">Custom quote</strong></article>`
      )
      .join('');
  }

  function renderUseCards(copy, pageKey) {
    const mount = document.getElementById('useCards');
    const cards = getByPath(copy, `pages.${pageKey}.uses.cards`);
    if (!mount || !Array.isArray(cards)) return;
    mount.innerHTML = cards
      .map(
        (card) =>
          `<article class="alignment-card"><span>${esc(card.tag)}</span><div><h3>${esc(card.title)}</h3><p>${esc(card.body)}</p></div></article>`
      )
      .join('');
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

  function initMobileNav() {
    document.querySelectorAll('.shell-nav').forEach((nav) => {
      if (nav.querySelector('.nav-toggle')) return;
      const links = nav.querySelector('.nav-links');
      if (!links) return;

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'nav-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', links.id || 'site-nav-links');
      if (!links.id) links.id = 'site-nav-links';

      const cta = nav.querySelector('.nav-cta');
      if (cta) nav.insertBefore(toggle, cta);
      else nav.appendChild(toggle);

      const close = () => {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      };

      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      links.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
      });
    });
  }

  async function init(options) {
    const pageKey = (options && options.page) || document.documentElement.getAttribute('data-page') || '';
    initParallax();
    initMobileNav();

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
      renderPortalLinks(copy, pageKey);
      renderAtAGlance(copy, pageKey);
      renderBestProof(copy, pageKey);
      renderPackageCards(copy, pageKey);
      renderProcessSteps(copy, pageKey);
      renderUseCards(copy, pageKey);
    } catch (_err) {
      /* static HTML fallbacks remain */
    }

    if (options && options.intake) {
      await hydrateIntakeHero();
      await hydrateProofGrid();
    }
    if (options && options.heroStrip) {
      await hydrateHeroStrip(options.heroStrip);
    }
    if (options && options.heroGrid) {
      await hydrateHeroPlates('heroGrid', typeof options.heroGrid === 'number' ? options.heroGrid : null);
    }

    if (global.MelodiaOrrery) {
      global.MelodiaOrrery.upgradeHeroOrreries();
      global.MelodiaOrrery.mountAll();
    }
  }

  global.MelodiaEditorial = { init, initParallax, initMobileNav, applyCopy };
})(window);
