# Material Library Improvement - Requirements

## Introduction

This document outlines the requirements for comprehensive material library improvements to BS_GodFile. The improvements focus on fixing critical layering issues in the Universal master, resolving Nikki MF compatibility with landscapes, expanding water master capabilities, and improving overall material architecture.

## Glossary

| Term | Definition |
|------|------------|
| Substrate Toon BSDF | UE 5.8 material function for stylized toon rendering with PBR support |
| MF_Nikki* chain | Series of material functions for anime-style character shading (DreamGrade, RimGlow, Sparkle, IridescenceSheen) |
| Layer blending | Technique for combining multiple material layers using alpha values and height information |
| Parallax UV offset | Technique for creating depth illusion using height maps |
| Compositing caustics | Water light effects created by light refraction through surfaces |
| LandscapeLayerCoords | UE 5.8 landscape-specific coordinate system for UV generation |

## Requirements

### Requirement 1: Universal Master Layering System Fix

**User Story:** As a material artist, I want LayerA and LayerB to work simultaneously so that I can combine different surface textures without one layer canceling the other out.

**Acceptance Criteria:**
1. LayerA and LayerB can be enabled simultaneously without one canceling the other
2. Simultaneous mode SHALL only be available when both layers are actually active
3. Each layer maintains independent BaseColor, Normal, Roughness, Metallic, Height, and Parallax properties
4. Layer blending SHALL require both alpha masking AND height bias whenever layer blending is used
5. Layer activation parameters work correctly (LayerA_Activate, LayerB_Activate)
6. Instance parameter editing remains per-instance when layering is enabled
7. No loss of texture quality when multiple layers are active
8. Test SHALL fail if textures don't render even when layers are enabled

**Technical Notes:**
- Current implementation has a bug where enabling one layer cancels the other
- The issue is likely in the layer blending logic or switch parameter wiring
- Must preserve existing per-instance texture defaults for all 27 instances

### Requirement 2: Nikki MF Landscape Master Fix

**User Story:** As a landscape designer, I want the Nikki material functions to work correctly on landscape surfaces so that I can apply character-style effects to terrain.

**Acceptance Criteria:**
1. MF_NikkiDreamGrade works correctly on landscape geometry
2. MF_NikkiRimGlow calculates proper rim lighting on landscape normals
3. MF_NikkiSparkle creates appropriate sparkle effects with UV coordinates
4. MF_NikkiIridescenceSheen produces correct iridescent effects on terrain
5. Landscape-specific UV and normal handling SHALL be implemented before any Nikki MF functions work on landscapes
6. No performance degradation when Nikki MF chain is active on landscapes
7. Explicit performance testing SHALL be required when the Nikki MF chain is actively running on landscape surfaces

**Technical Notes:**
- Nikki MF functions were designed for character rendering
- Landscape requires different UV coordinate handling (LandscapeLayerCoords vs WorldPosition)
- Normal mapping differences between character and terrain surfaces

### Requirement 3: Water Master Expansion

**User Story:** As a environment artist, I want M_Water_Master_Grand_v6 to support expanded water effects so that I can create diverse water bodies without creating new masters.

**Acceptance Criteria:**
1. Depth effects (depth fade, underwater color gradient)
2. Shoreline effects (UV-based shoreline fade, foam)
3. Surface effects (caustics, specular highlights, ripple animation)
4. Maintain concise instance presets for common water types (more than 12 presets allowed to fully cover required effects)
5. Preserve M_Master_Toon_Water migration path (deprecated master)
6. All water instances compile and run without errors

**Technical Notes:**
- M_Master_Toon_Water is deprecated, all water must use M_Water_Master_Grand_v6
- Current instances: OceanDeep, RiverClear, PondStylized, SakuraPond, ShorelinePond, SwampMurk, WaterfallSheet, FrozenPond
- Need to add depth, shoreline, and surface as separate parameter groups

### Requirement 4: Material Library Cleanup

**User Story:** As a technical director, I want deprecated materials and orphan textures cleaned up so that the project remains maintainable.

