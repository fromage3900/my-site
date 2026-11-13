# FROMΔGE — Map-Pack Wave 02 (source-based candidates)

**Prepared:** 2026-11-12 | **Status:** research/staging only. No sales, no redistribution license granted.

## Packaging rule
Use **three or six distinct, purposeful maps per release**, not six duplicate variants or an arbitrary mixture of channels. Keep all channels of one PBR material bundled together. Separate render previews from usable source maps. Every map requires image dimensions, bit depth, hash, color space, intended software, tile/seam QA, provenance, and test proof.

## Product 01 — Cymatic Field Kit (3-map seed)
**Repo:** private `fromage3900/melodia-herald` | `exports/capstone/textures/`

| Candidate | Intended role | Condition |
|---|---|---|
| `T_Faraway_ChladniDisplacement_16f.png` | acoustic displacement / height field | File present; verify true 16-bit depth and no clipping |
| `T_Faraway_SparkleCurvature_Mask.png` | packed curvature, AO, sparkle, height | File present; explain RGBA packing and extract single channels if needed |
| `T_Faraway_FlowDirection_VMap.png` | 2D flow direction field | File present; explain remap and tangent convention |

**Source:** `scripts/python/melodia_herald/benchmarks/copernicus_faraway.py`. That code uses NumPy/PIL and is not proof of a Houdini COP cook. The suite description mentions a silk normal, but no such output appears among currently tracked texture files. Do not call this a conventional 3-map PBR material or an actual COP-generated product without further evidence.

## Product 02 — Harmonic Sigils (3 stencil-mask seed)
**Repo:** private `fromage3900/MelodiaTouchDesigner` | `td/grandmaster_melodia/assets/vfx_alphas/`

| Candidate | Intended role | Condition |
|---|---|---|
| `T_Alpha_Rune_BaroqueFiligree.png` | ornamental white-on-black stencil | Visually inspected; thin linework; assess use as ZBrush alpha |
| `T_Alpha_Rune_HarmonicStaff.png` | musical geometric stencil | Visually inspected; linework, centered |
| `T_Alpha_Rune_MusicalClefScroll.png` | musical flourish stencil | Visually inspected; linework, centered |

Five thematically related rune images are available (also `T_Alpha_Rune_PianoKeyMatrix.png`, `T_Alpha_Rune_SoundwavePulse.png`), but do **not** pad a six-pack with a normal map or third-party texture just for the count. A sixth original mask requires separate QA.

**Do not label as ZBrush sculpting alpha yet:** these are VFX stencil masks, and thin hard white lines may create poor sculpted displacement without antialiasing/falloff/16-bit processing. Test actual strokes at different ZIntensities on a subdivided plane and obtain source/rights confirmation.

## Product 03 — Artist Sculpting Alphas (3- and 6-map editions)
**Status:** block on finding source 16-bit stamps or regenerating originals from design references.

Library visual references found:
- `Melodia Sculpt and Brush Alpha Pack.png` (one presentation sheet, not separated 16-bit files);
- `Sculpting Alpha Stamp Portfolio.png` (one portfolio board, not separated 16-bit stamps);
- `Ornamental Melodia Relief Alpha Collection.png`, `Melodia Ornamental Relief Alpha Sheet.png`, `Grayscale Sculpting Alpha Texture Sheet.png` (inspect as references; not verified brush-ready assets).

Choose **3-sample**: gouache edge, petrified lace, cymatic relief. Choose **6-pack** after QA: plus carved acanthus curl, stippled/pitted erosion, flowing strata. Design references do not establish downloadable, redistributable alphas. Final grayscale images must have true displacement information and appropriate bit depth; render brush-on-plane proof.

## Substance Designer source recovery (not a SKU yet)
- Repo `fromage3900/MelodiaMelusinaV2` has `Docs/Audits/HandpaintPrep_2026-09-23/MelusinaSmartMaterial/designer/SBS_Melusina_SimpleDiffuse/SBS_Melusina_SimpleDiffuse.sbs`.
- Three adjacent `_ref_*.sbs` graphs are references/dependencies, not three additional owner-created sale materials.
- `Content/Python/inventory_substance_sources.py` points at local `Imports/SubstanceSource` and an `F:` rhinestone archive; ownership and licenses must be checked, **never resell third-party archives**.
- A file tree cannot prove a Designer graph opens, renders or has working output maps.

## Luna recovery lane
See `fromage3900/melodia-houdini#2` for read-only recovery against the November 10 COP/flipbook inventory, local `C:/`, `D:/`, `G:/` histories, dependency provenance and confirmed source file paths.

## Publication gates
- [ ] Identify creator and redistribution rights for every map. Explicitly exclude Jonas Ronnegard paid ornament alphas and provenance-pending `Alphas_Sparkles` content.
- [ ] Inspect each actual raster: dimensions, native bit depth, alpha/channel usage, dynamic range, consistency, hashes.
- [ ] Verify seam/tiling for textures that claim seamlessness, and identify if stamps are non-tiling.
- [ ] Test in ZBrush/Blender/Houdini/UE as advertised; record proof rather than assuming file existence is a working product.
- [ ] Confirm Gumroad price/license with owner, privately attach final buyer downloads, then verify buyer download.
- [ ] Add only verified published SKUs to `content/assets-catalogue.json` in a separate reviewable PR. No live site or Gumroad publish here.

**No buyer-ready ZIP, store listing or guarantee is implied by this research memo.**