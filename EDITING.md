# Editing Melodia site copy & plates

> **Active recruiter P0:** [P0 Melusina render integration](docs/P0_MELUSINA_RENDER_WEBSITE_INTEGRATION_2026-09-07.md). The art/capture authority lives in the game repo's `Docs/Production/P0_MELUSINA_RENDER_AND_WEBSITE_BREAKDOWN_PLAN_2026-09-07.md`.

**You only need two files for most changes.**

| What | File |
|------|------|
| Text on recruiter-path pages | [`content/site-copy.json`](content/site-copy.json) |
| Which PNG shows where | [`content/site-plates.json`](content/site-plates.json) |

HTML under `wix/` is a **shell** on those pages (`data-copy` / `data-plate`). Prefer editing JSON.

## Drop in a new render

1. Save approved PNGs under `generated/assets/…` (Melusina stills: `generated/assets/character/`).
2. Use dated, role-specific names. For the current Unreal P0 prefer `melusina_ue58_b2_<shot>_YYYYMMDD_nn.png`.
3. **Pixel-review before promotion.** A filename does not authorize a hero role.
4. Record the image-specific verdict in `content/render-passports.json`.
5. Assign/update an explicit Melusina slot in `content/site-plates.json` only after the image is accepted.
6. Audit direct HTML/OG references and every `<picture><source srcset>` family.
7. Hard-refresh and verify desktop/mobile/social crops.

**Do not repurpose `index.hero` or `recruiter.hero` for Melusina.** Those generic slots currently carry the reviewed Night Bridge environment study. Use a Melusina-specific slot/reference for the character hero.

**Never assign** mauve blanks: `melusina_*_001.png` (solid color placeholders), or the rejected `melusina_cam_beauty_nikki_2026-08-13.png`.

## Change text

1. Open `content/site-copy.json`.
2. Edit the string under `pages.<page-key>…`.
3. Refresh. Keys match `data-copy="pages.…"` on the HTML.

Pages on this edit path: `index`, `recruiter-one-sheet`, `sakura-case-study`, `application-hub` (partial), ornament kitbash gate copy via catalog/`store_live`.

**Killed:** Melusina jewelry plate slot (stage.jewelry / glam_03 beauty twin).

## Forbidden claims (bangs-class)

Do not publish labels that outrun reality:

- Bangs plate / fringe section
- Kitbash **prices** or Buy while `generated/ornament_kitbash_catalog.json` → `store_live: false`
- “Product page live”, “15 FBX packed” unless export is actually done
- “Playable” / “Tonight” / “overnight” as shipping status
- Stage **v4** on live Melusina passport (use **v7 · EEVEE**)
- `project-name-hero.png` placeholders on live heroes
- Stale GN counts: **24/165**, **73 looks**, or 39/49/59 as the builder total (live is **165 / 12**, presets **33/165**, **100 looks**)
- Niagara 3D FLIP / Water V10 as the Melusina **hair solver** (cine is Geometry Cache Alembic 1–240 + Niagara drip; gameplay is `SK_MelusinaHair`)
- Blender idle as live (locomotion speed 0 is mocap `A_Melusina_Idle_Mocap_RootX`; Blender idle is on disk, not wired)
- Unreal **B2 Cam_Beauty** plates as published (git push of plates historically off)
- Live map `L_Melodia_Dreamstate` (merged into `L_KaleidoNave`)
- Genshin SDF as the shipped character look (hybrid Komikaze + UE Toon)
- Broken `WBP_MainMenu` fonts (Syne / Instrument Serif via `F_Melodia_UI` are live)

Verify: `python my-site-clean/tools/_verify_site_facts.py`

## Beauty retake → site

For the active UE5.8 P0, follow [the integration contract](docs/P0_MELUSINA_RENDER_WEBSITE_INTEGRATION_2026-09-07.md):

1. Render/audition in Unreal according to the game-repo P0 plan.
2. Reject weak frames before copying them into the public asset tree.
3. Add the approved hero to `content/render-passports.json`.
4. Promote an explicit Melusina website slot/reference.
5. Update public HTML + OG references + all responsive `srcset` sources.
6. Keep the 2026-08-13 bald plate rejected/history-only.
7. Verify 1440 desktop, 390 mobile and 1200×630 OG before deploy.

The Blender Stage v7 scripts remain useful for fallback/reference renders, but they are not the final Unreal B2 proof.

## Hair / AudVis image sequence → looping video

Do **not** upload the raw `melusina_glam_audvis_001.png####.png` dumps (~1 GB). Encode first:

```powershell
.\my-site-clean\tools\encode_melusina_loops.ps1
```

Outputs:
- `generated/assets/character-loops/melusina_glam_audvis.webm`
- `generated/assets/character-loops/melusina_glam_audvis_poster.png`
- `generated/character_loops_manifest.json`

Stage page `wix/melodia-stage-character.html` plays the loop (`autoplay loop muted`). Push WebM + manifest with the site (gh-pages), not the PNG sequence.

## Live site

GitHub Pages: `https://fromage3900.github.io/my-site/wix/`
