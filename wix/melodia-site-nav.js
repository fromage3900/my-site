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

  function createRuntimeGovernor() {
    if (global.MelodiaRuntime) return global.MelodiaRuntime;

    var mobileQuery = global.matchMedia ? global.matchMedia('(max-width: 680px)') : { matches: false };
    var reducedQuery = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var managedVideos = new Set();
    var visibility = new Map();
    var videoObserver = null;
    var mutationObserver = null;

    function quality() {
      if (reducedQuery.matches || (connection && connection.saveData) || mobileQuery.matches) return 'low';
      if (global.innerWidth <= 1100 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)) return 'medium';
      return 'high';
    }

    function budget() {
      var tier = quality();
      if (tier === 'low') return { quality: tier, targetFps: 30, maxDpr: 1.25, particleScale: 0.34, maxConcurrentVideos: 1 };
      if (tier === 'medium') return { quality: tier, targetFps: 45, maxDpr: 1.5, particleScale: 0.72, maxConcurrentVideos: 2 };
      return { quality: tier, targetFps: 60, maxDpr: 1.75, particleScale: 1, maxConcurrentVideos: 2 };
    }

    function isManagedVideo(video) {
      if (!video || video.nodeName !== 'VIDEO' || video.hasAttribute('data-runtime-unmanaged')) return false;
      return video.hasAttribute('data-melodia-autoplay') ||
        video.hasAttribute('autoplay');
    }

    function shouldPosterOnly(video) {
      return quality() === 'low' && Boolean(video.closest('.hero, .hero-media, [data-hero-bg-slot]'));
    }

    function syncVideos() {
      var current = budget();
      var ranked = [];

      managedVideos.forEach(function (video) {
        var ratio = visibility.get(video) || 0;
        if (!document.hidden && !reducedQuery.matches && !shouldPosterOnly(video) && ratio >= 0.18) {
          ranked.push({ video: video, ratio: ratio });
        }
      });

      ranked.sort(function (a, b) { return b.ratio - a.ratio; });
      var allowed = new Set(ranked.slice(0, current.maxConcurrentVideos).map(function (entry) { return entry.video; }));

      managedVideos.forEach(function (video) {
        if (allowed.has(video)) {
          video.preload = 'metadata';
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function () {});
        } else {
          video.pause();
          if (current.quality === 'low' || document.hidden) video.preload = 'none';
        }
      });
    }

    function registerVideo(video) {
      if (!isManagedVideo(video) || managedVideos.has(video)) return;
      managedVideos.add(video);
      video.autoplay = false;
      video.removeAttribute('autoplay');
      video.preload = 'none';
      video.pause();
      visibility.set(video, 0);
      if (videoObserver) videoObserver.observe(video);
    }

    function registerMedia(root) {
      var scope = root && root.querySelectorAll ? root : document;
      if (isManagedVideo(root)) registerVideo(root);
      scope.querySelectorAll('video').forEach(registerVideo);
      syncVideos();
    }

    if ('IntersectionObserver' in global) {
      videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        syncVideos();
      }, { threshold: [0, 0.18, 0.4, 0.7] });
    }

    if ('MutationObserver' in global) {
      mutationObserver = new MutationObserver(function (records) {
        records.forEach(function (record) {
          record.addedNodes.forEach(function (node) {
            if (node && node.nodeType === 1) registerMedia(node);
          });
        });
      });
      mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    document.addEventListener('visibilitychange', syncVideos, { passive: true });
    global.addEventListener('pagehide', function () {
      managedVideos.forEach(function (video) { video.pause(); });
    }, { passive: true });
    global.addEventListener('resize', syncVideos, { passive: true });

    var api = {
      get quality() { return quality(); },
      get targetFps() { return budget().targetFps; },
      get maxDpr() { return budget().maxDpr; },
      get particleScale() { return budget().particleScale; },
      get maxConcurrentVideos() { return budget().maxConcurrentVideos; },
      registerMedia: registerMedia,
      syncMedia: syncVideos,
      budget: budget
    };

    global.MelodiaRuntime = api;
    registerMedia(document);
    return api;
  }

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
    createRuntimeGovernor();
    ensureSkipLink();
    applyNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.MelodiaSiteNav = { refresh: applyNav, links: LINKS, moreLinks: MORE_LINKS, runtime: createRuntimeGovernor };
})(typeof window !== 'undefined' ? window : this);
