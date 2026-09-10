import * as THREE from 'three';
import { createRuntime } from '../../src/core/createRuntime.js';
import { createDeterministicTimeline } from '../../src/animation/createDeterministicTimeline.js';

const stage = document.getElementById('stage');
const timeline = document.getElementById('timeline');
const timeValue = document.getElementById('timeValue');
const seedSelect = document.getElementById('seed');
const playButton = document.getElementById('play');
const resetButton = document.getElementById('reset');
const diagnostics = document.getElementById('diagnostics');
const modeBadge = document.getElementById('modeBadge');
const modeButtons = [...document.querySelectorAll('.mode')];

const LOOP_SECONDS = 16;
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const motionTimeline = createDeterministicTimeline({
  duration: LOOP_SECONDS,
  channels: {
    stationAOffsetX: [
      { start: 0, end: 2, from: 0, to: 0.72 },
      { start: 12, end: 14, from: 0.72, to: 0 },
    ],
    stationBRotationY: [
      { start: 2, end: 4, from: 0, to: Math.PI * 0.5 },
      { start: 10, end: 12, from: Math.PI * 0.5, to: 0 },
    ],
    stationCOffsetY: [
      { start: 4, end: 6, from: 0, to: 0.82 },
      { start: 8, end: 10, from: 0.82, to: 0 },
    ],
  },
});

const phases = [
  { start: 0, end: 2, name: 'A_TRANSLATE_OUT' },
  { start: 2, end: 4, name: 'B_ROTATE_OUT' },
  { start: 4, end: 6, name: 'C_LIFT_OUT' },
  { start: 6, end: 8, name: 'HARD_HOLD_A' },
  { start: 8, end: 10, name: 'C_LIFT_RETURN' },
  { start: 10, end: 12, name: 'B_ROTATE_RETURN' },
  { start: 12, end: 14, name: 'A_TRANSLATE_RETURN' },
  { start: 14, end: 16, name: 'HARD_HOLD_B' },
];

const runtime = createRuntime({
  THREE,
  container: stage,
  camera: { fov: 35, near: 0.1, far: 100, x: 10.5, y: 7.3, z: 12.5 },
  renderer: { antialias: true, alpha: false },
  pixelRatioCap: 1.75,
});

runtime.renderer.setClearColor(0xe4e4e1, 1);
runtime.renderer.shadowMap.enabled = false;
runtime.camera.lookAt(0, 1.3, 0);

const hemi = new THREE.HemisphereLight(0xffffff, 0xa7a7a1, 2.1);
const key = new THREE.DirectionalLight(0xffffff, 3.1);
key.position.set(5, 9, 7);
const fill = new THREE.DirectionalLight(0xffffff, 1.25);
fill.position.set(-7, 3, 2);
runtime.scene.add(hemi, key, fill);

const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xdadad6,
  roughness: 0.92,
  metalness: 0.02,
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.04;
runtime.scene.add(floor);

const sceneRoot = new THREE.Group();
sceneRoot.name = 'PROC_IndustrialSystemRoot';
runtime.scene.add(sceneRoot);

let currentSeed = Number(seedSelect.value);
let currentMode = 'base';
let playing = !reducedMotion;
let timeSeconds = 0;
let lastFrameSeconds = performance.now() / 1000;
let fpsSmoothed = 60;
let diagAccumulator = 0;
let assembly = null;

function mulberry32(seed) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeMaterial(name, shade = 0) {
  return new THREE.MeshStandardMaterial({
    name,
    color: shade === 0 ? 0xd8d8d4 : shade === 1 ? 0x4a4d4d : 0xb7b8b4,
    roughness: shade === 1 ? 0.48 : 0.68,
    metalness: shade === 1 ? 0.48 : 0.2,
  });
}

function addPart(parent, geometry, position, scale, name, field, shade = 0) {
  const mesh = new THREE.Mesh(geometry, makeMaterial(`${name}_MAT`, shade));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.userData.field = field;
  mesh.userData.baseShade = shade;
  parent.add(mesh);
  return mesh;
}

