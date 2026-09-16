# Atelier Figma Pack — 2026-09-14

## Current source pair

- **Production viewer:** https://fromage3900.github.io/my-site/tools/fromage-webgl-kit/accessory-viewer/floral-study.html
- **Editable Figma source:** https://www.figma.com/design/sZM806XhCn3HrNlpsEjkaL
- **Grandmaster reference:** https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf/Untitled — page 12 / node `37:319`

The production HTML/Three.js viewer remains runtime authority. The editable Figma file is the visual/source-design companion for the finalized Accessory Atelier layout. Do not regenerate a second Atelier file unless this one is intentionally retired.

## What’s inside
- `tokens.json` — all colors (paper/plum/sky/stone…13 swatches + 4 finishes), grid (13 cols, fib 14/21/34/55, phi 1.618), typography (Jost 500 10px micro, Times hero 84–218px), controls, hero lockup, and the current editable Figma source.
- This README — authority and reconstruction notes.

## Finalized Figma structure
1. **Variables:** `Accessory Atelier` collection carries paper/ink/muted/plum/wine/sky/stone/celadon/sage/petal/rose/butter/cream/peach/umber/mist plus spacing 14/21/34/55, gutter 18, margin 28.
2. **Frame:** `Atelier / Floral-Study — Final`, 1720px wide.
3. **Hero:** “Frame, finish, light.” + “An optical object suspended between surface and image.” using the same editorial scale and asymmetric composition as the live sheet.
4. **Realtime stage:** product stage + optical silhouette reference, with the browser implementation remaining the actual interactive renderer.
5. **Controls:** silhouette, finish and lens families mirror the live viewer vocabulary.
6. **Floral archive:** palette/surface study retained as the visual art-direction evidence rather than stripped into generic UI chrome.

## Production behavior now live
- Eight authored eyewear GLBs are selectable.
- The -PI/2 forward-axis correction keeps lenses facing the camera.
- Clear lens polish uses 0.82 transmission, 0.42 opacity, 0.06 roughness, 0.65 clearcoat.
- Frame/lens/view/inspection state is URL-addressable and bookmarkable.
- Explicit camera views stop auto-rotation so Front/Hinge/Bridge are deterministic inspection shots.
- Reduced-motion remains the initial default while explicit user rotation is allowed.
- Technical proof reports GLB size, FPS, DPR, draw calls, triangles, mesh roles, current material state, view and rotation state.
- The live Atelier panel links to the editable Figma source and can copy the exact current-state URL.

## Sync rule

**Code is runtime authority; Figma is editable visual authority.** Keep the names and token values aligned. Native Code Connect is not required for this page to remain synchronized; if it is enabled later, map the finalized Atelier frame to `tools/fromage-webgl-kit/accessory-viewer/floral-study.html` / `app.js` rather than creating a parallel implementation.
