# Website Repository Boundary

**Canonical:** `fromage3900/my-site`

**Current website pipeline:** `docs/CANONICAL_WEBSITE_PIPELINE_2026-09-08.md`  
**Branch decisions:** `docs/BRANCH_CANONIZATION_2026-09-08.md`

This repository owns:
- public portfolio pages;
- Three.js / browser presentation;
- recruiter/editorial copy;
- site assets and deployment.

It does **not** own:
- Unreal/runtime/game state;
- capstone gameplay contracts;
- TouchDesigner project files;
- canonical music/gameplay semantics.

Use:
- game/runtime/capstone → `fromage3900/MelodiaMelusinaV2`
- TouchDesigner/AE → separate `MelodiaTouchDesigner` Git
- root `fromage3900/EnvironmentPortfolio` Git repo → deprecated archive only

The local filesystem folder `C:/EnvironmentPortfolio/` may remain a valid workspace container for independent nested repositories.

`C:/EnvironmentPortfolio/...` paths may be valid live local paths. The deprecated object is the **root umbrella Git repository**, not the workspace folder.

**One domain, one repo, one authority.**
