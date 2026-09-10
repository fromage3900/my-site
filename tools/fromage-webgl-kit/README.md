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

## Current strike state — 2026-09-10

The active paid-problem experiment is documented in:

- `DIRECT_LISTING_STRIKES_2026-09-10.md` — listing-specific execution briefs;
- `CUSTOM_ASSET_STRIKE_PACK_2026-09-10.md` — original asset proofs that improve proposal credibility;
- `LEADS_2026-09-10.md` — scored live-market batch;
- `FINISH_LATER_2026-09-10.md` — bounded continuation queue.

Current production order:

```text
A. Product Motion Lab + original handheld asset
→ B. Existing fabric/CLO pipeline commercialization proof
→ C. Procedural Industrial System Loop
→ measured evidence
→ human-reviewed proposal
```

Do not invent a fourth prototype until one of the current strikes reaches proposal-ready evidence.

## Afternoon submission package — 2026-09-10

Submission authority lives under `submissions/2026-09-10/`:

- `AFTERNOON_SUBMISSION_PACK.md` — exact evidence and packaging gate for all three lanes;
- `FIGMA_MINIMAL_POLISH_BRIEF.md` — shared minimal visual-polish system for covers/evidence sheets;
- `submission-manifest.json` — machine-readable lane ownership, blockers and ready-to-submit requirements.

If a runtime/capture agent finishes work, update the relevant evidence file and manifest status before adding any new features.

Current owner split:

```text
Lane A — Product / GLB      Kimi + Brennan visual pass
Lane B — CLO / Fabric      Brennan + evidence/application packaging
Lane C — Industrial Loop   Cursor (BASE polish + capture mode)
```

Figma is a presentation layer only. Use it after real captures exist to normalize hierarchy, annotation, cropping and export; never use it to manufacture metrics, runtime states or client results.

## Reusable primitives

- `src/core/createRuntime.js` — renderer/camera lifecycle, resize, frame loop, cleanup.
- `src/assets/createGLBLoader.js` — bounded GLB loading wrapper with progress/error handling.
- `src/game/createStateMachine.js` — tiny deterministic finite-state helper for microgames/interactions.
- `src/audio/createAudioReactiveBus.js` — opt-in Web Audio FFT bus for music-reactive experiences.
- `src/animation/createDeterministicTimeline.js` — absolute-time, scrub-safe linear channel sampling for product/industrial motion.

These are intentionally small. Do not grow this into a framework until a paid problem or portfolio proof requires the abstraction.

## Five initial service SKUs

See [`SERVICES.md`](SERVICES.md):

1. Three.js / WebGL Rescue Pass
2. Interactive 3D Product / Asset Viewer
3. Branded Browser Microgame
4. Interactive Music World / Visualizer
5. Procedural WebGL Environment Prototype

## Current prototype status

### Product Motion Lab

**Status:** SOURCE-SEEDED / RUNTIME VERIFY.

Target: prove web-ready product presentation, deterministic scrubbing, attached callouts, inspection mode, and renderer diagnostics. Kimi/custom-asset work should improve this lane rather than create a parallel product viewer.

### Fabric / material proof

**Status:** EXISTING SYSTEMS PRESENT / COMMERCIAL EXTRACTION REQUIRED.

Do not rebuild from scratch. Existing portfolio code already contains fabric presets, PBR material inspection and material-atlas surfaces. The next step is provenance-safe extraction, CLO-to-web evidence, and only the smallest missing consultant/configurator proof.

### Procedural Industrial System Loop

**Status:** SOURCE IMPLEMENTED / RUNTIME VERIFY.

The source now includes a 16-second deterministic mechanical loop, seeded procedural assemblies, illustrative Structural/Flow/Thermal modes, diagnostics, and the reusable deterministic-timeline helper. Read its local `README.md` before adding features.

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

## Stop condition

If an agent discovers itself writing more planning docs than runtime evidence, stop. The commercial lane only advances through one of these outputs:

```text
working demo
measured evidence
original reusable asset
qualified lead
human-approved proposal
paid result
```
