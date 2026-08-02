# Node design card

## modifier_id

`miouv_pack_invoke`

## class

Modifier (post-trim UV proxy workflow)

## inputs

- Active mesh with `surreal_arch_props` + trim groups / `uv_unwrap_mode=TRIM_SHEET`
- Optional MioUV addon (`bpy.ops.miouv.*`)

## outputs

- UV edit proxy mesh (evaluated GN bake)
- Invoked third-party pack operator when available

## dependencies

- `uv_workflow.create_uv_edit_proxy`, `uv_ops._invoke_addon_op`, `capabilities.is_available`

## data_flow

Generate → trim bake → Create UV Proxy → MioUV Pack → Commit UV from Proxy

## perf_cost

medium (evaluated mesh duplicate)

## generalization

`uv_pack_backend` modifier slot — MioUV / UVPackmaster / manual
