/**
 * Render evidence passports — binds a specific published plate to its
 * asset passport, material assignment confidence, and pixel-review verdict.
 */
(function () {
  'use strict';

  var PASSPORTS_URL = '../content/render-passports.json';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function chip(label, value, cls, href, title) {
    var body = '<span class="render-passport-label">' + esc(label) + '</span>' +
      '<strong>' + esc(value) + '</strong>';
    var attrs = ' class="render-passport-chip ' + esc(cls || '') + '"' +
      (title ? ' title="' + esc(title) + '"' : '');
    if (href) {
      return '<a' + attrs + ' href="' + esc(href) + '" target="_blank" rel="noopener">' + body + '</a>';
    }
    return '<span' + attrs + '>' + body + '</span>';
  }

  function materialText(material) {
    if (!material) return 'Unverified';
    if (material.status === 'not_applicable') return 'N/A · study';
    return material.label || material.status || 'Unverified';
  }

  function evidenceText(evidence) {
    var status = evidence && evidence.status ? evidence.status : 'unverified';
    if (status === 'accepted') return 'Verified';
    if (status === 'supporting') return 'Supporting';
    if (status === 'reject') return 'Rejected';
    return status;
  }

  function hydrateFigure(figure, entry) {
    if (!figure || !entry) return;
    var old = figure.querySelector('.render-passport-strip');
    if (old) old.remove();

    var asset = entry.asset || {};
    var material = entry.material || {};
    var evidence = entry.evidence || {};
    var strip = document.createElement('div');
    strip.className = 'render-passport-strip';
    strip.setAttribute('aria-label', 'Render evidence passport');

    var materialClass = 'material-' + (material.status || 'unverified');
    var evidenceClass = 'evidence-' + (evidence.status || 'unverified');
    strip.innerHTML =
      chip(
        'Asset',
        asset.label || 'Unverified',
        'asset-passport',
        asset.passport_href || '',
        asset.note || ''
      ) +
      chip(
        material.status === 'not_applicable' ? 'Preview' : 'Material',
        materialText(material),
        materialClass,
        '',
        material.note || ''
      ) +
      chip(
        'Evidence',
        evidenceText(evidence),
        evidenceClass,
        '',
        (evidence.does_not_prove || []).length
          ? 'Does not prove: ' + evidence.does_not_prove.join(', ')
          : ''
      );

    figure.appendChild(strip);
    figure.dataset.evidenceStatus = evidence.status || 'unverified';
  }

  function boot() {
    var figures = Array.prototype.slice.call(document.querySelectorAll('[data-passport-key]'));
    if (!figures.length) return;

    fetch(PASSPORTS_URL, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('render passport HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var entries = data.entries || {};
        figures.forEach(function (figure) {
          var key = figure.getAttribute('data-passport-key');
          hydrateFigure(figure, entries[key]);
        });
      })
      .catch(function () {
        /* Passport annotations are progressive enhancement; gallery remains usable. */
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.MelodiaRenderPassports = { refresh: boot };
})();
