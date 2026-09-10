# Canonical Submission State — 2026-09-10

This file is the final repo-side handoff for today's three Upwork application lanes. It exists to prevent another round of Git archaeology.

## Source of truth

- Website/WebGL kit: `fromage3900/my-site` → `main`.
- Machine-readable state: `submission-manifest.json`.
- Human tracker: `APPLICATION_TRACKER_SNAPSHOT.csv`.
- Detailed audit: `CURRENT_STATE_AUDIT_2026-09-10.md`.
- Recruiter-site freeze remains enforced; commercial experiments stay under `tools/fromage-webgl-kit/` unless explicitly promoted.

## 1. $10k procedural industrial homepage loop

**Repository state:** complete and canonical.

The final source, proposal and evidence documentation are on `my-site/main`. Cursor's PR #176 in `MelodiaMelusinaV2` is an audit/capture archive only and is not a source dependency.

**Only remaining gates:** one normal-browser sanity check of current main, open/check the five final attachments, recheck the live listing, human review, submit.

## 2. Three.js fabric technical-art consultant

**Repository state:** documentation/evidence lane canonical.

No further Git architecture is required. The remaining work is evidence selection: runtime-check the viewer, classify texture/material provenance, select one genuine Brennan-owned CLO or Blender artifact, choose concise links, recheck listing, submit.

## 3. $3k web-ready product animation / GLB

**Repository state:** source pipeline canonical; runtime proof intentionally incomplete.

Canonical source:

- `../../scripts/build_auriga_meter.py`
- `../../scripts/check_auriga_meter.py`
- `../../prototypes/product-motion-lab/src/auriga-meter.js`
- `../../prototypes/product-motion-lab/package.json`
- Product Motion Lab `index.html`, `app.js`, `EVIDENCE.md`

The earlier Kimi-workspace dependency is eliminated. Do not search for or wait on an unpushed Kimi version.

**Only remaining gates:** run Blender builder → visual review → run GLB checker → browser-load generated GLB → verify deterministic 0→1→0 scrub and three anchors → capture desktop/mobile + real diagnostics → recheck listing → human submit.

## Stop conditions

Do not create a fourth prototype, reopen broad branch cleanup, redesign the public recruiter site, apply old industrial transfer patches over current main, or mark runtime/evidence gates complete without observed proof.

After today's applications, return to the capstone source of truth; Choral Sheep remains P0.
