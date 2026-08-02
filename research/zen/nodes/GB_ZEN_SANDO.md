# Node design card

## generator_id

`GB_ZEN_SANDO`

## inputs

- `gb_length`, `gb_width`, `gb_wall_thick`, `gb_trim_mode`
- `genome.verticality`, `genome.ornament_density`

## outputs

- mesh, `surreal_snap_points`, `surreal_trim_groups`

## dependencies

- `surreal_greybox._gb_box`, `atoms.sando_approach`

## data_flow

props → `build_zen_sando` → join → snap_export

## perf_cost

low

## generalization

`path_segment_generator` with paving atom variants
