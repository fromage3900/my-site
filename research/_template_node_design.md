# Node design card

## generator_id

`GB_ZEN_EXAMPLE`

## inputs

- `gb_length`, `gb_width`, `gb_trim_mode`
- `genome.verticality` (optional)

## outputs

- mesh
- `surreal_snap_points`
- `surreal_trim_groups`

## dependencies

- `surreal_greybox._gb_box`
- `surreal_os.atoms.example_atom`

## data_flow

`props` → builder → `_gb_join` → `snap_export.attach_trim_metadata`

## perf_cost

low | medium | high

## generalization

Can this become a reusable path_segment_generator / modifier / YAML graph module?

## critique checklist

- [ ] taxonomy entry in `procedural_taxonomy.yaml`
- [ ] atom entry in `architectural_atoms.yaml`
- [ ] verify smoke in `_mcp_verify_overhaul.py`
