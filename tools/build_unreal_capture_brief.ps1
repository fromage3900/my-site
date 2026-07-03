param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$IntakePath = (Join-Path $Root 'generated\unreal_portfolio_intake.json')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $IntakePath)) {
  throw "Unreal intake not found: $IntakePath"
}

$intake = Get-Content -LiteralPath $IntakePath -Raw | ConvertFrom-Json
$briefPath = Join-Path $Root 'generated\unreal_capture_brief.json'
$markdownPath = Join-Path $Root 'application\unreal-capture-brief.md'

$sceneName = if ($intake.scene.scene_name) { $intake.scene.scene_name } else { 'Unreal portfolio scene' }
$genomeName = if ($intake.genome.genome) { $intake.genome.genome } else { 'ZEN_SHRINE_AXIS' }
$axisLabels = @($intake.genome.axis_steps | ForEach-Object { $_.label } | Where-Object { $_ })
if ($axisLabels.Count -eq 0) { $axisLabels = @('Torii', 'Sando', 'Kairo', 'Haiden') }

$slots = @(
  [ordered]@{
    id = 'shader-graph-meshblend-master'
    priority = 1
    destination_group = 'renders.breakdown'
    target_page = 'wix/shader-breakdowns.html'
    title = 'Universal Master MeshBlend graph plate'
    capture = 'Annotated Material Editor screenshot or beauty-plus-graph pair for M_Master_Toon_Universal with MeshBlend controls visible.'
    proves = 'Layered stylized environment materials can be explained as a production system, not just a beauty render.'
    preferred_filename = 'breakdown_shader_meshblend_master_1920x1080.png'
  },
  [ordered]@{
    id = 'space-cathedral-celestial-nebula'
    priority = 2
    destination_group = 'renders.breakdown'
    target_page = 'wix/shader-breakdowns.html'
    title = 'Space Cathedral celestial shader plate'
    capture = 'MI_Show_CelestialNebula material instance, starmap texture source, parallax nebula response, and one beauty crop.'
    proves = 'NASA starmap source work supports the Space Cathedral pillar with readable cosmic material language.'
    preferred_filename = 'breakdown_space_cathedral_celestial_nebula_1920x1080.png'
  },
  [ordered]@{
    id = 'niagara-sakura-ambience'
    priority = 3
    destination_group = 'renders.breakdown'
    target_page = 'wix/shader-breakdowns.html'
    title = 'Sakura Niagara ambience plate'
    capture = 'Niagara system viewport with particle settings, petal drift read, and final in-scene ambience crop.'
    proves = 'The Sakura Dream world has motion language and atmospheric VFX support beyond static composition.'
    preferred_filename = 'breakdown_niagara_sakura_ambience_1920x1080.png'
  },
  [ordered]@{
    id = 'pcg-shrine-axis-proof'
    priority = 4
    destination_group = 'renders.pcg'
    target_page = 'wix/render-constellation.html'
    title = 'ZEN_SHRINE_AXIS PCG route proof'
    capture = 'PCG graph or debug overlay paired with the heatmap and a final route beauty shot.'
    proves = 'Torii, Sando, Kairo, and Haiden route logic can control procedural dressing without harming traversal clarity.'
    preferred_filename = 'pcg_zen_shrine_axis_route_proof_1920x1080.png'
  },
  [ordered]@{
    id = 'baroque-escher-ornament'
    priority = 5
    destination_group = 'renders.breakdown'
    target_page = 'wix/shader-breakdowns.html'
    title = 'Baroque Escher ornament material plate'
    capture = 'MI_Baroque_EscherOrnament and gilded filigree variants as swatches, close-up trims, and one world-context crop.'
    proves = 'The Escher/math concept is tied to actual material families and modular environment ornamentation.'
    preferred_filename = 'breakdown_baroque_escher_ornament_1920x1080.png'
  },
  [ordered]@{
    id = 'nikki-surface-polish'
    priority = 6
    destination_group = 'renders.materials'
    target_page = 'wix/shader-breakdowns.html'
    title = 'Nikki-style surface polish plate'
    capture = 'Iridescence, sheen, sparkle, and soft pastel grading comparison across Sakura material instances.'
    proves = 'The surface direction is intentionally fashion-fantasy and Infold-adjacent while remaining original.'
    preferred_filename = 'materials_nikki_surface_polish_2048x2048.png'
  }
)

$acceptance = @(
  'Every capture should include one beauty read and one production-proof read when possible.',
  'Use filenames from preferred_filename or keep the id as the filename slug.',
  'Update portfolio_package.json so renders.breakdown, renders.pcg, or renders.materials consumes the new assets.',
  'Rerun tools/ingest_unreal_portfolio.ps1 after new captures land.',
  'Rerun tools/build_unreal_capture_brief.ps1 if the intake metadata changes.',
  'Rerun tools/validate_portfolio.ps1 before committing.'
)

$brief = [ordered]@{
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
  source_intake = 'generated/unreal_portfolio_intake.json'
  scene = $sceneName
  genome = $genomeName
  route_axis = $axisLabels
  current_readiness = $intake.readiness
  current_counts = $intake.counts
  incoming_drop_contract = [ordered]@{
    unreal_package = 'G:\EnvironmentPortfolio\BS_GodFile\Saved\Portfolio\portfolio_package.json'
    website_intake_script = 'tools/ingest_unreal_portfolio.ps1'
    website_asset_destination = 'generated/assets/unreal/'
    expected_render_groups = @('renders.breakdown', 'renders.pcg', 'renders.materials', 'renders.hero')
  }
  capture_slots = $slots
  acceptance_checks = $acceptance
}

$brief | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $briefPath -Encoding UTF8

$slotMarkdown = ($slots | ForEach-Object {
@"
## $($_.priority). $($_.title)
- Slot ID: `$($_.id)`
- Destination: `$($_.destination_group)`
- Target page: `$($_.target_page)`
- Preferred filename: `$($_.preferred_filename)`
- Capture: $($_.capture)
- Proves: $($_.proves)
"@
}) -join "`r`n"

$acceptanceMarkdown = ($acceptance | ForEach-Object { "- $_" }) -join "`r`n"
$axisText = $axisLabels -join ' / '
$markdown = @"
# Unreal Capture Brief

Generated from `generated/unreal_portfolio_intake.json` for Brennan Shepherd's Melodia portfolio system.

## Current Scene
- Scene: `$sceneName`
- Genome: `$genomeName`
- Route axis: `$axisText`
- Readiness: `$($intake.readiness.label)` / `$($intake.readiness.score)`
- Current web-ready plates: `$($intake.counts.renders_web_ready)` of `$($intake.counts.renders_total)`
- Material instances: `$($intake.counts.material_instances)`

## Capture Slots
$slotMarkdown

## Acceptance Checks
$acceptanceMarkdown

## Website Integration Steps
1. Add new captures to the Unreal `portfolio_package.json` under the matching render group.
2. Run `powershell -ExecutionPolicy Bypass -File .\tools\ingest_unreal_portfolio.ps1`.
3. Run `powershell -ExecutionPolicy Bypass -File .\tools\build_unreal_capture_brief.ps1`.
4. Run `powershell -ExecutionPolicy Bypass -File .\tools\validate_portfolio.ps1`.
5. Commit, push `main`, then push the same commit to `gh-pages`.
"@

$markdown | Set-Content -LiteralPath $markdownPath -Encoding UTF8
Write-Host "OK wrote $briefPath"
Write-Host "OK wrote $markdownPath"