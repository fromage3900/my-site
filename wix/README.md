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

The custom domain is a Wix shell embedding the GitHub Pages site. The stable Wix iframe
URL remains `application-hub.html`, which bootstraps external iframe first-contact to
`index.html?embed=wix`.

`wix-embed-bridge.js` marks iframe mode and reports embed measurements to the parent.
The outer Wix HTML element still must be stretched/sized correctly in the Wix editor.
