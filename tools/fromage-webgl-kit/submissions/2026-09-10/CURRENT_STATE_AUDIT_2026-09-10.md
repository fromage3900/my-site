# WebGL Submission / Git State Audit — 2026-09-10

**Checked:** 2026-09-10 afternoon (America/Toronto)  
**Purpose:** distinguish canonical source, safely preserved transfer work, and work that is still only local/agent-reported.

## Executive state

Nothing important discovered in this audit appears lost. The remaining problem is **canonicality**, not preservation.

`fromage3900/my-site` remains the authority for the website/WebGL kit. `fromage3900/MelodiaMelusinaV2` remains the authority for the game/capstone and is temporarily carrying Cursor transfer packs because Cursor could not push `my-site`.

The WebGL kit is explicitly allowed by the recruiter-site freeze exception under `tools/fromage-webgl-kit/`; this does not authorize unrelated public-site redesign or new canonical routes.

## Repo health snapshot

### `fromage3900/my-site`

- default branch: `main`
- audited main head: `ef903b6bef1d21e4b846d566ea52d1ba71fba5a4`
- remote branches observed: 12
- open PRs observed: 0
- latest combined commit status endpoint returned no registered statuses; do not describe latest main as CI-certified solely from GitHub status checks.
- `tools/fromage-webgl-kit/` is inside an explicit freeze exception.

### `fromage3900/MelodiaMelusinaV2`

- default branch: `main`
- audited main head: `2f1c3b41b65f8a6236d23fa25bea3deacdbb11ad`
- remote branches observed: 17
- open PRs observed during audit: `#176`, `#175`, `#166`, `#145`, `#144`
- latest combined commit status endpoint returned no registered statuses on the main-head commit.
- `CAPSTONE_NOW.md` remains the owner queue and keeps Choral Sheep visual proof as P0.

## Submission lane A — $10k industrial homepage loop

**Market state:** live at audit time; $10,000 fixed; 20–50 proposals; 0 interviewing; 0 invites.

### Canonical on `my-site/main`

- base procedural industrial prototype;
- deterministic timeline helper;
- evidence/listing/application scaffolding;
- professional-polish handoff doc.

### Safely preserved, but not yet canonical on `my-site`

Cursor's newest/final work is on:

- Melodia branch: `cursor/industrial-final-polish-9850`
- Melodia PR: `#176`
- transfer folder: `Docs/Strategy/webgl-kit-industrial-final-2026-09-10/`

The transfer package contains:

- final `my-site` patch;
- final application draft;
- runtime report;
- embedded evidence media through the patch.

Observed runtime report from the final pass:

- console errors: none recorded;
- canonical seed: 1;
- draw calls: 81;
- triangles: 16,948;
- loop delta: 0;
- deterministic capture URLs present;
- full 16-second BASE MP4 and WebM listed;
- hero, STRUCTURAL, FLOW, THERMAL, seed, and mobile evidence listed.

Headless FPS values are evidence-environment diagnostics, not buyer-facing performance claims.

### Important duplication

PR `#175` is the older monochrome transfer pack. PR `#176` supersedes it for submission purposes.

**Do not apply both patches.**

### Next single action

Apply the final PR `#176` transfer patch to `my-site`, perform one normal local-browser sanity check, commit/push the resulting WebGL-kit source to `my-site`, then human-review and submit.

After canonicalization, close/supersede `#175` rather than merging both transfer histories.

## Submission lane B — Three.js fabric technical-art consultant

**Market state:** live at audit time; $30–$300/hr; fewer than 5 proposals; 0 interviewing.

### Canonical on `my-site/main`

`tools/fromage-webgl-kit/fabric/` contains:

- `FABRIC_CONSULTANT_EVIDENCE.md`;
- `CLO_TO_WEB_PIPELINE.md`;
- `APPLICATION_DRAFT_AFTER_QA.md`.

The existing portfolio code also contains the material/fabric viewer architecture being used as source evidence.

### Not yet present remotely

The later requested deliverables are not currently found on `my-site/main`:

- `FABRIC_RUNTIME_QA.md`;
- `FABRIC_SUBMISSION_ASSET_CHECKLIST.md`;
- `CURSOR_EXTRACTION_REPORT.md`;
- completed provenance manifest;
- final owned CLO/Blender evidence artifact.

Do not claim these as completed merely because prompts exist.

### Next single action

Runtime-check the existing viewer, classify material/texture provenance, select one genuine owner CLO/Blender artifact, choose explainable evidence links, then submit. A full knitwear configurator is not required for this consulting listing.

## Submission lane C — $3k web-ready product / GLB animation

**Market state:** live at audit time; $3,000 fixed; 20–50 proposals; 0 interviewing; client last viewed recently.

### Canonical on `my-site/main`

`tools/fromage-webgl-kit/prototypes/product-motion-lab/` currently contains only:

- `index.html`;
- `app.js`;
- `EVIDENCE.md`.

### Agent-reported but not remotely visible

Kimi reported that the handheld generator, validator, runtime wiring, and syntax verification are structurally ready.

No current `my-site/main` file or new remote Kimi/handheld branch was found containing that work during this audit.

Treat it as **local workspace state**, not Git truth, until pushed.

### Next single action

Push/merge Kimi's source first. Then run the Blender generation, Brennan visual pass, validator/export, GLB browser load, scrub/anchor QA, and measured capture pass before applying.

## Other Melodia work

### PR #166 — laptop studio integration

Safely preserved and mergeable. The PR body reports a clean one-commit integration and Echo Static Gates PASS after removing the obsolete `.assbin` ancestry from the integration range. It is not a blocker for today's applications.

### PR #145 — Resonance Astrolabe R0

Safely preserved. Source-built silhouette milestone exists, but owner hand-scale and gameplay-camera evidence remain the promotion gate. Do not call it live-proven yet.

### PR #144 — Issue #51 save idempotency

Safely preserved and mergeable. Implementation/ownership decisions exist, but full editor restart and packaged-build evidence remain required before merge.

### Choral Sheep P0

Still canonical on `main`. `CAPSTONE_NOW.md` remains clear that the revenue lane is sidecar work and must not displace the Sheep visual proof.

## Artifact safety

The binary `.xlsx` application tracker produced in chat is not stored in Git by the GitHub text connector. A CSV snapshot is stored beside this audit so the submission state is still reproducible from the repository.

Use the downloadable `.xlsx` for interactive tracking; use the repo CSV/this audit for durable Git truth.

## Decision summary

```text
INDUSTRIAL: SAFE ON GITHUB / NOT YET CANONICAL IN MY-SITE / FIRST SEND
FABRIC:     DOCS CANONICAL / RUNTIME + PROVENANCE + OWNER PROOF NEEDED / SECOND SEND
PRODUCT:    LAB CANONICAL / KIMI BUILD NOT REMOTELY VISIBLE / THIRD SEND
CAPSTONE:   CANONICAL / CHORAL SHEEP REMAINS P0
```

## Do not reopen

- no broad branch cleanup today;
- no new fourth commercial prototype;
- no public-site redesign;
- no merge of both industrial transfer PRs;
- no promotion of local/agent-reported work to `RUNTIME VERIFIED` without evidence;
- no displacement of Choral Sheep P0 after submission work is finished.
