// Melodia Resonant Wilds — material-directed NPR V2, Three.js r170.
// V2 is the default hard-RGB-band look. Use ?npr=v1 or ?render=legacy to compare older shading.
import * as THREE from 'three';

const flags = new URLSearchParams(window.location.search);
export const legacyRender = flags.get('render') === 'legacy';
export const nprV2 = !legacyRender && flags.get('npr') !== 'v1';
export const liquidGlassEnabled = !legacyRender && flags.get('glass') !== '0';


const glassControls = { refraction: 0.038, dispersion: 0.024, iridescence: 0.68, specular: 0.92 };
const glassUniforms = {
  uGlassRefraction: { value: glassControls.refraction },
  uGlassDispersion: { value: glassControls.dispersion },
  uGlassIridescence: { value: glassControls.iridescence },
  uGlassSpecular: { value: glassControls.specular },
  uGlassScene: { value: null },
  uGlassViewport: { value: new THREE.Vector2(1, 1) },
  uGlassHasScene: { value: 0 },
};
export function setLiquidGlassParams(changes = {}) {
  const limits = { refraction: [0, 0.12], dispersion: [0, 0.08],
    iridescence: [0, 1], specular: [0, 1.5] };
  for (const [key, [min, max]] of Object.entries(limits)) {
    const n = Number(changes[key]);
    if (key in changes && Number.isFinite(n)) glassControls[key] = Math.max(min, Math.min(max, n));
  }
  for (const key of Object.keys(glassControls))
    glassUniforms['uGlass' + key[0].toUpperCase() + key.slice(1)].value = glassControls[key];
  return { ...glassControls };
}
export function getLiquidGlassParams() { return { ...glassControls }; }
export function setLiquidGlassSceneTexture(texture, width = 1, height = 1) {
  glassUniforms.uGlassScene.value = texture || null;
  glassUniforms.uGlassViewport.value.set(Math.max(1, width), Math.max(1, height));
  glassUniforms.uGlassHasScene.value = texture ? 1 : 0;
}
export function getLiquidGlassSceneTextureState() {
  return { enabled: !!glassUniforms.uGlassHasScene.value,
    width: glassUniforms.uGlassViewport.value.x, height: glassUniforms.uGlassViewport.value.y };
}

let gradient;
const ramps = new Map();
const inkMaterials = new Set();
let shadowTint = 0.82;
let inkOpacity = 0.85;
const bandControls = {
  hardness: 0.98, threshold: 0.49, depth: 0.39,
};
const bandUniforms = {
  uBandHardness: { value: bandControls.hardness },
  uBandThreshold: { value: bandControls.threshold },
  uBandShadowDepth: { value: bandControls.depth },
};
// Exposed for the look tuner; shared uniforms update every compiled toon shader.
export function setNPRBands(changes = {}) {
  const limits = {
    hardness: [0, 1], threshold: [0.28, 0.70], depth: [0.15, 1],
  };
  for (const [key, bounds] of Object.entries(limits)) {
    if (!(key in changes)) continue;
    const num = Number(changes[key]);
    if (!Number.isFinite(num)) continue;
    bandControls[key] = Math.max(bounds[0], Math.min(bounds[1], num));
  }
  bandUniforms.uBandHardness.value = bandControls.hardness;
  bandUniforms.uBandThreshold.value = bandControls.threshold;
  bandUniforms.uBandShadowDepth.value = bandControls.depth;
  return { ...bandControls };
}
export function getNPRBands() { return { ...bandControls }; }
const V1_BANDS = [80, 167, 255];

