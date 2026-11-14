// Standalone, read-only GLB QA viewport. No gameplay or data writes.
import * as THREE from 'three';
import { GROVE_NAMES, GROVE_KIT02_NAMES, GROVE_KIT03_NAMES, loadHarmonicGrove } from './harmonic-grove.js';

const names = Object.freeze([...GROVE_NAMES, ...GROVE_KIT02_NAMES, ...GROVE_KIT03_NAMES]);
const stage = document.querySelector('#stage');
const select = document.querySelector('#assets');
const search = document.querySelector('#search');
const category = document.querySelector('#category');
const selection = document.querySelector('#selection');
const progress = document.querySelector('#progress');
const detail = document.querySelector('#detail');
const spin = document.querySelector('#spin');

const families = {
  FLR: 'Flowers & foliage', FUN: 'Mooncap fungi', GEO: 'Rocks & crystals',
  ARC: 'Architecture', PRP: 'Musical props', CAN: 'Canopy & trees',
  BUSH: 'Hedges & shrubs', POND: 'Water & shoreline',
  INT: 'Gameplay visuals', ORN: 'Ornaments', PICK: 'Pickups',
  SCAT: 'Terrain scatter', WAY: 'Wayfinding'
};
for (const [key, label] of Object.entries(families)) {
  const option = document.createElement('option');
  option.value = key; option.textContent = label; category.append(option);
}
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas: stage, antialias: true, alpha: false, powerPreference: 'low-power',
  });
} catch (error) {
  progress.textContent = 'WebGL could not start: ' + error.message;
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#141c30');
const camera = new THREE.PerspectiveCamera(43, 1, 0.05, 200);
const hemi = new THREE.HemisphereLight('#ffffff', '#536d87', 1.9);
const sun = new THREE.DirectionalLight('#fff3d7', 2.2);
sun.position.set(7, 12, 9);
scene.add(hemi, sun);
const back = new THREE.DirectionalLight('#98e7ed', 1.0);
back.position.set(-6, 5, -7);
scene.add(back);
const grid = new THREE.GridHelper(12, 12, '#514e71', '#2b3650');
grid.position.y = -0.025;
scene.add(grid);
const modelRoot = new THREE.Group();
scene.add(modelRoot);
let lib = null;
let active = null;
let radius = 5;
let pitch = 0.22;
let angle = 0.6;
let pointer = null;

function resize() {
  const box = stage.getBoundingClientRect();
  if (box.width < 1 || box.height < 1) return;
  renderer.setSize(Math.floor(box.width), Math.floor(box.height), false);
  camera.aspect = box.width / box.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

function options() {
  const query = search.value.trim().toLowerCase();
  const family = category.value;
  const current = select.value;
  select.replaceChildren();
  const filtered = names.filter(name =>
    (!family || name.startsWith(family + '_')) &&
    (!query || name.toLowerCase().includes(query)));
  for (const name of filtered) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name.replace(/_/g, ' ');
    if (lib && !lib.prefabs.has(name)) opt.textContent += ' · loading';
    select.append(opt);
  }
  if (filtered.includes(current)) select.value = current;
  else if (filtered.length) select.value = filtered[0];
  detail.textContent = filtered.length + ' matching assets · ' +
    (lib ? lib.prefabs.size : 0) + ' available / 100';
  if (filtered.length) choose();
  else {
    modelRoot.clear();
    active = null;
    selection.textContent = 'No matching assets';
  }
}
function choose() {
  const name = select.value;
  if (!name) return;
  selection.textContent = name.replace(/_/g, ' ');
  modelRoot.clear();
  active = null;
  if (!lib) { progress.textContent = 'Waiting for base GLB…'; return; }
  const model = lib.spawn(name);
  if (!model) { progress.textContent = 'Waiting for optional GLB download…'; return; }
  modelRoot.add(model);
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  if (bounds.isEmpty()) { progress.textContent = 'Missing visible geometry'; return; }
  const size = bounds.getSize(new THREE.Vector3());
  const centre = bounds.getCenter(new THREE.Vector3());
  model.position.set(-centre.x, -bounds.min.y, -centre.z);
  active = model;
  const largest = Math.max(size.x, size.y, size.z, 0.65);
  radius = Math.max(2.2, largest * 2.5);
  camera.near = 0.05;
  camera.far = Math.max(100, radius * 10);
  camera.updateProjectionMatrix();
  progress.textContent = size.x.toFixed(2) + ' × ' + size.y.toFixed(2) +
    ' × ' + size.z.toFixed(2) + ' metres';
  // Remember scale and dimensions without changing the prefabs.
  modelRoot.userData.height = size.y;
}
select.addEventListener('change', choose);
search.addEventListener('input', options);
category.addEventListener('change', options);
stage.addEventListener('pointerdown', event => {
  pointer = { x: event.clientX, y: event.clientY };
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointermove', event => {
  if (!pointer) return;
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  angle += dx * 0.008;
  pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -0.2, 1.15);
  pointer = { x: event.clientX, y: event.clientY };
  spin.checked = false;
});
for (const name of ['pointercancel','pointerup','lostpointercapture']) {
  stage.addEventListener(name, () => { pointer = null; });
}
stage.addEventListener('wheel', event => {
  event.preventDefault();
  radius = THREE.MathUtils.clamp(radius * (event.deltaY > 0 ? 1.09 : 0.92), 1.25, 80);
}, { passive: false });

function frame() {
  requestAnimationFrame(frame);
  if (spin.checked && active) angle += 0.003;
  modelRoot.rotation.y = angle;
  const focus = (modelRoot.userData.height || 1) * 0.47;
  camera.position.set(
    Math.sin(angle * 0.12 + 0.65) * radius,
    focus + radius * Math.sin(pitch),
    Math.cos(angle * 0.12 + 0.65) * radius
  );
  camera.lookAt(0, focus, 0);
  renderer.render(scene, camera);
}
frame();

options();
loadHarmonicGrove().then(kit => {
  lib = kit;
  options();
  const count = lib.prefabs.size;
  progress.textContent = count + ' base prefabs ready · loading 63 extras…';
  return kit.whenExtrasReady;
}).then(loaded => {
  options();
  progress.textContent = 'Ready: ' + lib.prefabs.size + '/100 assets · ' + loaded + ' optional GLBs loaded';
  if (select.value) choose();
}).catch(error => {
  progress.textContent = 'GLB loading failed: ' + (error?.message || String(error));
  console.error('[Harmonic Grove Gallery]', error);
});
