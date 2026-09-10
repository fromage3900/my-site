# Canonical Submission State — 2026-09-10

This file is the final repo-side handoff for today's three Upwork application lanes. It exists to prevent another round of Git archaeology.

## Source of truth

- Website/WebGL kit: `fromage3900/my-site` → `main`.
- Machine-readable state: `submission-manifest.json`.
- Human tracker: `APPLICATION_TRACKER_SNAPSHOT.csv`.
- Detailed audit: `CURRENT_STATE_AUDIT_2026-09-10.md`.
- Recruiter-site freeze remains enforced; commercial experiments stay under `tools/fromage-webgl-kit/` unless explicitly promoted.

## $10k procedural industrial homepage loop

**Repository state: complete and canonical.** Final industrial source, proposal, evidence documentation and the capture-archive receipt are on `my-site/main`.

Canonical files include:
- `../../prototypes/procedural-industrial-loop/app.js`;
- `../../prototypes/procedural-industrial-loop/index.html`;
- `../../prototypes/procedural-industrial-loop/APPLICATION_DRAFT_AFTER_QA.md`;
- `../../prototypes/procedural-industrial-loop/EVIDENCE.md`;
- `../../prototypes/procedural-industrial-loop/LISTING_10000_EVIDENCE.md`;
- `../../prototypes/procedural-industrial-loop/INDUSTRIAL_CAPTURE_ARCHIVE_RECEIPT.json`.

Cursor's Melodia PR #176 is **closed without merge** and retained only as the immutable transfer/capture archive. PR #175 is also closed and superseded. Neither should be re-applied over current website source.

The generated PNG/MP4/WebM evidence bundle remains in the closed capture archive by design rather than being duplicated into the source repo. Main contains the archive pointer, exact filename inventory, observed values and buyer-facing claim rules, so this is an explicit storage policy rather than an undocumented dependency.

Only remaining gates are outside Git: one normal-browser sanity check of current main, open/check the five final attachments, recheck the live listing, human review, submit.

## Three.js fabric technical-art consultant

**Repository state: documentation, QA and provenance gates canonical.** No further Git architecture is required.

Canonical files include:
- `../../fabric/FABRIC_CONSULTANT_EVIDENCE.md`;
- `../../fabric/CLO_TO_WEB_PIPELINE.md`;
- `../../fabric/APPLICATION_DRAFT_AFTER_QA.md`;
- `../../fabric/FABRIC_RUNTIME_QA.md`;
- `../../fabric/FABRIC_SUBMISSION_ASSET_CHECKLIST.md`;
- `../../fabric/MATERIAL_PROVENANCE_MANIFEST.json`.

The provenance manifest deliberately keeps unclear resources `UNKNOWN` and non-reusable until exact source/license evidence exists. `Melusina Shirt Silk` remains `MELODIA_SPECIFIC` and is not a generic commercial-kit resource.

Remaining work is evidence execution, not repo planning: runtime-check the viewer, finish provenance classification, select one genuine Brennan-owned CLO or Blender artifact, choose concise links, recheck listing, submit.

A full knitwear configurator is not required for the consulting listing.

## $3k web-ready product animation / GLB

**Repository state: source pipeline and continuation handoff canonical; runtime proof intentionally incomplete.** Canonical source is:

- `../../scripts/build_auriga_meter.py`;
- `../../scripts/check_auriga_meter.py`;
- `../../prototypes/product-motion-lab/src/auriga-meter.js`;
- `../../prototypes/product-motion-lab/package.json`;
- Product Motion Lab `index.html`, `app.js`, `EVIDENCE.md`;
- `../../prototypes/product-motion-lab/PRODUCT_RUNTIME_HANDOFF.md`.

The earlier Kimi-workspace dependency is eliminated. Do not search for or wait on an unpushed Kimi version.

Only remaining gates are execution/evidence: run Blender builder → visual review → run GLB checker → browser-load generated GLB → verify deterministic 0→1→0 scrub and three anchors → capture desktop/mobile + real diagnostics → recheck listing → human submit.

## Stop conditions

Do not create a fourth prototype, reopen broad branch cleanup, redesign the public recruiter site, apply old industrial transfer patches over current main, or mark runtime/evidence gates complete without observed proof.

After today's applications, return to the capstone source of truth; Choral Sheep remains P0.

## Final interpretation

`main` now owns every source file, checklist, manifest and handoff required to continue these three lanes. The remaining work is intentionally physical/runtime/human evidence work. An unfinished runtime gate is not a Git loose end and must not be disguised as one.