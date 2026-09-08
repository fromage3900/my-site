# Canonical Website Pipeline — 2026-09-08

**Status:** CANONICAL WEBSITE FRONT DOOR  
**Repository:** `fromage3900/my-site`

## 1. Authority boundary

This repository owns:
- recruiter-facing portfolio pages;
- Three.js / browser experiments;
- site design tokens, typography, navigation, and editorial copy;
- generated web manifests and approved presentation assets;
- GitHub Pages deployment;
- Wix shell/embed integration for the custom domain.

It does **not** own:
- Unreal gameplay/runtime truth;
- game/capstone state;
- TouchDesigner live-show state;
- canonical musical/gameplay semantics.

Upstream authorities:
- game/runtime/capstone → `fromage3900/MelodiaMelusinaV2`;
- TouchDesigner/AE → `fromage3900/MelodiaTouchDesigner`.

## 2. Public delivery architecture

```text
my-site/main
  ↓
site validation / manifest checks
  ↓
GitHub Actions Pages workflow
  ↓
GitHub Pages: fromage3900.github.io/my-site
  ↓
Wix Studio shell / custom domain
  ↓
https://www.fromageart.xyz/
```

The Wix custom domain is the stable public shell around the GitHub Pages portfolio.

Current embedded-entry contract:
- stable Wix iframe source: `wix/application-hub.html`;
- external iframe first-contact bootstrap redirects to the art-first `wix/index.html`;
- direct GitHub Pages routes retain their own metadata and remain usable independently.

## 3. Authoring / publishing flow

```text
approved upstream render / proof
  ↓
curated site asset + factual copy
  ↓
generated manifest / route update when required
  ↓
npm run verify:all
  ↓
deployment / asset validation
  ↓
commit to my-site/main
  ↓
GitHub Pages
  ↓
Wix shell / fromageart.xyz
```

Primary validation hooks already in the repo include:
- `npm run lint:tokens`;
- `python tools/_verify_site_facts.py`;
- `python tools/validate_assets.py`;
- `npm run verify:manifest`;
- `tools/validate_portfolio.ps1` where the broader package check is needed.

Do not bypass validation simply because a page looks correct locally.

## 4. Content intake rule

The website consumes **approved downstream evidence**.

Preferred handoff:
1. game / DCC / TD lane produces a real render, capture, or verified breakdown;
2. the source lane records its own evidence and commit provenance;
3. the website receives only the curated presentation artifact and factual summary;
4. site manifests/routes are updated;
5. the page is validated and promoted on `main`.

Website copy never creates runtime evidence.

## 5. Three.js / browser renderer rule

Three.js pages are authored presentation studies, not substitutes for Unreal proof.

Use browser rendering where it is the best medium for:
- interactive atmosphere;
- model inspection;
- procedural visual studies;
- constellation / cursor / musical interaction;
- recruiter-facing technical-art experiments.

Do not use a browser prototype to claim:
- a UE gameplay feature is implemented;
- a TD show scene is live;
- a game asset is production-ready.

Current canonical Living Worlds and atmosphere files are already on `main`; stale September 2 feature branches are superseded.

## 6. Recruiter soft freeze

The 2026-09-07 sendoff soft freeze remains active unless explicitly lifted.

Allowed:
- approved render promotion;
- factual corrections;
- contact/accessibility fixes;
- social-preview correctness;
- critical deployment fixes;
- bounded updates to already-approved case-study pages.

Frozen by default:
- new public route sprawl;
- major navigation changes;
- new design systems;
- broad typography/theme rewrites;
- experimental effects that destabilize recruiter-facing pages.

Experience-lab experiments may remain available without becoming primary recruiter routes.

## 7. Git rule

`main` is the only canonical website state.

A branch is not current site truth. Before reviving a branch:
1. compare it to `main`;
2. verify the relevant files are not already present in newer form;
3. extract only genuinely unique work;
4. never merge an old visual experiment wholesale just to reduce branch count.

The September 8 cleanup normalized the old atmosphere, Living Worlds, validation, repository-authority, and sendoff refs to current `main` after confirming their useful work was already represented.

## 8. Cross-repo handoff

```text
MelodiaMelusinaV2/main
   authoritative game/art/runtime evidence
        ↓
MelodiaTouchDesigner/main
   performance / TD / AE evidence where relevant
        ↓
my-site/main
   curated recruiter-facing publication
```

Direction of truth is downstream. The website summarizes and presents; it does not redefine upstream state.

## 9. Canonical public entry points

- public domain: `https://www.fromageart.xyz/`;
- GitHub Pages portfolio root: `https://fromage3900.github.io/my-site/wix/`;
- art-first page: `wix/index.html`;
- application/architecture hub: `wix/application-hub.html`;
- Selected Art: `wix/curated-art.html`;
- Living Worlds: `wix/melodia-living-worlds.html`;
- Resume: `wix/resume.html`.

**One website repo, one production branch, one public pipeline.**
