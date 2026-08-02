---
sessionId: session-260630-234413-10zv
---

# Requirements

### Overview & Goals
Expand the PCG scatter pipeline from 2 biome styles (Sakura, Baroque) to 7 by adding Forest, Desert, Coastal, Alpine, and Urban biomes. Simultaneously unblock 13 dead `*Ex` graphs and 12 dead Bezier graphs by filling `PCG_Sub_BaroqueSpawn` and adding a spline provider helper.

### Scope
**In Scope:**
- Fill `PCG_Sub_BaroqueSpawn` subgraph (volume-sampler → spawner chain)
- Add `setup_spline_provider()` helper for Bezier graph input
- Implement `PCG_WallDetail` as a real spline-tagged wall scatter (replacing current passthrough stub)
- Add 11 new `SCATTER_MESHES` roles and 10–15 new `STYLE_PRESETS` entries across 5 biomes
- Create 5 new `setup_pcg_<biome>.py` wrapper scripts following `setup_pcg_sakura.py` pattern
- Update `build_all()`, audit scripts, and documentation

**Out of Scope:**
- Art-quality meshes (all biomes use engine basic shapes / greybox placeholders)
- PCGEx plugin development
- New levels or landscape work
- Material instance creation for biome-specific looks

# Technical Design

### Current Implementation
- **`pcg_portfolio_standards.py`** (318 lines): Defines `SCATTER_MESHES` (7 roles), `STYLE_PRESETS` (6 entries), `PRESETS` (3 entries), graph path constants, `ALL_PORTFOLIO_DIRS`, `PCG_PYTHON_OWNERS`, seed constants. All biome data lives here.
- **`pcg_graph_builder.py`** (494 lines): Core graph construction — `wire_scatter_chain()`, `load_or_create_graph()`, `configure_spawner()`, `add_node()`, `apply_transform()`. No spline provider or baroque spawn helpers exist.
- **`setup_pcg_universal.py`** (258 lines): `build_all()` orchestrates foliage/rock/exclusion/wall/style graphs. `build_style_graphs()` iterates `STYLE_PRESETS` and calls `wire_scatter_chain()` for each. `build_wall_detail()` is a passthrough stub (line 152–162).
- **`setup_pcg_sakura.py`** (107 lines): Reference biome wrapper — imports standards + builder, calls `build_all()` if rebuild, spawns PCG actors, writes audit JSON, has CLI `main()` with `UnrealEditor-Cmd` fallback.

### Key Decisions
1. **Same `wire_scatter_chain` for all biomes** — biomes differ only in preset parameters (density, voxel, meshes, materials, scale, jitter). No new graph builder needed.
2. **Biome = STYLE_PRESET entries + scatter mesh roles + wrapper script** — each biome adds 3–5 entries to `STYLE_PRESETS` and corresponding mesh role lists.
3. **Spline provider pattern** — a shared `setup_spline_provider()` helper in `pcg_graph_builder.py` that spawns a tagged spline actor, reviving all 12 Bezier graphs.
4. **Fill `PCG_Sub_BaroqueSpawn`** — wire a minimal volume-sampler → spawner chain using existing Baroque collection meshes, unblocking 13 `*Ex` graphs.

### Proposed Changes

#### `pcg_portfolio_standards.py`
- Add `SCATTER_MESHES` roles: `canopy`, `undergrowth`, `deadwood`, `cactus`, `dune_grass`, `driftwood`, `kelp`, `alpine_shrub`, `snow_debris`, `rubble`, `ivy`
- Add `STYLE_PRESETS` entries for Forest (`forest_canopy`, `forest_undergrowth`, `forest_deadwood`), Desert (`desert_cactus`, `desert_dune_grass`), Coastal (`coastal_driftwood`, `coastal_kelp`), Alpine (`alpine_shrub`, `alpine_snow_debris`), Urban (`urban_rubble`, `urban_ivy`)
- Add `DIR_STYLES` subdirectories: `Forest`, `Desert`, `Coastal`, `Alpine`, `Urban`
- Add `GRAPH_*` constants for new biome graphs
- Add `PCG_PYTHON_OWNERS` entries mapping new graphs to their wrapper scripts
- Add `ALL_PORTFOLIO_DIRS` entries for new style directories
- Add seed constants: `SEED_CANOPY`, `SEED_UNDERGROWTH`, etc.

#### `pcg_graph_builder.py`
- Add `setup_spline_provider(level, tag, points)` — spawns a spline actor with `PCG_Spline` tag
- Add `fill_baroque_spawn_subgraph(force)` — wires `PCG_Sub_BaroqueSpawn` with volume-sampler → transform → spawner using Baroque collection meshes
- Upgrade `build_wall_detail(force)` — replace passthrough stub with spline-tagged wall scatter chain (sampler → transform → spawner)

