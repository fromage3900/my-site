# Node design card

## generator_id

`GB_ZEN_HAIDEN`

## inputs

- `gb_width`, `gb_depth`, `gb_height`, `gb_wall_thick`, `gb_trim_mode`
- `zen_genkan_rise` (platform step rise, default 0.45 m)
- `genome.verticality`, `genome.symmetry`

## outputs

- mesh, `surreal_snap_points`, `surreal_trim_groups`

## dependencies

- `surreal_greybox._gb_box`, `atoms.haiden_platform`

## data_flow

props → `build_zen_haiden` → join → snap_export

## perf_cost

low (boxes only)

## generalization

`worship_hall_generator` with platform atom + step module count param
