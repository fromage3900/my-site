# Phone Renderer Experiment Lab — 2026-09-08

**Branch:** `lab/phone-renderer-experiments-2026-09-08`  
**Canonical production branch:** `main`  
**Repository:** `fromage3900/my-site`

This branch is an intentionally non-canonical sandbox for Kimi, Grok, Cursor, and manual browser-art experiments.

## Hard boundary

- Do not treat this branch as recruiter-facing production truth.
- Do not merge experimental work to `main` by default.
- Do not modify canonical copy, route taxonomy, or recruiter claims unless a specific experiment requires a temporary local mockup.
- Do not weaken the sendoff-freeze validator on `main`.
- Production website authority remains `main`.

## Where experiments go

Prefer new experiments under:

`wix/experiments/<experiment-name>/`

Each experiment should be self-contained where practical and include either:
- `index.html`, or
- a clearly named HTML entry point.

Shared experimental utilities may live under:

`wix/experiments/_shared/`

Do not overwrite canonical pages such as:
- `wix/index.html`
- `wix/melodia-living-worlds.html`
- `wix/realtime-3d-viewer.html`

If you want to test an idea against one of those pages, copy or wrap it inside the experiment directory first.

## Renderer ownership

Use the renderer that best fits the phenomenon:

- **Three.js** — 3D scenes, models, cameras, spatial fog, PBR, SDF/raymarch studies.
- **PixiJS** — dense 2D GPU particles, gesture trails, screen-space magical effects, sprite systems.
- **Canvas2D** — lightweight generative drawing, starfields, trails, feedback when GPU complexity is unnecessary.
- **SVG** — crisp constellation diagrams, musical geometry, editorial linework, vector ornaments.
- **CSS** — typography, layout, gradients, simple local decoration. Do not use obvious repeating CSS grids as the main starfield.
- **OGL/regl/raw WebGL/WebGPU** — isolated graphics experiments only when the lower-level control is itself the point.

Avoid adding multiple renderers to one sketch unless their responsibilities are genuinely distinct.

## Visual language

Melodia palette:
- deep blue-violet night
- powder/cornflower blue
- pastel pink
- restrained magenta
- pearl lilac
- pale warm gold
- moonlit cream
- selective aquatic cyan

Aim for:
dreamlike, musical, aquatic, celestial, painterly, magical, strange, serene.

Avoid default cyberpunk, generic shader-demo rainbow, dashboard UI, and excessive bloom.

## Experiment contract

For each sketch, add a short `README.md` or comment containing:

1. **Phenomenon** — what visual/interaction idea is being tested.
2. **Renderer** — Three / Pixi / Canvas / SVG / etc.
3. **Why this renderer** — one sentence.
4. **Controls** — touch/mouse/keyboard behavior.
5. **Promotion verdict** — `LAB ONLY`, `MAYBE PROMOTE`, or `PROMOTION CANDIDATE`.
6. **Performance note** — mobile/desktop observation.

## Phone-first rules

- No hover-only critical interactions.
- Touch drag/pinch/tap must work cleanly.
- Cap device pixel ratio sensibly.
- Respect reduced motion.
- Pause expensive animation when hidden.
- Prefer one strong visual phenomenon over a large UI.
- Keep experiments easy to open directly from a URL.

## Agent behavior

Kimi / Grok / Cursor:

Do not solve this like a normal website feature unless asked.

This branch is a graphics-programming sketchbook.

Novel rendering behavior, spatial illusion, simulation, unusual interaction, and visual discovery are more valuable here than production polish.

You are allowed to fail visually.

You are not allowed to make `main` ambiguous.

## Promotion path

If an experiment becomes genuinely valuable:

1. leave the original lab version intact;
2. identify the smallest reusable subsystem;
3. create a fresh production branch from current `main`;
4. port only the selected subsystem;
5. test it against the sendoff freeze and recruiter experience;
6. merge only after deliberate review.

Lab branch = invention.  
Main = curation.
