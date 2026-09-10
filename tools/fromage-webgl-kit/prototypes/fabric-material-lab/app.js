import * as THREE from 'three';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/environments/RoomEnvironment.js';
import { createRuntime } from '../../src/core/createRuntime.js';

const stage = document.getElementById('stage');
const presetSelect = document.getElementById('presetSelect');
const texelDensity = document.getElementById('texelDensity');
const texelVal = document.getElementById('texelVal');
const sheenRoughness = document.getElementById('sheenRoughness');
const sheenVal = document.getElementById('sheenVal');
const filmThickness = document.getElementById('filmThickness');
const filmVal = document.getElementById('filmVal');
const rimOrbit = document.getElementById('rimOrbit');
const rimVal = document.getElementById('rimVal');
const turntableBtn = document.getElementById('turntableBtn');
const resetViewBtn = document.getElementById('resetViewBtn');
const modeBadge = document.getElementById('modeBadge');
const diagnostics = document.getElementById('diagnostics');
const aovButtons = [...document.querySelectorAll('.aov-btn')];

// Generate procedural micro-weave texture
function createWeaveTexture(type = 'twill') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const idx = (y * 256 + x) * 4;
      let pattern = 0;
      if (type === 'twill') {
        pattern = Math.sin((x + y * 2) * 0.4) * 0.5 + Math.cos((x - y) * 0.4) * 0.5;
      } else if (type === 'brocade') {
        pattern = Math.sin(x * 0.15) * Math.cos(y * 0.15) * 0.8 + Math.sin((x + y) * 0.3) * 0.2;
      } else {
        pattern = Math.sin(x * 0.3) * 0.5 + Math.cos(y * 0.3) * 0.5;
      }
      const val = 128 + Math.floor(pattern * 45);
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = 255; // normal Z dominant
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

const normalTextures = {
  twill: createWeaveTexture('twill'),
  brocade: createWeaveTexture('brocade'),
  satin: createWeaveTexture('satin'),
};

// Preset definitions
const PRESETS = {
  organza: {
    name: 'IRIDESCENT ORGANZA',
    color: 0xf6eff7,
    roughness: 0.18,
    metalness: 0.05,
    sheen: 1.0,
    sheenColor: 0x93d5ed,
    sheenRoughness: 0.28,
    clearcoat: 0.4,
    clearcoatRoughness: 0.15,
    transmission: 0.35,
    ior: 1.48,
    texel: 8.0,
    weave: 'satin',
    film: 520,
  },
  satin: {
    name: 'ANISOTROPIC SATIN SILK',
    color: 0xe6ded1,
    roughness: 0.22,
    metalness: 0.12,
    sheen: 1.0,
    sheenColor: 0xffeed9,
    sheenRoughness: 0.22,
    clearcoat: 0.2,
    clearcoatRoughness: 0.25,
    transmission: 0.0,
    ior: 1.5,
    texel: 6.0,
    weave: 'twill',
    film: 450,
  },
  brocade: {
    name: 'ROSE-GOLD PETAL BROCADE',
    color: 0xdfb4a4,
    roughness: 0.38,
    metalness: 0.65,
    sheen: 0.85,
    sheenColor: 0xffd1b8,
    sheenRoughness: 0.35,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    transmission: 0.0,
    ior: 1.55,
    texel: 4.0,
    weave: 'brocade',
    film: 610,
  },
  cymatic_wool: {
    name: 'CHORAL SHEEP CYMATIC WOOL',
    color: 0xf5f3ee,
    roughness: 0.88,
    metalness: 0.0,
    sheen: 0.95,
    sheenColor: 0xfffcf7,
    sheenRoughness: 0.75,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    transmission: 0.0,
    ior: 1.46,
    texel: 10.0,
    weave: 'twill',
    film: 380,
  },
  velvet: {
    name: 'DEEP PLUM CATHEDRAL VELVET',
    color: 0x3d1b28,
    roughness: 0.92,
    metalness: 0.0,
    sheen: 1.0,
    sheenColor: 0xa84a72,
    sheenRoughness: 0.48,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    transmission: 0.0,
    ior: 1.52,
    texel: 5.0,
    weave: 'twill',
    film: 680,
  },
};

// Initialize runtime
const runtime = createRuntime({
  container: stage,
  antialias: true,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.05,
});

