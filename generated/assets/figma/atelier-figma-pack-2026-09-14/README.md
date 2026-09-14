# Atelier Figma Pack — 2026-09-14

Drag this into Grandmaster https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf/Untitled

## What’s inside
- `tokens.json` — all colors (paper/plum/sky/stone…13 swatches + 4 finishes), grid (13 cols, fib 14/21/34/55, phi 1.618), typography (Jost 500 10px micro, Times hero 84–218px), controls, hero lockup.
- This README — how to build the frames.

## Build in Figma (10 min)
1. **Variables:** Create `primitives` collection → add colors from tokens.json → map paper/ink/muted/plum/wine/sky/stone/celadon/sage/petal/rose/butter/cream/peach/umber/mist + finishes obsidian/tea/sea/pearl.
2. **Frame 1720px:** New frame `Atelier / Floral-Study` 1720px wide → Layout Grid 13 columns, gutter 18px, margin 28px.
3. **Hero:** Text “Frame, finish, light.” at 400 218px serif, dek “An optical object…” italic 24px, place per sheet’s 13-col hero grid (h1 1/9, dek 10/14).
4. **Swatches:** 13 swatches — make auto-layout with ribbon/dot/tall variants per tokens.json swatches13. Use hex fills, add `data-n` label 7px.
5. **Controls:** Recreate `.choice` buttons — 42px, 1px dashed rule, 10px Jost. Pressed = plum fill + shadow. Add dot 9px for finishes.
6. **Live embed:** Optional — place screenshot of https://fromage3900.github.io/my-site/tools/fromage-webgl-kit/accessory-viewer/floral-study.html or embed the URL in a Figma prototype (link).

## Polish notes (already staged)
- Forward fix is live (face-forward -PI/2) — lenses now face camera.
- Next lens polish (clear 0.9→0.82 transmission) will land separately — re-import will just tweak hex, no re-layout needed.

## Commit
This pack is at `generated/assets/figma/atelier-figma-pack-2026-09-14/` — commit with site.

