# Procedural Industrial System Loop — Evidence

**Status:** SOURCE-SEEDED / RUNTIME VERIFY  
**Date:** 2026-09-10

This prototype is a clean-room capability proof for procedural/system-driven industrial animation. It is not a reconstruction of any prospective client's CAD, prototype, or proprietary animation.

## Implemented in source

- Three deterministic layout seeds.
- Neutral light-grey industrial presentation with fixed camera.
- Procedural station construction from Three.js primitives.
- Named assembly hierarchy (`PROC_IndustrialSystemRoot`, `STATION_01..03`, actuator/core/manifold parts).
- 16-second absolute-time loop.
- Strict piecewise-linear mechanical motion.
- Only one primary mechanical action advances during each active segment.
- Mirrored return sequence so the state at the loop boundary returns to the initial pose.
- Manual timeline scrub.
- Play/pause/reset controls.
- `BASE`, `STRUCTURAL`, `FLOW`, and `THERMAL` visualization styles.
- Visualization styles are explicitly labelled illustrative, not FEA/CFD/thermal simulation.
- Approximate FPS, DPR, draw calls, triangles, and geometry diagnostics.
- Responsive desktop/mobile layout.
- `prefers-reduced-motion` starts the experience paused.

## Motion schedule

```text
00–02  Station A actuator translates +X at constant speed
02–04  Station B actuator rotates +Y at constant angular speed
04–06  Station C actuator translates +Y at constant speed
06–08  hard hold
08–10  Station C reverses at constant speed
10–12  Station B reverses at constant angular speed
12–14  Station A reverses at constant speed
14–16  hard hold / loop boundary
```

The core pose is derived from absolute timeline time rather than frame-to-frame integration. Scrubbing to the same timestamp should therefore yield the same pose.

## Still unverified

The following require a real browser/runtime pass before any proposal claim:

- browser console is clean;
- all controls function correctly in Chrome/Safari/Firefox;
- actual FPS/draw-call/triangle values;
- mobile-width composition on real device or responsive emulator;
- visual quality of all three seeds;
- exact loop-boundary appearance under capture;
- color/readability of solver-inspired visualization styles;
- GitHub Pages/public serving behavior for this `/tools/` path.

Do not mark these items PASS from source inspection alone.

## Next bounded proof pass

1. Serve the repo through a local HTTP server.
2. Open `tools/fromage-webgl-kit/prototypes/procedural-industrial-loop/`.
3. Capture one full 16-second loop.
4. Scrub manually through every segment boundary: 0, 2, 4, 6, 8, 10, 12, 14, 16 seconds.
5. Switch Seeds 01/02/03 and confirm stable composition.
6. Capture BASE + STRUCTURAL + FLOW + THERMAL stills.
7. Record the runtime diagnostics.
8. Verify a phone-width layout.
9. Fix only evidence-blocking defects; do not expand scope.

## Reusable primitive produced

The prototype establishes a generic pattern for **absolute-time deterministic mechanical choreography**: each transform is a pure function of timeline time, with piecewise-linear segments and explicit hard holds. This pattern can be extracted into `src/motion/` after runtime proof demonstrates that another prototype needs it.
