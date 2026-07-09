/**
 * Melodia Dream Shaders — cursor-driven fresnel + ambient layer mount.
 * Maps mouse position to CSS vars for iridescent hero rims (web "shader" UX).
 */
(function (global) {
  'use strict';

  function mountDreamLayers() {
    document.querySelectorAll('.melodia-shell').forEach((shell) => {
      if (shell.querySelector(':scope > .dream-aurora-layer')) return;

      const aurora = document.createElement('div');
      aurora.className = 'dream-aurora-layer';
      aurora.setAttribute('aria-hidden', 'true');

      const sparkle = document.createElement('div');
      sparkle.className = 'dream-sparkle-layer';
      sparkle.setAttribute('aria-hidden', 'true');

      shell.insertBefore(sparkle, shell.firstChild);
      shell.insertBefore(aurora, shell.firstChild);
    });
  }

  function initDreamShaders() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    mountDreamLayers();

    const root = document.documentElement;
    let ticking = false;

    const setVars = (x, y) => {
      const nx = Math.max(0, Math.min(1, x));
      const ny = Math.max(0, Math.min(1, y));
      root.style.setProperty('--dream-mouse-x', String(nx));
      root.style.setProperty('--dream-mouse-y', String(ny));
      const fresnel = 0.22 + (1 - ny) * 0.28 + Math.abs(nx - 0.5) * 0.2;
      root.style.setProperty('--dream-fresnel', fresnel.toFixed(3));
    };

    const onMove = (event) => {
      if (reduceMotion.matches) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVars(event.clientX / window.innerWidth, event.clientY / window.innerHeight);
          ticking = false;
        });
        ticking = true;
      }
    };

    setVars(0.42, 0.38);
    window.addEventListener('pointermove', onMove, { passive: true });

    if (!reduceMotion.matches) {
      let hue = 0;
      const driftHue = () => {
        hue = (hue + 0.15) % 360;
        root.style.setProperty('--dream-hue-shift', `${hue}deg`);
        window.requestAnimationFrame(driftHue);
      };
      window.requestAnimationFrame(driftHue);
    }
  }

  global.MelodiaDreamShaders = { init: initDreamShaders, mountDreamLayers };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDreamShaders);
  } else {
    initDreamShaders();
  }
})(window);
