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
      if (index === 0 || index % 3 !== 1) return;
      section.setAttribute('data-mahou-rare-candidate', 'constellation');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.42) return;
        var el = entry.target;
        if (el.getAttribute('data-mahou-rare-seen') === 'true') return;
        el.setAttribute('data-mahou-rare-seen', 'true');
        if (rareEventReady()) constellationBloom(el);
      });
    }, { threshold: [0.42, 0.62] });

    document.querySelectorAll('[data-mahou-rare-candidate="constellation"]').forEach(function (section) {
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

  function initAmbientEvents() {
    if (prefersReducedMotion()) return;
    initSectionBlooms();
    bindRarePetalCracks();
    initDormantCursorSigil();
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
    petalCrack: petalCrack,
    wakeCursorSigil: wakeCursorSigil,
    initAmbientEvents: initAmbientEvents
  };
})(window);
