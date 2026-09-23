# FIGMA AGENT PROMPT — Atelier 3D Viewer Polish — 2026-09-14

You are polishing the **Accessory Atelier / Object 01** 3D viewer (`floral-study.html`) to feel like a luxury boutique, not a lab demo. Work in the Grandmaster Figma file and keep the live WebGL truth.

**Grandmaster:** https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf/Untitled (Page 12, node 37:319)
**Live viewer:** https://fromage3900.github.io/my-site/tools/fromage-webgl-kit/accessory-viewer/floral-study.html

**Local source (after our pass):**
- `C:/Users/froma/my-site/tools/fromage-webgl-kit/accessory-viewer/floral-study.html` (polished: pressed state with inset+shadow+dot border, stage vignette, face-forward kept)
- `C:/Users/froma/my-site/tools/fromage-webgl-kit/accessory-viewer/app.js` (fix: `rotation.set(-PI/2 -0.04, -0.16, 0)` so glasses face camera; lens `clear` transmission 0.82→0.82, roughness 0.06, thickness 0.14, envMap 1.15)
- `C:/Users/froma/my-site/generated/assets/figma/atelier-figma-pack-2026-09-14/tokens.json` + `README.md` — 13 swatches, phi 13-col 1720px grid, Jost/Times, finishing dots

**Current viewer spec:**
- 6 heroes now on disk (rect/panto/cateye/aviator + new browline/round from laptop lane) — `Saved/Accessories/Melodia_Accessory_Studio_v1.blend` (ISO 8624, 6-base curve, 4.4° form, bead size tuned)
- Controls: 4 finishes (obsidian/tea/sea/pearl), 4 lenses (clear/smoke/rose/cool), 4 views (hero/front/hinge/bridge), inspection (beauty/wire/clay), rotate toggle
- Tech: Three.js r186, ACES toneMapping 1.08, soft shadows 1024, DPR 1.75, floor at y=-1.32, diagnostics mono 9px

**Goals:**
1. **Graphic polish:** tighten hierarchy (hero type 400→300 above 1200px, -0.07em), pressed state tactile (inset + 0 2px 6px shadow + dot border), stage vignette (radial 62%→7% plum), swatch hover backing, mobile 44px tap targets, diagnostics max-height scroll.
2. **More live in Figma:** prototype controls with Smart Animate 180ms, embed live viewer or 4s capture so stakeholders can play inside Figma.
3. **Glasses fix:** verify faces forward across all heroes, glass not milky — test clear/rose/smoke on aviator + browline at hero/hinge.

**Deliver:**
- Updated `floral-study.html` + `app.js` pushed to `main`
- Figma Variables imported from `tokens.json` into a new `Atelier / Floral-Study` frame (1720px, 13-col)
- 2–3 before/after screenshots

**Reference docs:**
- `tools/fromage-webgl-kit/accessory-viewer/POLISH_PASS_2026-09-14.md`
- Upwork pitch: `tools/fromage-webgl-kit/submissions/2026-09-14_3d-blender-designer_eyewear_proposal.md`
- Blender studio: `Saved/Accessories/Melodia_Accessory_Studio_v1.blend` + `Silhouette_Grid_v1.blend` + `Tools/eyewear_verify/`

Keep layout (phi, 13 swatches, Rochegrosse source) — only tighten shadows, borders, and tactility. No wholesale redesign.

