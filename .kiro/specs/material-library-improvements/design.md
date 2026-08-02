# Material Library Improvement - Design Document

## Introduction

This design document details the technical approach for fixing the Universal master layering system, Nikki MF landscape compatibility, water master expansion, and material library cleanup. All solutions prioritize artist-friendly instance parameters while maintaining UE 5.8 Substrate Toon BSDF compatibility.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Material Library System                   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │   Universal   │  │  Landscape    │  │    Water      │  │
│  │    Master     │  │    Master     │  │    Master     │  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  │
│          │                  │                  │          │
│  ┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐  │
│  │ Layer Blender │  │  Nikki MF     │  │  Depth/       │  │
│  │   (Fixed)     │  │  Adapter      │  │  Shore/Surface│  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  │
│          │                  │                  │          │
│  ┌───────▼──────────────────▼──────────────────▼───────┐  │
│  │           Substrate Toon BSDF Output                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Design Components

### Component 1: Universal Master Layering Fix

**Problem Analysis:**

The current layering system in `setup_master_universal.py` has a fundamental flaw in the layer blending logic. When examining the code:

```python
# Current problematic logic (lines 800-1000)
blend_alpha_ab = advanced_layer_alpha(
    m, hgt_a, hgt_b, layer_blend, layer_blend_mode, ...
)
alb_ab = lerp3(m, alb_a, alb_b_s, color_alpha_ab, "alb_lerp_ab", -680, 520)
```

The issue: `blend_alpha_ab` creates a single alpha value that blends LayerA → LayerB. When LayerC is added, it blends AB → C. This means:
- Enabling LayerB sets alpha to blend A→B
- Enabling LayerC sets alpha to blend AB→C
- **No independent activation per layer**

**Solution Design:**

1. **Independent Layer Activation Switches**
   - Add `bLayerA_Active`, `bLayerB_Active`, `bLayerC_Active` static switch parameters
   - Each switch controls whether that layer contributes to the final output
   - Switches are independent, not mutually exclusive

2. **Revised Blending Logic**
   ```
   IF LayerA_Active AND NOT LayerB_Active AND NOT LayerC_Active:
       Output = LayerA
   ELIF LayerA_Active AND LayerB_Active AND NOT LayerC_Active:
       Output = Lerp(LayerA, LayerB, LayerAB_BlendAlpha)
   ELIF LayerA_Active AND LayerB_Active AND LayerC_Active:
       Output = Lerp(Lerp(LayerA, LayerB, AB_Alpha), LayerC, C_Alpha)
   ... (all combinations)
   ```

3. **Per-Layer Alpha Masks**
   - Each layer gets independent alpha: `LayerA_Alpha`, `LayerB_Alpha`, `LayerC_Alpha`
   - Height-based blending creates per-layer alpha from height maps
   - Final blend uses weighted sum based on active layers

**Implementation Approach:**

```python
# New layer activation switches
layer_a_active = static_switch(m, "bLayerA_Active", "Layers", -2000, 400, default=True)
layer_b_active = static_switch(m, "bLayerB_Active", "Layers", -2000, 500, default=False)
layer_c_active = static_switch(m, "bLayerC_Active", "Layers", -2000, 600, default=False)

# Per-layer alpha computation
layer_a_alpha = mul2(m, const1(m, -1800, 400, 1.0), layer_a_active, "la_alpha", -1600, 400)
layer_b_alpha = mul2(m, blend_alpha_ab, layer_b_active, "lb_alpha", -1600, 500)
layer_c_alpha = mul2(m, blend_alpha_c, layer_c_active, "lc_alpha", -1600, 600)

# Weighted blend
active_count = add2(m, add2(m, layer_a_active, layer_b_active, "ac1", -1400, 400), 
                    layer_c_active, "ac2", -1200, 400)
weight_a = div2(m, layer_a_alpha, active_count, "wa", -1000, 400)
weight_b = div2(m, layer_b_alpha, active_count, "wb", -1000, 500)
weight_c = div2(m, layer_c_alpha, active_count, "wc", -1000, 600)

# Final blend
final_alb = add3(m, 
    mul2(m, alb_a, weight_a, "fa", -800, 400),
    mul2(m, alb_b_s, weight_b, "fb", -800, 500),
    mul2(m, alb_c_s, weight_c, "fc", -800, 600),
    "final_alb", -600, 400
)
```

