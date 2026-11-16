# Restore the full Melodia portfolio without reviving stale renders

**Status:** Recovery branch / advisory audit only. No production deploy in this PR.

## Verified failure mode

The `my-site/.github/workflows/pages.yml` Pages job builds and deploys
`_recruiter_release`. Its builder, `tools/build_recruiter_release.py`,
publishes four generated pages and only three approved image files. This is a
small curated recruiter subset, **not** the original portfolio. The Wix Studio
home page loads the GitHub Pages portfolio at desktop widths via an iframe; the
optional Wix CLI publish job is currently skipped. Restoring source files alone
does not restore their visibility.

The editable `wix/` tree still contains the original/recovered
`portfolio-moodboard.html`, `melusina-photo-studio.html`,
`constellation-brush.html`, world/tech routes and viewer experiments.
The private `melodia-portfolio-site` contains a separate older source copy.
**Do not silently replace either source or pick a canonical repo without
comparing them.**

## Recovery sequence

1. **Freeze the public contract.** Keep the current strict recruiter output as
   a snapshot/fallback, not the site's permanent only destination.
2. **Choose a bounded full-site visitor manifest:** home, selected work,
   environments, technical work, moodboard, photo studio, original constellation
   brush, a verified working Three.js viewer, and about/contact. Stage it in an
   independent directory (e.g. `_portfolio_release`) before switching Pages.
   Maintain separate explicit allows for assets and interactive dependencies.
3. **Verify image provenance before copying anything:** original Git sources
   only; do not re-publish the 39 paths in
   `content/stale-render-archive-20261115.json`; never treat HDA point-cloud
   diagrams as finished 3D environment beauty renders. Preserve historical
   EEVEE art with clear dates/labels and promote newly verified real renders
   after inspection.
4. **Fix route closure, CSS, JS and media:** copy only reviewed local
   dependencies; rewrite or disable only genuinely broken links, and record
   their original destinations. Do not add all repo files or auto-scan binaries
   into production. Ensure homepage visitor links reach the actual experiences.
5. **Preserve original identity:** Night Velvet, rose ribbons, Sakura/crescent
   ornament, 13-column Fibonacci moodboard, Melusina photo-card studio, real
   Three.js constellation brush/site-wide overlay, mobile fallbacks and
   reduced-motion behaviour. No AI-generated replacement render assets.
6. **Preview before deployment:** test desktop/mobile and iPhone Safari,
   clickable links, working WebGL/pointer events, missing assets, no broken
   imports, no accidentally exposed internal/archived paths, and HTTP 404 for
   retired routes. Keep the current site up while reviewing the new output.
7. **Switch Pages artifact after review**, while retaining the smaller
   recruiter presentation as an explicit optional route; verify the Wix
   desktop iframe source and live custom domain after deployment.
8. **Add a permanent anti-stub release gate:** fail CI if the public release
   unexpectedly excludes moodboard, photo studio, constellation brush,
   environments or approved interactive galleries. The gate must inspect
   **the actual built deployment artifact**, not simply the source files.

## Read-only inventory

Run `python tools/audit_full_portfolio_release.py` to report which intended
routes are in the repo, which are excluded by the current strict publisher,
and the static local references or archived media they require.

Run with `--output reports/release-restore-audit.json` to write an inspection
report. The `--strict` option is for the future *complete* release; it is
expected to fail the existing four-page public artifact. This script does not
render or publish anything. It cannot prove a Three.js scene works, evaluate
asset visual quality, crawl dynamic JavaScript references or inspect a live
phone.

## Ship/hold

**Ship:** only after independent preview, route/asset closure, original
artwork review and public artifact validation.

**Hold:** automatic merge, production deployment changes, broad source tree
uploads, re-publication of stale renders, and replacement of the original
art direction.
