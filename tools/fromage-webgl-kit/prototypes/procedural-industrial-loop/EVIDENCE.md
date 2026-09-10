# Procedural Industrial System Loop — Evidence

**Status:** SOURCE IMPLEMENTED / RUNTIME VERIFY  
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
- Named motion-phase diagnostics.
- Numeric loop-endpoint delta diagnostic (`LOOP Δ`) derived from the shared deterministic timeline.
- Responsive desktop/mobile layout.
- `prefers-reduced-motion` starts the experience paused.

## Shared deterministic timeline primitive

The motion-law implementation has now been extracted into:

`../../src/animation/createDeterministicTimeline.js`

It accepts a duration plus named channels made of linear segments:

```js
{
  stationAOffsetX: [
    { start: 0, end: 2, from: 0, to: 0.72 },
    { start: 12, end: 14, from: 0.72, to: 0 }
  ]
}
```

Sampling is absolute-time and clamped. Gaps between segments hold the previous segment's terminal value. The helper also exposes timeline wrapping for deterministic looping.

This is reusable for product animation, industrial choreography, explodes/assemblies, technical callouts, and other scrub-driven Three.js work.

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

The source also computes the summed absolute delta between all timeline channel values at `0s` and `16s`. The intended value is `0.000000`; this remains a runtime verification item until observed in-browser.

## Still unverified

The following require a real browser/runtime pass before any proposal claim:

- browser console is clean;
- all controls function correctly in Chrome/Safari/Firefox;
- displayed `LOOP Δ` is actually `0.000000` at runtime;
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
3. Confirm there are no uncaught console/runtime errors.
4. Capture one full 16-second loop.
5. Scrub manually through every segment boundary: 0, 2, 4, 6, 8, 10, 12, 14, 16 seconds.
6. Verify `0s` and `16s` are visually identical and `LOOP Δ` reports `0.000000`.
7. Switch Seeds 01/02/03 and confirm stable composition.
8. Capture BASE + STRUCTURAL + FLOW + THERMAL stills.
9. Record the runtime diagnostics.
10. Verify a phone-width layout.
11. Fix only evidence-blocking defects; do not expand scope.

## Reusable primitive produced

`src/animation/createDeterministicTimeline.js` is now the reusable generic artifact produced by this strike.

The prototype no longer owns its own bespoke interpolation logic. Future Three.js product/industrial work should reuse or deliberately extend this helper only when a real paid problem requires additional motion-law behavior.

## Current handoff

```text
STATUS: SOURCE IMPLEMENTED / RUNTIME VERIFY
LAST VERIFIED: source-level structure only, 2026-09-10
WHAT CHANGED: deterministic motion extracted into shared timeline helper; industrial app refactored onto it; loop and phase diagnostics added
WHAT RAN SUCCESSFULLY: not yet browser-verified
MEASURED VALUES: none yet
WHAT IS STILL UNVERIFIED: runtime, visual polish, responsive QA, actual diagnostics, capture/export
NEXT SINGLE ACTION: serve the repo over HTTP and run the industrial prototype in a real browser
DO NOT REOPEN: motion architecture, real solver work, CAD parsing, broad framework design
```
