# Melodia UI Showcase Pack — 2026-09-23 (tonight)

**Freeze exception id:** `melodia-ui-showcase-kinetic-2026-09-23`  
(Already appended to `content/showcase-freeze.json` — include that file in the PR.)

**Soft freeze:** ACTIVE. PR only; Brennan merges with explicit “ship it”.

**Staging root (not Pages-primary):**  
`generated/assets/portfolio/melodia-ui-showcase-2026-09-23/`

**Pages-served public root (USE THESE URLs):**  
`wix/assets/melodia-ui/showcase-2026-09-23/`  
Live pattern: `https://fromageart.xyz/assets/melodia-ui/showcase-2026-09-23/<file>`

**Mirror:** `C:\EnvironmentPortfolio\BS_GodFile\Saved\SemesterEvidence\ui_lookdev\PORTFOLIO_SHOWCASE_2026-09-23`

**HTML target:** `wix/melodia-melusina.html` (existing Melodia Melusina case — no new route)

**Passport status:** none yet — Fromageart may add `content/render-passports.json` entries as `accepted` / supporting for SoftMG + Magical Artifact UI lookdev after visual QA. Until then: `passport: pending`.

## Pages 404 risk (read this)

Sep 23 TD AAA assets can 404 on Pages even when `raw` main is 200. Same risk if heroes stay only under `generated/`. **Promote via `wix/assets/…`** (done below). After PR merge + Pages deploy, verify each `.webp` returns 200 before soft-launch.

## Never publish

- `05_lens/_reference_lens_NOT_PUBLIC/` (third-party battle UI refs)
- Any Persona / Atlus IP wording in captions

## Public plates (wire in this order)

| # | Public file (prefer WebP) | site-plates key (proposed) | HTML slot | Caption (recruiter-safe) | Source staging | Passport |
|---|---------------------------|----------------------------|-----------|--------------------------|----------------|----------|
| 1 | `01_battle_rhythm_refined.webp` (+ .png) | `melodia.ui.rhythm_battle` | melodia-melusina.html · UI lookdev gallery · plate 1 | Melodia UI lookdev — SoftMG battle rhythm HUD | `01_rhythm_highway/T_Melodia_Figma_Game_BattleRhythmRefined.png` | pending |
| 2 | `02_softmg_kit.webp` | `melodia.ui.softmg_kit` | plate 2 | Melodia SoftMG rhythm kit — parchment, seals, highway | `01_…/T_Melodia_Figma_Game_SoftMG_Kit.png` | pending |
| 3 | `03_note_highway.webp` | `melodia.ui.note_highway` | plate 3 | Melodia note highway — SoftMG lane rhythm feedback | `01_…/T_Melodia_Figma_note_highway.png` | pending |
| 4 | `04_magical_girl_theme_ui_hero.webp` (card) · `04_magical_girl_theme_ui.webp` (full strip) | `melodia.ui.magical_artifact_theme` | plate 4 | Melodia Magical Artifact — Magical Girl Theme UI board | `02_…/T_Melodia_Figma_Redesign_UI_with_Magical_Girl_Theme.png` | pending |
| 5 | `05_magical_orrery.webp` | `melodia.ui.magical_orrery` | plate 5 | Melodia Magical Orrery — menu artifact lookdev | `02_…/T_Melodia_Figma_MagicalOrrery.png` | pending |
| 6 | `06_tokens_palette_board.webp` | `melodia.ui.tokens_palette` | plate 6 | Melodia design tokens — Champagne Gold `#C9A86A` SoftMG / Magical Artifact vocabulary | `04_tokens_palette/Melodia_Tokens_Palette_Board_2026-09-23.png` (hi-res regenerated) | pending |

### Final public URLs

- https://fromageart.xyz/assets/melodia-ui/showcase-2026-09-23/01_battle_rhythm_refined.webp
- https://fromageart.xyz/assets/melodia-ui/showcase-2026-09-23/02_softmg_kit.webp
- https://fromageart.xyz/assets/melodia-ui/showcase-2026-09-23/03_note_highway.webp
- https://fromageart.xyz/assets/melodia-ui/showcase-2026-09-23/04_magical_girl_theme_ui_hero.webp
- https://fromageart.xyz/assets/melodia-ui/showcase-2026-09-23/04_magical_girl_theme_ui.webp
- https://fromageart.xyz/assets/melodia-ui/showcase-2026-09-23/05_magical_orrery.webp
- https://fromageart.xyz/assets/melodia-ui/showcase-2026-09-23/06_tokens_palette_board.webp

## PR file allowlist (freeze exception scope)

1. `content/showcase-freeze.json` (exception `melodia-ui-showcase-kinetic-2026-09-23`)
2. `wix/assets/melodia-ui/showcase-2026-09-23/*` (public heroes only)
3. `generated/assets/portfolio/melodia-ui-showcase-2026-09-23/MANIFEST.md` + `LENS.md` + plates **01/02/04** only
4. `wix/melodia-melusina.html` (wire gallery)
5. Optional: `content/site-plates.json` keys `melodia.ui.*`
6. Optional: `content/render-passports.json` entries

## Gaps

- Magical Artifact v3 Closed→Settle discrete Figma state stills still missing (Smart Animate hand-wire). Stand-ins: Magical Girl Theme + Magical Orrery.
- Tokens board is a flat generative plate (~43 KB PNG / ~47 KB WebP at 2400×1350) — intentional swatch board, not a photo. Higher-res already refreshed for Fromageart.
