# Figma ↔ site sync (2026-07-12 · Pass B)

**Grandmaster:** https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf/Untitled  
**AAA plan:** `../../Docs/MELODIA_FIGMA_AAA_SYSTEMS_PLAN_2026-07-12.md`  
**AAA board:** page 12 · node `37:319`  
**Code Connect map:** `../../pipeline/figma/code_connect_map.json` (now includes `umg` targets)  
**Upload manifest:** `../../pipeline/figma/figma_upload_manifest.json`

## This pass

| Mapping | Site / asset |
|---------|----------------|
| `AAA/SystemsBoard` | Docs plan · Figma `37:319` |
| `Stage/CharacterPassport` | `wix/melodia-stage-character.html` |
| `Game/Battle*` + lookbook shell | `wix/melodia-melusina.html` |
| `Game/BattleMobile/iOSPlay` | `.game-ui-ios-play` → UMG `WBP_Battle_Mobile` (missing) |
| Batch N atlas → web | `generated/assets/melodia-game-ui/*.png` (resynced from Source) |
| Type SSOT | Syne / Instrument Serif / Bricolage / Azeret only |

## AAA checklist

- [x] Melusina page shares lookbook / Nikki / shared nav language  
- [x] Type docs + Figma page 02 luxury SSOT  
- [x] Hub → Melusina → Specs / Loop cross-links  
- [x] Figma AAA Systems Board + MG lock  
- [x] Code Connect UMG path stubs  
- [ ] Publish clean `Game/*` library formally  
- [ ] `WBP_Battle_Mobile` authored in editor (`--create --mobile-first`)  
- [ ] Package → Figma upload automation (Pass D — do not claim)

## Operator steps

1. Polish portfolio / store shots on your side — page 09 waits on those.  
2. When Unreal idle: `py Content/Python/scaffold_melodia_wbp_atoms.py --create --mobile-first`  
3. Keep Code Connect selectors aligned with live CSS.  
4. Hard-refresh Melusina after atlas sync.

## Live URLs

- Melusina: https://fromage3900.github.io/my-site/wix/melodia-melusina.html  
- iOS play: https://fromage3900.github.io/my-site/wix/melodia-melusina.html?mode=ios  
- Hub: https://fromage3900.github.io/my-site/wix/application-hub.html  
- Specs: https://fromage3900.github.io/my-site/wix/design-specs.html#game-ui  