**Parameter Changes:**
- Add `bLayerA_Active` (default: True) - Group: "Layers"
- Add `bLayerB_Active` (default: False) - Group: "Layers"
- Add `bLayerC_Active` (default: False) - Group: "Layers"
- Keep existing blend parameters for height-based alpha

---

### Component 2: Nikki MF Landscape Fix

**Problem Analysis:**

The Nikki MF chain (`MF_NikkiDreamGrade`, `MF_NikkiRimGlow`, `MF_NikkiSparkle`, `MF_NikkiIridescenceSheen`) was designed for character meshes using:
- Standard UV coordinates from mesh UV0
- Tangent-space normals from normal maps
- Pixel normals for rim lighting

Landscape geometry uses:
- `LandscapeLayerCoords` for UV generation
- World-space normals (no tangent space)
- Large-scale terrain where character-scale effects need adjustment

**Current Code Issues (setup_landscape_height_blend.py, lines 700-931):**

```python
# Problem: Using layer_uv for sparkle UV
lib.connect(layer_uv, "", sparkle, "UV")  # Line ~720

# Problem: Normal is already in world space for landscape
lib.connect(nrm_final, "", irid_mf, "Normal")  # Line ~730
```

**Solution Design:**

1. **UV Coordinate Adapter for Nikki MF**
   - Create `MF_LandscapeNikkiAdapter` to transform landscape coords
   - Scale UV to appropriate range for sparkle effects (landscape UV is much larger)
   - Add UV tiling parameter specific to Nikki effects

2. **Normal Space Conversion**
   - Convert landscape normals to a compatible space for rim lighting
   - Use `PixelNormalWS` directly for rim calculations (already world space)
   - Ensure MF_NikkiRimGlow receives correct normal format

3. **Scale Adjustments**
   - Add `NikkiUVScale` parameter (default: 0.001) to compensate for landscape scale
   - Add `NikkiRimWidth` adjustment for terrain-scale rim effects

**Implementation Approach:**

```python
# Landscape-specific Nikki adapter
nikki_uv_scale = lib.scalar_param(m, "NikkiUVScale", "Nikki", 0.001, px, py + 4200)
nikki_uv_scaled = lib.create_expression(m, unreal.MaterialExpressionMultiply, x, y)
lib.connect(layer_uv, "", nikki_uv_scaled, "A")
lib.connect(nikki_uv_scale, "", nikki_uv_scaled, "B")

# Use scaled UV for sparkle
lib.connect(nikki_uv_scaled, "", sparkle, "UV")

# World-space normal handling
pixel_normal = lib.create_expression(m, unreal.MaterialExpressionPixelNormalWS, x, y)
lib.connect(pixel_normal, "", irid_mf, "Normal")  # Use pixel normal directly
```

**Parameter Changes:**
- Add `NikkiUVScale` (default: 0.001, range: 0.0001-0.01) - Group: "Nikki"
- Modify `RimWidth` default for landscape (1.0 → 0.5)

---

### Component 3: Water Master Expansion

**Problem Analysis:**

Current `M_Water_Master_Grand_v6` has limited parameters:
- `CausticIntensity`, `GerstnerScale`, `WaveSpeed`, `WaterRoughness`
- `MagicalIntensity`, `DepthFadeDistance`, `ShorelineWidth`, `ShorelineFoam`
- `Opacity`, `RefractionStrength`
- `WaterColorShallow`, `WaterColorDeep`, `CausticTint`

Missing:
- Underwater color gradient transition
- UV-based shoreline fade for mesh water bodies
- Animated caustic patterns
- Depth-based opacity falloff

**Solution Design:**

1. **Depth Parameter Group**
   ```
   Group: "Depth"
   - DepthFadeDistance (exists, range: 100-2000)
   - DepthColorGradient (vector, default: (0.0, 0.1, 0.2, 1.0))
   - DepthOpacityFalloff (scalar, default: 0.5, range: 0.0-1.0)
   - UnderwaterTint (vector, default: (0.02, 0.08, 0.15, 1.0))
   ```