const pmremGenerator = new THREE.PMREMGenerator(runtime.renderer);
runtime.scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture;

runtime.camera.position.set(0, 0.4, 2.6);
runtime.camera.lookAt(0, -0.05, 0);

// Key lights
const keyLight = new THREE.DirectionalLight(0xfffbf5, 1.4);
keyLight.position.set(1.8, 2.4, 1.8);
runtime.scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xdce7f2, 0.6);
fillLight.position.set(-2.0, 1.2, 0.8);
runtime.scene.add(fillLight);

// Orbiting grazing rim light
const rimLight = new THREE.DirectionalLight(0xffeed6, 2.2);
rimLight.position.set(0, 0.2, -2.2);
runtime.scene.add(rimLight);

// Build 3D undulating fabric drape geometry
function createDrapedClothGeometry() {
  const geom = new THREE.PlaneGeometry(2.4, 2.4, 140, 140);
  const pos = geom.attributes.position;
  
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    
    // Catenary drape folds + gravity droop
    const fold1 = Math.sin(x * 3.4 + y * 0.8) * 0.18;
    const fold2 = Math.cos(x * 7.2 - y * 1.4) * 0.06;
    const fold3 = Math.sin(x * 12.0) * 0.015;
    const droop = Math.cos(x * 1.2) * 0.12 - (y * y * 0.06);
    
    const z = fold1 + fold2 + fold3 + droop;
    pos.setZ(i, z);
  }
  geom.computeVertexNormals();
  return geom;
}

const clothGeometry = createDrapedClothGeometry();

// PBR Material
let activePresetKey = 'organza';
let currentAOV = 'beauty';
let autoOrbitRim = false;
let rimAngleDeg = 45;

const clothMaterial = new THREE.MeshPhysicalMaterial();
const clothMesh = new THREE.Mesh(clothGeometry, clothMaterial);
clothMesh.rotation.x = -Math.PI * 0.22;
clothMesh.rotation.z = Math.PI * 0.04;
runtime.scene.add(clothMesh);

// AOV Alternative Materials
const normalAOVMaterial = new THREE.MeshNormalMaterial({ wireframe: false });
const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x1f2226, wireframe: true });
const sheenAOVMaterial = new THREE.MeshBasicMaterial({ color: 0x93d5ed });

function updateMaterialFromPreset(key) {
  const p = PRESETS[key];
  if (!p) return;
  activePresetKey = key;
  
  clothMaterial.color.setHex(p.color);
  clothMaterial.roughness = p.roughness;
  clothMaterial.metalness = p.metalness;
  clothMaterial.sheen = p.sheen;
  clothMaterial.sheenColor.setHex(p.sheenColor);
  clothMaterial.sheenRoughness = p.sheenRoughness;
  clothMaterial.clearcoat = p.clearcoat;
  clothMaterial.clearcoatRoughness = p.clearcoatRoughness;
  clothMaterial.transmission = p.transmission;
  clothMaterial.ior = p.ior;
  
  const normTex = normalTextures[p.weave];
  normTex.repeat.set(p.texel, p.texel);
  clothMaterial.normalMap = normTex;
  clothMaterial.normalScale.set(0.4, 0.4);
  clothMaterial.needsUpdate = true;
  
  texelDensity.value = p.texel;
  texelVal.value = `${p.texel}x`;
  sheenRoughness.value = p.sheenRoughness;
  sheenVal.value = p.sheenRoughness.toFixed(2);
  filmThickness.value = p.film;
  filmVal.value = `${p.film} nm`;
  
  presetSelect.value = key;
  modeBadge.textContent = `PRESET: ${p.name}`;
}

function updateAOV(aov) {
  currentAOV = aov;
  aovButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.aov === aov)));
  
  if (aov === 'normals') {
    clothMesh.material = normalAOVMaterial;
  } else if (aov === 'wireframe') {
    clothMesh.material = wireframeMaterial;
  } else if (aov === 'sheen') {
    sheenAOVMaterial.color.copy(clothMaterial.sheenColor);
    clothMesh.material = sheenAOVMaterial;
  } else {
    clothMesh.material = clothMaterial;
  }
}