// Recolour *existing* ramp textures in place so no mesh or shader rebuild is needed.
function writePalette(role, texture) {
  const data = texture.image.data;
  NPR_PALETTES[role].forEach((rgb, i) => {
    for (let c = 0; c < 3; c++) {
      data[i * 4 + c] = Math.round(V1_BANDS[i] * (1 - shadowTint) + rgb[c] * shadowTint);
    }
    data[i * 4 + 3] = 255;
  });
  texture.needsUpdate = true;
}
export function setNPRShadowTint(value) {
  const n = Number(value);
  if (Number.isFinite(n)) shadowTint = Math.max(0, Math.min(1, n));
  for (const [role, texture] of ramps) writePalette(role, texture);
  return shadowTint;
}
export function getNPRShadowTint() { return shadowTint; }

// Track only outline materials. V1 rendering stays untouched.
export function registerInkMaterial(mat) {
  if (nprV2) {
    inkMaterials.add(mat);
    mat.opacity = inkOpacity;
    mat.transparent = inkOpacity < 0.999;
    mat.depthWrite = !mat.transparent;
  }
  return mat;
}
export function setNPRInkOpacity(value) {
  const n = Number(value);
  if (Number.isFinite(n)) inkOpacity = Math.max(0, Math.min(1, n));
  for (const mat of inkMaterials) {
    const transparent = inkOpacity < 0.999;
    if (mat.transparent !== transparent) mat.needsUpdate = true;
    mat.transparent = transparent;
    mat.depthWrite = !transparent;
    mat.opacity = inkOpacity;
  }
  return inkOpacity;
}
export function getNPRInkOpacity() { return inkOpacity; }
// Multiplicative RGB shadow / midtone / light ramps, keeping author-authored
// texture maps, vertex colours, gear dyes and per-material emissive intact.
// Chosen to colour *lighting*, not overwrite surface albedo.
export const NPR_PALETTES = Object.freeze({
  default: [[105, 89, 152], [194, 181, 228], [255, 255, 255]],
  skin:    [[126, 91, 168], [228, 177, 212], [255, 248, 239]],
  fabric:  [[103, 79, 170], [206, 177, 231], [255, 251, 255]],
  foliage: [[74, 118, 163], [177, 214, 204], [255, 255, 238]],
  stone:   [[99, 123, 172], [189, 215, 225], [255, 251, 247]],
  metal:   [[138, 91, 147], [240, 203, 161], [255, 255, 236]],
  crystal: [[87, 133, 193], [180, 208, 255], [255, 255, 255]],
});

