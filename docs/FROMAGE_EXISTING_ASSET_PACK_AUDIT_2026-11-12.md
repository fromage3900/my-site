# FROMΔGE — existing-asset product audit

**Date:** 2026-11-12  
**Sources:** connected GitHub repositories under `fromage3900`, read-only source inspection.  
**Status:** staging / verification only; nothing listed or published for sale.

## Immediate archive candidates

| Candidate | Repo/source | Actual source files found | What needs QA | Priority |
|---|---|---|---|---|
| OBS decorative overlays | `my-site/generated/products/obs-overlays/` | 7 full-screen overlay PNGs, 17 individual PNGs, preview PNG, README. ~4.6 MB | Multiple backgrounds look basic/transparent. The README mentions `obs-scene-collection.json`, which was not found in the folder. Real OBS scene installation and clean previews need testing. | Stage now; polish before sale |
| Twitch / stream emote elements | `my-site/generated/products/twitch-emotes/` | 135 sized/background PNGs, preview grid, README. ~0.6 MB | Not 135 unique designs; the README's count/labels need checking against the actual variants. Some thumbnails are extremely simple. Test alpha channels and Twitch size rules before claiming compatibility. | Stage now; consider free/low-cost bonus |
| Melodia postcard graphics | `my-site/generated/products/postcards/` | 12 front PNGs, 1 back PNG, preview, two instructions. ~20 MB | Sample world postcard inspected looks mostly blank. Bleed specification contradicts itself: README 0.25 inch; print_spec 0.125 inch. Print proof required. | Stage now, **not** sale-ready |
| Melodia phone wallpapers | `my-site/generated/products/wallpaper-packs/` | 84 PNGs across five themed collections, 3 device sizes; ~112 MB | Quality/provenance review, phone cropping and any source-art rights; no dedicated preview-grid guarantee. | Hold until curated |

The pre-existing `generated/products/build_summary.json` reports 238 *product exports* (135 emotes + 7 overlays + 84 wallpapers + 12 postcards). Counts include sizes and variants, not 238 unique asset designs. Extra source components and previews exist alongside these exports.

## Next technical-art products to investigate

1. **Fantasy textile texture set** — `my-site/wix/textures/pbr/`, 56 PNGs (~89.6 MB) including baroque lace, royal velvet, gilded brocade, gold embroidery, and celestial weaves. Four pairs of complete material families are exact file aliases (20 duplicate maps); six distinct five-map families remain (30 maps, ~10 MB). Package only the six distinct families. Verify repeatability, roughness/normal/height channel data, consistency, authorship, and true texel density before listing.
2. **Musical VFX alpha mini-pack** — `MelodiaTouchDesigner/td/grandmaster_melodia/assets/vfx_alphas/`, dozens of sprites, masks and flowmaps. Test alpha/transparency, UV orientation, naming, texture provenance, and rendering in Unreal/Unity before proposing a commercial pack. Exclude direct references to third-party studios in product names.
3. **Procedural ornament and trim bases** — `melodia-houdini/assets/trim_sculpt_base/` includes Blender and OBJ sources plus a Houdini limited-commercial scene and a small review render. The geometry exists but the visible hero proof is a simple grey relief test; original surface design and clear user-facing controls need work.
4. **Floral tools** — `MelodiaMelusinaV2/Tools/gen_flower_brooch_v10.py`, `deploy/surreal_arch/melodia_gn/trees.py`, and Kawaii GN nature generator source. The previously discussed `blooms.py` was **not located in GitHub's connected code search**; check your local machine before promising a working Blender flower product.
5. **Architectural props and 3D models** — several game-source GLBs/FBXs exist, but first separate original work from third-party packs, Tripo-sourced models, and internal game-only character assets. In particular **exclude** `my-site/wix/models/KB3D_ATL_*` from any redistributable package without explicit third-party resale permission.

## Sale-readiness gates

- Source file exists; bytes open correctly in intended software.
- Creation/provenance and ownership allow a standalone resale/distribution license.
- Buyer benefits from a clear, coherent pack; no placeholder, duplicate, or empty images.
- Final accurate cover previews, compatibility information, README and license.
- Clean download test after package creation.
- The creator confirms price, license, and release before Gumroad publication.

## Staging builder

`tools/build_fromage_review_packs.py` builds local ZIPs from the existing `generated/products/` directories without duplicating media in Git history. The builder fails on unexpected missing-file counts or invalid PNG headers, includes checksums/dimensions, and stamps **internal review only** in the ZIP. The branch workflow optionally uploads short-lived GitHub Actions artifacts for review, not products or releases.

**Recommendation:** Open the overlay and emote review archives first. Neither is ready to sell untouched. For a more distinctive professional 3D storefront, follow with a curated original VFX / stylized-material pack after authorship and artistic QA.