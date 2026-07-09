# Unreal Capture Brief

Generated from generated/unreal_portfolio_intake.json for Brennan Shepherd's Melodia portfolio system.

## Current Scene
- Scene: $sceneName
- Genome: $genomeName
- Route axis: $axisText
- Readiness: $(@{generated_at=2026-07-09T18:56:51.8971904Z; source_package=G:\EnvironmentPortfolio\BS_GodFile\Saved\Portfolio\portfolio_package.json; scene=; stats=; counts=; readiness=; genome=; pcg_heatmap=; latest_unreal_signals=System.Object[]; render_cards=System.Object[]; shader_families=System.Object[]; web_outputs=}.readiness.label) / $(@{generated_at=2026-07-09T18:56:51.8971904Z; source_package=G:\EnvironmentPortfolio\BS_GodFile\Saved\Portfolio\portfolio_package.json; scene=; stats=; counts=; readiness=; genome=; pcg_heatmap=; latest_unreal_signals=System.Object[]; render_cards=System.Object[]; shader_families=System.Object[]; web_outputs=}.readiness.score)
- Current web-ready plates: $(@{generated_at=2026-07-09T18:56:51.8971904Z; source_package=G:\EnvironmentPortfolio\BS_GodFile\Saved\Portfolio\portfolio_package.json; scene=; stats=; counts=; readiness=; genome=; pcg_heatmap=; latest_unreal_signals=System.Object[]; render_cards=System.Object[]; shader_families=System.Object[]; web_outputs=}.counts.renders_web_ready) of $(@{generated_at=2026-07-09T18:56:51.8971904Z; source_package=G:\EnvironmentPortfolio\BS_GodFile\Saved\Portfolio\portfolio_package.json; scene=; stats=; counts=; readiness=; genome=; pcg_heatmap=; latest_unreal_signals=System.Object[]; render_cards=System.Object[]; shader_families=System.Object[]; web_outputs=}.counts.renders_total)
- Material instances: $(@{generated_at=2026-07-09T18:56:51.8971904Z; source_package=G:\EnvironmentPortfolio\BS_GodFile\Saved\Portfolio\portfolio_package.json; scene=; stats=; counts=; readiness=; genome=; pcg_heatmap=; latest_unreal_signals=System.Object[]; render_cards=System.Object[]; shader_families=System.Object[]; web_outputs=}.counts.material_instances)

## Capture Slots
## 1. Universal Master Substrate graph plate
- Slot ID: $(System.Collections.Specialized.OrderedDictionary.id)
- Destination: $(System.Collections.Specialized.OrderedDictionary.destination_group)
- Target page: $(System.Collections.Specialized.OrderedDictionary.target_page)
- Preferred filename: $(System.Collections.Specialized.OrderedDictionary.preferred_filename)
- Capture: Annotated Material Editor screenshot for M_Master_Toon_Universal â€” layer stack, Nikki modulators, and Substrate toon BSDF tail visible.
- Proves: Stylized environment materials are one production system with readable instance scope, not ad-hoc one-offs.
## 2. Space Cathedral celestial shader plate
- Slot ID: $(System.Collections.Specialized.OrderedDictionary.id)
- Destination: $(System.Collections.Specialized.OrderedDictionary.destination_group)
- Target page: $(System.Collections.Specialized.OrderedDictionary.target_page)
- Preferred filename: $(System.Collections.Specialized.OrderedDictionary.preferred_filename)
- Capture: MI_Show_CelestialNebula material instance, starmap texture source, parallax nebula response, and one beauty crop.
- Proves: NASA starmap source work supports the Space Cathedral pillar with readable cosmic material language.
## 3. Sakura Niagara ambience plate
- Slot ID: $(System.Collections.Specialized.OrderedDictionary.id)
- Destination: $(System.Collections.Specialized.OrderedDictionary.destination_group)
- Target page: $(System.Collections.Specialized.OrderedDictionary.target_page)
- Preferred filename: $(System.Collections.Specialized.OrderedDictionary.preferred_filename)
- Capture: Niagara system viewport with particle settings, petal drift read, and final in-scene ambience crop.
- Proves: The Sakura Dream world has motion language and atmospheric VFX support beyond static composition.
## 4. ZEN_SHRINE_AXIS PCG route proof
- Slot ID: $(System.Collections.Specialized.OrderedDictionary.id)
- Destination: $(System.Collections.Specialized.OrderedDictionary.destination_group)
- Target page: $(System.Collections.Specialized.OrderedDictionary.target_page)
- Preferred filename: $(System.Collections.Specialized.OrderedDictionary.preferred_filename)
- Capture: PCG graph or debug overlay paired with the heatmap and a final route beauty shot.
- Proves: Torii, Sando, Kairo, and Haiden route logic can control procedural dressing without harming traversal clarity.
## 5. Baroque Escher ornament material plate
- Slot ID: $(System.Collections.Specialized.OrderedDictionary.id)
- Destination: $(System.Collections.Specialized.OrderedDictionary.destination_group)
- Target page: $(System.Collections.Specialized.OrderedDictionary.target_page)
- Preferred filename: $(System.Collections.Specialized.OrderedDictionary.preferred_filename)
- Capture: MI_Baroque_EscherOrnament and gilded filigree variants as swatches, close-up trims, and one world-context crop.
- Proves: The Escher/math concept is tied to actual material families and modular environment ornamentation.
## 6. Nikki-style surface polish plate
- Slot ID: $(System.Collections.Specialized.OrderedDictionary.id)
- Destination: $(System.Collections.Specialized.OrderedDictionary.destination_group)
- Target page: $(System.Collections.Specialized.OrderedDictionary.target_page)
- Preferred filename: $(System.Collections.Specialized.OrderedDictionary.preferred_filename)
- Capture: Iridescence, sheen, sparkle, and soft pastel grading comparison across Sakura material instances.
- Proves: The surface direction is intentionally fashion-fantasy and Infold-adjacent while remaining original.

## Acceptance Checks
- Every capture should include one beauty read and one production-proof read when possible.
- Use filenames from preferred_filename or keep the id as the filename slug.
- Update portfolio_package.json so renders.breakdown, renders.pcg, or renders.materials consumes the new assets.
- Rerun tools/ingest_unreal_portfolio.ps1 after new captures land.
- Rerun tools/build_unreal_capture_brief.ps1 if the intake metadata changes.
- Rerun tools/validate_portfolio.ps1 before committing.

## Website Integration Steps
1. Add new captures to the Unreal portfolio_package.json under the matching render group.
2. Run powershell -ExecutionPolicy Bypass -File .\tools\ingest_unreal_portfolio.ps1.
3. Run powershell -ExecutionPolicy Bypass -File .\tools\build_unreal_capture_brief.ps1.
4. Run powershell -ExecutionPolicy Bypass -File .\tools\validate_portfolio.ps1.
5. Commit, push main, then push the same commit to gh-pages.
