# Product Motion Lab — Auriga Runtime Handoff

**Status:** SOURCE PIPELINE CANONICAL / BLENDER + RUNTIME EVIDENCE PENDING  
**Date:** 2026-09-10  
**Commercial target:** $3,000 web-ready product animation / GLB listing.

This file replaces any dependency on an unpushed Kimi workspace. The source pipeline required to continue is on `fromage3900/my-site` → `main`.

## Canonical source

- `../../scripts/build_auriga_meter.py` — Blender generator/exporter for the original generic Auriga Meter demo asset.
- `../../scripts/check_auriga_meter.py` — exported GLB validation gate.
- `src/auriga-meter.js` — Product Motion Lab browser loader/wiring.
- `package.json` — local module/runtime dependency declaration.
- `index.html`, `app.js`, `EVIDENCE.md` — existing Product Motion Lab proof shell.

The generated GLB itself is **not** considered evidence until the Blender command is actually run and the export is checked.

## Run order

1. Generate the owned demo GLB with Blender using the command documented by `build_auriga_meter.py`.
2. Open the resulting asset in Blender and perform Brennan's visual/silhouette check before treating it as portfolio-quality evidence.
3. Run `check_auriga_meter.py` against the exported GLB.
4. Serve the repo over local HTTP and load Product Motion Lab.
5. Confirm the generated GLB loads without blocking console errors.
6. Verify deterministic `0 → 1 → 0` scrub behavior.
7. Verify the screen/hinge/port annotation anchors remain correctly parented through the full motion range.
8. Check desktop and phone-width layouts.
9. Record actual GLB bytes, triangles, mesh/material counts, draw calls, DPR and approximate FPS from the executed runtime.
10. Capture one hero, one open/motion state, one annotation proof and one mobile proof.
11. Recheck the live listing and human-review the proposal before submission.

## Evidence states

- `SOURCE CANONICAL`: allowed now.
- `GENERATION VERIFIED`: only after Blender produces the GLB successfully.
- `STRUCTURE VERIFIED`: only after the checker passes against that exact exported file.
- `RUNTIME VERIFIED`: only after browser load/scrub/anchor QA is executed.
- `SUBMISSION READY`: only after captures, measured values, listing recheck and Brennan review.

## Do not reopen

- no second handheld generator;
- no imitation of the prospective client's diagnostic products;
- no new configurator architecture;
- no speculative compression claims;
- no application submission before real GLB/runtime evidence exists.

**NEXT SINGLE ACTION:** run the canonical Blender builder and visually inspect the generated Auriga Meter before changing any generator code.