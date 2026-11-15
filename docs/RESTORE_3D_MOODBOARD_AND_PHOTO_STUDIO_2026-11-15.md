# Portfolio Recovery Contract — 3D Moodboard & Melusina Photo Studio
Date: 2026-11-15
Status: **Review-only recovery, not an approved public release**

## Why
The artist has repeatedly requested a Pinterest-style presentation of **actual authored 3D renders**, with Melusina EEVEE beauty and macros kept visibly available. Subsequent recruiter-first curation removed them from the live release without preserving a clear alternative route. Absence from the release allowlist is not the same as deleting source assets, but it is a real visitor-facing loss.

## Recovered sources (DO NOT DELETE OR RELABEL)
- Original composition contract: `docs/MOODBOARD_COMPOSITION_2026-09-05.md` — 13 columns, 8/5 major pair, 3/5/3 detail beat; tablet 8; mobile 5; image-first, not exhaustive.
- Original photo engine: `wix/melodia-photobooth.js` plus `wix/melodia-photobooth.css` — 5 poses, 3 lens presets (24/50/85 mm), 5 LUT-like filters, viewfinder + shutter interactions, touch gestures.
- Historical card/masonry component: `wix/melodia-gallery-grid.html` and `public/melodia/melodia-gallery-grid.html` — retained, unchanged; originally URL-configured for illustrations.
- Original stage: `wix/melodia-stage-character.html`, `wix/melodia-melusina.html`; original render registry `content/render-passports.json`.
- Character beauty anchor: `generated/assets/character/melusina_beauty_eevee_20260715c_01.png`.
- Macro still: `generated/assets/character-loops/melusina_glam_macro_postcard_4s_poster.png`.
- Additional beauty close-ups and actual 3D ornaments are linked explicitly from recovered pages. Their original PNGs are unchanged.

## Reconnected review pages
- `wix/portfolio-moodboard.html` — authored render masonry, not generated/fabricated imagery; reuses 10 tracked images in the original rhythm.
- `wix/melusina-photo-studio.html` — wraps the existing, unmodified photo-engine JS/CSS and shows source macro card stills.

Both pages are currently **noindex review pages**. They are not added to the strict `tools/build_recruiter_release.py` allowlist, and do not modify Wix, public production, or DNS.

## Provenance / rendering honesty
- The EEVEE portrait is a **July 2026 historical stage render**, not independently verified as the artist's latest Melusina V2 Eevee render. The newer Blender output may exist only on the artist's machine.
- A source image with an old name must not be claimed to depict finished level gameplay or a current finalized shader merely because the name contains a world.
- The 2026-09-05 document includes later actual-pixel audit corrections. Weak or explicitly rejected captures must not be auto-promoted when the gallery returns.
- No AI-generated art substitutes for authored renders. Artwork deletions, source replacement, mass archive operations, merging, and publishing need explicit approval.

## Regression gate
`python tools/verify_visual_folio_preservation.py` verifies that original moodboard/photobooth/EEVEE files remain present, both restored pages expose valid existing referenced assets, the photo booth still initializes, and the layout retains its Fibonacci breakpoints.

A future portfolio simplification should **edit which items get displayed**, not silently remove the only access route to the archive or throw away its source. Keep the review gallery and studio source even if public selection changes.