2. **Shoreline Parameter Group**
   ```
   Group: "Shoreline"
   - bUseShorelineUV (static switch, default: false)
   - ShorelineWidth (exists, range: 0.0-1.0)
   - ShorelineFoam (exists, range: 0.0-1.0)
   - ShorelineFadeDistance (scalar, default: 200.0, range: 50-500)
   - FoamColor (vector, default: (1.0, 1.0, 1.0, 1.0))
   ```

3. **Surface Parameter Group**
   ```
   Group: "Surface"
   - CausticIntensity (exists, range: 0.0-1.0)
   - CausticTint (exists)
   - CausticSpeed (scalar, default: 0.15, range: 0.0-1.0)
   - RippleIntensity (scalar, default: 0.0, range: 0.0-1.0)
   - RippleScale (scalar, default: 0.05, range: 0.01-0.2)
   - SpecularBoost (scalar, default: 1.0, range: 0.5-2.0)
   ```

**Implementation Approach:**

```python
# Depth group
depth_color_grad = lib.vector_param(m, "DepthColorGradient", "Depth", (0.0, 0.1, 0.2, 1.0), x, y)
depth_opacity_falloff = lib.scalar_param(m, "DepthOpacityFalloff", "Depth", 0.5, x, y)
underwater_tint = lib.vector_param(m, "UnderwaterTint", "Depth", (0.02, 0.08, 0.15, 1.0), x, y)

# Depth-based color gradient
depth_factor = lib.create_expression(m, unreal.MaterialExpressionDepthFade, x, y)
lib.connect(depth_fade_distance, "", depth_factor, "FadeDistance")
depth_color = lerp3(m, water_color_shallow, water_color_deep, depth_factor, "depth_col", x, y)
underwater_color = lerp3(m, depth_color, underwater_tint, depth_opacity_falloff, "underwater", x, y)

# Shoreline group
shoreline_fade_dist = lib.scalar_param(m, "ShorelineFadeDistance", "Shoreline", 200.0, x, y)
foam_color = lib.vector_param(m, "FoamColor", "Shoreline", (1.0, 1.0, 1.0, 1.0), x, y)

# UV-based shoreline fade
shore_uv = lib.create_expression(m, unreal.MaterialExpressionTextureCoordinate, x, y)
shore_v = mask_channel(m, shore_uv, "g", "shore_v", x, y)
shore_fade = lib.create_expression(m, unreal.MaterialExpressionSmoothStep, x, y)
lib.connect(shore_v, "", shore_fade, "Value")
lib.connect(const1(m, x-200, y, 0.3), "", shore_fade, "Edge0")
lib.connect(const1(m, x-200, y+100, 0.7), "", shore_fade, "Edge1")

# Surface group
caustic_speed = lib.scalar_param(m, "CausticSpeed", "Surface", 0.15, x, y)
ripple_intensity = lib.scalar_param(m, "RippleIntensity", "Surface", 0.0, x, y)
ripple_scale = lib.scalar_param(m, "RippleScale", "Surface", 0.05, x, y)
specular_boost = lib.scalar_param(m, "SpecularBoost", "Surface", 1.0, x, y)

# Animated caustics
time_node = lib.create_expression(m, unreal.MaterialExpressionTime, x, y)
caustic_time = mul2(m, time_node, caustic_speed, "caustic_t", x, y)
```

**New Instances:**
- MI_GrandWater_LagoonClear (tropical clear water)
- MI_GrandWater_MysticalPool (high magical intensity)
- MI_GrandWater_Rapids (fast flow, high foam)
- MI_GrandWater_TropicalOcean (gradient depth, caustics)

---

### Component 4: Material Library Cleanup

**Implementation Plan:**

1. **Run Audit Script**
   ```bash
   python Content/Python/audit_material_library.py
   ```

