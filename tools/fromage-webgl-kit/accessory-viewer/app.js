import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/controls/OrbitControls.js';
import { createRuntime } from '../src/core/createRuntime.js';
import { createGLBLoader } from '../src/assets/createGLBLoader.js';

const MODEL_URL = '../../../wix/models/accessory-eyewear-hero.glb';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const stage = document.getElementById('stage');
const emptyState = document.getElementById('emptyState');
const stageStatus = document.getElementById('stageStatus');
const diagnostics = document.getElementById('diagnostics');
const controlButtons = [...document.querySelectorAll('.choice')];

controlButtons.forEach((button) => { button.disabled = true; });

const runtime = createRuntime({
  THREE,
  container: stage,
  camera: { fov: 34, x: 3.4, y: 1.4, z: 5.5, near: 0.05, far: 100 },
  pixelRatioCap: 1.75,
});

runtime.scene.background = new THREE.Color(0xe9e5df);
runtime.renderer.toneMapping = THREE.ACESFilmicToneMapping;
runtime.renderer.toneMappingExposure = 1.08;
runtime.renderer.shadowMap.enabled = true;
runtime.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(runtime.camera, runtime.renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 2.4;
controls.maxDistance = 8;
controls.target.set(0, 0, 0);
controls.update();

const hemi = new THREE.HemisphereLight(0xffffff, 0xb5aa9d, 2.35);
const key = new THREE.DirectionalLight(0xfff9f2, 5.4);
key.position.set(4.5, 5.8, 4.2);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
const fill = new THREE.DirectionalLight(0xc9d8e7, 2.0);
fill.position.set(-4.4, 2.1, 3.2);
const rim = new THREE.DirectionalLight(0xffd4c6, 2.8);
rim.position.set(-2.7, 3.5, -4.8);
const grazing = new THREE.DirectionalLight(0xffffff, 1.7);
grazing.position.set(5.8, 0.2, -2.2);
runtime.scene.add(hemi, key, fill, rim, grazing);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(5.6, 96),
  new THREE.ShadowMaterial({ opacity: 0.12 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.32;
floor.receiveShadow = true;
runtime.scene.add(floor);

const loader = createGLBLoader({ GLTFLoader: (await import('https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/loaders/GLTFLoader.js')).GLTFLoader });

const FINISHES = {
  obsidian: {
    frame: 0x151518,
    frameRoughness: 0.18,
    frameTransmission: 0.0,
    metal: 0xd4d2ce,
    metalRoughness: 0.2,
  },
  tea: {
    frame: 0x74503d,
    frameRoughness: 0.22,
    frameTransmission: 0.08,
    metal: 0xc8a66c,
    metalRoughness: 0.24,
  },
  sea: {
    frame: 0xb7d3cd,
    frameRoughness: 0.16,
    frameTransmission: 0.2,
    metal: 0xd9ddd9,
    metalRoughness: 0.21,
  },
  pearl: {
    frame: 0xdccfdd,
    frameRoughness: 0.17,
    frameTransmission: 0.06,
    metal: 0xd5c2a3,
    metalRoughness: 0.23,
  },
};

const LENSES = {
  clear: { color: 0xe9f1f2, transmission: 0.9, opacity: 0.4 },
  smoke: { color: 0x667078, transmission: 0.66, opacity: 0.55 },
  rose: { color: 0xc98f99, transmission: 0.72, opacity: 0.5 },
  cool: { color: 0x8facbf, transmission: 0.72, opacity: 0.48 },
};

const VIEWS = {
  hero: { camera: [3.35, 1.45, 5.25], target: [0, 0.02, 0] },
  front: { camera: [0, 0.45, 5.45], target: [0, 0, 0] },
  hinge: { camera: [3.85, 0.72, 3.1], target: [0.9, 0, 0] },
  bridge: { camera: [1.15, 0.6, 3.85], target: [0, 0.02, 0] },
};

let root = null;
let meshes = [];
let currentFinish = 'obsidian';
let currentLens = 'clear';
let inspection = 'beauty';
let autoRotate = !reducedMotion;
let cameraGoal = new THREE.Vector3(...VIEWS.hero.camera);
let targetGoal = new THREE.Vector3(...VIEWS.hero.target);
let materialPool = [];
let modelBytes = null;
let frameCounter = 0;
let fpsWindowStart = performance.now();
let fps = 0;

function setStatus(text) {
  stageStatus.textContent = text;
}

function readableBytes(bytes) {
  if (!bytes || !Number.isFinite(bytes)) return 'size pending';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function sourceMaterial(mesh) {
  const material = Array.isArray(mesh.userData.sourceMaterial)
    ? mesh.userData.sourceMaterial[0]
    : mesh.userData.sourceMaterial;
  return material || null;
}

function copyUsefulMaps(target, source) {
  if (!source) return target;
  ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'alphaMap'].forEach((key) => {
    if (source[key]) target[key] = source[key];
  });
  if (source.normalScale && target.normalScale) target.normalScale.copy(source.normalScale);
  return target;
}

function classifyMesh(mesh) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const token = `${mesh.name || ''} ${materials.map((m) => m?.name || '').join(' ')}`.toLowerCase();

  if (/lens|glass/.test(token)) return 'lens';
  if (/metal|hinge|screw|hardware|nose[-_ ]?pad|pin/.test(token)) return 'metal';
  if (/logo|engrave|detail|mark|inlay/.test(token)) return 'detail';
  return 'frame';
}

function disposeGeneratedMaterials() {
  for (const material of materialPool) material?.dispose?.();
  materialPool = [];
}

function makeBeautyMaterials() {
  disposeGeneratedMaterials();
  const finish = FINISHES[currentFinish];
  const lens = LENSES[currentLens];

  const frameMaterial = new THREE.MeshPhysicalMaterial({
    color: finish.frame,
    roughness: finish.frameRoughness,
    metalness: 0.02,
    clearcoat: 1,
    clearcoatRoughness: 0.09,
    transmission: finish.frameTransmission,
    thickness: 0.16,
    ior: 1.48,
  });
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: finish.metal,
    roughness: finish.metalRoughness,
    metalness: 1,
  });
  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: lens.color,
    roughness: 0.08,
    metalness: 0,
    transmission: lens.transmission,
    thickness: 0.12,
    ior: 1.5,
    transparent: true,
    opacity: lens.opacity,
    clearcoat: 0.55,
    clearcoatRoughness: 0.05,
    depthWrite: false,
  });
  const detailMaterial = new THREE.MeshStandardMaterial({
    color: finish.metal,
    roughness: Math.min(0.34, finish.metalRoughness + 0.06),
    metalness: 0.92,
  });
  materialPool.push(frameMaterial, metalMaterial, lensMaterial, detailMaterial);

  return { frameMaterial, metalMaterial, lensMaterial, detailMaterial };
}

