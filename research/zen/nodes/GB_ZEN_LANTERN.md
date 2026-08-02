# Node design card

## generator_id

`GB_ZEN_LANTERN`

## inputs

- `zen_lantern_height`, `zen_lantern_radius`, `zen_lantern_style`
- `gb_trim_mode`

## outputs

- mesh, `surreal_snap_points`, `surreal_trim_groups`

## dependencies

- `surreal_greybox._gb_box`, `atoms.stone_lantern_post`

## data_flow

props → `build_zen_lantern` → join → snap_export

## perf_cost

low

## generalization

`path_accent_generator` — tōrō rhythm along sando / roji graphs
