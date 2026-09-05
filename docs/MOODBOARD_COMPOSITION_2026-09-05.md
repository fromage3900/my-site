# Melodia Portfolio Moodboard Composition

## Purpose

The public portfolio is composed as an authored visual moodboard, not an exhaustive asset browser.
New work must replace weaker work rather than continuously increasing page density.

The visual hierarchy is:

**image → feeling → world → object/detail → process → technical proof**

Technical systems are discoverable beneath the art rather than competing with it on first contact.

## Mathematical composition system

### Grid

Desktop uses a **13-column Fibonacci grid**.

Primary spans:
- **8 / 5** — dominant image beside supporting image
- **5 / 8** — inverse beat on the next group
- **3 / 5 / 3** — detail rhythm for ornament, props, macro crops
- **13** — occasional full-width breath

Responsive reductions:
- tablet: **8 columns**, favoring 5 / 3
- mobile: **5 columns**, favoring 3 / 2 and 4 / 1 offsets

### Image ratios

Preferred crop families:
- **1 : 1.618** — dominant portrait / tall editorial anchor
- **1.618 : 1** — world and architecture plates
- **4 : 5** — character, prop, sculpt, paper-study pins
- **1 : 1** — tactile macro details

Do not force a crop that damages the artwork. Mathematical ratios govern the board, not the source render.

### Phyllotactic rhythm

Phyllotaxis is used as a sequencing principle rather than a literal spiral.

Vertical offsets repeat through Fibonacci-sized beats:
- 2 units
- 3 units
- 5 units
- 8 units

This creates stagger and visual growth without random masonry or DOM reordering.

## Current selected board — 12 images

| Weight | Work | Source | Intended role |
|---|---|---|---|
| Anchor | Melusina beauty portrait | `generated/assets/character/melusina_cam_beauty_nikki_2026-08-13.png` | Primary human/character memory |
| Anchor | Sakura Dream establishing | `generated/assets/unreal/hero-hero-level-cam-hero-establishing-20260709-182314-1920x1080.png` | Primary world memory |
| Anchor | Sakura Dream full world | `generated/assets/unreal/scene-sakuradream-full.png` | Broad environment breath |
| Medium | Kaleido Nave / Space Cathedral | `generated/assets/nightshift/WP_SpaceCathedral_terrain.png` | Monumental architecture counterpoint |
| Medium | Fallen Moon | `generated/assets/unreal/level_fallen_moon.png` | Dark procedural-world counterpoint |
| Medium | Rose Window | `generated/assets/ornaments/rose_window_void_iri_beauty_34.png` | Iridescent ornamental anchor |
| Medium | Gazebo | `generated/assets/signature/gazebo1_komikaze_beauty_34.png` | Stylized architecture object |
| Pin | Violin | `generated/assets/props/violin_komikaze_beauty_34.png` | Musical object/detail |
| Pin | Vow Cross macro | `generated/assets/cross/cross_hero_macro_filigree.png` | Tactile filigree macro |
| Pin | Lissajous | `generated/assets/signature/lissajous_komikaze_beauty_34.png` | Procedural sculptural form |
| Paper fragment | Melusina design sketch | `generated/assets/character/melusina_design_sketch.png` | Hand/process trace |
| Paper fragment | Melusina sculpt profile | `generated/assets/sculpt/sculpt_melusina_profile.png` | Form/process trace |

## Homepage overture — 5 images

The homepage should remain smaller than Selected Art.

Current five:
1. Melusina beauty portrait — dominant
2. Sakura Dream establishing — supporting landscape
3. Rose Window — detail pin
4. Violin — object pin
5. Vow Cross macro — tactile pin

The homepage is a preview of the board, not a second gallery.

## Technical discovery

The homepage exposes only three technical gateways:

1. **Fallen Moon — Procedural World Systems**
2. **Material Atlas**
3. **Technical Art Atelier**

