# Canon Melusina — browser UI presentation slice

- **Source:** `Melusina’s Four-Direction Walk Cycle.png` (user's canonical sprite sheet from the Nov 11 Higgsfield asset pass, 1254×1254 RGBA).
- **Derived sprite:** `melusina-canon-front-4.png` (288×72 RGBA-indexed PNG; 4 columns × 72×72, 32-color palette, nearest-neighbour sampling, transparency preserved). Source is not overwritten.
- **Frame source:** top/front row only (4 sequential front-walk poses). Do not pretend this asset contains the side/back frames, blink/expression sets, or equip-dependent outfit renders.
- **Uses:** HUD portrait and Wardrobe reference panel. Both share a CSS-only `steps(4, end)` animation. Perfect/Miss score applies an optional transient border reaction to the HUD only.
- **Not:** a replacement for the existing procedural 3D Melusina or a gameplay/save/loot/wardrobe appearance system. Equipment still changes stats as before.
- **Runtime:** relative assets under `resonant-wilds/`; v16 cache preloads the atlas for offline. Reduced-motion disables the animation.
- **To expand:** preserve the full original 4×4 source atlas, split/correct directions by pixel alignment, then add explicitly authored expressions and an outfit rendering contract. Verify on iPhone Safari before merging.

Proof: `node resonant-wilds/tools/check_canon_sprite_ui.mjs`.
