param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$PackagePath = 'G:\EnvironmentPortfolio\BS_GodFile\Saved\Portfolio\portfolio_package.json',
  [switch]$NoAssetCopy
)

$ErrorActionPreference = 'Stop'

function New-Slug {
  param([string]$Value)
  $slug = $Value.ToLowerInvariant() -replace '[^a-z0-9]+', '-'
  $slug = $slug.Trim('-')
  if ([string]::IsNullOrWhiteSpace($slug)) { return 'untitled' }
  return $slug
}

function Resolve-SourcePath {
  param([string]$Path)
  if ([string]::IsNullOrWhiteSpace($Path)) { return $null }
  $normalized = $Path -replace '/', '\'
  if (Test-Path -LiteralPath $normalized) { return (Resolve-Path -LiteralPath $normalized).Path }
  return $null
}

if (-not (Test-Path -LiteralPath $PackagePath)) {
  throw "Unreal portfolio package not found: $PackagePath"
}

$package = Get-Content -LiteralPath $PackagePath -Raw | ConvertFrom-Json
$packageRoot = (Resolve-Path -LiteralPath (Join-Path ([System.IO.Path]::GetDirectoryName($PackagePath)) '..\..')).Path
$assetDir = Join-Path $Root 'generated\assets\unreal'
if (-not $NoAssetCopy) { New-Item -ItemType Directory -Force -Path $assetDir | Out-Null }