Operational dashboards, project-health views, model-evaluation pages, and recruiter-specific evidence remain deep-link/internal surfaces.

## Shared navigation

Shared visitor navigation prioritizes:
- Home
- Art
- Worlds
- Melodia
- About

The More menu prioritizes visual and art-facing depth:
- Render archive
- Sculpt breakdown
- Shader breakdowns
- Cosmic Orrery
- Material Atlas
- Technical Art Atelier

Architecture Hub and Echo Pipeline remain available through contextual technical links, not universal chrome.

## Selection rule for new renders

A new render enters the primary board only if it clearly improves one of these roles:

- stronger character memory
- stronger world establishing image
- stronger close detail
- stronger musical object
- stronger ornamental silhouette
- stronger hand/process fragment
- genuinely new visual temperature

Do **not** add:
- near-duplicate glam angles
- raw debug/capture plates
- dashboards
- generic material grids when a beauty/detail image already proves the same idea
- terrain thumbnails that are weaker than the current world plate
- technical proof that belongs in a breakdown page

The target is remembered images, not inventory completeness.


## Pixel-review correction — 2026-09-05

The first moodboard pass was subsequently reviewed against the actual published pixels rather than filenames alone. The visual review found that several legacy captures had inherited stronger labels than the image could support.

### Evidence corrections

| Previous public claim | Pixel-reviewed result | Action |
|---|---|---|
| Sakura Dream establishing | Dark violet terrain with cyan/emissive scatter; no visible shrine/petals | Reframed as **Emissive Terrain Study** |
| Full Sakura Dream environment | Violet rolling terrain mound/surface study | Reframed as **Violet Terrain Study** |
| Space Cathedral / Kaleido Nave terrain | Grey preview primitive over blurred green outdoor/HDRI test background | **Rejected as public world proof** |
| Fallen Moon environment | Grey preview primitive over blurred green outdoor/HDRI test background | **Rejected as public world proof** |
| Rose Window void-iridescent beauty | Flat blue frame; geometry/material not visible | **Rejected**; visible front plate promoted instead |
| Lissajous beauty | Empty/pale studio frame | **Rejected**; macro curve plate promoted instead |
| Melodia Violin beauty ¾ | Asset visible but weaker silhouette | Front plate promoted for asset evidence |
| Melusina concept / sculpt | Strong design/form evidence | Material passport explicitly **N/A / preview-only** |

### Current reviewed Selected Art evidence

1. Melusina Cam_Beauty — character/lookdev evidence; multi-zone surface description only.
2. Emissive Terrain Study — Unreal terrain/scatter evidence; canonical world identity unverified.
3. Violet Terrain Study — terrain form/surface evidence; not a finished Sakura beauty.
4. Sakura Surface Quartet — material-family evidence; exact sphere-to-instance mapping not encoded.
5. Sakura Stone-Path Surface — material preview; not an in-world route capture.
6. Rose Window front — asset + Komikaze Voronoi 3-tone metadata-backed material evidence.
7. Melusina Gazebo Variant — architecture/lookdev evidence; diagnostic-quality Voronoi 3-tone surface.
8. Melodia Violin front — asset + Komikaze The Wall metadata-backed material evidence.
9. Vow Cross filigree macro — strong visual surface evidence; exact hero-macro shader lineage remains conservative.
10. Lissajous macro — curve/form + metadata-backed Voronoi 3-tone evidence.
11. Melusina design sketch — concept/design evidence; no production material passport.
12. Melusina sculpt profile — sculpt/form evidence; neutral clay/MatCap is preview-only.

### Passport SSOTs

- `content/asset-passports.json` — asset identity and production-lineage registry.
- `content/material-passports.json` — technical material/shader registry with assignment confidence.
- `content/render-passports.json` — image-specific pixel-review verdict and asset/material links.
- `generated/passports/*.json` — generated production metrics remain authoritative where available.

A render is no longer allowed to inherit a world or material claim merely because its filename contains that name.
