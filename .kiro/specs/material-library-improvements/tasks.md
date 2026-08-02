# Implementation Plan: Material Library Improvement

## Task Overview

This document outlines the implementation tasks for the Material Library Improvement project. Tasks are organized by priority and dependency order.

## Task Dependency Graph

```json
{
  "waves": [
    ["T1"],
    ["T2", "T6"],
    ["T3"],
    ["T4", "T5"]
  ]
}
```

---

## Tasks

- [ ] T1. Fix Universal Master Layering System — Implement sequential A→B→C layer blending with proper activation gating so LayerA and LayerB can be enabled simultaneously without canceling each other (file: `Content/Python/setup_master_universal.py`, requirement: R1)

- [ ] T2. Fix Nikki MF on Landscape Master — Add NikkiUVScale parameter (default 0.001) and use PixelNormalWS for normal inputs to make Nikki material functions work correctly on landscape geometry (file: `Content/Python/setup_landscape_height_blend.py`, requirement: R2)

- [ ] T3. Expand Water Master — Add Depth (DepthColorGradient, DepthOpacityFalloff, UnderwaterTint), Shoreline (ShorelineFadeDistance, FoamColor, bUseShorelineUV), and Surface (CausticSpeed, RippleIntensity, RippleScale, SpecularBoost) parameter groups to M_Water_Master_Grand_v6 (file: `Content/Python/setup_master_water.py`, requirement: R3)

- [ ] T4. Parameter Standardization — Audit and standardize parameter naming across all masters to follow consistent patterns: Layer{A/B/C}_{Property} for layer params, *Map suffix for textures (files: `setup_master_universal.py`, `setup_landscape_height_blend.py`, `setup_master_water.py`, requirement: R5)

- [ ] T5. Material Library Cleanup — Run audit_material_library.py, migrate Melodia/_PROJECT references to EnvSandbox, identify orphan textures, and clean up redirectors (requires: audit_material_library.py, fix_migration_redirectors.py, requirement: R4)

- [ ] T6. Substrate Toon BSDF Validation — Create validate_substrate_bsdf.py script to verify all masters wire to SubstrateToonBSDF correctly with BaseColor, Normal, Roughness, Metallic outputs and Front Material output path (file: `Content/Python/validate_substrate_bsdf.py`, requirement: R6)

---

## Implementation Details

### T1: Fix Universal Master Layering System

**Status:** Partially complete (2026-07-01 repair applied sequential lerp blending)

**Implementation Notes:**
- Layer channels now blend sequentially A to B to C, gated by layer activation
- Enabling an overlay no longer divides/dims Layer A when the overlay alpha is 0
- The `layer_channel_blend()` function uses `lerp3()` for sequential blending:
  ```python
  ab = lerp3(m, v_a, v_b, alpha_b_on, f"{tag}_ab", -200, y + 60)
  return lerp3(m, ab, v_c, alpha_c_on, f"{tag}_abc", 0, y + 60)
  ```

**Remaining Work:**
- [ ] Verify all 27 existing instances compile without errors
- [ ] Test layer combinations in Material Editor (LayerA only, LayerB only, A+B, A+B+C)
- [ ] Verify per-instance texture editing still works
- [ ] Check no loss of texture quality

**Files:** `Content/Python/setup_master_universal.py`, `Content/Python/run_force_universal.py`

---

### T2: Fix Nikki MF on Landscape Master

**Problem:** Nikki MF functions were designed for character rendering. Landscape uses different UV scale (LandscapeLayerCoords) and world-space normals.

**Implementation Steps:**

1. Add NikkiUVScale parameter:
   ```python
   nikki_uv_scale = lib.scalar_param(m, "NikkiUVScale", "Nikki", 0.001, px, py + 4200)
   nikki_uv_scaled = lib.create_expression(m, unreal.MaterialExpressionMultiply, x, y)
   lib.connect(layer_uv, "", nikki_uv_scaled, "A")
   lib.connect(nikki_uv_scale, "", nikki_uv_scaled, "B")
   ```

2. Scale UV input for Nikki MF chain (compensates for landscape UV being ~1000x larger)

3. Use PixelNormalWS for rim lighting calculations:
   ```python
   pixel_normal = lib.create_expression(m, unreal.MaterialExpressionPixelNormalWS, x, y)
   lib.connect(pixel_normal, "", irid_mf, "Normal")
   ```

4. Adjust default parameters: RimWidth 0.5 (landscape scale), SparkleThreshold 0.42

