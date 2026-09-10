# Procedural Industrial System Loop

**Status:** SOURCE IMPLEMENTED / RUNTIME VERIFY REQUIRED  
**Authority:** `../../KIMI_PROTOTYPE_BATCH_2026-09-10.md` — Prototype C.

Clean-room Three.js proof for procedural industrial presentation, deterministic mechanical motion, and solver-inspired visualization styling.

This prototype exists to support the current paid-problem / commercial-proof lane. It is not an engineering simulator and does not use client CAD or client IP.

## Run locally

Serve `my-site` from a local HTTP server; do not open the page through `file://` because ES-module imports require HTTP(S).

Example from repository root:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/tools/fromage-webgl-kit/prototypes/procedural-industrial-loop/
```

## What the source intends to prove

- deterministic 16-second timeline;
- absolute-time sampling rather than accumulated transform state;
- one-axis-at-a-time mechanical motion;
- constant-speed motion segments with hard holds;
- exact return to the starting pose at the loop boundary;
- three deterministic procedural seeds;
- fixed-camera art-directed composition;
- restrained base materials;
- illustrative `STRUCTURAL`, `FLOW`, and `THERMAL` display modes;
- desktop/mobile responsive presentation;
- renderer diagnostics.

The reusable motion logic lives at:

`../../src/animation/createDeterministicTimeline.js`

## Runtime QA gate

Do not mark this prototype PASS until all of the following have been observed in a real browser session:

1. page loads with no uncaught console error;
2. all three seeds render;
3. all four visualization modes work;
4. timeline can scrub to arbitrary times and back without drift;
5. `0.00s` and `16.00s` are visually identical;
6. displayed `LOOP Δ` is `0.000000`;
7. no two independent mechanical actions visibly move during the same active segment;
8. pause/play/reset remain deterministic;
9. phone-width layout remains usable;
10. reduced-motion mode starts paused;
11. diagnostics report plausible nonzero render stats;
12. no misleading engineering-simulation claim appears in the UI.

## Visual polish gate

Only after runtime QA:

- judge silhouette/readability at desktop capture size;
- reduce visual clutter before adding detail;
- improve proportions of the modular station if it reads as placeholder geometry;
- keep the camera fixed unless the buyer proof explicitly requires otherwise;
- preserve the light-grey engineering presentation;
- use visualization color only to encode state;
- prefer hierarchy, spacing, rhythm, and material response over decorative detail.

## Evidence gate

Capture:

- base-mode hero still;
- one full 16-second loop;
- stills of Structural / Flow / Thermal;
- one image containing Seeds 01 / 02 / 03 or three clearly labelled stills;
- diagnostics at desktop width;
- phone-width proof;
- console-clean proof if practical.

Record actual values in `EVIDENCE.md`. Never backfill guessed FPS, triangles, draw calls, encoded file size, or browser results.

## Commercial mapping

See `LISTING_10000_EVIDENCE.md` for the current buyer-facing requirement map.

This clean-room demo may demonstrate:

- following strict motion-law direction;
- system-driven/procedural animation thinking;
- constrained industrial art direction;
- real-time Three.js delivery awareness;
- deterministic state/timeline control.

It does **not** prove, until separately executed:

- import/cleanup of supplied CAD;
- Houdini-to-web interchange;
- ProRes master delivery;
- 2560×1080 final render delivery;
- AV1/VP9 encoding below a specified byte budget;
- real FEA, CFD, thermal, structural, or other engineering computation.

## Scope boundary

Do not turn this proof into a CAD platform, physics simulator, engineering solver, terrain system, or public-site redesign. If runtime proof is clean, the next action is evidence + proposal preparation, not feature expansion.
