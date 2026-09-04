/**
 * Wix public-entry bootstrap.
 *
 * fromageart.xyz embeds application-hub.html as its long-lived iframe URL.
 * When that page is entered from an external iframe shell, route the iframe
 * to the art-first homepage. Direct/top-level Hub visits and in-site links
 * from GitHub Pages remain on the technical Architecture Hub.
 */
(function () {
  'use strict';

  if (window.self === window.top) return;

  var referrer = document.referrer || '';
  var cameFromSite = /^https:\/\/fromage3900\.github\.io(?:\/|$)/i.test(referrer);

  if (!cameFromSite) {
    window.location.replace('index.html');
  }
})();