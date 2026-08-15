/**
 * Melodia ZBrush Sculpt Studio — High-Poly Ornamental & Retopology Inspector
 */
(function (global) {
  'use strict';

  var SCULPTS = [
    {
      id: 'zen_lantern',
      name: 'Zen Lantern (High-Poly)',
      image: '../generated/assets/sculpt_zen_lantern_beauty.png',
      fallback: '../generated/assets/character/melusina_beauty_34.png',
      polycount: '1.8M Polys (SubD Level 5)',
      tools: 'ZBrush / 3DCoat / Blender Retopo',
      notes: 'Curved pagoda eaves, filigree lattice perforations, soft-edge bevels for Komikaze Toon normals.'
    },
    {
      id: 'melody_tokens',
      name: 'Melody Token Quartet',
      image: '../generated/assets/melody_token_swirl_komikaze_beauty_34.png',
      fallback: '../generated/assets/character/melusina_34_wireframe_grey_20260715.png',
      polycount: '4-Piece Set · 450K Triangles',
      tools: 'ZBrush Boolean DynaMesh + QuadRemesher',
      notes: 'Four musical-celestial motifs (Star, Swirl, Heart, Water) sculpted for physics drop pickups.'
    },
    {
      id: 'melusina_head',
      name: 'Melusina Bust & Jewelry',
      image: '../generated/assets/character/melusina_hero_20260712/melusina_hero_three_quarter_jewelry.png',
      fallback: '../generated/assets/character/melusina_beauty_eevee_20260715c_01.png',
      polycount: 'Hero Mesh · 68K Low-Poly Quad',
      tools: 'Maya Retopology / ZBrush Detailing',
      notes: 'Stylized facial planar transitions with Subdivision surface support and water-hair attachment curve flow.'
    },
    {
      id: 'gothic_kitbash',
      name: 'Gothic Architectural Kitbash',
      image: '../generated/assets/character/melusina_eevee_glam_20260715c_03.png',
      fallback: '../generated/assets/unreal/hero_l_wp_sakuradream_1920x1080.png',
      polycount: '15 Modular Mesh Assets',
      tools: 'Blender 5.2 Geometry Nodes + ZBrush Trim',
      notes: 'Ribbed vaults, traceried rose windows, pointed arches engineered for PCG procedural assembly.'
    }
  ];

  function init(containerSelector) {
    var root = document.querySelector(containerSelector || '#zbrush-studio-mount');
    if (!root) return;

    var activeIndex = 0;

    function render() {
      var item = SCULPTS[activeIndex];
      root.innerHTML = `
        <div class="zbrush-studio-container">
          <div class="zbrush-viewport">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='${item.fallback}'" />
          </div>

          <div class="zbrush-studio-sidebar">
            <div class="zbrush-asset-list">
              ${SCULPTS.map((s, idx) => `
                <button type="button" class="zbrush-asset-item ${idx === activeIndex ? 'active' : ''}" data-index="${idx}">
                  <span>✦</span>
                  <strong>${s.name}</strong>
                </button>
              `).join('')}
            </div>

            <div class="zbrush-passport-sheet">
              <h4>Sculpt Technical Passport</h4>
              <div class="zbrush-passport-row">
                <span>Density</span>
                <strong>${item.polycount}</strong>
              </div>
              <div class="zbrush-passport-row">
                <span>Pipeline</span>
                <strong>${item.tools}</strong>
              </div>
              <div class="zbrush-passport-row" style="flex-direction:column;gap:4px;padding-top:8px;border:none;">
                <span>Artistic &amp; Technical Notes</span>
                <p style="margin:0;color:var(--color-text-secondary);font-size:0.75rem;line-height:1.5;">${item.notes}</p>
              </div>
            </div>
          </div>
        </div>
      `;

      root.querySelectorAll('[data-index]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeIndex = parseInt(btn.getAttribute('data-index'), 10);
          render();
        });
      });
    }

    render();
  }

  global.MelodiaZBrushStudio = { init: init };
})(window);