function applyMaterials() {
  if (!root) return;

  if (inspection === 'wire') {
    disposeGeneratedMaterials();
    const wire = new THREE.MeshBasicMaterial({ color: 0x252525, wireframe: true });
    materialPool.push(wire);
    meshes.forEach((mesh) => { mesh.material = wire; });
    return;
  }

  if (inspection === 'clay') {
    disposeGeneratedMaterials();
    const clay = new THREE.MeshStandardMaterial({ color: 0xd5d0c9, roughness: 0.66, metalness: 0.02 });
    materialPool.push(clay);
    meshes.forEach((mesh) => { mesh.material = clay; });
    return;
  }

  const { frameMaterial, metalMaterial, lensMaterial, detailMaterial } = makeBeautyMaterials();

  meshes.forEach((mesh) => {
    const source = sourceMaterial(mesh);
    switch (mesh.userData.accessoryRole) {
      case 'lens':
        mesh.material = copyUsefulMaps(lensMaterial.clone(), source);
        materialPool.push(mesh.material);
        break;
      case 'metal':
        mesh.material = copyUsefulMaps(metalMaterial.clone(), source);
        materialPool.push(mesh.material);
        break;
      case 'detail':
        mesh.material = copyUsefulMaps(detailMaterial.clone(), source);
        materialPool.push(mesh.material);
        break;
      case 'frame':
      default:
        mesh.material = copyUsefulMaps(frameMaterial.clone(), source);
        materialPool.push(mesh.material);
        break;
    }
  });
}

function fitProduct(object) {
  object.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(largest) || largest <= 1e-6) return;

  const scale = 2.75 / largest;
  object.scale.setScalar(scale);
  object.updateMatrixWorld(true);

  box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
  object.position.y += 0.02;
  object.rotation.set(-0.04, -0.16, 0);
  object.updateMatrixWorld(true);
}

