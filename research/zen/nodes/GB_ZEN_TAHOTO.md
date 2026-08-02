# Node design card

## generator_id

`GB_ZEN_TAHOTO`

## inputs

- `gb_width`, `gb_height`, `gb_wall_thick`, `gb_trim_mode`
- `zen_tahoto_roof_span` (eave overhang factor)

## outputs

- mesh, `surreal_snap_points`, `surreal_trim_groups`

## dependencies

- `surreal_greybox._gb_box`, `atoms.tahoto_treasure_tower`

## data_flow

props → `build_zen_tahoto` → join → snap_export

## perf_cost

low

## generalization

`treasure_tower_generator` — square mokoshi + drum + double-roof typology
