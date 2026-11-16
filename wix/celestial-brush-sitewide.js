/*
 * Site-wide Celestial Brush: render the ORIGINAL Three.js brush math onto
 * a native transparent canvas in the page — never over an opaque iframe.
 * No redesign, no pointer interception and no unrelated image replacements.
 */
(function () {
  'use strict';
  if (window.MelodiaCelestialSitewideLoaded) return;
  window.MelodiaCelestialSitewideLoaded = true;
  if (window.top !== window.self) return;
  if (/\/constellation-brush\.html$/i.test(location.pathname)) return;
  if (!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches) return;
  if (document.querySelector('canvas[data-webgl-main], .photobooth-stage, #melusina-photobooth-mount')) return;

  var canvas = null, ready = false, loading = false;
  var last = null, lastPost = 0, active = true;
  function loadScript(src, success, fail) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = success;
    script.onerror = fail || function(){};
    document.head.appendChild(script);
  }
  function bootEngine() {
    loadScript('celestial-brush-overlay-engine.js?v=20261115',
      function () {
        ready = !!window.MelodiaCelestialBrushInput;
        if (ready && last) window.MelodiaCelestialBrushInput.move(last);
      },
      function () { if (canvas) canvas.remove(); canvas = null; });
  }
  function mount() {
    if (loading || !active) return;
    loading = true;
    canvas = document.createElement('canvas');
    canvas.id = 'melodia-celestial-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.dataset.celestialSitewide = 'true';
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;z-index:90;pointer-events:none;background:transparent;opacity:.72;touch-action:auto;';
    document.body.appendChild(canvas);
    if (window.THREE && window.THREE.WebGLRenderer) { bootEngine(); return; }
    var fallback = function() {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',bootEngine,
        function(){ if(canvas)canvas.remove();canvas=null; });
    };
    loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',bootEngine,fallback);
  }
  function leave() {
    if (ready && window.MelodiaCelestialBrushInput) window.MelodiaCelestialBrushInput.leave();
  }
  document.addEventListener('pointermove', function(event) {
    if (!active || document.hidden || event.pointerType === 'touch') return;
    if (event.target && event.target.closest && event.target.closest('a,button,input,textarea,select,summary,[role="button"],iframe,canvas,[data-no-celestial]')) {
      leave(); return;
    }
    var now = performance.now();
    if (now - lastPost < 28) return;
    lastPost = now;
    last = {clientX:event.clientX, clientY:event.clientY, pointerId:1, pointerType:'mouse', pressure:.5};
    if (!canvas) mount();
    if (ready && window.MelodiaCelestialBrushInput) window.MelodiaCelestialBrushInput.move(last);
  },{passive:true});
  document.addEventListener('pointerleave',leave,{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden)leave()});
  window.addEventListener('pagehide',function(){
    active=false;leave();
    if(canvas){canvas.remove();canvas=null}
  });
})();
