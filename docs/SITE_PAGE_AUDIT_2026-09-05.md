# Site Page Audit — 2026-09-05

## Purpose

Deep route and page-maturity review for the public portfolio in `wix/`.
The folder intentionally contains more than the public website: canonical pages,
secondary case studies, recruiter-targeted evidence, internal dashboards, experiments,
and reusable HTML components. The problem was not simply "too many files"; it was that
their maturity and audience boundaries were not explicit enough.

## High-confidence findings

### 1. Canonical public surface — healthy

The current canonical visitor routes are:

- `index.html`
- `curated-art.html`
- `world-bible.html`
- `melodia-living-worlds.html`
- `resume.html`
- `hero-renders.html`
- `zbrush-breakdown.html`
- `shader-breakdowns.html`
- `cosmic-orrery.html`
- `application-hub.html`
- `pipeline.html`

These are protected by the shared build contract in `public-routes.json` and
`tools/validate_portfolio.ps1`.

### 2. Genuine leaked stubs — retired

Two root-level pages were real unfinished stubs:

- `asset-scouting.html` — only "In Progress" copy
- `social-kit.html` — only "In Progress" copy

Both already had historical/deprecated counterparts under `wix/_deprecated/`, which
confirmed that the root versions were not meaningful portfolio destinations.

Actions:
- `asset-scouting.html` now redirects to `art-test-readiness.html`
- `social-kit.html` now redirects to `curated-art.html`
- both are `noindex`
- incoming public links were removed/repointed

`capture-brief.html` was already correctly retired to `world-bible.html`.

### 3. Worth keeping, but secondary

These pages contain substantive portfolio material and should not be deleted, but they
should stay below the canonical hierarchy:

- art-test-readiness
- baroque-grotto
- commissions
- credits
- design-specs
- geometry-nodes
- hiring-dossier
- material-loop-gallery
- melodia-atelier-lab
- melodia-gameplay-loop
- melodia-melusina
- melodia-stage-character
- ornament-kitbash
- pcg-system-impact
- realtime-3d-viewer
- recruiter-one-sheet
- render-constellation
- sakura-case-study
- sdf-material-gallery
- space-cathedral
- surreal-architecture
- touchdesigner-architecture
- universal-material-impact

These are now explicitly classified as `public_supporting`.

### 4. Targeted evidence — useful, but not general portfolio navigation

- `melusina-model-tooling.html`
- `nous-research-packet.html`
- `nvidia-recruiter-sendoff.html`

These contain detailed dated model/tooling evidence and recruiter-specific claims.
They are useful for direct outreach but too specialized and time-sensitive to define
the main site.

### 5. Internal operational pages

The following are dashboards or project-health surfaces, not portfolio destinations:

- `dashboards.html`
- `project_health.html`
- `agent-dashboard-t3d.html`
- `metrics_dashboard.html`
- `loop_monitor.html`
- `live_dashboard.html`
- `t3d-catalog.html`
- `production-roadmap.html`

They should remain accessible for diagnostics but should not be promoted as visitor
navigation or treated as art pages.

### 6. Reusable component/example pages

These are implementation surfaces, not standalone destinations:

- `melodia-hero-embed.html`
- `melodia-passport-embed.html`
- `melodia-project-card.html`
- `melodia-breakdown-card.html`
- `melodia-gallery-grid.html`
- `melodia-section-header.html`
- `melodia-smooth-scroll.html`
- `melodia-navigation-constellation.html`
- `melodia-rhythm-hero.html`

Several intentionally contain only a few visible words or placeholder component data.
That is acceptable for a component harness, but they should not be confused with pages
that need editorial completion.

## Concrete cleanup issues found

### Surreal Architecture
- duplicated `melodia-starfield.js` load
- duplicated `melodia-magical-girl.js` load
- linked to the leaked `social-kit.html` stub
- lacked the shared build marker

Fixed in the current pass.

### Art Test Readiness
- old Infold-specific public metadata/footer language
- hard-coded nav instead of shared navigation behavior
- linked directly to the leaked `asset-scouting.html` stub
- lacked the shared build marker/cache token

Fixed in the current pass.

### Material Loop Gallery
The page is visually useful, but its copy is still production-command-first:
"run Tools\\publish_material_loops.ps1 and walk away." It should be rewritten to
lead with the visual/material result, with pipeline commands moved to a disclosure or
technical note.

### Universal Material Impact
The concept is good, but the public page still reads like a capture checklist:
"These slots correspond to the filenames already listed in the capture brief."
This should become a finished before/after material case study once the missing plates
exist; until then it belongs below the primary portfolio hierarchy.

