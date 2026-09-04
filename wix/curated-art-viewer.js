/**
 * Curated Art viewer — quiet fullscreen inspection for phone/desktop.
 * Originals remain the authoritative full-resolution source.
 */
(function () {
  'use strict';

  function boot() {
    var pieces = Array.prototype.slice.call(document.querySelectorAll('.art-piece'));
    var links = pieces.map(function (piece) { return piece.querySelector('a[href]'); }).filter(Boolean);
    if (!links.length) return;

    var body = document.body;
    var shell = document.querySelector('.melodia-shell');
    var active = -1;
    var restoreFocus = null;
    var pointerStartX = null;

    var viewer = document.createElement('div');
    viewer.className = 'art-viewer';
    viewer.hidden = true;
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'Artwork viewer');
    viewer.innerHTML =
      '<button class="art-viewer-close" type="button" aria-label="Close artwork viewer">×</button>' +
      '<button class="art-viewer-prev" type="button" aria-label="Previous artwork">‹</button>' +
      '<div class="art-viewer-stage">' +
        '<img class="art-viewer-image" alt="" draggable="false" />' +
      '</div>' +
      '<button class="art-viewer-next" type="button" aria-label="Next artwork">›</button>' +
      '<div class="art-viewer-meta">' +
        '<div class="art-viewer-caption"><strong></strong><span></span></div>' +
        '<div class="art-viewer-progress" aria-live="polite"></div>' +
      '</div>';
    document.body.appendChild(viewer);

    var image = viewer.querySelector('.art-viewer-image');
    var close = viewer.querySelector('.art-viewer-close');
    var prev = viewer.querySelector('.art-viewer-prev');
    var next = viewer.querySelector('.art-viewer-next');
    var capTitle = viewer.querySelector('.art-viewer-caption strong');
    var capType = viewer.querySelector('.art-viewer-caption span');
    var progress = viewer.querySelector('.art-viewer-progress');

    function infoAt(index) {
      var link = links[index];
      var piece = link.closest('.art-piece');
      var thumb = piece.querySelector('img');
      var title = piece.querySelector('figcaption span');
      var type = piece.querySelector('figcaption small');
      return {
        src: link.getAttribute('href'),
        alt: thumb ? thumb.getAttribute('alt') || '' : '',
        title: title ? title.textContent.trim() : 'Artwork',
        type: type ? type.textContent.trim() : ''
      };
    }

    function render(index) {
      active = (index + links.length) % links.length;
      var info = infoAt(active);
      image.src = info.src;
      image.alt = info.alt;
      capTitle.textContent = info.title;
      capType.textContent = info.type;
      progress.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(links.length).padStart(2, '0');
    }

    function open(index, trigger) {
      restoreFocus = trigger || document.activeElement;
      render(index);
      viewer.hidden = false;
      body.classList.add('art-viewer-open');
      if (shell) shell.setAttribute('aria-hidden', 'true');
      close.focus({ preventScroll: true });
    }

    function shut() {
      viewer.hidden = true;
      body.classList.remove('art-viewer-open');
      image.removeAttribute('src');
      if (shell) shell.removeAttribute('aria-hidden');
      if (restoreFocus && restoreFocus.focus) restoreFocus.focus({ preventScroll: true });
    }

    links.forEach(function (link, index) {
      link.addEventListener('click', function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        open(index, link);
      });
    });

    close.addEventListener('click', shut);
    prev.addEventListener('click', function () { render(active - 1); });
    next.addEventListener('click', function () { render(active + 1); });

    viewer.addEventListener('click', function (event) {
      if (event.target === viewer || event.target.classList.contains('art-viewer-stage')) shut();
    });

    viewer.addEventListener('pointerdown', function (event) {
      pointerStartX = event.clientX;
    }, { passive: true });

    viewer.addEventListener('pointerup', function (event) {
      if (pointerStartX === null) return;
      var dx = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(dx) < 52) return;
      render(active + (dx < 0 ? 1 : -1));
    }, { passive: true });

    document.addEventListener('keydown', function (event) {
      if (viewer.hidden) return;
      if (event.key === 'Escape') shut();
      else if (event.key === 'ArrowLeft') render(active - 1);
      else if (event.key === 'ArrowRight') render(active + 1);
      else if (event.key === 'Tab') {
        var controls = [close, prev, next];
        var current = controls.indexOf(document.activeElement);
        if (event.shiftKey && current <= 0) {
          event.preventDefault(); next.focus();
        } else if (!event.shiftKey && current === controls.length - 1) {
          event.preventDefault(); close.focus();
        }
      }
    });

    if ('IntersectionObserver' in window) {
      var quietSections = new Set();
      var silenceObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.42) quietSections.add(entry.target);
          else quietSections.delete(entry.target);
        });
        body.classList.toggle('art-silence-active', quietSections.size > 0);
      }, { threshold: [0.42, 0.62] });

      document.querySelectorAll('[data-art-silence="true"]').forEach(function (section) {
        silenceObserver.observe(section);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();