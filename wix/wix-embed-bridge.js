/**
 * Melodia Wix embed bridge.
 * Marks iframe mode and reports document/viewport measurements to the parent.
 * The Wix host may use these messages for diagnostics or future dynamic sizing.
 */
(function () {
  'use strict';

  if (window.self === window.top) return;

  var root = document.documentElement;
  root.classList.add('wix-embedded');
  root.setAttribute('data-embed-host', 'wix');

  var targetOrigin = '*';
  try {
    var ref = new URL(document.referrer || '');
    if (
      /(^|\.)fromageart\.xyz$/i.test(ref.hostname) ||
      /(^|\.)wixsite\.com$/i.test(ref.hostname) ||
      /(^|\.)wix\.com$/i.test(ref.hostname)
    ) {
      targetOrigin = ref.origin;
    }
  } catch (e) {}

  var raf = 0;
  function sendMetrics() {
    raf = 0;
    var body = document.body;
    var doc = document.documentElement;
    var height = Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      doc.scrollHeight,
      doc.offsetHeight,
      doc.clientHeight
    );

    window.parent.postMessage({
      source: 'melodia-portfolio',
      type: 'melodia:embed-metrics',
      path: location.pathname,
      height: height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      build: '20260904p1'
    }, targetOrigin);
  }

  function scheduleMetrics() {
    if (raf) return;
    raf = window.requestAnimationFrame(sendMetrics);
  }

  document.addEventListener('DOMContentLoaded', scheduleMetrics, { once: true });
  window.addEventListener('load', scheduleMetrics, { once: true });
  window.addEventListener('resize', scheduleMetrics, { passive: true });

  if ('ResizeObserver' in window) {
    new ResizeObserver(scheduleMetrics).observe(document.documentElement);
  }
})();