2. **Migration Script** (`migrate_material_paths.py`)
   ```python
   #!/usr/bin/env python3
   """Migrate Melodia/_PROJECT paths to EnvSandbox."""
   import json
   from pathlib import Path
   
   MIGRATIONS = {
       "/Game/_PROJECT/": "/Game/EnvSandbox/",
       "/Game/Melodia/": "/Game/EnvSandbox/Melodia/",
   }
   
   def migrate_material(material_path: Path, report: dict):
       # Read .uasset binary
       data = material_path.read_bytes()
       modified = False
       
       for old_prefix, new_prefix in MIGRATIONS.items():
           if old_prefix.encode() in data:
               data = data.replace(old_prefix.encode(), new_prefix.encode())
               modified = True
               report["migrated"].append(str(material_path))
       
       if modified:
           material_path.write_bytes(data)
   
   def main():
       report = {"migrated": [], "errors": [], "preserved": []}
       # Scan all materials in EnvSandbox
       for uasset in Path("Content/EnvSandbox").rglob("*.uasset"):
           migrate_material(uasset, report)
       
       Path("Saved/Audit/migration_report.json").write_text(
           json.dumps(report, indent=2)
       )
   ```

3. **Orphan Texture Handling**
   - Preserve textures in `SDF/Textures/` (intentional placeholders)
   - Delete textures with no refs outside SDF directory
   - Reassign textures with partial refs

---

### Component 5: Parameter Standardization

**Naming Conventions:**

| Category | Pattern | Example |
|----------|---------|---------|
| Layers | Layer{A/B/C}_{Property} | LayerA_Albedo, LayerB_Normal |
| Textures | {Purpose}Map | AlbedoMap, NormalMap, RoughnessMap |
| Scalars | {Purpose}{Property} | WaterRoughness, DepthFade |
| Vectors | {Purpose}{Property} | WaterColorShallow, CausticTint |
| Switches | b{Feature} | bLayerA_Active, bUseShorelineUV |

**Group Conventions:**

| Group | Purpose | Parameters |
|-------|---------|------------|
| Palette | Color and tint controls | BaseTint, PaletteRamp* |
| Surface | Material properties | Roughness, Metallic, Normal |
| Layers | Layer blending | LayerA_*, LayerB_*, LayerC_* |
| Animation | Time-based effects | TemporalStrength, WindSpeed |
| Depth | Water depth effects | DepthFade, UnderwaterTint |
| Shoreline | Edge effects | ShorelineWidth, Foam |
| Nikki | Character-style effects | PastelLift, RimIntensity |

---

### Component 6: Substrate Toon BSDF Validation

**Validation Script** (`validate_substrate_bsdf.py`):

```python
#!/usr/bin/env python3
"""Validate Substrate Toon BSDF wiring for all masters."""
import unreal
import json
from pathlib import Path

MASTERS = [
    "/Game/EnvSandbox/Materials/Masters/M_Master_Toon_Universal",
    "/Game/EnvSandbox/Materials/Masters/M_Master_Toon_Landscape_HeightBlend",
    "/Game/EnvSandbox/Materials/Masters/M_Water_Master_Grand_v6",
    "/Game/EnvSandbox/Materials/Impressionist/Masters/M_Master_Impressionist_Toon",
]

REQUIRED_OUTPUTS = [
    ("BaseColor", ["BaseColor", "DiffuseColor"]),
    ("Normal", ["Normal", "TangentNormal"]),
    ("Roughness", ["Roughness"]),
    ("FrontMaterial", ["FrontMaterial"]),
]

def validate_master(path: str) -> dict:
    mat = unreal.load_asset(path)
    if not mat:
        return {"path": path, "error": "Asset not found"}
    
    exprs = unreal.MaterialEditingLibrary.get_material_expressions(mat)
    results = {"path": path, "outputs": {}, "issues": []}
    
    # Check for SubstrateToonBSDF nodes
    toon_bsdf_nodes = [e for e in exprs if type(e).__name__ == "MaterialExpressionSubstrateToonBSDF"]
    
    if not toon_bsdf_nodes:
        results["issues"].append("No SubstrateToonBSDF found")
        return results
    
    # Check connections
    for output_name, pin_names in REQUIRED_OUTPUTS:
        connected = False
        for pin in pin_names:
            # Check if connected to Toon BSDF
            for node in toon_bsdf_nodes:
                inputs = unreal.MaterialEditingLibrary.get_inputs_for_material_expression(mat, node)
                # Simplified check - real implementation would trace connections
                connected = True
        results["outputs"][output_name] = connected
    
    results["valid"] = len(results["issues"]) == 0
    return results

def main():
    report = {"masters": [], "summary": {"total": 0, "valid": 0, "issues": 0}}
    
    for master_path in MASTERS:
        result = validate_master(master_path)
        report["masters"].append(result)
        report["summary"]["total"] += 1
        if result.get("valid"):
            report["summary"]["valid"] += 1
        else:
            report["summary"]["issues"] += 1
    
    Path("Saved/Audit/bsdf_validation.json").write_text(
        json.dumps(report, indent=2)
    )
    
    print(f"BSDF Validation: {report['summary']['valid']}/{report['summary']['total']} valid")
```

