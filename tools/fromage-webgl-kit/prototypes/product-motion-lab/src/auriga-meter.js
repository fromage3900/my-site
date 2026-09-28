import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/loaders/GLTFLoader.js';

export const DEFAULT_AURIGA_URL = './assets/auriga_meter.glb';

function collectMaterials(root) {
  const materials = new Set();
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    const list = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of list) if (material) materials.add(material);
  });
  return [...materials];
}

function collectAnchors(root, required) {
  const anchors = {};
  for (const key of required) {
    const object = root.getObjectByName(`ANCHOR_${key}`);
    if (object) anchors[key] = object;
  }
  return anchors;
}

export async function loadProductGlb({ scene, url, requiredAnchors = ['screen', 'hinge', 'port'], rootName = 'product-glb-runtime-root', scale = 1, manager, onProgress } = {}) {
  if (!scene) throw new TypeError('loadProductGlb requires a THREE.Scene or THREE.Group in { scene }.');
  if (!url) throw new TypeError('loadProductGlb requires a GLB { url }.');

  const loader = new GLTFLoader(manager);
  const gltf = await loader.loadAsync(url, onProgress);
  const root = gltf.scene;
  root.name = root.name || rootName;
  if (scale !== 1) root.scale.setScalar(scale);
  scene.add(root);

  const anchors = collectAnchors(root, requiredAnchors);
  const missingAnchors = requiredAnchors.filter((name) => !anchors[name]);
  if (missingAnchors.length) {
    scene.remove(root);
    throw new Error(`${url} missing annotation anchors: ${missingAnchors.join(', ')}`);
  }

  const mixer = new THREE.AnimationMixer(root);
  const clips = gltf.animations || [];
  const actions = clips.map((clip) => {
    const action = mixer.clipAction(clip);
    action.play();
    action.paused = true;
    return action;
  });
  const duration = clips.reduce((max, clip) => Math.max(max, clip.duration || 0), 0);
  const materials = collectMaterials(root);

  function applyTimeline(normalized) {
    const t = THREE.MathUtils.clamp(Number(normalized) || 0, 0, 1);
    if (duration > 0) {
      for (const action of actions) action.paused = false;
      mixer.setTime(t * duration);
      for (const action of actions) action.paused = true;
    }
    root.updateMatrixWorld(true);
    return t;
  }

  function setWireframe(enabled) {
    for (const material of materials) {
      if ('wireframe' in material) {
        material.wireframe = Boolean(enabled);
        material.needsUpdate = true;
      }
    }
  }

  function dispose() {
    scene.remove(root);
    mixer.stopAllAction();
    const disposedMaterials = new Set();
    root.traverse((obj) => {
      if (obj.geometry?.dispose) obj.geometry.dispose();
      const list = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const material of list) {
        if (!material || disposedMaterials.has(material)) continue;
        disposedMaterials.add(material);
        for (const value of Object.values(material)) {
          if (value?.isTexture && value.dispose) value.dispose();
        }
        material.dispose?.();
      }
    });
  }

  applyTimeline(0);
  return { root, anchors, clips, mixer, duration, materials, applyTimeline, setWireframe, dispose };
}

export async function loadAurigaMeter({ scene, url = DEFAULT_AURIGA_URL, manager, onProgress } = {}) {
  return loadProductGlb({ scene, url, rootName: 'auriga-meter-runtime-root', manager, onProgress });
}

export const DEFAULT_EYEWEAR_URL = './assets/eyewear_study.glb';
export const EYEWEAR_ANCHORS = ['lens', 'hinge', 'bridge'];

export async function loadEyewearStudy({ scene, url = DEFAULT_EYEWEAR_URL, manager, onProgress } = {}) {
  // Eyewear is authored in meters (~0.15 wide); scale to the lab's staging.
  return loadProductGlb({ scene, url, requiredAnchors: EYEWEAR_ANCHORS, rootName: 'eyewear-study-runtime-root', scale: 12, manager, onProgress });
}
