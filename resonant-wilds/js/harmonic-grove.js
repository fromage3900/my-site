// The 37 authored Higgsfield 3D Jutsu kit objects, loaded as a stable GLB.
// Blender's gallery positions are removed from every part by relative matrices.
// Procedural runtime geometry is never generated here; all meshes come from GLB.
import * as THREE from 'three';
import { GLTFLoader } from '../vendor/loaders/GLTFLoader.js';
import { mergeGeometries } from '../vendor/utils/BufferGeometryUtils.js';

export const GROVE_URL = './assets/models/harmonic-grove-37.glb';

export const GROVE_NAMES = Object.freeze([
  'FLR_bellflower_tall', 'FLR_bellflower_double', 'FLR_bellflower_triple',
  'FLR_bellflower_dwarf', 'FLR_bellflower_pearl',
  'FLR_moonfern_wide', 'FLR_moonfern_young', 'FLR_moonfern_spiral', 'FLR_moonfern_clump',
  'FLR_satin_grass', 'FLR_choral_grass', 'FLR_short_grass', 'FLR_fluffy_grass',
  'FLR_choir_reeds', 'FLR_shallow_reeds', 'FLR_high_reeds',
  'FUN_lilac_mooncaps', 'FUN_mini_mooncaps', 'FUN_pearl_fungi', 'FUN_violet_mooncaps',
  'GEO_moonstone_scatter', 'GEO_jade_boulders', 'GEO_shore_pebbles', 'GEO_rough_hearthstone',
  'GEO_choir_crystals', 'GEO_glassbuds', 'GEO_aether_cluster',
  'ARC_pearl_path', 'ARC_round_resonance_step', 'ARC_tessera_steps',
  'ARC_tuning_path_stone', 'ARC_pearl_column', 'ARC_ruined_column', 'ARC_column_pillar_small',
  'PRP_choral_chime', 'PRP_petite_chime', 'PRP_harmonic_seedpod',
]);

// Kit 02 is loaded opportunistically after base gameplay is ready.
export const GROVE_KIT02_NAMES = Object.freeze([
  "ARC_arched_trellis",
  "ARC_broken_lyre_gate",
  "ARC_garden_balustrade",
  "ARC_lyre_gate",
  "ARC_moonbridge",
  "ARC_pearl_stairs",
  "ARC_wall_corner",
  "ARC_wall_straight",
  "BUSH_jade_topiary",
  "BUSH_laceleaf_hedge",
  "BUSH_lavender_hedge",
  "BUSH_pearlescent_bramble",
  "BUSH_rosebell_hedge",
  "CAN_amethyst_oak",
  "CAN_blush_cherry",
  "CAN_cyan_cypress",
  "CAN_jade_bonsai",
  "CAN_lantern_sapling",
  "CAN_moonwillow",
  "POND_floating_pads",
  "POND_lily_pads",
  "POND_lotus_glow",
  "POND_riverfan",
  "POND_shellstone",
  "POND_singing_rushes",
  "PRP_celestial_signpost",
  "PRP_choral_bellpost",
  "PRP_dream_fountain",
  "PRP_harp_plinth",
  "PRP_note_obelisk",
  "PRP_resonance_cache",
  "PRP_waystone_monolith"
]);

// Match shapes by gameplay silhouette. Trees, ice, and other unmodelled
// characters retain their original visuals instead of being replaced with a bad mesh.
export const GROVE_TYPES = Object.freeze({
  sakura: ['CAN_blush_cherry', 'CAN_moonwillow', 'CAN_amethyst_oak', 'CAN_jade_bonsai'],
  pine: ['CAN_cyan_cypress', 'CAN_lantern_sapling'],
  lily: ['POND_lily_pads', 'POND_floating_pads', 'POND_lotus_glow'],
  flower: ['FLR_bellflower_tall', 'FLR_bellflower_double', 'FLR_bellflower_triple', 'FLR_bellflower_dwarf', 'FLR_bellflower_pearl'],
  rock: ['GEO_moonstone_scatter', 'GEO_jade_boulders', 'GEO_shore_pebbles', 'GEO_rough_hearthstone'],
  bell: ['FLR_bellflower_tall', 'FLR_bellflower_pearl', 'PRP_choral_chime', 'PRP_petite_chime'],
  note: ['PRP_harmonic_seedpod', 'PRP_petite_chime'],
  lantern: ['PRP_choral_chime', 'PRP_petite_chime'],
  pillar: ['ARC_pearl_column', 'ARC_ruined_column', 'ARC_column_pillar_small'],
  reed: ['FLR_choir_reeds', 'FLR_shallow_reeds', 'FLR_high_reeds'],
  mushroom: ['FUN_lilac_mooncaps', 'FUN_mini_mooncaps', 'FUN_pearl_fungi', 'FUN_violet_mooncaps'],
  crystal: ['GEO_choir_crystals', 'GEO_glassbuds', 'GEO_aether_cluster'],
  spire: ['GEO_aether_cluster', 'GEO_choir_crystals'],
  icespike: ['GEO_glassbuds', 'GEO_aether_cluster'],
  stalagmite: ['GEO_rough_hearthstone', 'GEO_moonstone_scatter'],
});