$pcgHeatmapSource = Resolve-SourcePath -Path $package.pcg_heatmap.path
if (-not $pcgHeatmapSource -and $package.pcg_heatmap.path) {
  $candidate = Join-Path $packageRoot ($package.pcg_heatmap.path -replace '/', '\')
  if (Test-Path -LiteralPath $candidate) { $pcgHeatmapSource = (Resolve-Path -LiteralPath $candidate).Path }
}
$pcgHeatmapCopied = $false
$pcgHeatmapWebPath = $null
$pcgHeatmapLocalPath = $null
if ($pcgHeatmapSource -and -not $NoAssetCopy) {
  $heatmapDest = Join-Path $assetDir 'pcg-heatmap.png'
  Copy-Item -LiteralPath $pcgHeatmapSource -Destination $heatmapDest -Force
  $pcgHeatmapCopied = $true
  $pcgHeatmapWebPath = '../generated/assets/unreal/pcg-heatmap.png'
  $pcgHeatmapLocalPath = 'generated/assets/unreal/pcg-heatmap.png'
}

$renderCards = New-Object System.Collections.Generic.List[object]
$renderGroups = @('hero', 'materials', 'breakdown', 'pcg')
foreach ($group in $renderGroups) {
  $items = @($package.renders.$group)
  $index = 0
  foreach ($item in $items) {
    if ($null -eq $item) { continue }
    $index += 1
    $sourcePath = Resolve-SourcePath -Path $item.path
    $extension = [System.IO.Path]::GetExtension($item.filename)
    if ([string]::IsNullOrWhiteSpace($extension)) { $extension = '.png' }
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($item.filename)
    $slug = New-Slug "$group-$baseName"
    $destFile = "$slug$extension"
    $relativePath = "generated/assets/unreal/$destFile"
    $webPath = "../$relativePath"
    $copied = $false
    if ($sourcePath -and -not $NoAssetCopy) {
      Copy-Item -LiteralPath $sourcePath -Destination (Join-Path $assetDir $destFile) -Force
      $copied = $true
    }

    $role = if ($item.presentation -and $item.presentation.plate_role) { $item.presentation.plate_role } else { $group }
    $priority = switch ($group) {
      'hero' { 90 - $index }
      'materials' {
        if ($baseName -match 'families_review') { 10 - $index }
        elseif ($baseName -match 'showcase') { 88 - $index }
        else { 72 - $index }
      }
      'breakdown' { 82 - $index }
      'pcg' { 76 - $index }
      default { 50 }
    }
    $status = if ($copied) { 'web_ready' } elseif ($sourcePath) { 'source_found' } else { 'needs_capture' }
    $caption = switch ($group) {
      'hero' { 'Environment hero render for mood, composition, traversal read, and recruiter first impression.' }
      'materials' { 'Material showcase plate for shader family review, surface language, and look-development proof.' }
      'breakdown' { 'Technical breakdown capture slot for graph, system, or annotated Unreal proof.' }
      'pcg' { 'Procedural dressing or PCG proof slot for scatter logic, exclusions, density, and world-building controls.' }
      default { 'Portfolio render plate.' }
    }

    $renderCards.Add([ordered]@{
      id = $slug
      group = $group
      filename = $item.filename
      source_path = $item.path
      source_exists = [bool]$sourcePath
      copied = $copied
      web_path = if ($copied) { $webPath } else { $null }
      local_relative_path = if ($copied) { $relativePath } else { $null }
      width = $item.width
      height = $item.height
      aspect_ratio = $item.aspect_ratio
      plate_role = $role
      priority = $priority
      status = $status
      caption = $caption
    })
  }
}

$materials = @($package.materials)
$shaderFamilies = $materials | Group-Object shader_family | Sort-Object Count -Descending | ForEach-Object {
  [ordered]@{
    family = if ([string]::IsNullOrWhiteSpace($_.Name)) { 'Unsorted' } else { $_.Name }
    count = $_.Count
    sample_materials = @($_.Group | Select-Object -First 4 | ForEach-Object { $_.material_name })
    output_maps = @($_.Group | ForEach-Object { $_.output_maps } | ForEach-Object { $_ } | Where-Object { $_ } | Sort-Object -Unique)
  }
}

$totalRenders = $renderCards.Count
$webReady = @($renderCards | Where-Object { $_.copied }).Count
$missingBreakdown = @($renderCards | Where-Object { $_.group -eq 'breakdown' }).Count -eq 0
$missingPcg = @($renderCards | Where-Object { $_.group -eq 'pcg' }).Count -eq 0
$needs = New-Object System.Collections.Generic.List[string]
if ($missingBreakdown) { $needs.Add('Capture shader and Niagara breakdown plates into renders.breakdown.') }
if ($missingPcg) { $needs.Add('Capture PCG or procedural dressing proof into renders.pcg.') }
if ($webReady -lt $totalRenders) { $needs.Add('Confirm source paths for any render cards not copied into generated/assets/unreal.') }
if ($materials.Count -gt 0) { $needs.Add('Promote strongest shader families into dedicated material breakdown cards.') }

$score = 20 + ($webReady * 7) + [Math]::Min($materials.Count, 30)
if (-not $missingBreakdown) { $score += 15 }
if (-not $missingPcg) { $score += 10 }
$score = [Math]::Min(100, $score)
if ($missingBreakdown) { $score = [Math]::Min($score, 82) }
if ($missingPcg) { $score = [Math]::Min($score, 88) }
$readinessLabel = if ($webReady -ge 6 -and -not $missingBreakdown) { 'portfolio_ready' } elseif ($webReady -gt 0) { 'render_ready_needs_breakdowns' } else { 'needs_renders' }
$axisSteps = @($package.genome.axis_steps | ForEach-Object { $_.label } | Where-Object { $_ })
$axisText = if ($axisSteps.Count -gt 0) { $axisSteps -join ' / ' } else { 'Torii / Sando / Kairo / Haiden' }
$genomeName = if ($package.genome.genome) { $package.genome.genome } else { 'ZEN_SHRINE_AXIS' }
$pcgHeatmapHtml = if ($pcgHeatmapWebPath) { "<div class=`"thumb heatmap-thumb`"><img src=`"$pcgHeatmapWebPath`" alt=`"PCG heatmap showing procedural exclusion zones and shrine route logic`" /></div>" } else { '<div class="thumb heatmap-thumb"><span>PCG heatmap pending</span></div>' }
$latestSignals = @(
  [ordered]@{ title = 'MeshBlend master pass'; label = 'Universal master'; note = 'Additive MeshBlend support on M_Master_Toon_Universal gives the shader breakdown a stronger story around layered environment surfaces.' },
  [ordered]@{ title = 'NASA starmap shader'; label = 'Space Cathedral'; note = 'MI_Show_CelestialNebula now carries real celestial source work for constellation ramp, parallax nebula, and galaxy mood.' },
  [ordered]@{ title = 'Melusina trim texture pass'; label = 'Sakura Dream'; note = 'ZenTrim work connects real texture assets to the Sakura shrine material language instead of placeholder surface reads.' },
  [ordered]@{ title = 'Nikki surface polish'; label = 'Fashion fantasy'; note = 'Iridescence, sheen, sparkle, and soft pastel response expanded across Sakura material instances for a stronger Infold-adjacent finish.' },
  [ordered]@{ title = 'PCG alignment fix'; label = 'Procedural route'; note = 'Sakura showcase route logic now has a documented mesh-alignment fix and heatmap proof for exclusion zones.' }
)

$intake = [ordered]@{
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
  source_package = $PackagePath
  scene = $package.scene
  stats = $package.stats
  counts = [ordered]@{
    renders_total = $totalRenders
    renders_web_ready = $webReady
    hero = @($renderCards | Where-Object { $_.group -eq 'hero' }).Count
    materials = @($renderCards | Where-Object { $_.group -eq 'materials' }).Count
    breakdown = @($renderCards | Where-Object { $_.group -eq 'breakdown' }).Count
    pcg = @($renderCards | Where-Object { $_.group -eq 'pcg' }).Count
    material_instances = $materials.Count
    shader_families = @($shaderFamilies).Count
    assets = @($package.assets).Count
  }
  readiness = [ordered]@{
    label = $readinessLabel
    score = $score
    next_needs = @($needs)
  }
  genome = $package.genome
  pcg_heatmap = [ordered]@{
    source_path = $package.pcg_heatmap.path
    source_exists = [bool]$pcgHeatmapSource
    copied = $pcgHeatmapCopied
    web_path = $pcgHeatmapWebPath
    local_relative_path = $pcgHeatmapLocalPath
  }
  latest_unreal_signals = $latestSignals
  render_cards = @($renderCards | Sort-Object priority -Descending)
  shader_families = @($shaderFamilies)
  web_outputs = [ordered]@{
    intake_json = 'generated/unreal_portfolio_intake.json'
    dashboard = 'wix/render-constellation.html'
    asset_dir = 'generated/assets/unreal/'
  }
}

$intakePath = Join-Path $Root 'generated\unreal_portfolio_intake.json'
$intake | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $intakePath -Encoding UTF8

# NightShift plates live outside portfolio_package.json — merge from assets folder.
$nightshiftDir = Join-Path $Root 'generated\assets\nightshift'
if (Test-Path -LiteralPath $nightshiftDir) {
  $nightshiftFiles = @(
    @{ file = 'grid_cosmic_all.png'; group = 'materials'; caption = 'Nine cosmic SDF instance previews.'; priority = 96 },
    @{ file = 'grid_nikki_heroes.png'; group = 'materials'; caption = 'Nine Nikki-hero SDF previews.'; priority = 95 },
    @{ file = 'celestial_nebula_nasa_sphere.png'; group = 'breakdown'; caption = 'CelestialNebula with NASA star map.'; priority = 97 },
    @{ file = 'WP_SakuraDream_terrain.png'; group = 'hero'; caption = 'L_WP_SakuraDream terrain preview.'; priority = 94 },
    @{ file = 'WP_SpaceCathedral_terrain.png'; group = 'hero'; caption = 'L_WP_SpaceCathedral terrain preview.'; priority = 93 },
    @{ file = 'WP_BaroqueGrotto_terrain.png'; group = 'hero'; caption = 'L_WP_BaroqueGrotto terrain preview.'; priority = 92 },
    @{ file = 'WP_CosmicOrrery_terrain.png'; group = 'hero'; caption = 'L_WP_CosmicOrrery terrain preview.'; priority = 91 }
  )
  foreach ($ns in $nightshiftFiles) {
    $src = Join-Path $nightshiftDir $ns.file
    if (-not (Test-Path -LiteralPath $src)) { continue }
    $slug = New-Slug "nightshift-$($ns.file)"
    $renderCards.Add([ordered]@{
      id = $slug
      group = $ns.group
      filename = $ns.file
      source_path = $src
      source_exists = $true
      copied = $true
      web_path = "../generated/assets/nightshift/$($ns.file)"
      local_relative_path = "generated/assets/nightshift/$($ns.file)"
      priority = $ns.priority
      status = 'web_ready'
      caption = $ns.caption
    }) | Out-Null
  }
  $intake.render_cards = @($renderCards | Sort-Object priority -Descending)
  $intake.counts.renders_total = @($intake.render_cards).Count
  $intake.counts.renders_web_ready = @($intake.render_cards | Where-Object { $_.status -eq 'web_ready' }).Count
  $intake | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $intakePath -Encoding UTF8
}

# render-constellation.html is a Melodia shell hydrated by melodia-editorial.js — do not overwrite here.

$syncScript = Join-Path $PSScriptRoot 'sync_portfolio_audit.ps1'
if (Test-Path -LiteralPath $syncScript) {
  & $syncScript -Root $Root | Out-Host
}

$scanScript = Join-Path $PSScriptRoot 'scan_portfolio_renders.ps1'
if (Test-Path -LiteralPath $scanScript) {
  & $scanScript -Root $Root | Out-Host
  $catalogPath = Join-Path $Root 'generated\portfolio_render_catalog.json'
  if (Test-Path -LiteralPath $catalogPath) {
    $catalog = Get-Content -LiteralPath $catalogPath -Raw | ConvertFrom-Json
    foreach ($item in @($catalog.items | Where-Object { $_.status -eq 'web_ready' -and $_.web_path -and $_.filename -match '\.(png|jpe?g)$' })) {
      $exists = @($renderCards | Where-Object { $_.id -eq $item.id }).Count -gt 0
      if (-not $exists) {
        $renderCards.Add([ordered]@{
          id = $item.id
          group = $item.group
          filename = $item.filename
          source_path = $item.source_path
          source_exists = $true
          copied = [bool]$item.copied
          web_path = $item.web_path
          local_relative_path = ($item.web_path -replace '^\.\./', '')
          priority = [int]$item.priority
          status = 'web_ready'
          caption = $item.caption
        }) | Out-Null
      }
    }
    $intake.render_cards = @($renderCards | Sort-Object priority -Descending)
    $intake.counts.renders_total = @($intake.render_cards).Count
    $intake.counts.renders_web_ready = @($intake.render_cards | Where-Object { $_.status -eq 'web_ready' }).Count
    $intake | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $intakePath -Encoding UTF8
  }
}

try {
  $embedScript = Join-Path $PSScriptRoot 'build_melodia_embed_urls.ps1'
  if (Test-Path -LiteralPath $embedScript) {
    & $embedScript -Root $Root | Out-Null
  }
} catch {
  Write-Host "WARN could not generate Melodia embed URLs: $($_.Exception.Message)"
}

Write-Host "OK wrote $intakePath"
Write-Host "OK copied $webReady render assets into $assetDir"
Write-Host "STATUS $($intake.readiness.label) score=$($intake.readiness.score)"


