# Kimi brief — Three.js toy rebuild pass
Date: 2026-09-18

## Open these first

Repo:
https://github.com/fromage3900/my-site

Working branch:
https://github.com/fromage3900/my-site/tree/audit/recruiter-truth-polish-2026-09-18

Live cleanup PR:
https://github.com/fromage3900/my-site/pull/47

This brief:
https://github.com/fromage3900/my-site/blob/audit/recruiter-truth-polish-2026-09-18/docs/KIMI_THREEJS_REBUILD_BRIEF_2026-09-18.md

September hero bank:
https://github.com/fromage3900/my-site/tree/audit/recruiter-truth-polish-2026-09-18/public/melodia/melusina-morning-vfx/2026-09-17/heroes

Strongest existing reference implementation — Accessory Atelier:
https://github.com/fromage3900/my-site/blob/audit/recruiter-truth-polish-2026-09-18/tools/fromage-webgl-kit/accessory-viewer/index.html

Floral Study:
https://github.com/fromage3900/my-site/blob/audit/recruiter-truth-polish-2026-09-18/tools/fromage-webgl-kit/accessory-viewer/floral-study.html

Product Motion Lab:
https://github.com/fromage3900/my-site/blob/audit/recruiter-truth-polish-2026-09-18/tools/fromage-webgl-kit/prototypes/product-motion-lab/index.html

Fabric Material Lab:
https://github.com/fromage3900/my-site/blob/audit/recruiter-truth-polish-2026-09-18/tools/fromage-webgl-kit/prototypes/fabric-material-lab/index.html

Constellation Brush:
https://github.com/fromage3900/my-site/blob/audit/recruiter-truth-polish-2026-09-18/wix/constellation-brush.html

Living Worlds:
https://github.com/fromage3900/my-site/blob/audit/recruiter-truth-polish-2026-09-18/wix/melodia-living-worlds.html

Cosmic Orrery:
https://github.com/fromage3900/my-site/blob/audit/recruiter-truth-polish-2026-09-18/wix/cosmic-orrery.html

Resonance Motion Study:
https://github.com/fromage3900/my-site/blob/audit/recruiter-truth-polish-2026-09-18/tools/fromage-webgl-kit/accessory-viewer/resonance-motion-study.html

## Project context Kimi needs before touching anything

This is Brennan Shepherd's final-year 3D Animation portfolio and the public face of **Melodia Melusina**, a stylized rhythm-JRPG / technical-art project in Unreal Engine 5.8.

The site has accumulated a lot of older experiments, agent-written prose, old renders, technical dashboards, and browser toys. The current cleanup is NOT about adding more systems. It is about making the website feel like one artist made it in September 2026.

Brennan's strongest current lane is:
- stylized environment art;
- technical art;
- procedural worldbuilding;
- Unreal Engine 5.8;
- Houdini / Hython;
- PCG / PCGEx;
- materials / shaders;
- TouchDesigner audio-reactive visuals;
- character / wardrobe lookdev;
- strange musical interactive work.

The visual identity is romantic fantasy + magical-girl + artbook editorial + cosmic diagrams. It should feel authored, soft, strange, musical, and visually intentional.

The recruiter-facing rule is:

**ART FIRST. TECHNICAL PROOF SECOND.**

The browser toys should never read like generic WebGL tutorials or SaaS configurators.

## Goal
Rebuild the weakest browser toys so they feel authored for Brennan Shepherd's September 2026 portfolio rather than inherited WebGL demos.

Use `tools/fromage-webgl-kit/accessory-viewer/index.html` as the quality/reference bar.

## Triage

### KEEP / POLISH — Accessory Atelier
`tools/fromage-webgl-kit/accessory-viewer/index.html`

Strongest current browser-object direction. Do not rewrite from scratch. Preserve the editorial object-first layout, large authored stage, restrained controls, fashion/product-study tone, calm initial camera, and progressive technical proof.

### REBUILD — Product Motion Lab
`tools/fromage-webgl-kit/prototypes/product-motion-lab/index.html`

Problems: generic dark developer-demo UI; generic Display/Hinge/Port callouts; diagnostics dominate art direction.

Rebuild as a Melodia object-motion study:
- one authored hero object;
- elegant initial framing;
- motion communicates assembly / resonance / transformation;
- timeline may remain but moves behind Inspect / Motion;
- Melodia ivory / lavender / blue / rose / gold;
- annotations explain art/animation intent, not generic hardware;
- first viewport must work as a portfolio still.

