# Social upload kit — Melodia (2026-07-11)

**Site:** https://fromage3900.github.io/my-site/  
**Crops:** `generated/social/` · rebuild: `python tools/build_social_upload_kit.py`  
**Policy:** `store_live` stays **false** — do not claim kits are for sale until Gumroad is live.

## Quick pick

| Channel | File | Size |
|---------|------|------|
| Link preview (OG / Discord / Slack) | `og-default.jpg` | 1200×630 |
| Instagram / Facebook feed | `stage_melusina__square_1080.jpg` | 1080×1080 |
| Stories / Reels / TikTok | `stage_melusina__story_1080x1920.jpg` | 1080×1920 |
| X / LinkedIn landscape | `stage_melusina__twitter_1600x900.jpg` | 1600×900 |
| Product teaser (ornament) | `ornament_plate__square_1080.jpg` | 1080×1080 |
| Desire object | `vow_cross__square_1080.jpg` | 1080×1080 |

Browse locally: open `wix/social-kit.html` after deploy.

## Captions (copy-paste)

### Stage / Melusina (portfolio)

```
Melusina on the Melodia Portfolio Stage — EEVEE beauty, Nikki iridescence, Magical Girl chrome.

Stage passport → https://fromage3900.github.io/my-site/wix/melodia-stage-character.html
Portfolio → https://fromage3900.github.io/my-site/

#Melodia #EnvironmentArt #UnrealEngine #Blender #StylizedArt #TechnicalArt
```

### Ornament kitbash (coming soon — no Buy CTA)

```
Gothic & baroque ornament kitbash for UE5 — 15 meshes, FBX ready. Store listing coming soon (not live yet).

Product page → https://fromage3900.github.io/my-site/wix/ornament-kitbash.html

#Kitbash #UE5 #EnvironmentArt #Gothic #Baroque #GameDev
```

### Vow Cross

```
Melusina Vow Cross — EEVEE + Komikaze desire-object plate.

Gallery → https://fromage3900.github.io/my-site/wix/hero-renders.html
```

### Game UI / iOS kit (craft, not store)

```
Melodia Melusina rhythm battle UI — Figma-synced sheet roll, grade pops, and portrait iOS lane kit.

Playable web → https://fromage3900.github.io/my-site/wix/melodia-melusina.html?mode=ios
Figma → https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf/Untitled
```

## Do / don't

- Do: link Stage, Game UI, commissions, ornament **product page**
- Don't: say “Buy now” / paste Gumroad until `store_live: true`
- Don't: post Melusina as a sellable character pack
- Credit Komikaze on NPR plates when relevant (DoubleGum / Superhive)

## Figma sync

Upload crops into Grandmaster slots via `pipeline/figma/figma_upload_manifest.json` (updated with Stage + social paths). Code Connect map includes Stage passport + iOS play shell.