### Melusina Model Tooling
Not a stub. It is dense and evidence-rich, but it is dated and overly operational for
general visitors. Keep for targeted technical/research links, not broad navigation.

### T3D Catalog / dashboards
Not stubs. They are generated diagnostic artifacts. Their raw counts, stock/migrated
states, and dated drift data are valuable internally but visually inappropriate as
general portfolio pages.

## Next cleanup tier

1. Add `noindex` consistently to internal dashboards and component/example pages.
2. Add CI enforcement for the `internal_not_navigation`, `component_examples`, and
   `retired_redirects` classifications.
3. Synchronize the most important `public_supporting` pages to the current build token,
   starting with recruiter-one-sheet, melodia-stage-character, sakura-case-study,
   space-cathedral, geometry-nodes, credits, and commissions.
4. Rewrite Material Loop Gallery and Universal Material Impact from "capture/task"
   language into finished visual case-study language.
5. Review recruiter-targeted pages for dated claims before any external send.
6. Keep experiments such as `mahou-particle-garden.html` visually autonomous; do not
   force full portfolio chrome onto intentional web-lab experiences.

## Principle

A file being in `wix/` does not mean it is a public portfolio destination.
Canonical pages should be polished and synchronized; supporting pages should be
intentional; internal dashboards should be clearly internal; component harnesses should
stay out of search/navigation; retired routes should redirect cleanly.


## Completed follow-up — reviewer-facing secondary pages

The first cleanup tier is now substantially complete.

### Reworked as finished case studies

- `pcg-system-impact.html` now opens as a Fallen Moon procedural-world case study rather than a raw scatter survey. The 605 live instances, density maps, Infinite Nave plan/section, and remaining Mandala elevation exception are preserved as evidence; visitor copy leads with composition and traversal.
- `material-loop-gallery.html` now presents only finished captured loops. Pending catalog entries no longer render as public "Awaiting capture" cards. The batch command and manifest moved into an optional pipeline disclosure.
- `universal-material-impact.html` no longer contains filenames or "what to capture next" TODOs. It now explains the shared material spine and world-level variation, with technical configuration available as an optional deep dive.

### Reviewer path synchronized

The following supporting pages now declare build `20260904p1` and cache-bust the current shared CSS/JS:

- recruiter-one-sheet
- hiring-dossier
- melodia-stage-character
- sakura-case-study
- space-cathedral
- baroque-grotto
- geometry-nodes
- credits
- commissions
- art-test-readiness
- surreal-architecture
- PCG System Impact
- Material Loop Gallery
- Universal Material Impact

General recruiter/portfolio metadata no longer defines the work through Infold / Infinity Nikki. Company-specific language remains appropriate only on explicitly targeted campaign/sendoff evidence.

### New CI boundary

`public-routes.json` now contains `reviewer_priority_supporting`. Portfolio validation requires those routes to carry the same build marker and shared luxury type / editorial CSS / site nav / editorial JS stack as the canonical visitor routes.


## Completed follow-up — technical-art lab tier

The next reviewer-reachable technical pages are now synchronized to build `20260904p1`.

### SDF Material Gallery

- reframed from a dated NightShift capture catalog into a controlled material-family atlas
- removed "Nikki hero" and recruiter-scan language from visitor-facing copy
- replaced intake/manifest-heavy navigation with portfolio destinations
- preserved the static sphere evidence and link to animated material motion studies
- added the shared site navigation runtime and current build token

### Render Constellation

- reframed from an Unreal intake/dashboard page into a visual production-evidence map
- removed visible "next capture needs" / rerun-command framing from the reviewer path
- replaced stale loading/question-mark copy with deliberate editorial language
- replaced raw JSON navigation with Home / Worlds / Renders / Shaders / Architecture Hub
- preserved package statistics, PCG evidence, material-family mapping, and render-card hydration
- added the shared site navigation runtime and current build token

### Real-Time 3D Viewer

- removed "Infinity Nikki-grade" positioning
- simplified the navigation to the current portfolio hierarchy
- reframed the page as a real-time material and asset inspection studio
- preserved orbit, topology, channel-isolation, fabric, shading, and asset controls
- added shared site-nav/editorial runtime and the current build token

### Melodia Atelier Lab

- removed AI-research and studio-target links from the primary lab navigation
- replaced the "Nikki Silk & Pearl" public preset label with "Dream Silk & Pearl"
- removed the closing Papergames / Infold / HoYoverse dossier pitch
- reframed the footer callout around the broader technical-art portfolio
- preserved the shader, atmosphere, PCG, resonance, and turntable experiments
- added the current build token and shared navigation behavior

These four pages are now included in `reviewer_priority_supporting`, so CI will enforce the same build marker and shared type/nav/editorial stack on them going forward.