**Acceptance Criteria:**
1. All Melodia/_PROJECT path references migrated to EnvSandbox
2. Orphan textures (no incoming refs) identified and either deleted or assigned
3. Duplicate texture names resolved with proper organization
4. Dead texture references removed from materials
5. Redirector assets cleaned up
6. Audit report generated with actionable recommendations
7. Assets marked as intentionally having zero references SHALL always be preserved during orphan texture cleanup
8. Orphan texture deletion SHALL be strictly prevented until migration plan exists
7. Strictly prevent all orphan texture deletion until migration plan exists
8. Always preserve assets marked as intentionally having zero references

**Technical Notes:**
- Use audit_material_library.py for systematic detection
- Preserve assets with intentional zero references (e.g., placeholders)
- Create migration plan before deletion

### Requirement 5: Parameter Standardization

**User Story:** As a material artist, I want consistent parameter naming across all masters so that I can quickly understand and use material properties.

**Acceptance Criteria:**
1. Layer parameters follow consistent naming (LayerA_*, LayerB_*)
2. All masters use consistent group naming (Palette, Surface, Animation, etc.)
3. Texture parameters follow naming convention (*Map suffix)
4. Scalar parameters SHALL have clear units and ranges; dimensionless parameters (opacity 0.0-1.0, blend factors) MAY have ranges without explicit units
5. Vector parameters have consistent alpha handling

**Technical Notes:**
- Review all parameter groups across Universal, Impressionist, and Water masters
- Document naming conventions in material_lib.py or separate style guide
- Create parameter validation script

### Requirement 6: Substrate Toon BSDF Validation

**User Story:** As a rendering engineer, I want to verify all Substrate Toon BSDF connections so that we ensure correct material output paths.

**Acceptance Criteria:**
1. All masters wire to SubstrateToonBSDF correctly
2. BaseColor, Normal, Roughness, Metallic outputs are properly connected
3. Front Material output path is verified for all masters
4. No legacy BaseColor-only output paths remain
5. Validation report generated for each master
6. BSDF validation test SHALL execute and pass before any audit runs
6. BSDF validation test SHALL run to verify 100% correct wiring regardless of current state
7. Block the audit when BSDF wiring is 100% complete

**Technical Notes:**
- UE 5.8 requires SubstrateToonBSDF for Toon materials
- Verify Material Property connections: MP_BASECOLOR, MP_NORMAL, MP_ROUGHNESS, MP_METALLIC
- Check Front Material connection path

## Constraints

1. **UE Version Compatibility**: Must work with UE 5.8 Substrate Toon system
2. **Backward Compatibility**: Existing instances must continue to work
3. **Performance**: No material complexity that impacts frame rate
4. **Artist Friendly**: Parameter UI must remain intuitive
5. **Auditability**: All changes must be tracked and reversible

## Dependencies

- UE 5.8 Substrate Toon BSDF
- MF_Nikki* material functions (DreamGrade, RimGlow, Sparkle, IridescenceSheen)
- MF_ParallaxCore, MF_NormalAdjust, MF_ColorRamp3 function libraries
- Portfolio texture catalog (portfolio_texture_catalog.py)
- PCG integration (for landscape materials)

## Out of Scope

1. Creating new material function libraries (existing MF_ functions are sufficient)
2. Changing texture catalogs (portfolio_texture_catalog.py already defined)
3. Modifying PCG graphs (material instances only)
4. Creating new water physics (visual water only)

## Acceptance Tests

1. **Layering Test**: Enable both LayerA and LayerB on universal master, verify both textures render simultaneously; test SHALL fail if textures don't render even when layers are enabled
2. **Nikki Landscape Test**: Apply MF_Nikki* chain to landscape master, verify visual output with proper UV/normal
3. **Water Expansion Test**: Verify all 8 water instances have proper depth/shoreline/surface parameters
4. **Audit Test**: Run audit_material_library.py, verify <5 orphan textures, <50 Melodia refs
5. **Parameter Test**: Verify parameter group naming consistency across all masters
6. **BSDF Test**: Run BSDF validation, verify 100% correct wiring; validation script SHALL always run regardless of current wiring state