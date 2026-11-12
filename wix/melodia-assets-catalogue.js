/**
 * FROMΔGE Assets catalogue — renders content/assets-catalogue.json as product cards with category filters and search.
 * Record fields: title, slug, category, software[], thumbnail, status, license, formats[], description, purchase_url (optional, verified only).
 * Pure filter logic lives in matchesFilters()/filterProducts() so tools/test-assets-catalogue.js can exercise it under Node.
 */
(function (global) {
  'use strict';

  var DATA_URL = '../content/assets-catalogue.json';

  function filterProducts(products, state) {
    var q = (state.query || '').trim().toLowerCase();
    return products.filter(function (p) {
      if (state.category && state.category !== 'all' && p.category !== state.category) return false;
      if (!q) return true;
      var hay = [p.title, p.description, p.category].concat(p.software || [], p.formats || []).join(' ').toLowerCase();
      return q.split(/\s+/).every(function (term) { return hay.indexOf(term) !== -1; });
    });
  }

  function countByCategory(products) {
    return products.reduce(function (acc, p) { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  function card(p, categoryLabel) {
    var thumb = p.thumbnail
      ? el('img', { src: p.thumbnail, alt: p.title + ' thumbnail', loading: 'lazy', decoding: 'async' })
      : el('div', { 'class': 'asset-thumb-empty', 'aria-hidden': 'true', text: categoryLabel });
    var body = [
      el('span', { 'class': 'asset-kicker', text: categoryLabel }),
      el('h3', { text: p.title }),
      el('p', { text: p.description || '' }),
      el('ul', { 'class': 'asset-meta', 'aria-label': 'Details' }, [
        el('li', { text: 'Software: ' + ((p.software || []).join(', ') || '—') }),
        el('li', { text: 'Formats: ' + ((p.formats || []).join(', ') || '—') }),
        el('li', { text: 'License: ' + (p.license || '—') })
      ])
    ];
    var article = el('article', { 'class': 'asset-card', 'data-category': p.category }, [
      el('div', { 'class': 'asset-thumb' }, [thumb]),
      el('div', { 'class': 'asset-body' }, body)
    ]);
    if (p.purchase_url) {
      article.appendChild(el('a', { 'class': 'asset-action', href: p.purchase_url, rel: 'noopener', text: 'View details' }));
    } else {
      article.appendChild(el('p', { 'class': 'asset-status', text: p.status === 'published' ? 'Available on request' : 'Draft — not yet released' }));
    }
    return article;
  }

  // Never expose drafts or incomplete listings in the public catalogue, even if
  // content/assets-catalogue.json contains work-in-progress product records.
  function getPublicProducts(products) {
    return (Array.isArray(products) ? products : []).filter(function (p) {
      return Boolean(p && p.status === 'published' &&
        typeof p.title === 'string' && p.title.trim() &&
        typeof p.description === 'string' && p.description.trim() &&
        typeof p.category === 'string' && p.category.trim() &&
        typeof p.thumbnail === 'string' && p.thumbnail.trim() &&
        typeof p.license === 'string' && p.license.trim() &&
        Array.isArray(p.software) && p.software.length > 0 &&
        Array.isArray(p.formats) && p.formats.length > 0 &&
        typeof p.purchase_url === 'string' && /^https:\/\//i.test(p.purchase_url));
    });
  }

  function render(root, data) {
    var products = getPublicProducts(data.products);
    var catLabel = {};
    data.categories.forEach(function (c) { catLabel[c.id] = c.label; });
    var state = { category: 'all', query: '' };
    var counts = countByCategory(products);

    var empty = root.querySelector('[data-assets-empty-catalogue]');
    if (empty) empty.hidden = products.length !== 0;

    var filters = root.querySelector('[data-assets-filters]');
    filters.innerHTML = '';
    var all = [{ id: 'all', label: 'All' }].concat(data.categories);
    all.forEach(function (c) {
      var n = c.id === 'all' ? products.length : (counts[c.id] || 0);
      var b = el('button', { type: 'button', 'class': 'asset-filter', 'data-category': c.id, 'aria-pressed': c.id === state.category ? 'true' : 'false', text: c.label + ' (' + n + ')' });
      b.addEventListener('click', function () { state.category = c.id; sync(); });
      filters.appendChild(b);
    });

    var input = root.querySelector('[data-assets-search]');
    input.addEventListener('input', function () { state.query = input.value; sync(); });

    var grid = root.querySelector('[data-assets-grid]');
    var summary = root.querySelector('[data-assets-summary]');
    var none = root.querySelector('[data-assets-no-results]');

    function sync() {
      Array.prototype.forEach.call(filters.children, function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-category') === state.category ? 'true' : 'false');
      });
      var list = filterProducts(products, state);
      grid.innerHTML = '';
      list.forEach(function (p) { grid.appendChild(card(p, catLabel[p.category] || p.category)); });
      summary.textContent = list.length + ' of ' + products.length + ' assets shown';
      none.hidden = !(products.length > 0 && list.length === 0);
    }
    sync();
  }

  function init() {
    var root = document.querySelector('[data-assets-root]');
    if (!root) return;
    fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { render(root, data); })
      .catch(function () {
        var err = root.querySelector('[data-assets-error]');
        if (err) err.hidden = false;
      });
  }

  var api = { filterProducts: filterProducts, countByCategory: countByCategory, getPublicProducts: getPublicProducts };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.FromageAssets = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
