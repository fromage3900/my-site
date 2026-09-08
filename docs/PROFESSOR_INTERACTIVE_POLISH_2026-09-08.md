# Professor Interactive Polish — 2026-09-08

**Status:** bounded soft-freeze exception complete pending live browser QA  
**Authority:** `content/showcase-freeze.json`  
**Audience:** Humber professors / technical-art reviewers

## Why this exception exists

The recruiter showcase remains in soft freeze, but the owner explicitly requested one bounded pass on the existing browser-interactive work before professors begin reviewing the portfolio.

This is **not** a new website redesign.

The pass is limited to making the existing interactive studies:
- clearer about what is browser-authored versus Unreal authority;
- less dashboard/recruiter-coded in tone;
- safer when WebGL or a CDN is unavailable;
- more respectful of reduced-motion preferences;
- easier for a professor to understand quickly;
- better described in metadata and social previews.

No new public route, art system, generated replacement image, or navigation architecture was introduced.

---

## 1. Living Worlds

Files:
- `wix/melodia-living-worlds.html`
- `wix/melodia-living-worlds.js`

Changes:
- reframed the page as an **interactive environment study** rather than a vague WebGL spectacle;
- names the authored ingredients directly: geometry, shaders, atmosphere, camera interaction;
- replaced recruiter-specific CTA language with **Selected Art**;
- clarified keyboard / orbit / reset interaction;
- removed FPS / device-pixel-ratio telemetry from the visible runtime status;
- made renderer-failure copy professional and useful;
- added a second Three.js CDN source before falling back to the static field note.

The procedural scene itself is unchanged. The polish is presentation and robustness.

---

## 2. Interactive 3D Asset Study

Files:
- `wix/realtime-3d-viewer.html`
- `wix/melodia-3d-viewport.js`

Changes:
- renamed the surface from “Studio” to **Interactive 3D Asset Study**;
- added explicit public scope:
  **the browser viewport is a lightweight presentation study; UE5.8 captures remain the visual / technical authority**;
- removed language implying the browser shader is Unreal Substrate or equivalent to another commercial game;
- changed “PBR Beauty” / “Substrate Toon” to **PBR Preview** / **Toon Study**;
- marked Zundamon as a **3rd-party pipeline test** rather than allowing ambiguous authorship;
- added canonical / OG / Twitter metadata using an already-reviewed raster plate;
- added reduced-motion handling for auto-rotation;
- added alternate CDN sources for the Three.js dependency stack;
- added explicit WebGL/context-loss fallbacks;
- when an asset fails to load, the fallback primitive is now visibly identified instead of inheriting the asset’s geometry claim.

This page should be read as a browser inspection interface, not a replacement for the Unreal breakdown.

---

## 3. Technical Art Atelier

Files:
- `wix/melodia-atelier-lab.html`
- `wix/melodia-atelier-lab.js`

Changes:
- renamed tabs to **Stylized Shader Study**, **World Atmospheres**, and **Procedural Scatter**;
- removed public “Substrate Toon” equivalence language;
- changed “Anime Rim Light” / “SDF Outline” controls to descriptive implementation-neutral labels;
- changed the turntable to **PBR Preview** / **Toon Study**;
- marked the Zundamon turntable option as a third-party test;
- clarified the 3D destination as an **Asset Study**;
- added canonical / robots / Twitter metadata and a reviewed absolute social image;
- corrected internal implementation comments so future agents do not mistake browser approximations for live Unreal or TouchDesigner systems;
- ambient shader / world / resonance motion now respects reduced-motion preferences; the WebGL turntable already suppresses auto-rotation there.

---

## 4. Discovery copy

Small existing-route copy corrections:
- homepage CTA now says **INTERACT ✦ · Living Worlds** rather than the ambiguous “ENTER · Melodia”;
- Application Hub now names **Technical Art Atelier** directly.

No hierarchy or route taxonomy was changed.

---

## 5. Canonical presentation cleanup

The same bounded pass removed a few public-facing presentation problems that were especially distracting in a professor review:

- homepage / render-gallery / application-hub copy no longer advertises unfinished beauty captures as “pending”; existing studies are described positively and accurately as the evidence they actually contain;
- reviewer language on the render gallery is now audience-neutral rather than recruiter-specific;
- the material breakdown page foregrounds **Melodia's own hero-surface identity** instead of leading with an “Infinity Nikki–aligned” comparison. Internal asset filenames and production lineage are not rewritten; only the public editorial framing changed.

This is editorial cleanup, not evidence inflation.

---

## Recommended professor path

For a concise review:

1. `wix/curated-art.html` — art first.
2. `wix/melodia-living-worlds.html` — authored procedural browser environment work.
3. `wix/shader-breakdowns.html` — production material proof.
4. `wix/melodia-atelier-lab.html` — browser translation of technical-art ideas.
5. `wix/realtime-3d-viewer.html` — asset / topology / material inspection study.
6. `wix/pipeline.html` — production context only if deeper technical evidence is useful.

The interactive pages are supporting evidence. **The art and UE captures remain primary.**

---

## Remaining gate before professor sendoff

Source review and CI are necessary but not sufficient. Before calling this professor-ready, perform a real rendered-browser check at minimum:

- 390px mobile;
- ~768–1024px tablet/laptop;
- 1440px desktop;
- keyboard-only traversal;
- reduced-motion enabled;
- one session with WebGL working;
- one forced/failing WebGL or blocked-CDN fallback;
- Wix / `fromageart.xyz` framing;
- direct GitHub Pages route;
- audio interaction in Atelier after explicit user gesture.

Do not claim those browser checks passed until they have actually been observed.

---

## Freeze rule after QA

After browser QA fixes, this exception closes.

Further Three.js work returns to the normal freeze rule:
**no new effects, labs, routes, or visual systems before the final render promotion and hard freeze.**
