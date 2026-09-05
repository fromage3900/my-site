/**
 * Melodia shared site nav — one recruiter-path chrome for all pages.
 * Include after DOM header exists; safe to load before MelodiaEditorial.init.
 * Constellation accents activate when header has .constellation-nav or data-constellation.
 */
(function (global) {
  'use strict';

  var LINKS = [
    { href: 'index.html', label: 'Home', keys: ['index', ''] },
    { href: 'curated-art.html', label: 'Art', keys: ['curated-art'] },
    { href: 'world-bible.html', label: 'Worlds', keys: ['world-bible', 'sakura-case-study', 'space-cathedral', 'pcg-system-impact', 'melodia-stage-character'] },
    { href: 'melodia-living-worlds.html', label: 'Melodia', keys: ['melodia-living-worlds', 'melodia-gameplay-loop', 'melodia-rhythm-hero'] },
    { href: 'resume.html', label: 'About', keys: ['resume', 'recruiter-one-sheet'] },
  ];

  var moreHandlersBound = false;

  var MORE_LINKS = [
    { href: 'hero-renders.html', label: 'Render archive', keys: ['hero-renders'] },
    { href: 'zbrush-breakdown.html', label: 'Sculpt breakdown', keys: ['zbrush-breakdown'] },
    { href: 'shader-breakdowns.html', label: 'Shader breakdowns', keys: ['shader-breakdowns'] },
    { href: 'cosmic-orrery.html', label: 'Cosmic Orrery', keys: ['cosmic-orrery'] },
    { href: 'sdf-material-gallery.html', label: 'Material Atlas', keys: ['sdf-material-gallery'] },
    { href: 'melodia-atelier-lab.html', label: 'Technical Art Atelier', keys: ['melodia-atelier-lab'] },
  ];

  function pageKey() {
    var html = document.documentElement;
    if (html && html.getAttribute('data-page')) return html.getAttribute('data-page');
    var file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/i, '');
    return file === '' || file === 'index' ? 'index' : file;
  }

  function ensureSkipLink() {
    if (document.querySelector('.skip-link')) return;
    var a = document.createElement('a');
    a.className = 'skip-link';
    a.href = '#main';
    a.textContent = 'Skip to main content';
    document.body.insertBefore(a, document.body.firstChild);
    var main = document.getElementById('main') || document.querySelector('main');
    if (main && !main.id) main.id = 'main';
  }

  function wantsConstellation(header) {
    return (
      header.classList.contains('constellation-nav') ||
      header.getAttribute('data-constellation') === 'true'
    );
  }

  function linkHtml(item, active, constellation) {
    var star = constellation
      ? '<span class="nav-star" aria-hidden="true"></span>'
      : '';
    return (
      '<a href="' +
      item.href +
      '"' +
      (active ? ' class="is-active" aria-current="page"' : '') +
      '>' +
      star +
      item.label +
      '</a>'
    );
  }

  function moreHtml(key, constellation) {
    var active = MORE_LINKS.some(function (item) { return item.keys.indexOf(key) !== -1; });
    var star = constellation ? '<span class="nav-star" aria-hidden="true"></span>' : '';
    return (
      '<details class="nav-more' + (active ? ' is-active' : '') + '">' +
        '<summary>' + star + 'More <span aria-hidden="true">✦</span></summary>' +
        '<div class="nav-more-menu">' +
          MORE_LINKS.map(function (item) {
            return linkHtml(item, item.keys.indexOf(key) !== -1, constellation);
          }).join('') +
        '</div>' +
      '</details>'
    );
  }

  function bindMoreMenuDismissal() {
    if (moreHandlersBound) return;
    moreHandlersBound = true;

    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('.nav-more')) return;
      document.querySelectorAll('.nav-more[open]').forEach(function (details) {
        details.removeAttribute('open');
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.nav-more[open]').forEach(function (details) {
        details.removeAttribute('open');
      });
    });
  }

  function applyNav() {
    var header = document.querySelector('header.shell-nav');
    if (!header) return;

    var shell = document.querySelector('.melodia-shell');
    var ctaHref = (shell && shell.getAttribute('data-nav-cta')) || 'curated-art.html';
    var ctaLabel = (shell && shell.getAttribute('data-nav-cta-label')) || 'Selected art';
    var key = pageKey();
    var constellation = wantsConstellation(header);

    if (constellation) header.classList.add('constellation-nav');

    var brand = header.querySelector('.brand');
    if (brand && !brand.querySelector('.brand-mark')) {
      brand.insertAdjacentHTML('afterbegin', '<span class="brand-mark" aria-hidden="true"></span>');
    }

    var nav = header.querySelector('.nav-links');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'nav-links';
      nav.setAttribute('aria-label', 'Sections');
      header.appendChild(nav);
    }

    nav.innerHTML = LINKS.map(function (item) {
      return linkHtml(item, item.keys.indexOf(key) !== -1, constellation);
    }).join('') + moreHtml(key, constellation);
    bindMoreMenuDismissal();

    var cta = header.querySelector('.nav-cta');
    if (!cta) {
      cta = document.createElement('a');
      header.appendChild(cta);
    }
    cta.className = 'nav-cta button-premium';
    cta.href = ctaHref;
    cta.textContent = ctaLabel;
  }

  function boot() {
    ensureSkipLink();
    applyNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.MelodiaSiteNav = { refresh: applyNav, links: LINKS, moreLinks: MORE_LINKS };
})(typeof window !== 'undefined' ? window : this);
