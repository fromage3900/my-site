/**
 * Melodia Melusina Photobooth — Infinity Nikki Photo-Spot Engine
 * Interactive lens zoom, filter LUT switching, pose selection, and snapshot burst.
 */
(function (global) {
  'use strict';

  var POSES = [
    { id: 'glam_c01', name: 'Glam Pose I', src: '../generated/assets/character/melusina_beauty_eevee_20260715c_01.png' },
    { id: 'glam_c02', name: 'Glam Pose II', src: '../generated/assets/character/melusina_eevee_glam_20260715c_02.png' },
    { id: 'three_quarter', name: '3/4 Jewelry', src: '../generated/assets/character/melusina_hero_20260712/melusina_hero_three_quarter_jewelry.png' },
    { id: 'flip_hair', name: 'Water Hair', src: '../generated/assets/character/melusina_flip_hair_eevee_glam_20260813_01.png' },
    { id: 'wireframe', name: 'Topology Mesh', src: '../generated/assets/character/melusina_34_wireframe_grey_20260715.png' }
  ];

  var FILTERS = [
    { id: 'normal', name: 'Original', class: 'filter-normal' },
    { id: 'sakura', name: 'Sakura Bloom', class: 'filter-sakura' },
    { id: 'moonlight', name: 'Fallen Moon', class: 'filter-moonlight' },
    { id: 'gilded', name: 'Gilded Atelier', class: 'filter-gilded' },
    { id: 'celestial', name: 'Celestial Orrery', class: 'filter-celestial' }
  ];

  var LENSES = [
    { id: 'wide', name: '24mm Wide', scale: 1 },
    { id: 'portrait', name: '50mm Prime', scale: 1.25 },
    { id: 'tele', name: '85mm Close-Up', scale: 1.6 }
  ];

  function init(containerSelector) {
    var root = document.querySelector(containerSelector || '#melusina-photobooth-mount');
    if (!root) return;

    var state = {
      currentPose: POSES[0],
      currentFilter: FILTERS[0],
      currentLens: LENSES[0]
    };

    function render() {
      root.innerHTML = `
        <div class="photobooth-container">
          <div class="photobooth-viewport" id="photobooth-stage">
            <img class="photobooth-stage-image ${state.currentFilter.class}" 
                 id="photobooth-img" 
                 src="${state.currentPose.src}" 
                 alt="Melusina Photobooth" 
                 style="transform: scale(${state.currentLens.scale});" />
            
            <div class="photobooth-viewfinder">
              <div class="photobooth-frame-corner top-left"></div>
              <div class="photobooth-frame-corner top-right"></div>
              <div class="photobooth-frame-corner bottom-left"></div>
              <div class="photobooth-frame-corner bottom-right"></div>
              <div class="photobooth-crosshair"></div>
            </div>
            <div class="photobooth-stickers-layer" id="photobooth-stickers"></div>
          </div>

          <div class="photobooth-controls">
            <!-- Poses -->
            <div class="photobooth-toolbar">
              <div class="photobooth-group">
                <span class="photobooth-label">Pose:</span>
                ${POSES.map(p => `
                  <button type="button" class="photobooth-chip ${p.id === state.currentPose.id ? 'active' : ''}" data-pose="${p.id}">
                    ${p.name}
                  </button>
                `).join('')}
              </div>

              <!-- Lenses -->
              <div class="photobooth-group">
                <span class="photobooth-label">Focal Length:</span>
                ${LENSES.map(l => `
                  <button type="button" class="photobooth-chip ${l.id === state.currentLens.id ? 'active' : ''}" data-lens="${l.id}">
                    ${l.name}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Filters & Shutter -->
            <div class="photobooth-toolbar">
              <div class="photobooth-group">
                <span class="photobooth-label">Atmosphere:</span>
                ${FILTERS.map(f => `
                  <button type="button" class="photobooth-chip ${f.id === state.currentFilter.id ? 'active' : ''}" data-filter="${f.id}">
                    ${f.name}
                  </button>
                `).join('')}
              </div>

              <button type="button" class="photobooth-shutter-btn" id="photobooth-shutter">
                <span>✦ Capture Photo</span>
              </button>
            </div>
          </div>
        </div>
      `;

      bindEvents();
    }

    function bindEvents() {
      root.querySelectorAll('[data-pose]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-pose');
          state.currentPose = POSES.find(p => p.id === id) || state.currentPose;
          render();
        });
      });

      root.querySelectorAll('[data-lens]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-lens');
          state.currentLens = LENSES.find(l => l.id === id) || state.currentLens;
          var img = root.querySelector('#photobooth-img');
          if (img) img.style.transform = 'scale(' + state.currentLens.scale + ')';
          root.querySelectorAll('[data-lens]').forEach(b => b.classList.toggle('active', b === btn));
        });
      });

      root.querySelectorAll('[data-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-filter');
          state.currentFilter = FILTERS.find(f => f.id === id) || state.currentFilter;
          var img = root.querySelector('#photobooth-img');
          if (img) {
            FILTERS.forEach(f => img.classList.remove(f.class));
            img.classList.add(state.currentFilter.class);
          }
          root.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === btn));
        });
      });

      var shutter = root.querySelector('#photobooth-shutter');
      if (shutter) {
        shutter.addEventListener('click', function () {
          var stage = root.querySelector('#photobooth-stage');
          if (stage) {
            stage.style.transition = 'filter 0.05s ease';
            stage.style.filter = 'brightness(2.2) contrast(1.5)';
            setTimeout(function () {
              stage.style.transition = 'filter 0.4s ease';
              stage.style.filter = '';
            }, 120);
          }
          if (global.MelodiaMahouFlourish) {
            global.MelodiaMahouFlourish.burst(shutter.getBoundingClientRect().left + 50, shutter.getBoundingClientRect().top);
          }
        });
      }
    }

    render();
  }

  global.MelodiaPhotobooth = { init: init };
})(window);
