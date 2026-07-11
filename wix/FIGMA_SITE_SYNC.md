# Figma ↔ site sync (2026-07-11)

**Grandmaster:** https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf/Untitled  
**Code Connect map:** `../../pipeline/figma/code_connect_map.json` (from BS_GodFile root)  
**Upload manifest:** `../../pipeline/figma/figma_upload_manifest.json`

## This pass

| Mapping | Site / asset |
|---------|----------------|
| `Stage/CharacterPassport` | `wix/melodia-stage-character.html` |
| `Stage/DioramaPlate` | `generated/assets/character/melusina_diorama_beauty.png` |
| `Game/BattleMobile/iOSPlay` | `.game-ui-ios-play` |
| `Game/LanePress` (+ SkillChip / SafeArea / MobileTopBar) | `generated/assets/melodia-game-ui/` |
| `Social/OGDefault` | `generated/social/og-default.jpg` |
| `Shop/OrnamentKitbash` | `wix/ornament-kitbash.html` |

## Operator steps

1. Open Grandmaster → page 12 Game UI + Stage / Social frames.
2. Upload from `figma_upload_manifest.json` slots (Stage diorama, social crops, iOS atlas tiles).
3. Keep Code Connect selectors aligned with live CSS classes — do not invent new class names on the site without updating the map.
4. After CSS/HTML changes: hard-refresh live Pages, then screenshot Figma vs site for MG / Game UI / Stage.

## Live URLs

- Stage: https://fromage3900.github.io/my-site/wix/melodia-stage-character.html
- Melusina: https://fromage3900.github.io/my-site/wix/melodia-melusina.html
- iOS play: https://fromage3900.github.io/my-site/wix/melodia-melusina.html?mode=ios
- Social kit: https://fromage3900.github.io/my-site/wix/social-kit.html
