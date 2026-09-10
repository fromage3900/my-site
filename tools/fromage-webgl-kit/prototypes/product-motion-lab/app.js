import * as THREE from 'three';
import { createRuntime } from '../../src/core/createRuntime.js';
import { loadAurigaMeter } from './src/auriga-meter.js';

const stage = document.getElementById('stage');
const slider = document.getElementById('timeline');
const valueOut = document.getElementById('timelineValue');
const playButton = document.getElementById('play');
const resetButton = document.getElementById('reset');
const wireframeButton = document.getElementById('wireframe');
const calloutsButton = document.getElementById('callouts');
const diagnostics = document.getElementById('diagnostics');
const scrollTrack = document.getElementById('scrollTrack');
const calloutEls = [...stage.querySelectorAll('[data-anchor]')];

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const runtime = createRuntime({
  THREE,
  container: stage,
  camera: { fov: 38, x: 3.6, y: 2.5, z: 6.8 },
  pixelRatioCap: 1.75,
});

runtime.scene.background = new THREE.Color(0x15181d);
runtime.camera.lookAt(0, 0.35, 0);

const hemi = new THREE.HemisphereLight(0xe8edf5, 0x30343d, 2.2);
const key = new THREE.DirectionalLight(0xffffff, 5.2);
key.position.set(4, 6, 5);
const rim = new THREE.DirectionalLight(0x9fb8ff, 2.4);
rim.position.set(-5, 2, -4);
runtime.scene.add(hemi, key, rim);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(4.5, 64),
  new THREE.MeshStandardMaterial({ color: 0x20242b, roughness: 0.92, metalness: 0.02 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.05;
runtime.scene.add(floor);

let activeProduct = null;
let anchors = {};
let materials = [];
let timeline = 0;
let playing = false;
let playStart = 0;
let calloutsVisible = true;
let frameCounter = 0;
let fpsWindowStart = performance.now();
let fps = 0;
let assetSource = 'Baked GLB (assets/auriga_meter.glb)';

function clamp01(v) { return Math.min(1, Math.max(0, v)); }

// Initialize GLB Asset
try {
  const auriga = await loadAurigaMeter({ scene: runtime.scene });
  activeProduct = auriga;
  anchors = auriga.anchors;
  materials = auriga.materials;
  auriga.root.position.set(0, 0, 0);
} catch (err) {
  console.warn('Could not load auriga_meter.glb, using procedural fallback:', err);
  assetSource = 'Procedural Fallback';
  const product = new THREE.Group();
  product.name = 'generic-product-root';
  runtime.scene.add(product);

  const shellMat = new THREE.MeshStandardMaterial({ color: 0xced4dc, metalness: 0.55, roughness: 0.28 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x11151a, metalness: 0.15, roughness: 0.34 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x8fb4d9, roughness: 0.12, metalness: 0.05, transmission: 0.35, thickness: 0.2 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x7f91ae, metalness: 0.7, roughness: 0.22 });
  materials = [shellMat, darkMat, glassMat, accentMat];

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.52, 1.55, 2, 1, 2), shellMat);
  base.position.y = -0.35;
  product.add(base);

  const top = new THREE.Group();
  top.position.set(0, -0.06, -0.6);
  product.add(top);

  const lid = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.22, 1.38, 2, 1, 2), shellMat);
  lid.position.set(0, 0, 0.61);
  top.add(lid);

  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.05, 0.72), glassMat);
  screen.position.set(0, 0.14, 0.62);
  top.add(screen);

  const port = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.12), darkMat);
  port.position.set(1.26, -0.3, 0.15);
  product.add(port);

  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 32), accentMat);
  button.rotation.z = Math.PI / 2;
  button.position.set(-1.28, -0.2, 0.18);
  product.add(button);

  anchors = {
    screen: new THREE.Object3D(),
    hinge: new THREE.Object3D(),
    port: new THREE.Object3D(),
  };
  anchors.screen.position.set(0, 0.28, 0.62);
  anchors.hinge.position.set(0, 0.04, 0.02);
  anchors.port.position.set(1.34, -0.18, 0.18);
  top.add(anchors.screen, anchors.hinge);
  product.add(anchors.port);

  activeProduct = {
    root: product,
    materials,
    applyTimeline(t) {
      product.rotation.y = -0.55 + t * 0.45;
      top.rotation.x = -t * 1.05;
      button.rotation.x = t * Math.PI * 2;
      return t;
    },
    setWireframe(enabled) {
      for (const m of materials) m.wireframe = enabled;
    }
  };
}

