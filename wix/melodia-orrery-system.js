/**
 * Melodia Orrery System — injectable SVG armillary variants for heroes and section accents.
 * Variants: cosmic (hero), atelier (fashion editorial bands), constellation (compact nav accent).
 */
(function (global) {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';

  const VARIANTS = {
    cosmic: `
      <g class="ring slow"><circle class="orbit" cx="260" cy="260" r="226"/><path class="axis" d="M98 422 422 98"/><circle class="node" cx="420" cy="100" r="4"/></g>
      <g class="ring"><circle class="orbit" cx="260" cy="260" r="166"/><path class="axis" d="M132 260h256"/><circle class="node" cx="389" cy="260" r="3.5"/></g>
      <g class="ring fast"><circle class="orbit" cx="260" cy="260" r="92"/><path class="axis" d="M260 168v184"/><circle class="node" cx="260" cy="168" r="3"/></g>
      <circle class="orbit" cx="260" cy="260" r="22"/>
    `,
    atelier: `
      <ellipse class="orbit ellipse" cx="200" cy="200" rx="178" ry="132" transform="rotate(-18 200 200)"/>
      <ellipse class="orbit ellipse thin" cx="200" cy="200" rx="128" ry="94" transform="rotate(24 200 200)"/>
      <ellipse class="orbit ellipse" cx="200" cy="200" rx="72" ry="52" transform="rotate(-8 200 200)"/>
      <path class="axis" d="M40 200h320"/>
      <path class="axis" d="M200 48v304"/>
      <circle class="node quatrefoil" cx="200" cy="200" r="5"/>
      <circle class="node" cx="368" cy="168" r="2.8"/>
      <circle class="node" cx="56" cy="232" r="2.2"/>
      <path class="axis fashion-cross" d="M200 20v24M200 356v24M20 200h24M356 200h24"/>
    `,
    constellation: `
      <g class="ring"><circle class="orbit" cx="120" cy="120" r="98"/><circle class="node" cx="210" cy="120" r="2.5"/></g>
      <g class="ring slow"><circle class="orbit" cx="120" cy="120" r="62"/><path class="axis" d="M58 120h124"/></g>
      <circle class="orbit" cx="120" cy="120" r="14"/>
      <circle class="node" cx="120" cy="38" r="2"/>
      <circle class="node" cx="178" cy="168" r="1.8"/>
    `,
  };

  function createOrrery(variant, viewBox) {
    const wrap = document.createElement('div');
    const v = VARIANTS[variant] ? variant : 'atelier';
    const vb = viewBox || (v === 'constellation' ? '0 0 240 240' : '0 0 400 400');
    wrap.className = `orrery-mount orrery-${v}`;
    wrap.innerHTML = `<svg viewBox="${vb}" role="img" aria-hidden="true">${VARIANTS[v]}</svg>`;
    return wrap;
  }

  function mountElement(el) {
    if (!el || el.dataset.orreryMounted === 'true') return;
    const variant = el.getAttribute('data-orrery') || 'atelier';
    const viewBox = el.getAttribute('data-orrery-viewbox') || '';
    const mount = createOrrery(variant, viewBox || undefined);
    el.appendChild(mount);
    el.dataset.orreryMounted = 'true';
  }

  function mountAll(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-orrery]').forEach(mountElement);
  }

  function upgradeHeroOrreries() {
    document.querySelectorAll('.melodia-orrery').forEach((el) => {
      if (el.querySelector('svg')) return;
      el.setAttribute('data-orrery', 'cosmic');
      el.setAttribute('data-orrery-viewbox', '0 0 520 520');
      el.innerHTML = '';
      mountElement(el);
      const svg = el.querySelector('svg');
      if (svg) svg.setAttribute('viewBox', '0 0 520 520');
    });
  }

  global.MelodiaOrrery = { mountAll, mountElement, createOrrery, upgradeHeroOrreries };
})(window);