function createStation(index, x, random) {
  const group = new THREE.Group();
  group.name = `STATION_${String(index + 1).padStart(2, '0')}`;
  group.position.x = x;

  const width = 2.25 + random() * 0.45;
  const height = 2.4 + random() * 0.5;
  const depth = 2.0 + random() * 0.35;
  const columnOffset = width * 0.38;

  addPart(group, new THREE.BoxGeometry(1, 1, 1), [0, 0.16, 0], [width, 0.25, depth], `${group.name}_BASE`, { structural: 0.16, flow: 0.08, thermal: 0.12 }, 0);
  addPart(group, new THREE.BoxGeometry(1, 1, 1), [-columnOffset, height * 0.5, 0], [0.22, height, 0.22], `${group.name}_COLUMN_L`, { structural: 0.82, flow: 0.12, thermal: 0.36 }, 1);
  addPart(group, new THREE.BoxGeometry(1, 1, 1), [columnOffset, height * 0.5, 0], [0.22, height, 0.22], `${group.name}_COLUMN_R`, { structural: 0.76, flow: 0.18, thermal: 0.42 }, 1);
  addPart(group, new THREE.BoxGeometry(1, 1, 1), [0, height, 0], [width * 0.9, 0.18, 0.28], `${group.name}_CROSSBEAM`, { structural: 0.92, flow: 0.28, thermal: 0.52 }, 1);

  const core = addPart(group, new THREE.CylinderGeometry(0.48, 0.48, 1.2, 24), [0, 1.02, 0], [1, 1, 1], `${group.name}_CORE`, { structural: 0.58, flow: 0.76, thermal: 0.72 }, 2);
  core.rotation.z = Math.PI / 2;

  const pipe = addPart(group, new THREE.CylinderGeometry(0.14, 0.14, 2.3, 18), [0, 1.02, 0], [1, 1, 1], `${group.name}_MANIFOLD`, { structural: 0.34, flow: 0.94, thermal: 0.64 }, 0);
  pipe.rotation.z = Math.PI / 2;

  const moving = new THREE.Group();
  moving.name = `${group.name}_ACTUATOR`;
  moving.position.set(0, 1.02, depth * 0.46);
  group.add(moving);

  addPart(moving, new THREE.BoxGeometry(1, 1, 1), [0, 0, 0], [0.86, 0.64, 0.28], `${group.name}_ACTUATOR_BLOCK`, { structural: 0.68, flow: 0.56, thermal: 0.88 }, 1);
  addPart(moving, new THREE.CylinderGeometry(0.08, 0.08, 1.25, 16), [0, -0.54, 0], [1, 1, 1], `${group.name}_ACTUATOR_ROD`, { structural: 0.72, flow: 0.5, thermal: 0.82 }, 0);

  sceneRoot.add(group);
  return { group, moving, width, height, depth };
}

function buildAssembly(seed) {
  while (sceneRoot.children.length) {
    const child = sceneRoot.children.pop();
    runtime.disposeObject(child);
  }

  const random = mulberry32(seed * 1009 + 97);
  const spacing = 4.15 + random() * 0.35;
  const stations = [
    createStation(0, -spacing, random),
    createStation(1, 0, random),
    createStation(2, spacing, random),
  ];

  addPart(
    sceneRoot,
    new THREE.BoxGeometry(1, 1, 1),
    [0, 0.05, -1.5],
    [spacing * 2.9, 0.12, 0.16],
    'SYSTEM_RAIL',
    { structural: 0.66, flow: 0.48, thermal: 0.34 },
    1,
  );

  assembly = { stations, spacing };
  applyVisualization(currentMode);
  applyTimeline(timeSeconds);
}

const ramps = {
  structural: [0x355b87, 0x6d8fb4, 0xd6dbe0, 0xcb8b58, 0x873f32],
  flow: [0x23445f, 0x397da1, 0x8bc1c8, 0xe1d8a1, 0xbf6845],
  thermal: [0x2f4b74, 0x6f73a7, 0xb9a7a7, 0xd98b62, 0x8e3b2e],
};

function sampleRamp(mode, value) {
  const ramp = ramps[mode];
  const clamped = THREE.MathUtils.clamp(value ?? 0, 0, 0.9999);
  return ramp[Math.floor(clamped * ramp.length)];
}

function applyVisualization(mode) {
  currentMode = mode;
  sceneRoot.traverse((object) => {
    if (!object.isMesh || object === floor) return;
    const material = object.material;
    const field = object.userData.field;
    const shade = object.userData.baseShade ?? 0;

    if (mode === 'base' || !field) {
      const baseColor = shade === 0 ? 0xd8d8d4 : shade === 1 ? 0x4a4d4d : 0xb7b8b4;
      material.color.setHex(baseColor);
      material.emissive.setHex(0x000000);
      material.emissiveIntensity = 0;
      return;
    }

    const encoded = sampleRamp(mode, field[mode]);
    material.color.setHex(encoded);
    material.emissive.setHex(encoded);
    material.emissiveIntensity = 0.035;
  });

  modeButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  });
  modeBadge.textContent = `${mode.toUpperCase()} / SEED ${String(currentSeed).padStart(2, '0')}`;
}