function setPressed(selector, value) {
  document.querySelectorAll(selector).forEach((button) => {
    const active = button.dataset.finish === value
      || button.dataset.lens === value
      || button.dataset.view === value
      || button.dataset.inspect === value;
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function setView(name) {
  const view = VIEWS[name] || VIEWS.hero;
  cameraGoal.set(...view.camera);
  targetGoal.set(...view.target);
  setPressed('[data-view]', name);
}

function activateControls() {
  controlButtons.forEach((button) => { button.disabled = false; });
  document.getElementById('rotateToggle').setAttribute('aria-pressed', autoRotate ? 'true' : 'false');
}

function recordSourceMaterials(object) {
  meshes = [];
  object.traverse((mesh) => {
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.sourceMaterial = mesh.material;
    mesh.userData.accessoryRole = classifyMesh(mesh);
    meshes.push(mesh);
  });
}

async function getModelBytes() {
  try {
    const response = await fetch(MODEL_URL, { method: 'HEAD', cache: 'no-store' });
    if (!response.ok) return null;
    const bytes = Number(response.headers.get('content-length'));
    return Number.isFinite(bytes) && bytes > 0 ? bytes : null;
  } catch {
    return null;
  }
}

async function loadProduct() {
  setStatus('Loading original asset…');
  modelBytes = await getModelBytes();

  try {
    const gltf = await loader.load(MODEL_URL, {
      onProgress: ({ ratio }) => {
        if (ratio !== null) setStatus(`Loading ${Math.round(ratio * 100)}%`);
      },
    });

    root = gltf.scene;
    root.name = 'accessory-eyewear-hero';
    recordSourceMaterials(root);
    fitProduct(root);
    runtime.scene.add(root);
    applyMaterials();

    emptyState.hidden = true;
    setStatus('Realtime asset loaded');
    activateControls();
    setView('hero');
  } catch (error) {
    console.info('[accessory-viewer] Authored eyewear asset not present yet:', error?.message || error);
    setStatus('Asset slot ready');
    diagnostics.textContent = [
      'PRESENTATION SHELL READY',
      'Expected: wix/models/accessory-eyewear-hero.glb',
      'Authoring contract: separate/name FRAME, METAL/HINGE, LENS/GLASS, DETAIL/LOGO parts.',
      'No fallback product is shown: capability proof must use the owner-authored asset.',
    ].join('\n');
  }
}

document.querySelectorAll('[data-finish]').forEach((button) => {
  button.addEventListener('click', () => {
    currentFinish = button.dataset.finish;
    setPressed('[data-finish]', currentFinish);
    if (inspection === 'beauty') applyMaterials();
  });
});

document.querySelectorAll('[data-lens]').forEach((button) => {
  button.addEventListener('click', () => {
    currentLens = button.dataset.lens;
    setPressed('[data-lens]', currentLens);
    if (inspection === 'beauty') applyMaterials();
  });
});

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

document.querySelectorAll('[data-inspect]').forEach((button) => {
  button.addEventListener('click', () => {
    inspection = button.dataset.inspect;
    setPressed('[data-inspect]', inspection);
    applyMaterials();
  });
});

document.getElementById('rotateToggle').addEventListener('click', (event) => {
  autoRotate = !autoRotate && !reducedMotion;
  event.currentTarget.setAttribute('aria-pressed', autoRotate ? 'true' : 'false');
});

controls.addEventListener('start', () => {
  autoRotate = false;
  document.getElementById('rotateToggle').setAttribute('aria-pressed', 'false');
});

runtime.onFrame(({ now, delta }) => {
  controls.update();

  const smoothing = reducedMotion ? 1 : 1 - Math.pow(0.0008, delta);
  runtime.camera.position.lerp(cameraGoal, smoothing);
  controls.target.lerp(targetGoal, smoothing);

  if (root && autoRotate && inspection === 'beauty') {
    root.rotation.y += delta * 0.12;
  }

  frameCounter += 1;
  if (now - fpsWindowStart >= 700) {
    fps = Math.round((frameCounter * 1000) / (now - fpsWindowStart));
    frameCounter = 0;
    fpsWindowStart = now;
  }

  if (root) {
    const info = runtime.renderer.info.render;
    const roleCounts = meshes.reduce((acc, mesh) => {
      const role = mesh.userData.accessoryRole || 'frame';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    diagnostics.textContent = [
      `GLB ${readableBytes(modelBytes)}`,
      `FPS ~${fps || '…'} · DPR ${runtime.renderer.getPixelRatio().toFixed(2)}`,
      `Draw calls ${info.calls} · Triangles ${info.triangles.toLocaleString()}`,
      `Meshes ${meshes.length} · frame ${roleCounts.frame || 0} · metal ${roleCounts.metal || 0} · lens ${roleCounts.lens || 0}`,
      `Finish ${currentFinish} · Lens ${currentLens} · ${inspection}`,
    ].join('\n');
  }
});

loadProduct();
