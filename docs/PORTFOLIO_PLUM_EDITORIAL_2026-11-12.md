# Portfolio · Night Velvet / Plum editorial direction

**Date:** November 12, 2026  
**Authority:** User picked the third, dark plum visual concept instead of the light pearlescent variant.  
**Target:** `fromage3900/my-site` PR #97 on `portfolio/recruiter-first-cleanup-20261112`.

## Color tokens
| Role | Token | Value | Purpose |
|---|---|---|---|
| Canvas | `--folio-night` | `#1F141F` | Deep eggplant, **not navy** |
| Surface | `--folio-plum` | `#2D1D2E` | Main dark folio |
| Raised surface | `--folio-plum-raised` | `#38283A` | Gallery cards |
| Pearl ink | `--folio-pearl` | `#FFF1F4` | Titles & body |
| Secondary text | `--folio-muted` | `#D9C5D5` | Narrative copy |
| Rosé accent | `--folio-rose` | `#E9B8D0` | Eyebrows, links, small rules |
| Rosé deeper | `--folio-rose-deep` | `#D093B4` | Fine borders |
| Lilac | `--folio-lilac` | `#D2BDEB` | Secondary glow |
| Aqua glint | `--folio-aqua` | `#B9E7E1` | Focus & selected technical links |
| Pearl feature panel | `--folio-cream` | `#F6E7EE` | Single featured case-study shelf |

## Visual hierarchy
1. Header and primary canvas are dark plum, pink accents remain restrained.
2. Hero typography switches to artist name at display scale; the canonical line **“I build worlds that feel like songs.”** remains italic.
3. One real portfolio image stays dominant. No mockup/generated environments become shipping imagery.
4. The Faraway Mother case study becomes the single light rose-pearl panel; remaining four paths stay dark.
5. Original environment proof, fonts and accessibility remain intact. No Three.js toys restored.

## QA / review
- Source checks, link validation and desktop/mobile screenshots must pass after the commit.
- The prior light `melodia-lilac-editorial.css` stays on Git for rollback but is no longer loaded by these four pages.
- Do not merge to live `main` without visual approval; Wix is still a separate live shell.

This is a practical implementation, not a promise that mockup artwork exists in the game.