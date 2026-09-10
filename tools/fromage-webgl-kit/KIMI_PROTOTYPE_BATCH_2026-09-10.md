# Kimi Prototype Batch — 2026-09-10

**Authority:** `LEADS_2026-09-10.md` chooses the market problems; `SERVICES.md` defines what we sell.  
**Execution rule:** build generic proof, not unpaid client deliverables.  
**Destination:** `tools/fromage-webgl-kit/prototypes/` only. Do not modify deployed recruiter-facing pages.

## Shared constraints for all three prototypes

- Use Three.js/WebGL with clean, readable source.
- Reuse the generic kit primitives under `src/` where they fit; improve them only when a genuinely reusable abstraction falls out of the work.
- No Melodia characters, names, logos, music, textures, or proprietary/project-specific assets.
- No third-party commercial IP or scraped client assets.
- Procedural geometry, primitive geometry, CC0 assets, or clearly owned generic assets only.
- Mobile-width behavior is mandatory.
- Respect `prefers-reduced-motion` where motion is not functionally required.
- Expose a small performance/debug readout: DPR, approximate FPS, triangles/draw calls if available, and loaded asset bytes when practical.
- Fail gracefully when WebGL or an asset is unavailable.
- No backend, accounts, ecommerce, CMS, analytics, payment, or external API scope.
- Do not redesign the public portfolio or auto-deploy anything.
- Finish with a short `EVIDENCE.md`: what works, what was measured, what remains unverified, and exactly which reusable primitive was created or improved.

---

# Prototype A — Web Product Motion Lab

**Market proof target:** real-time product animation, product viewer/configurator, scroll-scrubbed GLB delivery.

**Create:** `tools/fromage-webgl-kit/prototypes/product-motion-lab/`

## Goal

Build a premium but neutral browser demonstration showing that a web-ready 3D product can be loaded, presented, annotated and scrubbed through a deterministic product-use animation without video.

## Required experience

1. A generic handheld-device-like object built from owned/procedural geometry or an original simple GLB.
2. Neutral studio presentation with physically plausible PBR response.
3. A timeline scrubber and scroll-linked scrub mode.
4. At least three deterministic named animation phases: `intro`, `use`, `idle`.
5. At least three named annotation anchors that remain attached to the correct moving component.
6. Toggleable callouts anchored to those points.
7. A compact diagnostics panel showing approximate triangles, draw calls, DPR/FPS and asset size if measurable.
8. Responsive desktop and phone-width layout.
9. One visual QA mode showing wireframe or normal/material inspection.

## Architecture preference

Keep animation scrub-safe: the same normalized timeline value must always yield the same visual pose. Avoid time-integrated behavior for the core product motion.

If a GLB is generated outside the browser, keep the source asset and document the export settings. If Kimi cannot generate a useful GLB directly, use original Three.js primitive groups and structure the code as though the root were a product asset; do not block the prototype waiting for DCC work.

## Hard stop

Do **not** build purchasing, quoting, user uploads, CRM integration, or a full configurator.

## Evidence to return

- desktop screenshot/capture;
- phone-width screenshot/capture;
- one complete scrub from 0 → 1 → 0;
- diagnostics values;
- note describing how the same architecture would accept a client GLB.

---

# Prototype B — Fabric Material Lab

**Market proof target:** Three.js technical-art consultancy, PBR fabrics, swatch-to-web material pipelines, knitwear configurators.

**Create:** `tools/fromage-webgl-kit/prototypes/fabric-material-lab/`

## Goal

Build a focused technical-art demonstration for evaluating textile appearance in the browser. It should look like a useful production tool, not a shader toy.

## Required experience

1. Original generic cloth/swatch geometry with enough curvature to read roughness, normal and grazing-angle response.
2. At least four independently-authored textile presets with visibly different response: e.g. velvet-like, satin-like, knit-like and coarse-woven.
3. Controls for base color, roughness multiplier, normal strength and sheen/specular response appropriate to the chosen Three.js material model.
4. Live texture/preset switching without recreating the renderer.
5. A close-up inspection camera and a whole-swatch camera.
6. A light-rig selector with at least studio softbox and grazing-light inspection modes.
7. A compact state panel showing the active material parameters.
8. Export the selected configuration as a local JSON download/string representation if feasible without backend work.
9. Responsive desktop and phone-width behavior.

## Optional stretch

Add a generic decal/patch preview using an original procedural image or canvas-generated mark. Do not require arbitrary user upload for the first proof.

## Hard stop

Do **not** claim physical colorimetry, measured BRDF accuracy, automatic real-swatch capture, or a production swatch digitization pipeline unless those systems are actually implemented and measured.

## Evidence to return

- one comparison capture showing all four presets under identical lighting;
- one grazing-angle close-up;
- exported example state;
- short note separating physically grounded controls from artistic approximations.

---

# Prototype C — Procedural Industrial System Loop

**Market proof target:** procedural industrial homepage work, procedural Three.js worlds, interactive WebGL hero/banner work.

**Create:** `tools/fromage-webgl-kit/prototypes/procedural-industrial-loop/`

## Goal

Build a completely generic industrial/procedural scene whose motion can obey a strict mechanical design language and whose visualization state can communicate structural, flow and thermal-like information without pretending to be a real engineering solver.

## Required experience

1. Procedurally generated mechanical/architectural geometry using primitives and deterministic seeded parameters.
2. Stable art-directed composition despite seed variation.
3. A 10–16 second loop with a deterministic timeline.
4. `MECHANICAL` motion mode: one axis at a time, constant-speed segments, hard stops, no bounce/overshoot/anticipation/easing.
5. Three clearly labelled **visualization styles**, not simulations: `STRUCTURAL`, `FLOW`, `THERMAL`.
6. Visualization color only where it encodes state; keep base scene restrained/neutral.
7. Seed control with at least three visibly different but compositionally valid variations.
8. One optional displacement/shader transition that can be disabled; it must not compromise the mechanical motion proof.
9. Diagnostics/performance overlay.
10. Responsive desktop and phone-width fallback.

## Important language rule

Do not label generated fields as real FEA/CFD/thermal simulation. They are illustrative visualization styles designed to prove rendering, motion-law and procedural-composition capability.

## Hard stop

No CAD parser, no physics solver, no real engineering analysis, no multi-kilometre world, no terrain ecosystem.

## Evidence to return

- one complete mechanical loop capture;
- stills of all three visualization styles;
- stills of three seeds;
- diagnostics snapshot;
- concise explanation of deterministic motion/timeline implementation.

---

# Completion order

Kimi should execute **A first**, then **B**, then **C**. After each prototype:

1. run it locally;
2. fix obvious console/runtime errors;
3. write its `EVIDENCE.md`;
4. stop before starting the next prototype if the first has not reached a clean bounded proof.

Do not merge unrelated portfolio/site changes into this batch.

# Definition of batch success

This batch is successful when we have three clean-room URLs or locally reproducible demos that can honestly support a proposal claim of demonstrated WebGL/product/material/procedural capability. The prototypes are evidence generators and reusable kit R&D, not free client work.
