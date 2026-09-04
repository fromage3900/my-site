/**
 * Melodia Mahou Flourish — Sailor Moon & Madoka Magica Transformation Lookbook System
 * Standalone module providing sacred geometry sigil overlays, unfurling ribbons,
 * interactive pointer stardust trails, and radiant henshin transformation bursts.
 *
 * Interface contract:
 * window.MelodiaMahouFlourish = { init, trigger, burst, mount, mountHeroFlourish, triggerHenshin }
 */
(function (global) {
  'use strict';

  var activeParticles = 0;
  var MAX_TRAIL_PARTICLES = 16;
  var lastTrailTime = 0;
  var TRAIL_THROTTLE_MS = 55;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function createSigilSvg() {
    // 24 radial rune tick marks around the outer perimeter
    var ticks = Array.from({ length: 24 }, function (_, i) {
      var a = (i / 24) * Math.PI * 2;
      var x1 = (250 + Math.cos(a) * 208).toFixed(1);
      var y1 = (250 + Math.sin(a) * 208).toFixed(1);
      var x2 = (250 + Math.cos(a) * 224).toFixed(1);
      var y2 = (250 + Math.sin(a) * 224).toFixed(1);
      return '<line class="mahou-tick" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" />';
    }).join('');

    // 8 radial starburst coordinates for 8-pointed star
    var outerStarPoints = [];
    var innerStarPoints = [];
    for (var i = 0; i < 16; i++) {
      var angle = (i / 16) * Math.PI * 2 - Math.PI / 2;
      var rOuter = i % 2 === 0 ? 190 : 85;
      var rInner = i % 2 === 0 ? 135 : 60;
      outerStarPoints.push((250 + Math.cos(angle) * rOuter).toFixed(1) + ',' + (250 + Math.sin(angle) * rOuter).toFixed(1));
      innerStarPoints.push((250 + Math.cos(angle) * rInner).toFixed(1) + ',' + (250 + Math.sin(angle) * rInner).toFixed(1));
    }

    return (
      '<svg class="mahou-sigil-svg" viewBox="0 0 500 500" aria-hidden="true">' +
      '<circle class="mahou-ring outer" cx="250" cy="250" r="236" />' +
      '<circle class="mahou-ring mid" cx="250" cy="250" r="195" />' +
      '<circle class="mahou-ring inner" cx="250" cy="250" r="140" />' +
      '<circle class="mahou-ring core" cx="250" cy="250" r="48" />' +
      '<polygon class="mahou-starburst" points="' + outerStarPoints.join(' ') + '" />' +
      '<polygon class="mahou-starburst-inner" points="' + innerStarPoints.join(' ') + '" />' +
      '<path class="mahou-crescent" d="M250,210 A40,40 0 0,0 250,290 A30,30 0 0,1 250,210 Z" />' +
      ticks +
      '</svg>'
    );
  }

  function mountHeroFlourish(container) {
    var target = container || document.querySelector('[data-mahou-stage]') || document.querySelector('.hero');
    if (!target || target.querySelector(':scope > .mahou-flourish-stage')) return null;

    var computedStyle = window.getComputedStyle(target);
    if (computedStyle.position === 'static') {
      target.style.position = 'relative';
    }

    var stage = document.createElement('div');
    stage.className = 'mahou-flourish-stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.innerHTML =
      '<div class="mahou-lens-flare"></div>' +
      '<div class="mahou-sigil-ring">' + createSigilSvg() + '</div>' +
      '<div class="mahou-ribbon-spiral r1"></div>' +
      '<div class="mahou-ribbon-spiral r2"></div>' +
      '<div class="mahou-sparks">' +
        '<span class="mahou-spark s1">✦</span>' +
        '<span class="mahou-spark s2">✧</span>' +
        '<span class="mahou-spark s3">✦</span>' +
        '<span class="mahou-spark s4">✧</span>' +
      '</div>';

    target.appendChild(stage);

    window.requestAnimationFrame(function () {
      stage.classList.add('is-active', 'is-mounted');
    });

    return stage;
  }

  function triggerHenshin(target) {
    if (prefersReducedMotion()) return;

    var host = target || document.querySelector('[data-mahou-stage]') || document.querySelector('.hero') || document.body;
    var burstEl = document.createElement('div');
    burstEl.className = 'mahou-henshin-burst';
    burstEl.setAttribute('aria-hidden', 'true');

    var shardElements = '';
    var glyphs = ['✦', '✧', '⋆', '♪', '✧', '✦', '⋆', '✧'];
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      var dist = 90 + Math.random() * 50;
      var tx = (Math.cos(a) * dist).toFixed(1) + 'px';
      var ty = (Math.sin(a) * dist).toFixed(1) + 'px';
      shardElements += '<span class="mahou-burst-shard" style="--tx:' + tx + '; --ty:' + ty + ';">' + glyphs[i] + '</span>';
    }

    burstEl.innerHTML =
      '<div class="mahou-burst-core"></div>' +
      '<div class="mahou-burst-ring"></div>' +
      '<div class="mahou-burst-shards">' + shardElements + '</div>';

    host.appendChild(burstEl);

    setTimeout(function () {
      if (burstEl.parentNode) {
        burstEl.parentNode.removeChild(burstEl);
      }
    }, 1500);
  }

  function burst(x, y) {
    if (prefersReducedMotion()) return;

    var posX = typeof x === 'number' ? x : window.innerWidth / 2;
    var posY = typeof y === 'number' ? y : window.innerHeight / 2;

    var b = document.createElement('div');
    b.className = 'mahou-henshin-burst';
    b.setAttribute('aria-hidden', 'true');
    b.style.position = 'fixed';
    b.style.left = posX + 'px';
    b.style.top = posY + 'px';

    b.innerHTML = '<div class="mahou-burst-core"></div><div class="mahou-burst-ring"></div>';
    document.body.appendChild(b);

    setTimeout(function () {
      if (b.parentNode) {
        b.parentNode.removeChild(b);
      }
    }, 1300);
  }

  function spawnTrailSpark(x, y) {
    if (activeParticles >= MAX_TRAIL_PARTICLES || prefersReducedMotion()) return;

    activeParticles++;
    var particle = document.createElement('span');
    particle.className = 'mahou-trail-particle';
    particle.setAttribute('aria-hidden', 'true');
    particle.textContent = Math.random() > 0.5 ? '✦' : '✧';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    document.body.appendChild(particle);

    var cleanedUp = false;
    function cleanup() {
      if (cleanedUp) return;
      cleanedUp = true;
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
      activeParticles = Math.max(0, activeParticles - 1);
    }

    particle.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 850);
  }

  function initPointerTrails() {
    if (prefersReducedMotion()) return;

    var handleMove = function (e) {
      var now = performance.now();
      if (now - lastTrailTime < TRAIL_THROTTLE_MS) return;
      lastTrailTime = now;
      spawnTrailSpark(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
  }

  function bindInteractiveTriggers() {
    var triggers = document.querySelectorAll(
      '[data-mahou-trigger], .magazine-kicker, .hero-actions .button.primary, .brand'
    );

    triggers.forEach(function (el) {
      if (el.getAttribute('data-mahou-bound')) return;
      el.setAttribute('data-mahou-bound', 'true');

      if (el.tagName !== 'BUTTON' && el.tagName !== 'A') {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
        if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Trigger henshin flourish burst');

        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            el.click();
          }
        });
      }

      el.addEventListener('click', function (event) {
        var stageTarget = el.closest('[data-mahou-stage]') || el.closest('.hero');
        if (stageTarget) {
          triggerHenshin(stageTarget);
        } else {
          burst(event.clientX, event.clientY);
        }
      });
    });
  }

  var ambientState = {
    lastRareEvent: -Infinity,
    rareCooldown: 8500,
    hoverCount: 0,
    cursorTimer: null,
    cursorSigil: null,
    lastPointerX: window.innerWidth / 2,
    lastPointerY: window.innerHeight / 2
  };

  function ambientAllowed() {
    return !prefersReducedMotion() && !document.hidden;
  }

  function markRareEvent() {
    ambientState.lastRareEvent = performance.now();
  }

  function rareEventReady() {
    return ambientAllowed() && (performance.now() - ambientState.lastRareEvent) > ambientState.rareCooldown;
  }

  function removeAfter(el, ms) {
    window.setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, ms);
  }

  function constellationBloom(target) {
    if (!ambientAllowed()) return null;

    var rect = target && target.getBoundingClientRect ? target.getBoundingClientRect() : null;
    var x = rect ? Math.max(100, Math.min(window.innerWidth - 100, rect.left + rect.width * 0.72)) : window.innerWidth * 0.7;
    var y = rect ? Math.max(110, Math.min(window.innerHeight - 110, rect.top + Math.min(rect.height * 0.34, 240))) : window.innerHeight * 0.45;

    var points = [
      [28, 112], [70, 52], [112, 92], [150, 34], [188, 78], [226, 48], [238, 128], [164, 142], [96, 138]
    ];
    var links = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,0],[2,7],[1,8],[4,7]];
    var lines = links.map(function (pair) {
      var a = points[pair[0]], b = points[pair[1]];
      return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"></line>';
    }).join('');
    var stars = points.map(function (p, i) {
      return '<circle class="mahou-constellation-node n' + i + '" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i % 3 === 0 ? 3.6 : 2.4) + '"></circle>';
    }).join('');

    var bloom = document.createElement('div');
    bloom.className = 'mahou-constellation-event';
    bloom.setAttribute('aria-hidden', 'true');
    bloom.style.left = x + 'px';
    bloom.style.top = y + 'px';
    bloom.innerHTML =
      '<svg viewBox="0 0 260 180" aria-hidden="true"><g class="mahou-constellation-lines">' + lines + '</g><g class="mahou-constellation-nodes">' + stars + '</g></svg>' +
      '<span class="mahou-constellation-glyph">✦</span>';
    document.body.appendChild(bloom);
    markRareEvent();
    removeAfter(bloom, 2600);
    return bloom;
  }

  function phyllotaxisBloom(target) {
    if (!ambientAllowed()) return null;

    var GOLDEN_ANGLE = 137.50776405003785 * Math.PI / 180;
    var rect = target && target.getBoundingClientRect ? target.getBoundingClientRect() : null;
    var x = rect ? Math.max(105, Math.min(window.innerWidth - 105, rect.left + rect.width * 0.382)) : window.innerWidth * 0.382;
    var y = rect ? Math.max(110, Math.min(window.innerHeight - 110, rect.top + Math.min(rect.height * 0.618, 260))) : window.innerHeight * 0.618;

    var count = 34;
    var nodes = '';
    for (var i = 0; i < count; i++) {
      var angle = i * GOLDEN_ANGLE;
      var radius = 8.4 * Math.sqrt(i);
      var px = 120 + Math.cos(angle) * radius;
      var py = 120 + Math.sin(angle) * radius;
      var pr = i % 8 === 0 ? 3.2 : (i % 5 === 0 ? 2.4 : 1.7);
      nodes += '<circle class="mahou-phi-node n' + i + '" cx="' + px.toFixed(2) + '" cy="' + py.toFixed(2) + '" r="' + pr + '" style="--phi-node-i:' + i + ';--phi-node-delay:' + ((i % 8) * 0.055).toFixed(3) + 's"></circle>';
    }

    var bloom = document.createElement('div');
    bloom.className = 'mahou-phyllotaxis-event';
    bloom.setAttribute('aria-hidden', 'true');
    bloom.style.left = x + 'px';
    bloom.style.top = y + 'px';
    bloom.innerHTML =
      '<svg viewBox="0 0 240 240" aria-hidden="true">' +
        '<circle class="mahou-phi-orbit o1" cx="120" cy="120" r="74"></circle>' +
        '<circle class="mahou-phi-orbit o2" cx="120" cy="120" r="46"></circle>' +
        '<g class="mahou-phi-nodes">' + nodes + '</g>' +
      '</svg>' +
      '<span class="mahou-phi-glyph">φ</span>';
    document.body.appendChild(bloom);
    markRareEvent();
    removeAfter(bloom, 2618);
    return bloom;
  }

  function petalCrack(x, y) {
    if (!ambientAllowed()) return null;

    var crack = document.createElement('div');
    crack.className = 'mahou-petal-crack';
    crack.setAttribute('aria-hidden', 'true');
    crack.style.left = (typeof x === 'number' ? x : window.innerWidth * 0.5) + 'px';
    crack.style.top = (typeof y === 'number' ? y : window.innerHeight * 0.5) + 'px';

    var petals = '';
    for (var i = 0; i < 8; i++) {
      petals += '<span class="mahou-petal" style="--a:' + (i * 45) + 'deg;--d:' + (42 + (i % 3) * 12) + 'px"></span>';
    }
    crack.innerHTML = '<span class="mahou-crack-star">✦</span>' + petals;
    document.body.appendChild(crack);
    markRareEvent();
    removeAfter(crack, 1800);
    return crack;
  }

  function ensureCursorSigil() {
    if (ambientState.cursorSigil || !window.matchMedia || !window.matchMedia('(pointer:fine)').matches) {
      return ambientState.cursorSigil;
    }

    var sigil = document.createElement('div');
    sigil.className = 'mahou-cursor-sigil';
    sigil.setAttribute('aria-hidden', 'true');
    sigil.innerHTML =
      '<span class="mahou-cursor-ring outer"></span>' +
      '<span class="mahou-cursor-ring inner"></span>' +
      '<span class="mahou-cursor-diamond">✧</span>';
    document.body.appendChild(sigil);
    ambientState.cursorSigil = sigil;
    return sigil;
  }

  function wakeCursorSigil(x, y) {
    if (!rareEventReady()) return;
    var sigil = ensureCursorSigil();
    if (!sigil) return;

    sigil.style.left = x + 'px';
    sigil.style.top = y + 'px';
    sigil.classList.remove('is-awake');
    void sigil.offsetWidth;
    sigil.classList.add('is-awake');
    markRareEvent();

    window.setTimeout(function () {
      if (sigil) sigil.classList.remove('is-awake');
    }, 2200);
  }

  function initDormantCursorSigil() {
    if (prefersReducedMotion() || !window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;

    window.addEventListener('pointermove', function (e) {
      ambientState.lastPointerX = e.clientX;
      ambientState.lastPointerY = e.clientY;
      if (ambientState.cursorTimer) window.clearTimeout(ambientState.cursorTimer);
      ambientState.cursorTimer = window.setTimeout(function () {
        wakeCursorSigil(ambientState.lastPointerX, ambientState.lastPointerY);
      }, 1100);
    }, { passive: true });
  }

  function initSectionBlooms() {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

    var sections = Array.prototype.slice.call(document.querySelectorAll('.hero, main > .band, main > section.band'));
    sections.forEach(function (section, index) {
      if (index === 0) return;
      if (index % 6 === 4) {
        section.setAttribute('data-mahou-rare-candidate', 'phyllotaxis');
      } else if (index % 3 === 1) {
        section.setAttribute('data-mahou-rare-candidate', 'constellation');
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.42) return;
        var el = entry.target;
        if (el.getAttribute('data-mahou-rare-seen') === 'true') return;
        el.setAttribute('data-mahou-rare-seen', 'true');
        if (!rareEventReady()) return;
        if (el.getAttribute('data-mahou-rare-candidate') === 'phyllotaxis') phyllotaxisBloom(el);
        else constellationBloom(el);
      });
    }, { threshold: [0.42, 0.62] });

    document.querySelectorAll('[data-mahou-rare-candidate]').forEach(function (section) {
      observer.observe(section);
    });
  }

  function bindRarePetalCracks() {
    var targets = document.querySelectorAll('.viz-door, .portal-card, .env-card, .hero-actions .button, [data-mahou-trigger]');
    targets.forEach(function (el) {
      if (el.getAttribute('data-mahou-rare-bound')) return;
      el.setAttribute('data-mahou-rare-bound', 'true');
      el.addEventListener('pointerenter', function (event) {
        ambientState.hoverCount += 1;
        if (ambientState.hoverCount % 4 !== 0 || !rareEventReady()) return;
        var rect = el.getBoundingClientRect();
        var x = typeof event.clientX === 'number' ? event.clientX : rect.left + rect.width * 0.5;
        var y = typeof event.clientY === 'number' ? event.clientY : rect.top + rect.height * 0.5;
        petalCrack(x, y);
      }, { passive: true });
    });
  }

  function pageSlug() {
    var file = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/i, '');
    return (document.documentElement.getAttribute('data-page') || file || 'index').toLowerCase();
  }

  function resolveWorldSkin() {
    var slug = pageSlug();
    var shell = document.querySelector('.melodia-shell');
    var pillar = shell ? (shell.getAttribute('data-pillar') || '') : '';
    pillar = pillar.toLowerCase();

    if (/stage-character|melodia-melusina|wardrobe|character/.test(slug)) return 'melusina';
    if (/space-cathedral|kaleido|cathedral/.test(slug) || pillar === 'cathedral') return 'cathedral';
    if (/pcg-system-impact|fallen|moon/.test(slug) || pillar === 'fallenmoon') return 'moon';
    if (/sakura/.test(slug) || pillar === 'sakura') return 'sakura';
    if (/cosmic-orrery|orrery/.test(slug) || pillar === 'orrery' || pillar === 'cosmic') return 'moon';
    return 'astral';
  }

  function applyWorldSkin() {
    var skin = resolveWorldSkin();
    document.documentElement.setAttribute('data-mahou-world', skin);

    var shell = document.querySelector('.melodia-shell') || document.body;
    if (!shell || shell.querySelector(':scope > .mahou-world-ambience')) return skin;

    var layer = document.createElement('div');
    layer.className = 'mahou-world-ambience';
    layer.setAttribute('aria-hidden', 'true');

    var count = prefersReducedMotion() ? 3 : 7;
    for (var i = 0; i < count; i++) {
      var mote = document.createElement('span');
      mote.className = 'mahou-world-mote m' + (i + 1);
      mote.style.setProperty('--mahou-i', String(i));
      mote.style.setProperty('--mahou-x', ((9 + i * 14 + (i % 2) * 5) % 96) + '%');
      mote.style.setProperty('--mahou-delay', (i * -1.7) + 's');
      layer.appendChild(mote);
    }
    shell.appendChild(layer);
    return skin;
  }

  function filigreeSvg() {
    return (
      '<svg class="mahou-filigree-svg" viewBox="0 0 520 150" preserveAspectRatio="none" aria-hidden="true">' +
        '<g class="mahou-filigree-lines">' +
          '<path pathLength="1" d="M8 78 C62 16 112 22 152 64 C174 87 196 91 221 74 C239 62 249 48 260 24" />' +
          '<path pathLength="1" d="M512 78 C458 16 408 22 368 64 C346 87 324 91 299 74 C281 62 271 48 260 24" />' +
          '<path class="minor" pathLength="1" d="M24 101 C91 54 139 60 180 92 C204 111 226 108 260 80 C294 108 316 111 340 92 C381 60 429 54 496 101" />' +
          '<path class="minor" pathLength="1" d="M72 116 C117 94 150 96 184 116 M448 116 C403 94 370 96 336 116" />' +
        '</g>' +
        '<g class="mahou-filigree-rosette" transform="translate(260 69)">' +
          '<circle pathLength="1" r="24" />' +
          '<circle class="minor" pathLength="1" r="12" />' +
          '<path pathLength="1" d="M0 -31 L7 -8 L31 0 L7 8 L0 31 L-7 8 L-31 0 L-7 -8 Z" />' +
        '</g>' +
        '<circle class="mahou-filigree-gem left" cx="28" cy="98" r="3" />' +
        '<circle class="mahou-filigree-gem right" cx="492" cy="98" r="3" />' +
      '</svg>'
    );
  }

  function initLivingFiligree() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('main > .band, main > section.band'));
    if (!sections.length) return;

    sections.forEach(function (section, index) {
      if (index % 2 !== 0 || index > 10 || section.querySelector(':scope > .mahou-living-filigree')) return;
      if (window.getComputedStyle(section).position === 'static') section.style.position = 'relative';

      var ornament = document.createElement('div');
      ornament.className = 'mahou-living-filigree';
      ornament.setAttribute('aria-hidden', 'true');
      ornament.innerHTML = filigreeSvg();
      section.appendChild(ornament);
      section.classList.add('mahou-filigree-host');
    });

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.mahou-living-filigree').forEach(function (el) {
        el.classList.add('is-awake');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.24) return;
        var ornament = entry.target.querySelector(':scope > .mahou-living-filigree');
        if (ornament) ornament.classList.add('is-awake');
        observer.unobserve(entry.target);
      });
    }, { threshold: [0.24, 0.45] });

    document.querySelectorAll('.mahou-filigree-host').forEach(function (section) {
      observer.observe(section);
    });
  }

  function eligiblePortalLink(link) {
    if (!link || !link.href || link.target === '_blank' || link.hasAttribute('download')) return false;
    if (link.getAttribute('aria-disabled') === 'true') return false;
    var raw = link.getAttribute('href') || '';
    if (!raw || raw.charAt(0) === '#' || raw.indexOf('mailto:') === 0 || raw.indexOf('tel:') === 0 || raw.indexOf('javascript:') === 0) return false;
    try {
      var url = new URL(link.href, window.location.href);
      return url.origin === window.location.origin && url.pathname !== window.location.pathname;
    } catch (e) {
      return false;
    }
  }

  function portalOverlay() {
    var existing = document.querySelector('.mahou-page-portal');
    if (existing) return existing;

    var overlay = document.createElement('div');
    overlay.className = 'mahou-page-portal';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="mahou-page-portal-ring r1"></div>' +
      '<div class="mahou-page-portal-ring r2"></div>' +
      '<div class="mahou-page-portal-iris"></div>' +
      '<div class="mahou-page-portal-star">✦</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function shouldPortalTransition() {
    if (prefersReducedMotion()) return false;
    var key = 'melodia-mahou-portal-count';
    var count = 0;
    try { count = parseInt(sessionStorage.getItem(key) || '0', 10) || 0; } catch (e) {}
    count += 1;
    try { sessionStorage.setItem(key, String(count)); } catch (e) {}
    return count % 4 === 0;
  }

  function bindRarePortalTransitions() {
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target && event.target.closest ? event.target.closest('a') : null;
      if (!eligiblePortalLink(link) || !shouldPortalTransition()) return;

      event.preventDefault();
      var overlay = portalOverlay();
      overlay.classList.remove('is-opening');
      void overlay.offsetWidth;
      overlay.classList.add('is-opening');

      window.setTimeout(function () {
        window.location.href = link.href;
      }, 620);
    });
  }

  var soundState = {
    ctx: null,
    enabled: false,
    lastHeaderTone: -Infinity
  };

  function hashText(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
  }

  function noteSetFor(text) {
    var roots = [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00];
    var ratioFamilies = [
      [1, 5 / 4, 3 / 2],
      [1, 4 / 3, 5 / 3],
      [1, 8 / 5, 2],
      [1, 6 / 5, 8 / 5]
    ];
    var h = hashText(text || 'melodia');
    var root = roots[h % roots.length];
    var ratios = ratioFamilies[(h >>> 4) % ratioFamilies.length];
    return ratios.map(function (ratio) { return root * ratio; });
  }

  function getSoundContext() {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!soundState.ctx) soundState.ctx = new AudioContext();
    if (soundState.ctx.state === 'suspended') soundState.ctx.resume();
    return soundState.ctx;
  }

  function setSoundEnabled(enabled) {
    soundState.enabled = !!enabled;
    try { sessionStorage.setItem('melodia-mahou-sound', enabled ? '1' : '0'); } catch (e) {}
    var button = document.querySelector('.mahou-sound-toggle');
    if (button) {
      button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      button.textContent = enabled ? '♪ sound awake' : '♪ sound asleep';
      button.classList.toggle('is-awake', enabled);
    }
  }

  function playHeaderChord(text, quiet) {
    if (!soundState.enabled) return;
    var ctx = getSoundContext();
    if (!ctx) return;

    var freqs = noteSetFor(text);
    var now = ctx.currentTime;
    var master = ctx.createGain();
    master.gain.setValueAtTime(quiet ? 0.0001 : 0.0001, now);
    master.gain.linearRampToValueAtTime(quiet ? 0.025 : 0.045, now + 0.035);
    master.gain.exponentialRampToValueAtTime(0.0001, now + (quiet ? 0.58 : 0.82));
    master.connect(ctx.destination);

    freqs.forEach(function (freq, index) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = index === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * (index === 2 ? 2 : 1), now);
      gain.gain.setValueAtTime(index === 1 ? 0.34 : 0.24, now);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now + index * 0.025);
      osc.stop(now + (quiet ? 0.62 : 0.9));
    });
  }

  function mountSoundToggle() {
    if (document.querySelector('.mahou-sound-toggle')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mahou-sound-toggle';
    button.setAttribute('aria-label', 'Toggle Melodia ambient musical interactions');
    button.setAttribute('aria-pressed', 'false');
    button.textContent = '♪ sound asleep';
    document.body.appendChild(button);

    var stored = false;
    try { stored = sessionStorage.getItem('melodia-mahou-sound') === '1'; } catch (e) {}
    if (stored) setSoundEnabled(true);

    button.addEventListener('click', function () {
      var next = !soundState.enabled;
      if (next) getSoundContext();
      setSoundEnabled(next);
      if (next) playHeaderChord(document.title || 'Melodia', false);
    });
  }

  function scoreShoreSvg(text) {
    var h = hashText(text || 'shore');
    var notes = '';
    for (var i = 0; i < 6; i++) {
      var x = 58 + ((h >>> (i * 3)) % 410);
      var line = (h >>> (i * 2 + 1)) % 5;
      var y = 22 + line * 10 + ((i % 2) ? -3 : 2);
      var stem = i % 2 === 0 ? -17 : 17;
      notes +=
        '<g class="mahou-shore-note n' + i + '" transform="translate(' + x + ' ' + y + ')">' +
          '<ellipse rx="4.2" ry="3.1" transform="rotate(-18)" />' +
          '<line x1="3.5" y1="0" x2="3.5" y2="' + stem + '" />' +
        '</g>';
    }

    return (
      '<svg class="mahou-score-shore-svg" viewBox="0 0 520 78" preserveAspectRatio="none" aria-hidden="true">' +
        '<g class="mahou-score-waterlines">' +
          '<path d="M0 18 C72 10 126 28 196 18 S334 10 520 18" />' +
          '<path d="M0 28 C74 20 132 38 208 28 S348 20 520 28" />' +
          '<path d="M0 38 C68 30 128 47 206 38 S352 30 520 38" />' +
          '<path d="M0 48 C76 40 140 57 218 48 S370 40 520 48" />' +
          '<path d="M0 58 C82 50 144 67 224 58 S382 50 520 58" />' +
        '</g>' +
        '<g class="mahou-score-notes">' + notes + '</g>' +
        '<circle class="mahou-shore-pearl p1" cx="28" cy="37" r="3" />' +
        '<circle class="mahou-shore-pearl p2" cx="492" cy="42" r="2.6" />' +
      '</svg>'
    );
  }

  function pulseScoreShore(header, playSound) {
    var shore = header && header.parentNode ? header.parentNode.querySelector(':scope > .mahou-score-shore') : null;
    if (!shore) return;
    shore.classList.remove('is-rippling');
    void shore.offsetWidth;
    shore.classList.add('is-rippling');
    window.setTimeout(function () { shore.classList.remove('is-rippling'); }, 1150);
    if (playSound) playHeaderChord(header.textContent || 'Melodia', false);
  }

  function initMusicalShores() {
    var headers = Array.prototype.slice.call(document.querySelectorAll('.hero h1, main section h2, main .band h2'));
    headers.forEach(function (header, index) {
      if (header.getAttribute('data-mahou-shore-bound')) return;
      header.setAttribute('data-mahou-shore-bound', 'true');

      var shore = document.createElement('div');
      shore.className = 'mahou-score-shore';
      shore.setAttribute('aria-hidden', 'true');
      shore.innerHTML = scoreShoreSvg(header.textContent || 'Melodia');
      header.insertAdjacentElement('afterend', shore);

      var activate = function () { pulseScoreShore(header, true); };
      header.addEventListener('pointerdown', activate, { passive: true });
      header.addEventListener('focus', function () { pulseScoreShore(header, false); });

      if (index === 0 && !prefersReducedMotion()) {
        window.setTimeout(function () { pulseScoreShore(header, false); }, 900);
      }
    });

    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.58) return;
        var header = entry.target;
        pulseScoreShore(header, false);
      });
    }, { threshold: [0.58] });

    headers.forEach(function (header) { observer.observe(header); });
  }

  function sessionMoonPhase() {
    var key = 'melodia-mahou-page-orbit';
    var visits = 0;
    try {
      visits = parseInt(sessionStorage.getItem(key) || '0', 10) || 0;
      visits += 1;
      sessionStorage.setItem(key, String(visits));
    } catch (e) {
      visits = 1;
    }
    var phases = ['new', 'crescent', 'quarter', 'gibbous', 'full', 'gibbous', 'quarter', 'crescent'];
    var phase = phases[(visits - 1) % phases.length];
    document.documentElement.setAttribute('data-mahou-moon-phase', phase);
    return phase;
  }

  function mountMoonPhaseMark() {
    if (document.querySelector('.mahou-moon-phase-mark')) return;
    var phase = sessionMoonPhase();
    var glyphs = { 'new': '●', 'crescent': '◔', 'quarter': '◐', 'gibbous': '◕', 'full': '○' };
    var mark = document.createElement('div');
    mark.className = 'mahou-moon-phase-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<span>' + (glyphs[phase] || '◔') + '</span><small>' + phase + '</small>';
    document.body.appendChild(mark);
  }

  function dreamCreatureMarkup(kind) {
    if (kind === 'jelly') {
      return '<span class="mahou-jelly-cap"></span><span class="mahou-jelly-tentacle t1"></span><span class="mahou-jelly-tentacle t2"></span><span class="mahou-jelly-tentacle t3"></span>';
    }
    return '<span class="mahou-koi-body"></span><span class="mahou-koi-tail"></span><span class="mahou-koi-fin f1"></span><span class="mahou-koi-fin f2"></span><span class="mahou-koi-eye"></span>';
  }

  function spawnDreamCreature() {
    if (prefersReducedMotion() || document.hidden || document.querySelector('.mahou-dream-creature')) return;
    var skin = resolveWorldSkin();
    var kind = skin === 'melusina' || skin === 'moon' ? 'jelly' : 'koi';
    var creature = document.createElement('div');
    creature.className = 'mahou-dream-creature ' + kind;
    creature.setAttribute('aria-hidden', 'true');
    creature.style.setProperty('--creature-y', (20 + Math.random() * 55).toFixed(1) + 'vh');
    creature.style.setProperty('--creature-duration', (11 + Math.random() * 5).toFixed(1) + 's');
    creature.innerHTML = dreamCreatureMarkup(kind);
    document.body.appendChild(creature);
    removeAfter(creature, 17500);
  }

  function initRareCreatures() {
    if (prefersReducedMotion()) return;
    var first = 16000 + Math.random() * 9000;
    window.setTimeout(function loop() {
      if (Math.random() < 0.62) spawnDreamCreature();
      window.setTimeout(loop, 24000 + Math.random() * 18000);
    }, first);
  }

  function hiddenRoseSvg() {
    var spokes = '';
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2;
      var x = 160 + Math.cos(a) * 94;
      var y = 160 + Math.sin(a) * 94;
      spokes += '<line x1="160" y1="160" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" />';
    }
    return '<svg viewBox="0 0 320 320" aria-hidden="true"><circle cx="160" cy="160" r="118"/><circle class="inner" cx="160" cy="160" r="78"/><circle class="inner" cx="160" cy="160" r="34"/>' + spokes + '<path d="M160 42 C188 92 228 110 278 160 C228 188 210 228 160 278 C132 228 92 210 42 160 C92 132 110 92 160 42 Z"/></svg>';
  }

  function revealHiddenRose(section) {
    if (!section || section.querySelector(':scope > .mahou-hidden-rose-window')) return;
    if (window.getComputedStyle(section).position === 'static') section.style.position = 'relative';
    var rose = document.createElement('div');
    rose.className = 'mahou-hidden-rose-window';
    rose.setAttribute('aria-hidden', 'true');
    rose.innerHTML = hiddenRoseSvg();
    section.appendChild(rose);
    window.requestAnimationFrame(function () { rose.classList.add('is-revealed'); });
  }

  function initLingeringRoseWindow() {
    if (!('IntersectionObserver' in window)) return;
    var shown = false;
    var timer = null;
    var current = null;
    var sections = Array.prototype.slice.call(document.querySelectorAll('main > .band, main > section.band'));

    var observer = new IntersectionObserver(function (entries) {
      if (shown) return;
      entries.forEach(function (entry) {
        if (shown) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.62) {
          if (current === entry.target) return;
          current = entry.target;
          if (timer) window.clearTimeout(timer);
          timer = window.setTimeout(function () {
            if (!shown && current === entry.target) {
              revealHiddenRose(entry.target);
              shown = true;
              try { sessionStorage.setItem('melodia-mahou-rose-seen', '1'); } catch (e) {}
            }
          }, prefersReducedMotion() ? 2200 : 4600);
        } else if (current === entry.target) {
          current = null;
          if (timer) window.clearTimeout(timer);
          timer = null;
        }
      });
    }, { threshold: [0.62] });

    var already = false;
    try { already = sessionStorage.getItem('melodia-mahou-rose-seen') === '1'; } catch (e) {}
    if (already) return;
    sections.forEach(function (section, index) {
      if (index > 0 && index % 2 === 0) observer.observe(section);
    });
  }

  function initTouchRipples() {
    document.addEventListener('pointerdown', function (event) {
      if (event.target && event.target.closest && event.target.closest('button, a, input, textarea, select')) return;
      if (prefersReducedMotion()) return;

      var ring = document.createElement('span');
      ring.className = 'mahou-touch-ripple';
      ring.setAttribute('aria-hidden', 'true');
      ring.style.left = event.clientX + 'px';
      ring.style.top = event.clientY + 'px';
      document.body.appendChild(ring);
      removeAfter(ring, 1300);
    }, { passive: true });
  }

  function applyPhiComposition() {
    var PHI = 1.618033988749895;
    var MAJOR = 1 / PHI;
    var MINOR = 1 - MAJOR;
    var archetypes = [
      'spiral-left',
      'phi-split',
      'void-majority',
      'spiral-right',
      'golden-horizon',
      'fibonacci-stack'
    ];
    var fib = [13, 21, 34, 55, 89, 144];
    var sections = Array.prototype.slice.call(document.querySelectorAll('.hero, main > .band, main > section.band'));
    if (!sections.length) return;

    var offset = hashText(pageSlug()) % archetypes.length;
    document.documentElement.style.setProperty('--phi', PHI.toFixed(9));
    document.documentElement.style.setProperty('--phi-major', (MAJOR * 100).toFixed(3) + '%');
    document.documentElement.style.setProperty('--phi-minor', (MINOR * 100).toFixed(3) + '%');

    sections.forEach(function (section, index) {
      if (section.getAttribute('data-phi-lock') === 'off') return;
      var archetype = index === 0 ? 'golden-horizon' : archetypes[(index + offset) % archetypes.length];
      var focusLeft = archetype === 'spiral-left' || archetype === 'phi-split';
      var focusX = focusLeft ? MINOR : MAJOR;
      var focusY = index % 2 === 0 ? MINOR : MAJOR;
      var fibStep = fib[(index + offset) % fib.length];

      section.classList.add('mahou-phi-composed');
      section.setAttribute('data-phi-layout', archetype);
      section.style.setProperty('--phi-focus-x', (focusX * 100).toFixed(3) + '%');
      section.style.setProperty('--phi-focus-y', (focusY * 100).toFixed(3) + '%');
      section.style.setProperty('--phi-gap', fibStep + 'px');
      section.style.setProperty('--phi-gap-small', Math.max(13, fibStep / PHI).toFixed(1) + 'px');

      var imgs = section.querySelectorAll('.hero-media img, .viz-plate img, .viz-door img, .image-card img, .env-card img');
      Array.prototype.forEach.call(imgs, function (img) {
        if (img.getAttribute('data-phi-focus') === 'off') return;
        img.style.setProperty('--phi-object-x', (focusX * 100).toFixed(2) + '%');
        img.style.setProperty('--phi-object-y', (focusY * 100).toFixed(2) + '%');
        img.classList.add('mahou-phi-image');
      });
    });
  }

  function initScrollScore() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('.hero, main > .band, main > section.band'));
    if (!sections.length) return;

    var activeIndex = -1;
    var raf = 0;
    var lastSoundAt = -Infinity;

    function update() {
      raf = 0;
      var focusY = window.innerHeight * (window.matchMedia('(max-width: 720px)').matches ? 0.46 : 0.52);
      var bestIndex = 0;
      var bestDistance = Infinity;

      sections.forEach(function (section, index) {
        var rect = section.getBoundingClientRect();
        var center = rect.top + rect.height * 0.5;
        var distance = Math.abs(center - focusY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }

        var local = Math.max(0, Math.min(1, (focusY - rect.top) / Math.max(rect.height, 1)));
        section.style.setProperty('--mahou-section-progress', local.toFixed(3));
        section.style.setProperty('--mahou-shore-lift', ((local - 0.5) * -3).toFixed(2) + 'px');
        section.style.setProperty('--mahou-shore-drift', ((local - 0.5) * 8).toFixed(2) + 'px');
      });

      document.documentElement.style.setProperty('--mahou-scroll-phrase', String(bestIndex % 8));

      if (bestIndex === activeIndex) return;
      activeIndex = bestIndex;
      sections.forEach(function (section, index) {
        section.classList.toggle('mahou-current-phrase', index === activeIndex);
      });

      var active = sections[activeIndex];
      var header = active && active.querySelector('h1, h2');
      if (header) {
        pulseScoreShore(header, false);
        var now = performance.now();
        if (soundState.enabled && now - lastSoundAt > 3000) {
          playHeaderChord(header.textContent || 'Melodia', true);
          lastSoundAt = now;
        }
      }
    }

    function schedule() {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
  }

  function initAmbientEvents() {
    applyWorldSkin();
    applyPhiComposition();
    mountMoonPhaseMark();
    mountSoundToggle();
    initLivingFiligree();
    initMusicalShores();
    initScrollScore();
    initLingeringRoseWindow();
    initTouchRipples();
    if (!prefersReducedMotion()) {
      initSectionBlooms();
      bindRarePetalCracks();
      initDormantCursorSigil();
      bindRarePortalTransitions();
      initRareCreatures();
    }
  }

  function init() {
    mountHeroFlourish();
    initPointerTrails();
    bindInteractiveTriggers();
    initAmbientEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.MelodiaMahouFlourish = {
    init: init,
    mount: mountHeroFlourish,
    mountHeroFlourish: mountHeroFlourish,
    trigger: triggerHenshin,
    triggerHenshin: triggerHenshin,
    burst: burst,
    constellationBloom: constellationBloom,
    phyllotaxisBloom: phyllotaxisBloom,
    petalCrack: petalCrack,
    wakeCursorSigil: wakeCursorSigil,
    resolveWorldSkin: resolveWorldSkin,
    applyWorldSkin: applyWorldSkin,
    initLivingFiligree: initLivingFiligree,
    bindRarePortalTransitions: bindRarePortalTransitions,
    initMusicalShores: initMusicalShores,
    applyPhiComposition: applyPhiComposition,
    initScrollScore: initScrollScore,
    playHeaderChord: playHeaderChord,
    spawnDreamCreature: spawnDreamCreature,
    revealHiddenRose: revealHiddenRose,
    sessionMoonPhase: sessionMoonPhase,
    initAmbientEvents: initAmbientEvents
  };
})(window);
