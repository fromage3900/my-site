# Atelier Figma Pack — 2026-09-14

## Current source pair

- **Production viewer:** https://fromage3900.github.io/my-site/tools/fromage-webgl-kit/accessory-viewer/floral-study.html
- **Editable Figma source:** https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf/Untitled?node-id=177-119
- **Grandmaster location:** `09 Website Pages` → `Page/accessory-atelier` → node `177:119`

The production HTML/Three.js viewer remains runtime authority. The Grandmaster frame above is the editable visual/source-design companion for the finalized Accessory Atelier layout. The temporary standalone draft is retired as an authority; do not regenerate a second Atelier file unless this Grandmaster node is intentionally replaced.

## What’s inside
- `tokens.json` — all colors (paper/plum/sky/stone…13 swatches + 4 finishes), grid (13 cols, fib 14/21/34/55, phi 1.618), typography (Jost 500 10px micro, Times hero 84–218px), controls, hero lockup, and the canonical Grandmaster node.
- This README — authority and reconstruction notes.

## Finalized Figma structure
1. **Frame:** `Page/accessory-atelier`, 1720 × 2200, on Grandmaster page `09 Website Pages`.
2. **Hero:** “Frame, finish, light.” + “An optical object suspended between surface and image.” using the same editorial scale and asymmetric composition as the live sheet.
3. **Realtime stage:** product-stage reference plus editable optical silhouette; the browser implementation remains the actual interactive renderer.
4. **Controls:** silhouette, finish and lens families mirror the live viewer vocabulary; the panel uses editable auto-layout rows.
5. **Floral archive:** the 13-color palette/surface study is retained as visual art-direction evidence rather than stripped into generic UI chrome.
6. **Source block:** the Figma frame records the live viewer path, runtime files, and the code/Figma authority rule directly on-canvas.

## Production behavior now live
- Eight authored eyewear GLBs are selectable.
- The -PI/2 forward-axis correction keeps lenses facing the camera.
- Clear lens polish uses 0.82 transmission, 0.42 opacity, 0.06 roughness, 0.65 clearcoat.
- Frame/lens/view/inspection state is URL-addressable and bookmarkable.
- Explicit camera views stop auto-rotation so Front/Hinge/Bridge are deterministic inspection shots.
- Reduced-motion remains the initial default while explicit user rotation is allowed.
- Technical proof reports GLB size, FPS, DPR, draw calls, triangles, mesh roles, current material state, view and rotation state.
- The live Atelier panel links directly to Grandmaster node `177:119` and can copy the exact current-state URL.

## Sync rule

**Code is runtime authority; Figma Grandmaster node `177:119` is editable visual authority.** Keep the names and token values aligned. Native Figma Code Connect remains plan-gated separately; if it becomes available later, map this node to `tools/fromage-webgl-kit/accessory-viewer/floral-study.html` / `app.js` rather than creating a parallel implementation.
