# wix/ route map

This directory is not one flat public site. It contains the live portfolio, case studies,
technical/internal pages, and reusable HTML components.

## Canonical visitor routes

These are the pages expected to share one current typography/navigation/editorial build:

- index.html
- curated-art.html
- world-bible.html
- melodia-living-worlds.html
- hero-renders.html
- zbrush-breakdown.html
- shader-breakdowns.html
- pipeline.html

The current shared build is **20260921p1**. Canonical pages carry
`<meta name="melodia-build" content="20260921p1">` and cache-bust local CSS/JS with the
same version.

## Bryce meeting — pearl/lilac editorial convergence (November 12)

`melodia-lilac-editorial.css` is loaded **after** legacy hardening CSS on the art-first
homepage, Selected Art, and World Bible. It intentionally overrides those three public
surfaces only, and preserves the browser labs' independent visual identity.

The colour relationships are taken from original gouache and digital pieces in the
artist's archive: blue/cyan oceans, fuchsia-violet horizons, lilac light and pearl
watercolour paper. Original painting images are not yet committed into the public
repo; the unpublished `_drafts/works-on-paper.html.txt` remains blocked on source assets.

The lighter folio and typography integrate the relevant art-direction intent of
open PRs #92 and #93 into PR #97, without merging unrelated branches or deleting them.

## Recruiter-first route policy (November 2026)

- Home has four main destinations: Selected Work, Environments, Technical Art, About.
- Faraway Mother is the featured environment case study, indexed in the sitemap.
- `melodia-living-worlds.html` is the sole optional browser study in shared navigation.
- `cosmic-orrery.html`, `application-hub.html`, `render-constellation.html`,
  `realtime-3d-viewer.html`, and `melodia-atelier-lab.html` are noindex and
  out of public navigation. Their source files and direct URLs remain available.
- `mahou-particle-garden.html` and `constellation-brush.html` stay unindexed labs.
- Root Three.js entry toy is removed, recoverable through Git history.
- Published Wix mobile behavior must be checked on a real browser before merging.

## Standalone résumé (still public and top-level in navigation)

- resume.html — current November 12 pearl-editorial résumé from main; intentionally self-contained and not bound to the legacy `melodia-build` stack.

## Secondary public case studies

- sakura-case-study.html
- space-cathedral.html
- pcg-system-impact.html
- melodia-stage-character.html

## Internal / operational pages

Dashboards, health pages, readiness pages, production-roadmap pages, and generated
technical views are intentionally not part of the main visual/navigation contract.

## Component / embed examples

Files named `melodia-*-embed.html`, component cards, and standalone demos are reusable
surfaces rather than separate portfolio destinations.

## Wix

The custom domain is a Wix Studio shell around the GitHub Pages portfolio.

### Desktop

As of 2026-09-04, the published Wix site has an enabled BODY_END custom embed:

- **Name:** `Melodia Desktop Portfolio Frame`
- **ID:** `f9bb4701-21e2-41b2-a88b-9016bf5abb51`
- **Breakpoint:** `min-width: 1081px`
- **Source:** `index.html?embed=wix&v=20260921p1`

On the Wix home route at desktop widths, this mounts the portfolio as a fixed,
borderless `100vw × 100dvh` iframe and locks the underlying Wix page scroll. This
bypasses the manually sized editor HTML element that previously caused letterboxing,
gutter drift, and awkward desktop framing.

### Mobile / tablet

Below 1081px, the custom desktop overlay unmounts and the existing Wix layout remains
active.

`wix-embed-bridge.js` marks iframe mode and reports document/viewport measurements to
the parent. The older `application-hub.html` bootstrap remains for compatibility, but
the current desktop shell enters the art-first `index.html` directly.