Do not invent a fake asset. Use an existing repo asset if a suitable GLB exists. If none exists, preserve the placeholder system but label it honestly as a motion-system study.

### REBUILD — Fabric Material Lab
`tools/fromage-webgl-kit/prototypes/fabric-material-lab/index.html`

Problems: competent but generic material-inspector UI; reads like a technical utility before it reads like Brennan; "clean-room PBR textile study" is disconnected from Melodia.

Rebuild as a Melodia textile / surface atelier:
- material is the hero;
- large drape / swatch / garment fragment under beautiful grazing light;
- controls hidden until requested;
- Beauty first;
- optional Roughness / Normal / Wire / Grazing views;
- art-direction names rather than anonymous presets;
- connect to Melusina wardrobe/accessory work without implying browser PBR equals Unreal.

Tone example: "I wanted the cloth to hold a little moonlight at the edge."

### REWORK — Floral Study
`tools/fromage-webgl-kit/accessory-viewer/floral-study.html`

Strength: strong editorial composition.
Problem: decorative art is currently hotlinked from Wikimedia via `Le_Chevalier_aux_Fleurs_2560x1600.png`.

Replace external moodboard art with Brennan-owned / Melodia repo imagery. Prefer the September 17 Melusina Morning hero bank, foliage/flower/atmosphere studies, or authored texture fragments. Preserve the strange print-editorial layout. Do not make it a clone of Accessory Atelier.

### PRESERVE + MODERNIZE — Constellation Brush
`wix/constellation-brush.html`

Keep the concept and gesture vocabulary:
- slow stroke → threads;
- fast stroke → comets/shards/blooms;
- circle → orbit;
- sharp turn → crystal junction;
- rest → listening star;
- touch/pinch behavior;
- pentatonic sound response.

Problems: Three.js r128; giant inline monolith; slightly detached from September visual language.

Modernize carefully:
- current Three.js module/importmap pattern;
- split renderer / gestures / audio / visual systems where practical;
- preserve mobile/touch behavior;
- improve untouched initial composition;
- make it feel like drawing into Melodia's sky.

### DEPRIORITIZE — Cosmic Orrery
`wix/cosmic-orrery.html`
Treat as a case-study page, not the rebuild priority.

### INTERNAL / LAB — Resonance Motion Study
`tools/fromage-webgl-kit/accessory-viewer/resonance-motion-study.html`
Keep internal/reel-facing for now. CSS/SVG motion study, not flagship Three.js.

## Shared presentation contract
Every flagship interactive should have:
1. portfolio-ready authored initial state;
2. one clear interaction hint;
3. Beauty by default;
4. technical controls behind Inspect / Customize / Study;
5. Reset view;
6. reduced-motion support;
7. mobile/touch support;
8. no diagnostics dominating the primary composition;
9. no fake performance numbers or production claims;
10. no third-party visual art presented as portfolio imagery;
11. browser renderer described honestly as a study;
12. still-worthy composition at 16:9 and phone portrait sizes.

## Visual language
Ivory / mist / lavender / blue / rose / gold. Fine linework. Musical diagrams. Editorial negative space. Softness punctuated by crisp technical geometry. Romantic fantasy, not cyber-dashboard UI.

Avoid generic black developer panels, neon SaaS gradients, sci-fi HUD spam, excessive pills, glassmorphism for its own sake, enterprise copy, and replacing art direction with more particles.

## Implementation rules
- Work on `audit/recruiter-truth-polish-2026-09-18`.
- Preserve existing URLs where possible.
- Refactor in place rather than creating v2/v3 duplicates.
- No new framework.
- No new build tooling unless required.
- Reuse authored repo assets.
- No generated replacement art.
- Preserve accessibility and reduced motion.
- Test phone + desktop.
- Small, legible commits.

## Acceptance order
1. Product Motion Lab no longer looks like a generic hardware tutorial.
2. Fabric Material Lab feels like a Melodia textile atelier.
3. Floral Study contains no external moodboard art.
4. Constellation Brush retains gestures but feels current and maintainable.
5. Accessory Atelier is only touched for consistency/bugs.
6. Living Worlds / Lab navigation clearly separates flagship work from experiments.

## Final handoff
Report files changed, visual intent per toy, external imagery removed, mobile/reduced-motion checks, blockers, capture paths, and behavior deliberately preserved.
