# Node design card

## generator_id

`GB_ZEN_SAKURA_TORII`

## inputs

- `torii_width`, `torii_height`, `torii_post_radius`, `gb_trim_mode`
- `genome.torii_variant` = `sakura` (genome flag on `zen_shrine_v1` sakura walks)

## outputs

- mesh, `surreal_snap_points`, `surreal_trim_groups`

## dependencies

- `atoms.torii_frame` (variant), `atoms.sakura_torii_frame`, `build_zen_torii_gate` base structure

## data_flow

props → `build_zen_sakura_torii` → join → snap_export

## perf_cost

low

## generalization

`torii_frame` atom with `variant: sakura` drives blossom/petal trim overlays
