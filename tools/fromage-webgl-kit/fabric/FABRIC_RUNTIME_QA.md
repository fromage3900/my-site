# Fabric Viewer Runtime QA — Submission Gate

**Status:** CHECKLIST READY / NOT EXECUTED  
**Date:** 2026-09-10  
**Authority:** `FABRIC_CONSULTANT_EVIDENCE.md` + observed browser results only.

This file closes the planning gap without inventing runtime evidence. A box becomes `PASS` only after the current `my-site/main` viewer is actually exercised in a browser.

## Runtime target

Primary source surfaces:
- `wix/realtime-3d-viewer.html`
- `wix/melodia-3d-viewport.js`
- `wix/melodia-atelier-lab.html`
- `wix/melodia-atelier-lab.js`
- `wix/sdf-material-gallery.html`

The commercial proof is the existing material/fabric inspection architecture. Do **not** build a second Fabric Lab for this gate.

## Smoke test

| Gate | State | Evidence / note |
|---|---|---|
| Viewer boots from local HTTP server | UNVERIFIED | |
| No blocking console errors | UNVERIFIED | |
| Default fabric/material preset resolves | UNVERIFIED | |
| Preset switching works | UNVERIFIED | |
| Camera orbit / turntable remains usable | UNVERIFIED | |
| Resize does not break composition | UNVERIFIED | |
| Phone-width layout remains usable | UNVERIFIED | |

## Material inspection

| Gate | State | Evidence / note |
|---|---|---|
| PBR presentation works | UNVERIFIED | |
| Normal inspection works | UNVERIFIED | |
| Roughness inspection works | UNVERIFIED | |
| Metallic inspection works | UNVERIFIED | |
| AO inspection works | UNVERIFIED | |
| Clay inspection works | UNVERIFIED | |
| Wireframe inspection works | UNVERIFIED | |
| Grazing-angle lighting reveals roughness/normal response | UNVERIFIED | |
| Exposure/lighting remain neutral enough for comparison | UNVERIFIED | |

## Commercial evidence capture

Capture only after the relevant gate passes:
1. whole-object PBR view;
2. grazing-angle textile/material close-up;
3. normal-channel inspection;
4. roughness/material-channel inspection;
5. mobile-width proof;
6. one genuine Brennan-owned CLO source view;
7. Blender cleanup/web-prep view;
8. final GLB/browser view when available.

## Evidence language

Allowed after observation:
- `RUNTIME VERIFIED` for the exact executed browser path;
- measured viewport/device and diagnostics actually observed;
- screenshots from the tested state.

Not allowed without new proof:
- physically measured textile reproduction;
- fiber-level BRDF accuracy;
- automated swatch acquisition;
- exact colorimetry;
- performance claims extrapolated from another prototype.

## Completion rule

This checklist is complete only when each required submission row is `PASS`, `FAIL`, or explicitly `NOT REQUIRED`, with a short observed note. Never infer a pass from source inspection.

**NEXT SINGLE ACTION:** serve current `my-site/main` over HTTP and execute the smoke-test + material-inspection rows once.