# Fromage WebGL Kit

**Status:** internal reusable production kit  
**Purpose:** turn existing Three.js/WebGL capabilities into fast, bounded commercial deliverables without coupling them to Melodia IP.

This directory is deliberately outside the deployed portfolio surface. It is a production/tooling lane, not a new website redesign.

## Commercial thesis

Build once, reuse often:

```text
client problem
→ closest service template
→ reusable runtime + modules
→ client-specific art / interaction
→ measured QA
→ delivery
→ extract any new generic primitive back into the kit
```

Every paid job should leave behind at least one of:

- a reusable generic module;
- a reusable test;
- a reusable intake/checklist;
- a reusable performance benchmark;
- a reusable visual pattern that contains no client/Melodia IP.

## First reusable primitives

- `src/core/createRuntime.js` — renderer/camera lifecycle, resize, frame loop, cleanup.
- `src/assets/createGLBLoader.js` — bounded GLB loading wrapper with progress/error handling.
- `src/game/createStateMachine.js` — tiny deterministic finite-state helper for microgames/interactions.
- `src/audio/createAudioReactiveBus.js` — opt-in Web Audio FFT bus for music-reactive experiences.

These are intentionally small. Do not grow this into a framework until a paid problem or portfolio proof requires the abstraction.

## Five initial service SKUs

See [`SERVICES.md`](SERVICES.md):

1. Three.js / WebGL Rescue Pass
2. Interactive 3D Product / Asset Viewer
3. Branded Browser Microgame
4. Interactive Music World / Visualizer
5. Procedural WebGL Environment Prototype

## First revenue gate

See [`FIRST_20.md`](FIRST_20.md).

The goal is not "launch a startup." The goal is to prove that one existing capability can earn the first **$20 of EARNED_POOL inference budget** with minimal distraction.

## IP boundary

Never package Melodia-specific characters, textures, music, purchased templates, third-party material graphs, client assets, or other restricted content as generic kit inventory.

Commercial reusable code/assets must be clean-room or clearly owned/licensed for that purpose.

## Existing proof worth mining, not blindly copying

The live portfolio already contains:

- GLB/OBJ/FBX loading and asset manifests;
- PBR material inspection;
- orbiting 3D viewers;
- post-processing/bloom experiments;
- interactive Three.js scenes and microgame logic;
- Web Audio and music-reactive experiments.

When extracting a primitive, preserve only generic implementation and remove project-specific naming, paths, palettes, assets and narrative logic.
