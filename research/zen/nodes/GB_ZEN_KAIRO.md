# Node design card

## generator_id

`GB_ZEN_KAIRO`

## inputs

- `gb_length`, `gb_width`, `gb_height`, `gb_wall_thick`, `gb_trim_mode`
- `genome.symmetry`, `genome.structural_logic`

## outputs

- mesh, `surreal_snap_points`, `surreal_trim_groups`

## dependencies

- `surreal_greybox._gb_box`, `atoms.kairo_cloister`

## data_flow

props → `build_zen_kairo` → join → snap_export

## perf_cost

low

## generalization

`cloister_segment_generator` for any column+eave atom set