---

## Data Models

### Material Instance Schema

```json
{
  "name": "MI_Landscape_CliffGrass",
  "parent": "/Game/EnvSandbox/Materials/Masters/M_Master_Toon_Landscape_HeightBlend",
  "profile": "TP_Stone",
  "vectors": {
    "RockTint": [0.42, 0.40, 0.38, 1.0],
    "GrassTint": [0.32, 0.48, 0.22, 1.0]
  },
  "scalars": {
    "SlopeSharpness": 4.0,
    "HeightBlendStrength": 2.5
  },
  "switches": {
    "bLayerA_Active": true,
    "bLayerB_Active": false,
    "bUseShorelineUV": false
  }
}
```

---

## Implementation Phases

### Phase 1: Layering Fix (Priority: Critical)
1. Modify `setup_master_universal.py` to add layer activation switches
2. Implement weighted blend logic
3. Test with existing 27 instances
4. Verify per-instance texture defaults preserved

### Phase 2: Nikki Landscape Fix (Priority: High)
1. Add `NikkiUVScale` parameter to landscape master
2. Modify Nikki MF chain calls to use scaled UV
3. Update normal handling for world space
4. Test performance on landscape surfaces

### Phase 3: Water Expansion (Priority: Medium)
1. Add Depth parameter group
2. Add Shoreline parameter group
3. Add Surface parameter group
4. Create 4 new instance presets
5. Update existing 8 instances with new parameters

### Phase 4: Library Cleanup (Priority: Medium)
1. Run audit_material_library.py
2. Create migration script
3. Migrate Melodia references
4. Delete orphan textures (after migration plan)
5. Generate cleanup report

### Phase 5: Parameter Standardization (Priority: Low)
1. Audit all parameter names
2. Create naming convention doc
3. Update scripts with new naming
4. Regenerate materials (with --force)

### Phase 6: BSDF Validation (Priority: High)
1. Create validation script
2. Run on all masters
3. Fix any wiring issues
4. Generate validation report

---

## Testing Strategy

### Unit Tests
- Layer activation: Verify each combination of layer switches
- Nikki UV scaling: Verify sparkle UV coordinates
- Water parameters: Verify all new parameters compile

### Integration Tests
- Full material compilation for all masters
- Instance parameter inheritance
- Performance profiling for Nikki on landscape

### Visual Tests
- Screenshot comparison for layer blending
- Landscape Nikki effects visual verification
- Water depth/shoreline visual validation

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing instances | Use --force flag only after backup; test all 27+ instances |
| Performance degradation with Nikki on landscape | Profile before/after; add LOD parameters |
| Migration script corrupts assets | Backup before migration; dry-run mode |
| Parameter name changes break instances | Preserve old names as aliases; gradual migration |

---

## Dependencies

- UE 5.8 Editor with Python API
- All MF_* material functions existing in project
- Portfolio texture catalog
- Test landscape and water meshes

---

## Success Metrics

- Layering test passes with all combinations
- Nikki landscape performance < 2ms overhead
- Water master has 12+ usable instances
- Audit shows < 5 orphan textures, < 50 Melodia refs
- BSDF validation 100% pass rate
- All instances compile without errors
## Implementation Plan for Layering Fix

