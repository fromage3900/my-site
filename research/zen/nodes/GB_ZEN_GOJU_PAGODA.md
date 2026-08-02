# Node design card

## generator_id

`GB_ZEN_GOJU_PAGODA`

## inputs

- `pagoda_tiers` (default 5 — goju-no-tō), `pagoda_base_radius`, `pagoda_tier_height`, `pagoda_taper`, `pagoda_roof_overhang`
- `gb_trim_mode`, `genome.verticality`

## outputs

- mesh, `surreal_snap_points`, `surreal_trim_groups`

## dependencies

- `surreal_greybox._gb_box`, `atoms.goju_pagoda_tower`

## data_flow

props → `build_zen_goju_pagoda` → join → snap_export

## perf_cost

low (stacked boxes)

## generalization

`tiered_tower_generator` with tier count + taper atom params
