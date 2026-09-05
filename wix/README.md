# wix/ route map

This directory is not one flat public site. It contains the live portfolio, case studies,
technical/internal pages, and reusable HTML components.

## Canonical visitor routes

These are the pages expected to share one current typography/navigation/editorial build:

- index.html
- curated-art.html
- world-bible.html
- melodia-living-worlds.html
- resume.html
- hero-renders.html
- zbrush-breakdown.html
- shader-breakdowns.html
- cosmic-orrery.html
- application-hub.html
- pipeline.html

The current shared build is **20260904p1**. Canonical pages carry
`<meta name="melodia-build" content="20260904p1">` and cache-bust local CSS/JS with the
same version.

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
- **Source:** `index.html?embed=wix&v=20260904p1`

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
