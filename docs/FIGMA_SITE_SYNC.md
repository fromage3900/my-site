# Figma ↔ site sync (2026-07-12 · Pass B)

**Grandmaster:** https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf/Untitled  
**AAA plan:** `../../Docs/MELODIA_FIGMA_AAA_SYSTEMS_PLAN_2026-07-12.md`  
**AAA board:** page 12 · node `37:319`  
**Code Connect map:** `../../pipeline/figma/code_connect_map.json`  
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
- [x] `WBP_Battle_Mobile` shell on disk (parent MelodiaMobileHUD)  
- [ ] Designer BindWidgets + LaneButtons + brushes (WidgetTree protected in UE 5.8 Python)  
- [ ] Package → Figma upload automation (Pass D — do not claim)

## Operator steps

1. Polish portfolio / store shots on your side — page 09 waits on those.  
2. When Unreal idle: `py Content/Python/scaffold_melodia_wbp_atoms.py --create --mobile-first`  
3. Keep Code Connect selectors aligned with live CSS.  
4. Hard-refresh Melusina after atlas sync.

## Live URLs

- Index: https://fromage3900.github.io/my-site/wix/index.html  
- Hub: https://fromage3900.github.io/my-site/wix/application-hub.html  
- Stage: https://fromage3900.github.io/my-site/wix/melodia-stage-character.html  
- Melusina: https://fromage3900.github.io/my-site/wix/melodia-melusina.html  
- iOS play: https://fromage3900.github.io/my-site/wix/melodia-melusina.html?mode=ios  
- Specs: https://fromage3900.github.io/my-site/wix/design-specs.html#game-ui  

---

## Status baseline (frozen 2026-07-15)

Live GitHub Pages is shippable for recruiter browsing. Tip SHAs at freeze time:

| Ref | SHA | Note |
|-----|-----|------|
| `origin/gh-pages` | `e0dd38f` (`e0dd38fed65f45f2a48c17ac473494ccfdcd497b`) | Escher graph + recruiter nav |
| `origin/main` | `3067891` (`30678916cd0d99cfd63b6cf25fe1e606acd0b376`) | Melusina lock polish: 4s hair loops, gilded ivory, home clearance |

**Checklist (live):** Worlds / Stage / Escher / Hub paths clear · glam `c_04`/`c_05` + beauty `c_01` · hair loops on stage · Capture Brief off recruiter paths · ivory bands + passport in-flow on home · Game UI page 12 / SheetMusicHUD / Batch O **out of scope** for DS sync.

---

## 2026-07-15 — Gilded ivory + lookbook foundations (DS sync)

**Scope:** Figma Grandmaster foundations only — no page-12 Game UI, no Melusina Blender/stage stomps, no full marketing redraw.

### Figma updates (`Yx8ud7n39NdWZvnNvo4Xlf`)

| Surface | Change |
|---------|--------|
| Variables `primitives` | `color/ivory/50`→`#fff8ee`, `/100`→`#f8ecd6`, `/200`→`#f3e6c8`; gold/300+500 reaffirmed; **astral unchanged** |
| Page **03 Atoms and Ornaments** | `Divider/Glyph` (`56:562`) — 5 variants astral/diamond/pipes/pipes-dot/pipes-spark |
| Page **03** | `Passport/Banner` (`56:563`) — in-flow passport chrome |
| Page **03** | `Band/IvoryLookbook` (`56:579`) — parchment + gold rule + MG rose/iris wash |
| Page **02** | Type samples already Syne / Instrument Serif / Bricolage / Azeret — left as live SSOT (Fraunces/Inter text styles remain doc-legacy) |

### Docs / connect

- `melodia-design-system/DESIGN-SYSTEM.md` §2.1 + §3.1 aligned to gilded ivory + portfolio type SSOT  
- `pipeline/figma/code_connect_map.json` — passport / ivory band / divider selectors  
- Live CSS source of truth: `wix/melodia-editorial-polish.css` (`--ivory-*`, `--divider-*`, `.pp-banner`, `.band.ivory`)
