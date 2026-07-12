# Figma ↔ site sync (2026-07-12)

**Grandmaster:** https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf/Untitled  
**AAA plan:** `../../Docs/MELODIA_FIGMA_AAA_SYSTEMS_PLAN_2026-07-12.md`  
**Code Connect map:** `../../pipeline/figma/code_connect_map.json`  
**Upload manifest:** `../../pipeline/figma/figma_upload_manifest.json`

## This pass (Pass A — portfolio integration)

| Mapping | Site / asset |
|---------|----------------|
| `Stage/CharacterPassport` | `wix/melodia-stage-character.html` |
| `Game/Battle*` + lookbook shell | `wix/melodia-melusina.html` (fashion + soft MG + doors) |
| `Game/BattleMobile/iOSPlay` | `.game-ui-ios-play` |
| Specs ↔ Melusina | `wix/design-specs.html#game-ui` |
| Loop ↔ Melusina | `wix/melodia-gameplay-loop.html` |
| Hub door 04 | Game UI from `application-hub.html` |
| Type SSOT | Syne / Instrument Serif / Bricolage / Azeret only |

## AAA checklist (Figma + web)

- [x] Melusina page shares lookbook / Nikki / shared nav language  
- [x] Type docs no longer list Fraunces / Inter / Plex as Melodia SSOT  
- [x] Hub → Melusina → Specs / Loop cross-links  
- [ ] Publish clean `Game/*` + `MG/*` variants in Figma (Pass B)  
- [ ] `WBP_Battle_Mobile` + atlas bitmap bind (Pass C)  
- [ ] Package → Figma upload automation (Pass D — do not claim until wired)

## Operator steps

1. Open Grandmaster → page 12 Game UI + page 13 MG Chrome.
2. Keep Code Connect selectors aligned with live CSS — update map when classes change.
3. After site CSS/HTML changes: hard-refresh live Pages, screenshot Figma vs Melusina lookbook hero.
4. Never claim “auto-synced from portfolio package” until Pass D lands.

## Live URLs

- Hub: https://fromage3900.github.io/my-site/wix/application-hub.html  
- Melusina: https://fromage3900.github.io/my-site/wix/melodia-melusina.html  
- iOS play: https://fromage3900.github.io/my-site/wix/melodia-melusina.html?mode=ios  
- Specs: https://fromage3900.github.io/my-site/wix/design-specs.html#game-ui  
- Loop: https://fromage3900.github.io/my-site/wix/melodia-gameplay-loop.html  
- Stage: https://fromage3900.github.io/my-site/wix/melodia-stage-character.html  