function updateRimLightPosition(deg) {
  rimAngleDeg = deg % 360;
  const rad = (rimAngleDeg * Math.PI) / 180;
  const radius = 2.4;
  rimLight.position.set(Math.sin(rad) * radius, 0.35, Math.cos(rad) * radius);
  rimOrbit.value = Math.round(rimAngleDeg);
  rimVal.value = `${Math.round(rimAngleDeg)}°`;
}

// Event Listeners
presetSelect.addEventListener('change', (e) => updateMaterialFromPreset(e.target.value));

aovButtons.forEach((btn) => {
  btn.addEventListener('click', () => updateAOV(btn.dataset.aov));
});

texelDensity.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  texelVal.value = `${val.toFixed(1)}x`;
  if (clothMaterial.normalMap) {
    clothMaterial.normalMap.repeat.set(val, val);
  }
});

sheenRoughness.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  sheenVal.value = val.toFixed(2);
  clothMaterial.sheenRoughness = val;
});

filmThickness.addEventListener('input', (e) => {
  const val = Number(e.target.value);
  filmVal.value = `${val} nm`;
  // Thin film interference phase shift color calculation
  const phase = (val - 200) / 600;
  const r = 0.5 + 0.5 * Math.cos(2 * Math.PI * (phase + 0.0));
  const g = 0.5 + 0.5 * Math.cos(2 * Math.PI * (phase + 0.33));
  const b = 0.5 + 0.5 * Math.cos(2 * Math.PI * (phase + 0.67));
  clothMaterial.sheenColor.setRGB(r, g, b);
});

rimOrbit.addEventListener('input', (e) => {
  updateRimLightPosition(Number(e.target.value));
});

turntableBtn.addEventListener('click', () => {
  autoOrbitRim = !autoOrbitRim;
  turntableBtn.setAttribute('aria-pressed', String(autoOrbitRim));
  turntableBtn.textContent = autoOrbitRim ? 'Stop Rim Orbit' : 'Auto-Orbit Rim';
});

resetViewBtn.addEventListener('click', () => {
  runtime.camera.position.set(0, 0.4, 2.6);
  runtime.camera.lookAt(0, -0.05, 0);
  clothMesh.rotation.set(-Math.PI * 0.22, 0, Math.PI * 0.04);
});

// Drag to rotate cloth
let isDragging = false;
let prevMouseX = 0;
let prevMouseY = 0;

stage.addEventListener('pointerdown', (e) => {
  isDragging = true;
  prevMouseX = e.clientX;
  prevMouseY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - prevMouseX;
  const dy = e.clientY - prevMouseY;
  clothMesh.rotation.y += dx * 0.008;
  clothMesh.rotation.x += dy * 0.008;
  prevMouseX = e.clientX;
  prevMouseY = e.clientY;
});

window.addEventListener('pointerup', () => { isDragging = false; });

// Runtime Loop
let fpsSmoothed = 60;
let diagAcc = 0;

runtime.onFrame(({ delta }) => {
  if (autoOrbitRim) {
    updateRimLightPosition(rimAngleDeg + delta * 35);
  }
  
  if (delta > 0) fpsSmoothed += ((1 / delta) - fpsSmoothed) * 0.08;
  diagAcc += delta;
  if (diagAcc >= 0.35) {
    diagAcc = 0;
    const info = runtime.renderer.info.render;
    diagnostics.textContent = [
      `PRESET    ${PRESETS[activePresetKey].name}`,
      `AOV MODE  ${currentAOV.toUpperCase()}`,
      `FPS       ${Math.round(fpsSmoothed)}`,
      `DRAWS     ${info.calls}`,
      `TRIS      ${info.triangles}`,
      `TEXEL     ${texelDensity.value}x repeat`,
      `SHEEN R   ${clothMaterial.sheenRoughness.toFixed(2)}`,
      `RIM ANGLE ${Math.round(rimAngleDeg)}°`,
    ].join('\n');
  }
});

// Initial setup
updateMaterialFromPreset('organza');
updateRimLightPosition(45);

window.__fabricLab = {
  getPreset() { return activePresetKey; },
  setPreset(k) { updateMaterialFromPreset(k); },
  setAOV(aov) { updateAOV(aov); },
  getState() {
    return {
      preset: activePresetKey,
      aov: currentAOV,
      draws: runtime.renderer.info.render.calls,
      tris: runtime.renderer.info.render.triangles,
    };
  }
};
