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

## Current strike state — refreshed 2026-09-11

The active paid-problem experiment is documented in:

- `DIRECT_LISTING_STRIKES_2026-09-10.md` — listing-specific execution briefs;
- `CUSTOM_ASSET_STRIKE_PACK_2026-09-10.md` — original asset proofs that improve proposal credibility;
- `LEADS_2026-09-10.md` — scored live-market batch;
- `FINISH_LATER_2026-09-10.md` — bounded continuation queue;
- `submissions/2026-09-10/` — canonical submission/evidence state for the three current strikes.

The three current strikes remain the only active prototype lanes:

```text
A. Product Motion Lab / GLB
B. Fabric / material consultant proof
C. Procedural Industrial System Loop
```

Do not invent a fourth prototype merely because a new listing category appears. New opportunities should first be attacked by **reusing these proofs and the existing service SKUs**.

## Current interpretation

### Industrial Loop

The prototype is reusable, measured buyer-shaped proof whether or not the original high-value listing is submitted. It demonstrates deterministic browser animation, seeded procedural assembly, capture discipline and technical presentation.

**Owner comfort is a hard gate.** A high-dollar listing is not automatically a good strike. If buyer expectations, claim scope or delivery risk feel unclear, mark the listing **WATCH**, clarify, or decline it. Do not let sunk prototype effort pressure the owner into a commitment.

Do not claim that the current Structural / Flow / Thermal modes are physical simulation fields. They are component-coding presentation modes unless and until real supplied data is mapped.

### Fabric / material proof

The current viewer/debug work supports a strong technical-art/rescue narrative: asset-path repair, packed-ORM channel inspection, texture/provenance QA, measured geometry and browser-safe asset correction. This proof can support fabric consulting, product/configurator work and WebGL rescue without another demo.

### Product Motion Lab

The Auriga GLB exists and is wired into the browser path. Remaining value comes from runtime verification, deterministic scrub/anchor checks, measured diagnostics and captures — not new feature growth.

## Submission package

Submission authority for the current batch lives under `submissions/2026-09-10/`:

- `CANONICAL_SUBMISSION_STATE_2026-09-10.md` — human handoff;
- `submission-manifest.json` — machine-readable lane ownership, blockers and ready-to-submit requirements;
- `CURRENT_STATE_AUDIT_2026-09-10.md` — detailed audit;
- `APPLICATION_TRACKER_SNAPSHOT.csv` — tracker mirror;
- lane-specific evidence/checklist files.

If a runtime/capture agent finishes work, update the relevant evidence state before adding features. Figma is a presentation layer only: use it after real captures exist to improve hierarchy, annotation and cropping, never to manufacture metrics, runtime states or client results.

## Reusable primitives

- `src/core/createRuntime.js` — renderer/camera lifecycle, resize, frame loop, cleanup.
- `src/assets/createGLBLoader.js` — bounded GLB loading wrapper with progress/error handling.
- `src/game/createStateMachine.js` — tiny deterministic finite-state helper for microgames/interactions.
- `src/audio/createAudioReactiveBus.js` — opt-in Web Audio FFT bus for music-reactive experiences.
- `src/animation/createDeterministicTimeline.js` — absolute-time, scrub-safe linear channel sampling for product/industrial motion.

These are intentionally small. Do not grow this into a framework until a paid problem or portfolio proof requires the abstraction.

## Six service SKUs

See [`SERVICES.md`](SERVICES.md):

1. Three.js / WebGL Rescue Pass
2. Interactive 3D Product / Asset Viewer
3. Branded Browser Microgame
4. Interactive Music World / Visualizer
5. Procedural WebGL Environment Prototype
6. Interactive 3D Product Configurator / Variant System

The same proof stack can also be used to pursue **creative-agency 3D integration**, **bounded industrial/technical visualization**, and **paid WebGL audits/feasibility consulting**. Those are proposal/search categories, not new prototype lanes.

## Current commercial order

```text
1. Decide SEND / WATCH / DECLINE on the Industrial strike after owner comfort + claim review
2. Close Fabric evidence/provenance/application gates
3. Close Product Motion browser runtime + captures
4. Search configurator / rescue / product-viewer / agency-integration / bounded visualization listings
5. Reuse existing proof; only build a missing proof when a qualified lead exposes a real gap
```

The first paid result matters more than maximizing application count.

## First revenue gate

See [`FIRST_20.md`](FIRST_20.md) and [`TREASURY_LEDGER.json`](TREASURY_LEDGER.json).

The goal is not "launch a startup." The goal is to prove that one existing capability can earn the first **$20 of EARNED_POOL inference budget** with minimal distraction.

## IP boundary

Never package Melodia-specific characters, textures, music, purchased templates, third-party material graphs, client assets, or other restricted content as generic kit inventory.

Commercial reusable code/assets must be clean-room or clearly owned/licensed for that purpose.

## Existing proof worth mining, not blindly copying

The live portfolio / kit already contains:

- GLB/OBJ/FBX loading and asset manifests;
- PBR/material inspection and ORM-channel debugging;
- orbiting 3D viewers and product presentation;
- deterministic timeline animation;
- renderer diagnostics and measured asset QA;
- post-processing/bloom experiments;
- interactive Three.js scenes and microgame logic;
- Web Audio and music-reactive experiments;
- seeded procedural/industrial presentation.

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

Also stop or downgrade a strike when:

- it begins displacing capstone P0;
- the buyer's scope is materially broader than the proof supports;
- a high price is creating pressure to overclaim capability;
- delivery would require unrelated backend/full-stack ownership;
- legal/IP provenance is unclear;
- the owner is not comfortable making the commitment after reviewing the actual listing.