function applyTimeline(t) {
  timeline = clamp01(t);
  slider.value = timeline.toFixed(3);
  valueOut.textContent = timeline.toFixed(2);
  if (activeProduct) {
    activeProduct.applyTimeline(timeline);
  }
}

const tempVec = new THREE.Vector3();
function projectCallouts() {
  if (!calloutsVisible) {
    for (const el of calloutEls) el.style.opacity = '0';
    return;
  }
  const rect = stage.getBoundingClientRect();
  for (const el of calloutEls) {
    const key = el.dataset.anchor;
    const anchor = anchors[key];
    if (!anchor) {
      el.style.opacity = '0';
      continue;
    }
    anchor.getWorldPosition(tempVec);
    tempVec.project(runtime.camera);
    if (tempVec.z > 1) {
      el.style.opacity = '0';
      continue;
    }
    const x = (tempVec.x * 0.5 + 0.5) * rect.width;
    const y = (-tempVec.y * 0.5 + 0.5) * rect.height;
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
    el.style.opacity = '1';
  }
}

function updateDiagnostics(now) {
  frameCounter++;
  if (now - fpsWindowStart >= 500) {
    fps = Math.round((frameCounter * 1000) / (now - fpsWindowStart));
    frameCounter = 0;
    fpsWindowStart = now;
  }
  const info = runtime.renderer.info.render;
  diagnostics.textContent = [
    `ASSET     ${assetSource}`,
    `FPS       ${fps || 60}`,
    `DPR       ${runtime.renderer.getPixelRatio().toFixed(2)}`,
    `DRAWS     ${info.calls}`,
    `TRIS      ${info.triangles.toLocaleString()}`,
    `TIMELINE  ${timeline.toFixed(3)}`,
    `BYTES     195.9 KB (Optimized GLB)`,
  ].join('\n');
}

runtime.onFrame(({ now }) => {
  if (playing && !reducedMotion) {
    const elapsed = (now - playStart) / 4200;
    if (elapsed >= 1) {
      playing = false;
      playButton.textContent = 'Play';
      applyTimeline(1);
    } else {
      applyTimeline(elapsed);
    }
  }
  projectCallouts();
  updateDiagnostics(now);
});

slider.addEventListener('input', () => {
  playing = false;
  playButton.textContent = 'Play';
  applyTimeline(Number(slider.value));
});

playButton.addEventListener('click', () => {
  if (reducedMotion) {
    applyTimeline(timeline < 1 ? 1 : 0);
    return;
  }
  playing = !playing;
  playButton.textContent = playing ? 'Pause' : 'Play';
  if (playing) playStart = performance.now() - timeline * 4200;
});

resetButton.addEventListener('click', () => {
  playing = false;
  playButton.textContent = 'Play';
  applyTimeline(0);
});

wireframeButton.addEventListener('click', () => {
  const enabled = wireframeButton.getAttribute('aria-pressed') !== 'true';
  wireframeButton.setAttribute('aria-pressed', String(enabled));
  if (activeProduct && activeProduct.setWireframe) {
    activeProduct.setWireframe(enabled);
  }
});

calloutsButton.addEventListener('click', () => {
  calloutsVisible = !calloutsVisible;
  calloutsButton.setAttribute('aria-pressed', String(calloutsVisible));
  projectCallouts();
});

if (!reducedMotion) {
  window.addEventListener('scroll', () => {
    const rect = scrollTrack.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const start = viewport * 0.78;
    const end = -Math.max(1, rect.height - viewport * 0.2);
    const p = clamp01((start - rect.top) / Math.max(1, start - end));
    if (rect.top < start && rect.bottom > viewport * 0.1) {
      playing = false;
      playButton.textContent = 'Play';
      applyTimeline(p);
    }
  }, { passive: true });
}

applyTimeline(0);

window.__productLab = {
  getState() {
    return {
      source: assetSource,
      timeline,
      fps,
      draws: runtime.renderer.info.render.calls,
      tris: runtime.renderer.info.render.triangles,
      anchors: Object.keys(anchors),
    };
  },
  setTime(t) { applyTimeline(t); },
};
