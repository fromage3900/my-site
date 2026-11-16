/*
 * Melodia Celestial Brush — site-wide bridge to the ORIGINAL Three.js
 * gesture-reading constellation-brush.html. No duplicate VFX implementation.
 * WebGL is lazy, desktop fine-pointer only, transparent and hit-test neutral.
 * Respects reduced motion and page visibility.
 */
(function () {
  'use strict';
  if (window.MelodiaCelestialSitewideLoaded) return;
  window.MelodiaCelestialSitewideLoaded = true;
  if (window.top !== window.self) return;
  if (/\/constellation-brush\.html$/i.test(location.pathname)) return;
  if (!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches) return;
  // Avoid a second GPU context over an active 3D canvas/workbench/game.
  if (document.querySelector('canvas[data-webgl-main], .photobooth-stage, #melusina-photobooth-mount')) return;

  var frame = null, ready = false, last = null, lastPost = 0;
  var allow = true, origin = location.origin;
  function send(type, e) {
    if (!ready || !frame || !frame.contentWindow) return;
    try {
      frame.contentWindow.postMessage({ melodiaCelestial:'v1', type:type, x:e && e.x, y:e && e.y }, origin);
    } catch (_error) { /* decorative effect must never block site navigation */ }
  }
  function mount() {
    if (frame) return;
    frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden','true');
    frame.setAttribute('tabindex','-1');
    frame.setAttribute('title','Decorative interactive celestial brush');
    frame.dataset.celestialSitewide = 'true';
    frame.src = 'constellation-brush.html?overlay=1';
    frame.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;z-index:90;pointer-events:none;border:0;background:transparent;opacity:.65;contain:strict;';
    frame.addEventListener('load', function () { ready = true; if(last) send('move',last); }, {once:true});
    document.body.appendChild(frame);
  }
  document.addEventListener('pointermove', function(e) {
    if (!allow || e.pointerType === 'touch' || document.hidden) return;
    if (e.target && e.target.closest && e.target.closest('a,button,input,textarea,select,summary,[role="button"],iframe,canvas,[data-no-celestial]')) {
      send('leave'); return;
    }
    var now = performance.now();
    if (now-lastPost < 28) return; // bounded ~35Hz upstream
    lastPost = now;
    last = {x:e.clientX,y:e.clientY};
    mount();
    send('move',last);
  }, {passive:true});
  document.addEventListener('pointerleave',function(){send('leave');},{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden)send('leave');});
  window.addEventListener('pagehide',function(){allow=false;send('leave');if(frame){frame.remove();frame=null;}});
})();
