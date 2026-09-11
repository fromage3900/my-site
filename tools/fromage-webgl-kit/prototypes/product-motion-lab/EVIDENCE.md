# Product Motion Lab — Evidence

**Status:** GLB GENERATED + CHECKER PASS / BROWSER RUNTIME STILL OWED  
**Date:** 2026-09-10

## Canonical source on `my-site/main`

The product lane no longer depends on an unpushed agent workspace. The reusable Auriga Meter proof pipeline is canonical here:

- `../../scripts/build_auriga_meter.py` — Blender generator for the original generic demonstration asset;
- `../../scripts/check_auriga_meter.py` — standard-library GLB structure/evidence checker;
- `src/auriga-meter.js` — Three.js GLB loader, anchor discovery, normalized animation scrub, wireframe and disposal helpers;
- `package.json` — local ES-module declaration and JS syntax-check command;
- existing `index.html` / `app.js` — bounded Product Motion Lab shell and procedural fallback proof.

The builder, checker and loader source have been syntax-validated and are committed. **As of 2026-09-10 the generated GLB also exists and passes its checker** — see "Generated artifact" below. Browser runtime proof (load, scrub, captures) is still owed.

## Generated artifact — observed 2026-09-10

Produced with Blender 5.2.1 after fixing a real build break: `build_auriga_meter.py` called `obj.animation_data.action.fcurves`, which Blender >= 4.4 removed in favour of slotted actions (`action.layers[*].strips[*].channelbags[*].fcurves`). The build had therefore never once completed. Headless runs also require `--factory-startup` with an isolated `BLENDER_USER_CONFIG`, or a second instance hangs on the shared config.

```text
assets/auriga_meter.glb            195,920 bytes
assets/auriga_meter.manifest.json  sidecar
CHECK_OK
  anchors          ANCHOR_hinge, ANCHOR_port, ANCHOR_screen   (3/3)
  animations       3
  meshes           9
  nodes            14
  materials        4
  triangles_approx 2844
  generator        Khronos glTF Blender I/O v5.2.40
```

`app.js` now imports `src/auriga-meter.js` and loads this GLB; before 2026-09-10 it did not, so the asset was unreachable from the page. The page reports load state in `#assetStatus`.

## Implemented in the existing lab source

- generic procedural product assembly;
- deterministic normalized 0–1 timeline;
- slider-driven scrub;
- scroll-linked scrub zone;
- three attached annotation anchors;
- callout visibility control;
- wireframe inspection toggle;
- approximate FPS / DPR / draw-call / triangle diagnostics;
- responsive layout;
- reduced-motion behavior.

## Exact remaining proof gate

1. Run Blender with `build_auriga_meter.py` and generate `assets/auriga_meter.glb`.
2. Give the generated asset a Brennan visual/silhouette review before treating it as portfolio evidence.
3. Run `check_auriga_meter.py` against the exported GLB and preserve the observed report.
4. Load the GLB through `src/auriga-meter.js` in the Product Motion Lab using a local web server, not `file://`.
5. Confirm zero blocking console errors.
6. Confirm deterministic pose at 0.0, 0.5 and 1.0 and a repeatable 0 → 1 → 0 scrub.
7. Confirm `ANCHOR_screen`, `ANCHOR_hinge` and `ANCHOR_port` remain attached through the full motion range.
8. Confirm desktop and phone-width layouts remain usable.
9. Record real triangles, draw calls, DPR, FPS and GLB byte size after the scene stabilizes.
10. Export desktop/mobile captures and recheck the Upwork listing immediately before send.

## Truth boundary

Do not claim Draco/meshopt/KTX2 compression, client triangle-budget compliance, React Three Fiber integration, production diagnostic-device experience, or a web payload target until those are actually demonstrated. The generated `.glb` and runtime captures are intentionally not marked complete until they exist.

## Next owner action

This lane is now a **machine/runtime task**, not a Git archaeology task: generate → inspect → validate → browser QA → capture → submit.