**Acceptance Criteria:**
- MF_NikkiSparkle produces correct sparkle pattern on landscape
- MF_NikkiRimGlow calculates proper rim lighting on terrain
- Performance overhead < 2ms when Nikki chain is active

**Files:** `Content/Python/setup_landscape_height_blend.py`

---

### T3: Expand Water Master

**New Parameter Groups:**

| Group | Parameters |
|-------|------------|
| Depth | DepthColorGradient, DepthOpacityFalloff, UnderwaterTint |
| Shoreline | ShorelineFadeDistance, FoamColor, bUseShorelineUV |
| Surface | CausticSpeed, RippleIntensity, RippleScale, SpecularBoost |

**Implementation:**
- Add parameters to `setup_master_water.py`
- Implement depth-based color gradient using MaterialExpressionDepthFade
- Implement UV-based shoreline fade using SmoothStep
- Implement animated caustics using Time node

**New Instance Presets:**
- MI_GrandWater_LagoonClear (tropical clear)
- MI_GrandWater_MysticalPool (high magical)
- MI_GrandWater_Rapids (fast flow, foam)
- MI_GrandWater_TropicalOcean (gradient depth)

**Files:** `Content/Python/setup_master_water.py`

---

### T4: Parameter Standardization

**Naming Conventions:**
- Layer parameters: `Layer{A/B/C}_{Property}` (e.g., LayerA_Albedo, LayerB_Normal)
- Texture parameters: `{Purpose}Map` suffix (e.g., AlbedoMap, NormalMap)
- Groups: Consistent names (Palette, Surface, Animation, etc.)

**Steps:**
1. Extract all parameters from Universal, Landscape, Water masters
2. Create parameter inventory document
3. Update scripts with consistent naming
4. Preserve backward compatibility with aliases

**Files:** `setup_master_universal.py`, `setup_landscape_height_blend.py`, `setup_master_water.py`

---

### T5: Material Library Cleanup

**Steps:**
1. Run `python Content/Python/audit_material_library.py`
2. Review `Saved/Audit/material_library_audit.json`
3. Create/execute migration script for Melodia → EnvSandbox paths
4. Handle orphan textures (preserve SDF/Textures/, delete confirmed orphans)
5. Clean up redirectors with `fix_migration_redirectors.py`

**Acceptance Criteria:**
- < 5 orphan textures
- < 50 Melodia/_PROJECT references
- Cleanup report generated

**Files:** `audit_material_library.py`, `migrate_material_paths.py`, `fix_migration_redirectors.py`

---

### T6: Substrate Toon BSDF Validation

**Create `validate_substrate_bsdf.py`:**
```python
"""Validate Substrate Toon BSDF wiring on all portfolio masters."""
import unreal

MASTERS = [
    "/Game/EnvSandbox/Materials/Masters/M_Master_Toon_Universal",
    "/Game/EnvSandbox/Materials/Masters/M_Master_Toon_Landscape_HeightBlend",
    "/Game/EnvSandbox/Materials/Masters/M_Water_Master_Grand_v6",
    "/Game/EnvSandbox/Materials/Masters/M_Master_Impressionist_Toon",
    "/Game/EnvSandbox/Materials/Masters/M_Master_Impressionist_Toon_Landscape",
]

def validate_bsdf(material_path: str) -> dict:
    # Check for SubstrateToonBSDF nodes
    # Verify BaseColor, Normal, Roughness, Metallic connections
    # Verify Front Material output
    pass
```

**Masters to Validate:**
- M_Master_Toon_Universal
- M_Master_Toon_Landscape_HeightBlend
- M_Water_Master_Grand_v6
- M_Master_Impressionist_Toon
- M_Master_Impressionist_Toon_Landscape

**Output:** `Saved/Audit/bsdf_validation.json`

---

## Progress Tracking

| Task | Status | Notes |
|------|--------|-------|
| T1 | Partial | Sequential lerp applied in 2026-07-01 repair |
| T2 | Not Started | Requires NikkiUVScale + PixelNormalWS |
| T3 | Not Started | Add Depth/Shoreline/Surface groups |
| T4 | Not Started | Audit and standardize naming |
| T5 | Not Started | Run audit, migrate paths |
| T6 | Not Started | Create validation script |

---

## Notes

- All tasks should be tested in a separate branch before merging to main
- Backup project before running `--force` rebuilds
- Document any deviations from this plan
- Update this document as tasks progress
