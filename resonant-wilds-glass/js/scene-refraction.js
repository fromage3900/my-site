// Scene-colour capture used by Liquid Glass. One shared half-resolution
// render target, never a second renderer; keeps postprocessing unchanged.
import * as THREE from 'three';
import { liquidGlassEnabled, setLiquidGlassSceneTexture } from './cel.js';
import { liteMode } from './flags.js';

const query = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
export const sceneRefractionRequested = liquidGlassEnabled && !liteMode && query.get('glasscapture') !== '0';

export class SceneRefraction {
  constructor(game) {
    this.g = game;
    this.enabled = sceneRefractionRequested;
    this.target = null;
    this.viewport = new THREE.Vector2();
    this.lastCaptureOK = false;
  }
  capture() {
    const { renderer, scene, camera, profile } = this.g;
    if (!this.enabled || profile.settings.quality === 'low') {
      setLiquidGlassSceneTexture(null);
      this.lastCaptureOK = false;
      return;
    }
    renderer.getDrawingBufferSize(this.viewport);
    const width = this.viewport.x, height = this.viewport.y;
    if (width < 1 || height < 1) return;
    const scale = matchMedia('(pointer: coarse)').matches ? 0.5 : 0.75;
    const tw = Math.max(1, Math.round(width * scale));
    const th = Math.max(1, Math.round(height * scale));
    if (!this.target) {
      this.target = new THREE.WebGLRenderTarget(tw, th, {
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: true,
        stencilBuffer: false,
        generateMipmaps: false,
      });
      this.target.texture.name = 'MelodiaGlassSceneColour';
    } else if (this.target.width !== tw || this.target.height !== th) {
      this.target.setSize(tw, th);
    }
    const hidden = [];
    scene.traverseVisible((obj) => {
      if (!obj.isMesh) return;
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      if (materials.some(mat => mat?.userData?.melodiaLiquidGlass)) {
        hidden.push(obj);
        obj.visible = false;
      }
    });
    if (hidden.length === 0) {
      this.lastCaptureOK = false;
      setLiquidGlassSceneTexture(null);
      return;
    }
    const previousTarget = renderer.getRenderTarget();
    try {
      renderer.setRenderTarget(this.target);
      renderer.clear();
      renderer.render(scene, camera);
      setLiquidGlassSceneTexture(this.target.texture, width, height);
      this.lastCaptureOK = true;
    } catch (error) {
      setLiquidGlassSceneTexture(null);
      this.enabled = false;
      this.lastCaptureOK = false;
      console.warn('Scene refraction capture disabled after WebGL error', error);
    } finally {
      renderer.setRenderTarget(previousTarget);
      for (const obj of hidden) obj.visible = true;
    }
  }
  dispose() {
    this.target?.dispose();
    this.target = null;
    setLiquidGlassSceneTexture(null);
  }
}
