# Node design card

## generator_id

`GB_ZEN_HONDEN`

## inputs

- `gb_width`, `gb_depth`, `gb_height`, `gb_wall_thick`, `gb_trim_mode`
- `zen_honden_platform_rise` (sacred floor elevation)

## outputs

- mesh, `surreal_snap_points`, `surreal_trim_groups`

## dependencies

- `surreal_greybox._gb_box`, `atoms.honden_sanctuary`

## data_flow

props → `build_zen_honden` → join → snap_export

## perf_cost

low

## generalization

`sanctuary_core_generator` — enclosed moya + engawa margin + deep noki