// Decorative sets intentionally vary by biome. All 37 assets are eligible
// for deterministic chunk placement (path stones, ferns, crystals and chimes).
const DECOR_BUSH = GROVE_KIT02_NAMES.filter(n => n.startsWith('BUSH_'));
const DECOR_CANOPY = GROVE_KIT02_NAMES.filter(n => n.startsWith('CAN_'));
export const GROVE_DECOR = Object.freeze({
  sakura_terrace: GROVE_NAMES.filter(n => n.startsWith('FLR_') || n.startsWith('FUN_') || n.startsWith('PRP_')).concat(DECOR_BUSH, DECOR_CANOPY),
  liquid_cathedral: GROVE_NAMES.filter(n => n.startsWith('ARC_') || n.includes('reeds') || n.includes('crystals') || n.includes('moonfern')).concat(DECOR_BUSH),
  fugue_grotto: GROVE_NAMES.filter(n => n.startsWith('FUN_') || n.startsWith('GEO_') || n.includes('column')),
  cadence_crystal_ridge: GROVE_NAMES.filter(n => n.startsWith('GEO_') || n.startsWith('ARC_') || n.startsWith('PRP_')),
  aurora_glacier: GROVE_NAMES.filter(n => n.startsWith('GEO_') || n.startsWith('FLR_') || n.includes('chime')).concat(DECOR_CANOPY.filter(n => n.includes('cypress'))),
});

function flattenPrefab(scene, root) {
  scene.updateMatrixWorld(true);
  const inv = root.matrixWorld.clone().invert();
  const byMaterial = new Map();
  root.traverse((mesh) => {
    if (!mesh.isMesh || !mesh.geometry || Array.isArray(mesh.material)) return;
    const local = new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld);
    const raw = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    raw.applyMatrix4(local);
    // Higgsfield kit uses Principled color materials with no texture images.
    // Normalize attributes before merging to avoid glTF per-object attributes mismatch.
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', raw.attributes.position.clone());
    if (raw.attributes.normal) geo.setAttribute('normal', raw.attributes.normal.clone());
    else geo.computeVertexNormals();
    raw.dispose();
    const key = mesh.material.uuid;
    if (!byMaterial.has(key)) byMaterial.set(key, { material: mesh.material, geometries: [] });
    byMaterial.get(key).geometries.push(geo);
  });
  const parts = [];
  for (const { material, geometries } of byMaterial.values()) {
    const merged = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries);
    if (merged) {
      parts.push({ geo: merged, mat: material, m: new THREE.Matrix4() });
      if (geometries.length > 1) geometries.forEach(g => g.dispose());
    } else {
      for (const geo of geometries) parts.push({ geo, mat: material, m: new THREE.Matrix4() });
    }
  }
  return { parts, glb: true };
}

export async function loadHarmonicGrove() {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(GROVE_URL);
  const prefabs = new Map();
  for (const name of GROVE_NAMES) {
    const root = gltf.scene.getObjectByName('ASSET_' + name);
    if (!root) {
      console.warn('[Harmonic Grove] Missing GLB anchor:', name);
      continue;
    }
    const prefab = flattenPrefab(gltf.scene, root);
    if (prefab.parts.length) prefabs.set(name, prefab);
  }
  if (prefabs.size < 30) throw new Error('Harmonic Grove GLB incomplete: ' + prefabs.size + '/37 anchors');
  // Do not hold the 9-second game warm gate while 32 optional models stream.
  // Prefabs are appended to the same map; the world can re-stream visible chunks
  // after this settles, without touching combat, collisions, rhythm or saves.
  const whenExtrasReady = (async () => {
    let index = 0;
    let loaded = 0;
    async function worker() {
      while (index < GROVE_KIT02_NAMES.length) {
        const name = GROVE_KIT02_NAMES[index++];
        try {
          const extra = await loader.loadAsync('./assets/models/' + name.toLowerCase() + '.glb');
          const anchor = extra.scene.getObjectByName('ASSET_' + name);
          if (!anchor) throw new Error('Missing prefab anchor');
          const prefab = flattenPrefab(extra.scene, anchor);
          if (prefab.parts.length) { prefabs.set(name, prefab); loaded++; }
        } catch (err) { console.warn('[Harmonic Grove] Optional asset unavailable:', name, err); }
      }
    }
    await Promise.all(Array.from({ length: 3 }, worker));
    return loaded;
  })();
  return { prefabs, whenExtrasReady, spawn(name) {
    const def = prefabs.get(name);
    if (!def) return null;
    const group = new THREE.Group();
    group.name = 'GLB_' + name;
    for (const part of def.parts) {
      const mesh = new THREE.Mesh(part.geo, part.mat);
      mesh.matrix.copy(part.m);
      mesh.matrixAutoUpdate = false;
      group.add(mesh);
    }
    return group;
  }, variants(type) {
    return (GROVE_TYPES[type] || []).filter(name => prefabs.has(name));
  }, decorative(biome) {
    return (GROVE_DECOR[biome] || GROVE_NAMES).filter(name => prefabs.has(name));
  } };
}
