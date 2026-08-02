# Next Actions - Universal Environment Platform

## Current Priority

Build the generic material/look-dev spine without touching `L_SakuraPath`.

## Recently Completed

- Done: Melodia portfolio components deployed - 7 animated components copied into `my-site/melodia-design-system/wix/`.
- Done: Professional editorial index page created - full portfolio layout in `wix/index.html`.
- Done: Deployment manifest updated - v2.0 with component URL inventory.
- Done: Committed to my-site main - commit `3b420dc` (push still requires GitHub connectivity).
- Done: Package-to-website handoff adapter added - `Content/Python/package_to_website_handoff.py` converts `Saved/Portfolio/portfolio_package.json` into `_github_deploy/generated/*_config.json`.
- Done: Material manifest/package refreshed - `material_family_manifest_full.py` handles UTF-8 BOM instance modules; latest package has 30 materials and zero aggregation warnings.

## Queue

1. Push to GitHub when connectivity and approval are available.
   - Current note from prior agents: local website work is ahead of `origin/main`.
   - Do not publish externally without explicit approval.

2. Produce generic look-dev capture pass.
   - Target: `L_Template`, not Sakura.
   - Capture: showcase material grid, landscape slab, water plane, trimsheet panel.

3. Validate Unreal material-system repairs from Kiro.
   - Check universal A/B/C layer combinations compile and behave.
   - Check Nikki landscape scale/normal behavior if `setup_landscape_height_blend.py` is rebuilt.
   - Check water parameter groups after `setup_master_water.py` changes.

4. Decide whether `my-site-clean/` should replace or supplement `_github_deploy/`.
   - `my-site-clean/` is currently an untracked clean clone with generated design-system/technical files.
   - `_github_deploy/` is the active deploy lane used by the Unreal package adapter.

## Completed Pipeline Commands

1. Generate material family manifest.
   - Command: `python Content/Python/material_family_manifest_full.py`
   - Output: `Saved/Portfolio/Materials/material_family_manifest.json`
   - Output: `Saved/Portfolio/MaterialPreviews/previews_manifest.json`
   - Latest result: 30 materials (`Showcase`: 11, `Zen`: 15, `Baroque`: 4)

2. Aggregate portfolio package.
   - Command: `python Content/Python/portfolio_aggregator.py`
   - Output: `Saved/Portfolio/portfolio_package.json`
   - Latest result: `sections_ok=True`, warnings `0`

3. Build package-to-website handoff.
   - Command: `python Content/Python/package_to_website_handoff.py`
   - Input: `Saved/Portfolio/portfolio_package.json`
   - Output: `_github_deploy/generated/hero_config.json`
   - Output: `_github_deploy/generated/passport_config.json`
   - Output: `_github_deploy/generated/portfolio_package_config.json`
   - Output: `_github_deploy/generated/materials_config.json`
   - Output: `_github_deploy/generated/renders_config.json`
   - Output: `_github_deploy/generated/stats_config.json`

4. Add agent memory docs.
   - `Docs/AgentMemory/Decisions.md`
   - `Docs/AgentMemory/RejectedIdeas.md`
   - `Docs/AgentMemory/MaterialStandards.md`

## Portfolio Deployment Status

| Component | Location | Status |
|-----------|----------|--------|
| Portfolio index | `wix/index.html` | Committed locally |
| Cosmic hero | `wix/melodia-hero-cosmic.html` | Committed locally |
| Navigation | `wix/melodia-navigation-constellation.html` | Committed locally |
| Project cards | `wix/melodia-project-card.html` | Committed locally |
| Gallery grid | `wix/melodia-gallery-grid.html` | Committed locally |
| Breakdown cards | `wix/melodia-breakdown-card.html` | Committed locally |
| Section headers | `wix/melodia-section-header.html` | Committed locally |
| Smooth scroll | `wix/melodia-smooth-scroll.html` | Committed locally |
| Hero embed | `wix/melodia-hero-embed.html` | Committed locally |
| Passport embed | `wix/melodia-passport-embed.html` | Committed locally |
| Deployment manifest | `generated/deployment_manifest.json` | Updated locally |
| Package handoff configs | `_github_deploy/generated/*_config.json` | Generated locally |
| Push to GitHub | `origin/main` | Requires connectivity and approval |

## Red-Line Constraints

- Do not edit Sakura level content.
- Do not delete legacy material assets.
- Do not rewrite master material families.
- Do not publish externally without explicit approval.
