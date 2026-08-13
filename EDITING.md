# Editing Melodia site copy & plates

**You only need two files for most changes.**

| What | File |
|------|------|
| Text on recruiter-path pages | [`content/site-copy.json`](content/site-copy.json) |
| Which PNG shows where | [`content/site-plates.json`](content/site-plates.json) |

HTML under `wix/` is a **shell** on those pages (`data-copy` / `data-plate`). Prefer editing JSON.

## Drop in a new render

1. Save PNG under `generated/assets/…` (Melusina stills: `generated/assets/character/`).
2. Prefer dated names: `melusina_beauty_nikki_YYYYMMDD_nn.png` — **no T-pose keepers** on live heroes.
3. Assign a slot:

```bash
python Tools/assign_plate.py index.hero generated/assets/character/melusina_beauty_eevee_20260715c_01.png
python Tools/assign_plate.py recruiter.hero generated/assets/character/melusina_beauty_eevee_20260715c_01.png
python Tools/assign_plate.py list
```

4. Refresh the page (hard refresh if cached).

**Never assign** mauve blanks: `melusina_*_001.png` (solid color placeholders). The CLI refuses them.

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

1. Stage v7 GUI: `Tools/render_melusina_beauty_still.py`
2. `python Tools/assign_plate.py index.hero <new png>` (and other hero slots)
3. `python Tools/remount_melusina_plates.py --apply --passport`

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
