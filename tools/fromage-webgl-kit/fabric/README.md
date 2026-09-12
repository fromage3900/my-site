# Fabric / Material / Viewer Evidence

**Purpose:** durable technical-art evidence for premium product/accessory, fabric/material, configurator and WebGL rescue proposals.

This README is the only status/evidence note for this lane. Durable pipeline detail remains in [`CLO_TO_WEB_PIPELINE.md`](CLO_TO_WEB_PIPELINE.md); reusable-asset licensing/provenance remains in [`MATERIAL_PROVENANCE_MANIFEST.json`](MATERIAL_PROVENANCE_MANIFEST.json).

## What is actually proven

The existing browser viewer has been run and repaired rather than merely inspected in source. Relevant demonstrated work includes:

- Three.js PBR product/material presentation;
- packed ORM channel debugging and true R/G/B isolation for AO/roughness/metalness inspection;
- missing-asset and texture-path diagnosis;
- measured geometry rather than guessed triangle labels;
- replacing placeholder/overweight browser assets with bounded alternatives;
- texture downscaling / browser-delivery cleanup;
- robust fit-to-view across inconsistent source units and outlier geometry;
- static-preview rebuilds that remove unnecessary rigs/embedded baggage;
- desktop/mobile viewer framing and interaction QA;
- authored realtime lighting for material response inspection.

These capabilities are directly useful for premium eyewear/accessory work even though the existing demonstration assets are not eyewear.

## Important observed fixes

Recent viewer QA found and corrected real production problems:

- roughness/metalness/AO inspection modes previously misrepresented packed ORM data;
- one catalog asset path was a live 404;
- several displayed triangle counts were badly wrong until measured through Blender;
- placeholder instrument geometry and multi-million-triangle browser assets were replaced/decimated;
- five asset groups referenced textures that had never shipped; the browser set was reduced from large 4K source textures to appropriately bounded web copies;
- a large rigged hero preview was rebuilt as a static viewer asset, removing unnecessary rig/embedded payload;
- hardcoded per-asset scaling was replaced by a measured fit-to-view strategy resilient to inconsistent units and stray geometry.

This is strong **pipeline/debugging evidence**. It does not make Melodia assets commercial kit inventory.

## Fabric-specific evidence

The current viewer/material architecture includes organized material families, base-color/normal/packed material resources, roughness/metalness controls, inspection modes and realtime light evaluation.

Treat it as an artistic realtime fabric/material system, **not** measured textile science. Do not claim:

- fiber-level or measured BRDF reproduction;
- spectrophotometer/colorimeter workflows;
- automated physical swatch acquisition;
- physically exact color/fiber matching.

## CLO capability

CLO 3D is valid owner experience. The durable intended path is documented in `CLO_TO_WEB_PIPELINE.md`:

```text
CLO / owned source
→ Blender cleanup + optimization
→ material / texture preparation
→ GLB/GLTF
→ Three.js validation
→ optional controlled variant/configurator state
```

Use concrete owned artifacts when a proposal depends on CLO; do not substitute software-name claims for evidence.

## Commercial reuse boundary

Existing textures/assets must be classified through `MATERIAL_PROVENANCE_MANIFEST.json` before reuse.

Only clearly owner-authored or commercially reusable/licensed resources may enter generic Treasury inventory. `UNKNOWN`, restricted third-party and Melodia-specific assets remain evidence-of-process only.

## Current use

Do not build a second fabric app. Reuse this lane to support:

- premium accessory/product viewers;
- material/finish variant systems;
- GLB optimization/rescue;
- product configurators;
- fabric/garment technical-art consulting.

A new proof is justified only when a qualified paid lead exposes a specific capability gap.
