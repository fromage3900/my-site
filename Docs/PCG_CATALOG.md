# PCG Library Catalog (live-tested 2026-06-22)

Live-tested every architectural graph in `_PROJECT/PCG/Graphs` by spawning a plain
PCGVolume per graph, generating in an open editor, and counting instances **after
async settle**. This corrects an earlier mis-audit (see Gotchas below).

## ✅ Working now — 14 (generate from a plain volume, no extra input)
| Graph | Instances |
|---|---|
| PCG_OvergrownRuins | 342 |
| PCG_EscherDecks | 281 |
| PCG_TerraceGarden | 211 |
| PCG_PenroseShrine | 160 |
| PCG_MeadowFalloff | 143 |
| PCG_BaroqueRuins | 134 |
| PCG_MelodiaForest | 121 |
| PCG_Cloister | 85 |
| PCG_FloatingStairways | 80 |
| PCG_BridgeArchipelago | 60 |
| PCG_CathedralNave | 50 |
| PCG_BaroqueColonnade | 48 |
| PCG_GreyboxBlockout | 43 |
| PCG_BaroqueEntryEx | 27 |

Also working elsewhere: `PCG_RockScatter` (31,500), `PCG_MeadowScatter` (1,742, now in `_Deprecated/`), `PCG_SakuraGrove`, `PCG_FoliageDensity`, `PCG_Sakura_Showcase`.

## ⚪ The "dead" 29 — NOT broken, each missing one specific input

**Need a spline actor** (scatter *along* a Bezier path → 0 without a spline):
PCG_BezierBridgeSpan, PCG_BezierCathedralAxis, PCG_BezierCloisterRing,
PCG_BezierColonnadeAvenue, PCG_BezierGardenPromenade, PCG_BezierOrnamentGallery,
PCG_BezierPathPortfolio, PCG_BezierSplineGarden, PCG_BezierVistaTerrace,
PCG_SplinePath, PCG_WallGardenPath, PCG_PortfolioTerraceBezier, PCG_PortfolioEnvironment
→ **Fix:** provide a spline (one pattern revives all).

**Depend on an empty subgraph** (`PCG_Sub_BaroqueSpawn` is empty, n=0):
PCG_EscherFloatingIslandEx, PCG_EscherGravityBridgeEx, PCG_EscherImpossibleArchEx,
PCG_EscherPenroseStairEx, PCG_BaroqueAtriumEx, PCG_BaroqueBalconyEx,
PCG_BaroqueColonnadeEx, PCG_BaroqueCorniceEx, PCG_BaroqueFacadeEx,
PCG_BaroqueNaveVaultEx, PCG_BaroquePilasterEx, PCG_BaroqueRotundaEx, PCG_GothicCorridorEx
→ **Fix:** fill the empty subgraph(s) they call (one fix revives the batch).

**Need a landscape:** PCG_MelodiaForest_Landscape → place on a landscape level.

**Check individually:** PCG_Balustrade, PCG_DreamWalls.

## Genuinely empty (rebuild or delete)
PCG_WallDetail (0 nodes), PCG_Greybox_Minimal (6 DensityFilters cull everything → 0),
PCG_Sub_BaroqueSpawn (empty subgraph), `_TEST_*` / `_DIAG_*` stubs.

## The fix plan — 3 leverage points, not 50 fixes
1. The 14 already work — place + use.
2. Fill `PCG_Sub_BaroqueSpawn` → revives the Escher/Baroque `*Ex` set (~13).
3. Provide a spline → revives the Bezier set (~12).

## ⚠️ Gotchas (why this looked broken before)
1. **`PCGComponent.generate(True)` is ASYNC** — counting instances in the same script returns 0; count in a SEPARATE call after it settles.
2. **No SurfaceSampler ≠ broken** — these use VolumeSampler / CreatePointsGrid (no landscape needed). Only meadow/grove need a landscape.
3. **Headless runs are structural-only** — never generate; everything logs 0. Needs an open editor.
4. **Batch-generating many dense graphs can OOM/crash the editor** — generate in small groups (the 43-volume catalog crash, after a prior VRAM warning).