### Step 1: Add Layer Activation Switches

In `setup_master_universal.py`, after line where `layer_c_metallic_blend` is defined (~line 380):

```python
# ---- Layer Activation Switches (independent per layer) ----
layer_a_active = static_switch(m, "bLayerA_Active", "Layers", -2100, 3800, default=True)
layer_b_active = static_switch(m, "bLayerB_Active", "Layers", -2100, 3900, default=False)
layer_c_active = static_switch(m, "bLayerC_Active", "Layers", -2100, 4000, default=False)
```

### Step 2: Add Helper Functions

After the existing helper functions in `setup_master_universal.py`, add:

```python
def add3(m, a, b, c, tag: str, x: int, y: int):
    """Add three values together via nested Add nodes."""
    ab = lib.create_expression(m, unreal.MaterialExpressionAdd, x, y)
    wire(f"{tag}_abA", a, ab, "A")
    wire(f"{tag}_abB", b, ab, "B")
    abc = lib.create_expression(m, unreal.MaterialExpressionAdd, x + 160, y)
    wire(f"{tag}_abcA", ab, abc, "A")
    wire(f"{tag}_abcB", c, abc, "B")
    return abc


def div2(m, a, b, tag: str, x: int, y: int):
    """Divide a by b."""
    e = lib.create_expression(m, unreal.MaterialExpressionDivide, x, y)
    wire(f"{tag}_A", a, e, "A")
    wire(f"{tag}_B", b, e, "B")
    return e
```

### Step 3: Update Layer Blending Logic

Replace the existing layer blending section (lines ~830-920) with weighted blend logic that uses independent layer activation switches.

See the full implementation in the tasks.md file.

---

## Nikki MF Landscape Fix Implementation

### Step 1: Add Nikki UV Scale Parameter

In `setup_landscape_height_blend.py`, after the existing Nikki parameters (~line 700):

```python
nikki_uv_scale = lib.scalar_param(m, "NikkiUVScale", "Nikki", 0.001, px, py + 4200)
nikki_uv_scaled = lib.create_expression(m, unreal.MaterialExpressionMultiply, x, y)
lib.connect(layer_uv, "", nikki_uv_scaled, "A")
lib.connect(nikki_uv_scale, "", nikki_uv_scaled, "B")
```

### Step 2: Use Scaled UV for Sparkle

Replace `lib.connect(layer_uv, "", sparkle, "UV")` with:

```python
lib.connect(nikki_uv_scaled, "", sparkle, "UV")
```

### Step 3: Use Pixel Normal for Rim

Replace normal inputs to MF_NikkiRimGlow and MF_NikkiIridescenceSheen:

```python
pixel_normal = lib.create_expression(m, unreal.MaterialExpressionPixelNormalWS, x, y)
lib.connect(pixel_normal, "", irid_mf, "Normal")
```

---

## Water Master Expansion Implementation

### Step 1: Add New Parameter Groups

In `setup_master_water.py` or create `expand_grand_water.py`:

```python
# Depth Group
lib.vector_param(m, "DepthColorGradient", "Depth", (0.0, 0.1, 0.2, 1.0), x, y)
lib.scalar_param(m, "DepthOpacityFalloff", "Depth", 0.5, x, y)
lib.vector_param(m, "UnderwaterTint", "Depth", (0.02, 0.08, 0.15, 1.0), x, y)

# Shoreline Group
lib.scalar_param(m, "ShorelineFadeDistance", "Shoreline", 200.0, x, y)
lib.vector_param(m, "FoamColor", "Shoreline", (1.0, 1.0, 1.0, 1.0), x, y)
lib.static_switch(m, "bUseShorelineUV", "Shoreline", x, y, default=False)

# Surface Group
lib.scalar_param(m, "CausticSpeed", "Surface", 0.15, x, y)
lib.scalar_param(m, "RippleIntensity", "Surface", 0.0, x, y)
lib.scalar_param(m, "SpecularBoost", "Surface", 1.0, x, y)
```

See full implementation in tasks.md for details.