#### New files: `setup_pcg_forest.py`, `setup_pcg_desert.py`, `setup_pcg_coastal.py`, `setup_pcg_alpine.py`, `setup_pcg_urban.py`
- Each follows `setup_pcg_sakura.py` pattern: imports `pcg_portfolio_standards` + `pcg_graph_builder`, filters `STYLE_PRESETS` by biome key prefix, calls `build_style_graphs()`, writes audit JSON to `Saved/Audit/`
- Headless CLI entry point (`main()` with `UnrealEditor-Cmd` subprocess fallback)

#### `setup_pcg_universal.py`
- `build_all()` extended to call `fill_baroque_spawn_subgraph()` and include new biome style graphs

#### Audit scripts (`audit_pcg_portfolio.py` / `audit_pcg_universal.py`)
- Inventory checks expanded to cover new biome graph paths and style directories

### Risks
- **Placeholder meshes** — all new biomes use engine basic shapes until art meshes are imported; visual quality is greybox-only
- **Editor OOM** — generating many dense biome graphs simultaneously can crash; batch in small groups
- **PCGEx availability** — exclusion falloff depends on `PCGExDistanceFilterProviderSettings`; fallback passthrough already exists in `wire_scatter_chain`

# Delivery Steps

###   Step 1: Unblock existing dead graphs
All 13 *Ex graphs and 12 Bezier graphs become functional.

- Add `fill_baroque_spawn_subgraph(force)` to `pcg_graph_builder.py` — wires `PCG_Sub_BaroqueSpawn` with volume-sampler → transform → spawner chain using `SMC_Baroque` collection meshes
- Add `setup_spline_provider(level, tag, points)` to `pcg_graph_builder.py` — spawns a tagged spline actor (`PCG_Spline`) for Bezier graph input
- Replace `build_wall_detail()` passthrough stub in `setup_pcg_universal.py` (lines 152–162) with a real spline-tagged wall scatter chain: sampler → transform → spawner with `ruin` role
- Update `build_all()` in `setup_pcg_universal.py` to call `fill_baroque_spawn_subgraph()`

###   Step 2: Expand standards with biome presets and mesh roles
`pcg_portfolio_standards.py` contains all constants, presets, and mesh roles for 5 new biomes.

- Add 11 new `SCATTER_MESHES` roles: `canopy`, `undergrowth`, `deadwood`, `cactus`, `dune_grass`, `driftwood`, `kelp`, `alpine_shrub`, `snow_debris`, `rubble`, `ivy` — each with engine basic shape placeholders
- Add `STYLE_PRESETS` entries: `forest_canopy`, `forest_undergrowth`, `forest_deadwood`, `desert_cactus`, `desert_dune_grass`, `coastal_driftwood`, `coastal_kelp`, `alpine_shrub`, `alpine_snow_debris`, `urban_rubble`, `urban_ivy` — each with density, voxel_cm, role, scale, seed, and notes
- Add directory constants (`DIR_FOREST`, `DIR_DESERT`, `DIR_COASTAL`, `DIR_ALPINE`, `DIR_URBAN`) as `DIR_STYLES` subdirs
- Add `GRAPH_*` constants for each new biome graph
- Add seed constants: `SEED_CANOPY`, `SEED_UNDERGROWTH`, `SEED_DEADWOOD`, `SEED_CACTUS`, `SEED_DUNE_GRASS`, `SEED_DRIFTWOOD`, `SEED_KELP`, `SEED_ALPINE_SHRUB`, `SEED_SNOW_DEBRIS`, `SEED_RUBBLE`, `SEED_IVY`
- Add `PCG_PYTHON_OWNERS` mappings and `ALL_PORTFOLIO_DIRS` entries for all new biome directories

###   Step 3: Create biome wrapper scripts
Five new `setup_pcg_<biome>.py` scripts exist, each following the `setup_pcg_sakura.py` pattern.

- Create `setup_pcg_forest.py` — filters `STYLE_PRESETS` by `forest_` prefix, calls `build_style_graphs()` for canopy/undergrowth/deadwood layers, writes audit JSON to `Saved/Audit/forest_pcg_build.json`
- Create `setup_pcg_desert.py` — builds cactus and dune grass scatter layers
- Create `setup_pcg_coastal.py` — builds driftwood and kelp scatter layers
- Create `setup_pcg_alpine.py` — builds alpine shrub and snow debris scatter layers
- Create `setup_pcg_urban.py` — builds rubble and ivy scatter layers
- Each script: imports `pcg_portfolio_standards` + `pcg_graph_builder`, has `build_all(rebuild, spawn)` and `main()` with `UnrealEditor-Cmd` subprocess fallback matching `setup_pcg_sakura.py` lines 77–105

###   Step 4: Update universal builder and audit pipeline
The full build and audit pipeline covers all biomes end-to-end.

- Update `setup_pcg_universal.py` `build_all()` to invoke new biome style graphs via `build_style_graphs()` (new presets are automatically picked up from `STYLE_PRESETS`)
- Update `audit_pcg_portfolio.py` inventory checks to include new biome graph paths and style directories
- Update `audit_pcg_universal.py` to validate new graph existence
- Update `init_unreal.py` editor menu entries to add per-biome build commands
- Update `PCG_PORTFOLIO_PLAN.md` and `PCG_CATALOG.md` documentation with new biome inventory