export function toonGradient() {
  if (gradient) return gradient;
  gradient = new THREE.DataTexture(new Uint8Array([80, 167, 255]), 3, 1, THREE.RedFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.generateMipmaps = false;
  gradient.colorSpace = THREE.NoColorSpace;
  gradient.needsUpdate = true;
  return gradient;
}

export function paletteGradient(role = 'default') {
  role = NPR_PALETTES[role] ? role : 'default';
  if (ramps.has(role)) return ramps.get(role);
  const pixels = new Uint8Array(12);
  // Populated by writePalette below; preserves a single GPU texture per role.
  const texture = new THREE.DataTexture(pixels, 3, 1, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.NoColorSpace;
  ramps.set(role, texture);
  writePalette(role, texture);
  return texture;
}

function guessPalette(color) {
  if (typeof color !== 'string' && !color?.isColor && typeof color !== 'number') return 'default';
  const c = new THREE.Color(color), hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  if (hsl.s < 0.13) return hsl.l > 0.7 ? 'fabric' : 'stone';
  if (hsl.h > 0.27 && hsl.h < 0.52) return 'foliage';
  if (hsl.h > 0.50 && hsl.h < 0.70) return 'crystal';
  if (hsl.h > 0.70 && hsl.h < 0.84) return 'fabric';
  if (hsl.h > 0.84) return 'fabric';
  if (hsl.h < 0.13 && hsl.l < 0.43) return 'skin';
  if (hsl.h < 0.16) return 'metal';
  return 'stone';
}

// Three.js r170's stock getGradientIrradiance samples gradientMap.r only.
// Replace the chunk on NPR V2 to preserve the actual RGB lighting ramps and
// make band transition width independent of the three-sample palette texture.
// This is the source of the previously mushy/pale shadow thresholds.
const RGB_BANDS_GLSL = `
#ifdef USE_GRADIENTMAP
uniform sampler2D gradientMap;
#endif
uniform float uBandHardness;
uniform float uBandThreshold;
uniform float uBandShadowDepth;
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
  float ndl = dot( normal, lightDirection ) * 0.5 + 0.5;
  // 0.98 is nearly a hard step; low values allow gentle transitions.
  float feather = mix(0.115, 0.0015, uBandHardness);
  float shadeMid = smoothstep(uBandThreshold-feather, uBandThreshold+feather, ndl);
  float midLitCut = min(0.97, uBandThreshold + 0.31);
  float midLit = smoothstep(midLitCut-feather, midLitCut+feather, ndl);
  #ifdef USE_GRADIENTMAP
    vec3 shadowRGB = texture2D( gradientMap, vec2(1.0/6.0, 0.5) ).rgb * uBandShadowDepth;
    vec3 middleRGB = texture2D( gradientMap, vec2(3.0/6.0, 0.5) ).rgb;
    vec3 lightRGB = texture2D( gradientMap, vec2(5.0/6.0, 0.5) ).rgb;
    return mix(mix(shadowRGB, middleRGB, shadeMid), lightRGB, midLit);
  #else
    return vec3(mix(mix(uBandShadowDepth, 0.70, shadeMid), 1.0, midLit));
  #endif
}
`;

function installRGBBandShader(material) {
  if (!nprV2) return material;
  const upstream = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    upstream.call(material, shader, renderer);
    Object.assign(shader.uniforms, bandUniforms);
    const chunk = '#include <gradientmap_pars_fragment>';
    if (!shader.fragmentShader.includes(chunk)) {
      throw new Error('Melodia RGB toon shader: Three.js gradient chunk missing');
    }
    shader.fragmentShader = shader.fragmentShader.replace(chunk, RGB_BANDS_GLSL);
    // The broad hemispheric fill was washing out the three direct-light bands.
    // Retain a little fill so shadowed skin, hair and fabric remain legible.
    // A strong hemispheric fill washes out dark bands. Tone it down after
    // lighting accumulation; emission and the world's beat effects stay intact.
    shader.fragmentShader = shader.fragmentShader.replace(
      'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;',
      'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse * 0.22 + totalEmissiveRadiance;'
    );
    material.userData.melodiaNPRShader = shader;
  };
  material.customProgramCacheKey = () => 'melodia-rgb-three-band-r2';
  return material;
}

export function celMaterial(color, options = {}) {
  const { nprRole, ...parameters } = options;
  return installRGBBandShader(new THREE.MeshToonMaterial({
    color,
    gradientMap: nprV2 ? paletteGradient(nprRole || guessPalette(color)) : toonGradient(),
    ...parameters,
  }));
}

export function environmentMaterial(color, options = {}) {
  const { nprRole, ...parameters } = options;
  return legacyRender
    ? new THREE.MeshLambertMaterial({ color, ...parameters })
    : celMaterial(color, { ...parameters, nprRole });
}


/**
 * Screen-space scene refraction using real captured environment RGB pixels.
 * Stylized thin-film highlights and stepped anime rim preserve cel identity.
 * Uses 'normal', not vNormal, so flatShading materials also compile.
 */
export function liquidGlassMaterial(color = '#b8f0ff', options = {}) {
  const { nprRole = 'crystal', opacity = 0.84, transparent = true, ...rest } = options;
  if (legacyRender || !liquidGlassEnabled)
    return environmentMaterial(color, { nprRole, opacity, transparent, ...rest });
  const mat = celMaterial(color, { nprRole, opacity, transparent, depthWrite: false, ...rest });
  mat.userData.melodiaLiquidGlass = true;
  const previousShaderHook = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, renderer) => {
    if (previousShaderHook) previousShaderHook.call(mat, shader, renderer);
    Object.assign(shader.uniforms, glassUniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform float uGlassRefraction;
        uniform float uGlassDispersion;
        uniform float uGlassIridescence;
        uniform float uGlassSpecular;
        uniform sampler2D uGlassScene;
        uniform vec2 uGlassViewport;
        uniform float uGlassHasScene;
        vec3 rwThinFilm(float ndv, float shift) {
          float phase = 6.2831853 * (1.42 * ndv + shift);
          return 0.5 + 0.5 * cos(phase + vec3(0.0, 2.094395, 4.188790));
        }
        vec2 rwGlassBend(vec3 viewDir, vec3 surfNorm, float ior) {
          vec3 ray = refract(-viewDir, surfNorm, 1.0 / ior);
          return (ray.xy + viewDir.xy) * uGlassRefraction;
        }
        vec2 rwGlassClampUV(vec2 uv) {
          vec2 pixel = 1.5 / max(uGlassViewport, vec2(1.0));
          return clamp(uv, pixel, vec2(1.0) - pixel);
        }
      `)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        vec3 lgView = normalize(vViewPosition);
        vec3 lgNorm = normalize(normal);
        float lgNdotV = clamp(dot(lgNorm, lgView), 0.0, 1.0);
        float lgFresnel = pow(1.0 - lgNdotV, 2.8);
        vec3 lgFilm = rwThinFilm(lgNdotV, lgNorm.x * 0.35 + lgNorm.y * 0.25);
        vec3 lgHalf1 = normalize(lgView + normalize(vec3(0.45, 0.82, 0.35)));
        vec3 lgHalf2 = normalize(lgView + normalize(vec3(-0.55, 0.65, -0.35)));
        float lgSpec1 = smoothstep(0.955, 0.982, pow(max(0.0, dot(lgNorm, lgHalf1)), 48.0));
        float lgSpec2 = smoothstep(0.84, 0.89, pow(max(0.0, dot(lgNorm, lgHalf2)), 20.0)) * 0.42;
        float lgSpecTotal = (lgSpec1 + lgSpec2) * uGlassSpecular;
        vec3 lgSceneRGB = vec3(0.0);
        if (uGlassHasScene > 0.5) {
          vec2 screenUV = gl_FragCoord.xy / uGlassViewport;
          float disp = clamp(uGlassDispersion, 0.0, 0.08);
          vec2 redUV = rwGlassClampUV(screenUV + rwGlassBend(lgView, lgNorm, 1.36 - disp));
          vec2 greenUV = rwGlassClampUV(screenUV + rwGlassBend(lgView, lgNorm, 1.36));
          vec2 blueUV = rwGlassClampUV(screenUV + rwGlassBend(lgView, lgNorm, 1.36 + disp));
          lgSceneRGB = vec3(texture2D(uGlassScene, redUV).r,
            texture2D(uGlassScene, greenUV).g, texture2D(uGlassScene, blueUV).b);
        }
        totalEmissiveRadiance += lgFilm * uGlassIridescence * (0.10 + 0.30 * lgFresnel)
          + vec3(1.0, 0.98, 1.0) * lgSpecTotal * 0.65;
      `)
      .replace('#include <opaque_fragment>', `
        float lgTransmission = uGlassHasScene * (0.72 - 0.30 * lgFresnel);
        outgoingLight = mix(outgoingLight, lgSceneRGB, lgTransmission);
        // Keep the scene's existing hard bands; rim has a deliberately sharp edge.
        float lgRim = smoothstep(0.70, 0.78, pow(1.0 - lgNdotV, 2.5));
        outgoingLight += vec3(0.18, 0.22, 0.32) * lgRim;
        #include <opaque_fragment>
        gl_FragColor.a = clamp(gl_FragColor.a * mix(0.72, 1.0, lgFresnel)
          + lgSpecTotal * 0.18, 0.20, 1.0);
      `);
  };
  mat.customProgramCacheKey = () => 'melodia-liquid-glass-real-scene-r3';
  return mat;
}