function getPhaseName(time) {
  const clamped = Math.min(LOOP_SECONDS - Number.EPSILON, Math.max(0, time));
  return phases.find((phase) => clamped >= phase.start && clamped < phase.end)?.name ?? 'LOOP_END';
}

function applyTimeline(time) {
  if (!assembly) return;
  const sample = motionTimeline.sample(time);
  const [a, b, c] = assembly.stations;

  a.moving.position.x = sample.values.stationAOffsetX;
  a.moving.rotation.y = 0;

  b.moving.rotation.y = sample.values.stationBRotationY;
  b.moving.position.x = 0;

  c.moving.position.y = 1.02 + sample.values.stationCOffsetY;
  c.moving.rotation.y = 0;

  timeline.value = sample.time.toFixed(2);
  timeValue.value = `${sample.time.toFixed(1)}s`;
}

function resetTimeline() {
  timeSeconds = 0;
  applyTimeline(timeSeconds);
}

function endpointDelta() {
  const start = motionTimeline.sample(0).values;
  const end = motionTimeline.sample(LOOP_SECONDS).values;
  return Object.keys(start).reduce(
    (sum, keyName) => sum + Math.abs((end[keyName] ?? 0) - (start[keyName] ?? 0)),
    0,
  );
}

function updateDiagnostics(delta) {
  if (delta > 0) {
    const instantaneous = 1 / delta;
    fpsSmoothed = fpsSmoothed * 0.9 + instantaneous * 0.1;
  }

  diagAccumulator += delta;
  if (diagAccumulator < 0.25) return;
  diagAccumulator = 0;

  const info = runtime.renderer.info;
  diagnostics.textContent = [
    `MODE     ${currentMode.toUpperCase()}`,
    `SEED     ${String(currentSeed).padStart(2, '0')}`,
    `PHASE    ${getPhaseName(timeSeconds)}`,
    `TIME     ${timeSeconds.toFixed(2)} / ${LOOP_SECONDS}s`,
    `LOOP Δ   ${endpointDelta().toFixed(6)}`,
    `FPS ~    ${Math.round(Math.min(999, fpsSmoothed))}`,
    `DPR      ${runtime.renderer.getPixelRatio().toFixed(2)}`,
    `DRAWS    ${info.render.calls}`,
    `TRIS     ${info.render.triangles.toLocaleString()}`,
    `GEOM     ${info.memory.geometries}`,
  ].join('\n');
}

runtime.onFrame(({ delta }) => {
  const nowSeconds = performance.now() / 1000;
  const realDelta = Math.min(0.1, Math.max(0, nowSeconds - lastFrameSeconds));
  lastFrameSeconds = nowSeconds;

  if (playing) {
    timeSeconds = motionTimeline.wrap(timeSeconds + realDelta);
    applyTimeline(timeSeconds);
  }

  updateDiagnostics(delta);
});

playButton.addEventListener('click', () => {
  playing = !playing;
  playButton.textContent = playing ? 'Pause' : 'Play';
  playButton.setAttribute('aria-pressed', String(playing));
});

resetButton.addEventListener('click', () => {
  resetTimeline();
  playing = false;
  playButton.textContent = 'Play';
  playButton.setAttribute('aria-pressed', 'false');
});

timeline.addEventListener('input', () => {
  playing = false;
  playButton.textContent = 'Play';
  playButton.setAttribute('aria-pressed', 'false');
  timeSeconds = THREE.MathUtils.clamp(Number(timeline.value) || 0, 0, LOOP_SECONDS);
  applyTimeline(timeSeconds);
});

seedSelect.addEventListener('change', () => {
  currentSeed = THREE.MathUtils.clamp(Number(seedSelect.value) || 1, 1, 3);
  buildAssembly(currentSeed);
});

modeButtons.forEach((button) => {
  button.addEventListener('click', () => applyVisualization(button.dataset.mode || 'base'));
});

if (reducedMotion) {
  playing = false;
  playButton.textContent = 'Play';
  playButton.setAttribute('aria-pressed', 'false');
}

buildAssembly(currentSeed);
applyVisualization('base');
applyTimeline(0);
