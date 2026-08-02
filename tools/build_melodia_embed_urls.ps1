param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$IntakePath = (Join-Path $Root 'generated\unreal_portfolio_intake.json'),
  [string]$ManifestPath = (Join-Path $Root 'generated\deployment_manifest.json'),
  [string]$CaptureBriefPath = (Join-Path $Root 'generated\unreal_capture_brief.json')
)

$ErrorActionPreference = 'Stop'

function Get-Obj {
  param([object]$Value, [string]$Name)
  if ($null -eq $Value) { throw "Missing required object: $Name" }
  return $Value
}

function Escape-QueryValue {
  param([string]$Value)
  if ($null -eq $Value) { return '' }
  return [System.Uri]::EscapeDataString($Value)
}

function Json-Query {
  param([object]$Value, [int]$Depth = 20)
  return ($Value | ConvertTo-Json -Compress -Depth $Depth)
}

function New-Url {
  param(
    [string]$Base,
    [hashtable]$Params
  )
  if ([string]::IsNullOrWhiteSpace($Base)) { throw 'Base URL is empty.' }
  if (-not $Params -or $Params.Count -eq 0) { return $Base }

  $pairs = New-Object System.Collections.Generic.List[string]
  foreach ($key in ($Params.Keys | Sort-Object)) {
    $value = $Params[$key]
    if ($null -eq $value) { continue }
    if ($value -is [string] -and [string]::IsNullOrWhiteSpace($value)) { continue }
    $pairs.Add("$key=$(Escape-QueryValue -Value ([string]$value))")
  }

  if ($pairs.Count -eq 0) { return $Base }
  return "${Base}?$($pairs -join '&')"
}

if (-not (Test-Path -LiteralPath $IntakePath)) {
  throw "Unreal intake not found: $IntakePath"
}
if (-not (Test-Path -LiteralPath $ManifestPath)) {
  throw "Deployment manifest not found: $ManifestPath"
}

$intake = Get-Content -LiteralPath $IntakePath -Raw | ConvertFrom-Json
$manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
$brief = $null
if (Test-Path -LiteralPath $CaptureBriefPath) {
  $brief = Get-Content -LiteralPath $CaptureBriefPath -Raw | ConvertFrom-Json
}

$components = Get-Obj -Value $manifest.components -Name 'deployment_manifest.components'

$baseHero = [string]$components.melodiaHeroEmbed
$basePassport = [string]$components.melodiaPassportEmbed
$baseBreakdown = [string]$components.melodiaBreakdownCard
$baseProcessFlow = [string]('https://fromage3900.github.io/my-site/wix/layout-process-flow.html')
$basePerformance = [string]('https://fromage3900.github.io/my-site/wix/card-performance.html')
$baseBadge = [string]('https://fromage3900.github.io/my-site/wix/badge-data-status.html')
$baseGraphMeta = [string]('https://fromage3900.github.io/my-site/wix/info-graph-metadata.html')

$sceneName = if ($intake.scene -and $intake.scene.scene_name) { [string]$intake.scene.scene_name } else { 'Unreal Portfolio Scene' }
$engine = if ($intake.scene -and $intake.scene.engine) { [string]$intake.scene.engine } else { 'Unreal Engine' }

$triangles = $intake.stats.triangle_count
$drawCalls = $intake.stats.draw_calls
$uniqueMaterials = $intake.stats.unique_materials
$uniqueMeshes = $intake.stats.unique_meshes

$passportUrl = New-Url -Base $basePassport -Params @{
  theme = 'dark'
  project = $sceneName
  category = if ($intake.scene.environment_type) { [string]$intake.scene.environment_type } else { 'Environment' }
  version = 'v1.0'
  triangles = $triangles
  drawcalls = $drawCalls
  materials = $uniqueMaterials
  engine = $engine
  date = if ($intake.scene.timestamp) { ([string]$intake.scene.timestamp).Substring(0,7) } else { '' }
}

$heroUrl = New-Url -Base $baseHero -Params @{
  theme = 'dark'
  kicker = '3D Environment & Technical Art'
  title = 'Brennan Shepherd'
  sub = 'Stylized worlds with production proof'
}

$performanceUrl = New-Url -Base $basePerformance -Params @{
  triangleCount = $triangles
  drawCalls = $drawCalls
  materialCount = $uniqueMaterials
  textureCount = $null
  textureResolution = $null
}

$needsBadgeUrl = New-Url -Base $baseBadge -Params @{
  status = if ($intake.readiness -and $intake.readiness.score -ge 90) { 'present' } else { 'partial' }
  label = 'Portfolio data'
}

$axisLabels = @()
if ($intake.genome -and $intake.genome.axis_steps) {
  $axisLabels = @($intake.genome.axis_steps | ForEach-Object { $_.label } | Where-Object { $_ })
}
if ($axisLabels.Count -eq 0) { $axisLabels = @('Exclusion','Foliage','Rock','Wall') }
$processFlowUrl = New-Url -Base $baseProcessFlow -Params @{
  steps = ($axisLabels -join '|')
}

# Capture slot breakdown URLs (from unreal_capture_brief.json)
$captureSlotUrls = @()
if ($brief -and $brief.capture_slots) {
  $slotPlates = @($intake.render_cards | Where-Object { $_.web_path })
  foreach ($slot in @($brief.capture_slots | Sort-Object priority)) {
    if (-not $slot) { continue }

    $dest = [string]$slot.destination_group
    $preferred = [string]$slot.preferred_filename

    $process = @()
    if ($dest -like '*breakdown*') { $process = @('Capture plate', 'Annotate proof', 'Ingest to web', 'Embed in Wix') }
    elseif ($dest -like '*pcg*') { $process = @('Graph proof', 'Overlay/heatmap', 'Beauty pass', 'Ingest to web') }
    elseif ($dest -like '*materials*') { $process = @('Swatch grid', 'Close-up crop', 'Compare variants', 'Ingest to web') }
    else { $process = @('Capture', 'Ingest', 'Embed') }

    $performance = [ordered]@{
      triangleCount = $triangles
      drawCalls = $drawCalls
      materialCount = $uniqueMaterials
      textureCount = $null
    }

    $gallery = @()
    # If the preferred file already exists in render_cards, use it; otherwise create an expected URL.
    $match = $slotPlates | Where-Object { $_.filename -eq $preferred } | Select-Object -First 1
    if ($match -and $match.web_path) {
      $gallery += [ordered]@{ image = [string]$match.web_path; caption = 'Capture plate' }
    } elseif ($preferred) {
      $gallery += [ordered]@{
        image = "https://fromage3900.github.io/my-site/generated/assets/unreal/$preferred"
        caption = 'Expected capture filename'
        placeholder = '#141A30'
      }
    }

    $notes = @(
      "Slot: $([string]$slot.id)",
      "Capture: $([string]$slot.capture)",
      "Proves: $([string]$slot.proves)"
    ) -join "`n"

    $url = New-Url -Base $baseBreakdown -Params @{
      title = [string]$slot.title
      subtitle = "$dest · $sceneName"
      process = (Json-Query -Value $process)
      performance = (Json-Query -Value $performance)
      gallery = (Json-Query -Value $gallery)
      notes = $notes
    }

    $captureSlotUrls += [ordered]@{
      id = [string]$slot.id
      priority = [int]$slot.priority
      destination_group = $dest
      preferred_filename = $preferred
      url = $url
    }
  }
}

# Optional: PCG graph metadata URLs
$pcgGraphUrls = @()
if ($intake.pcg_graphs) {
  foreach ($graph in @($intake.pcg_graphs)) {
    if (-not $graph) { continue }
    $pcgGraphUrls += (New-Url -Base $baseGraphMeta -Params @{
      title = $graph.title
      role = $graph.role
      path = $graph.path
      voxel = $graph.voxel_cm
      phase = $graph.phase
      density_filter = $graph.features.density_filter
      surface_sampler = $graph.features.surface_sampler
      passthrough = $graph.features.passthrough
      pcgex_exclusion = $graph.features.pcgex_exclusion
      pcgex_candidate = $graph.features.pcgex_candidate
    })
  }
}

# Build per-family breakdown card URLs using intake.shader_families + hero/material plates
$breakdowns = @()
$families = @($intake.shader_families)
foreach ($family in $families) {
  if (-not $family) { continue }
  $familyName = [string]$family.family
  $sample = @($family.sample_materials | Where-Object { $_ } | Select-Object -First 4)
  $gallery = @()

  # Prefer the "families review" plate if present, otherwise any first material plate.
  $plate = $null
  $plates = @($intake.render_cards | Where-Object { $_.group -eq 'materials' -and $_.web_path })
  $plate = $plates | Where-Object { $_.filename -like '*families*review*' } | Select-Object -First 1
  if (-not $plate) { $plate = $plates | Select-Object -First 1 }
  if ($plate -and $plate.web_path) {
    $gallery += [ordered]@{ image = [string]$plate.web_path; caption = "$familyName swatch plate" }
  }

  $process = @(
    'Family grouping',
    'Key instance pass',
    'Proof plate capture',
    'Melodia breakdown publish'
  )

  $performance = [ordered]@{
    triangleCount = $triangles
    drawCalls = $drawCalls
    materialCount = if ($family.count) { [int]$family.count } else { $null }
    textureCount = $null
  }

  $notes = if ($sample.Count -gt 0) {
    "Featured instances: " + ($sample -join ', ') + '.'
  } else {
    'Featured instances pending.'
  }

  $url = New-Url -Base $baseBreakdown -Params @{
    title = "$familyName shader family"
    subtitle = "$($family.count) materials · $sceneName"
    process = (Json-Query -Value $process)
    performance = (Json-Query -Value $performance)
    gallery = (Json-Query -Value $gallery)
    notes = $notes
  }

  $breakdowns += [ordered]@{
    id = ($familyName.ToLowerInvariant() -replace '[^a-z0-9]+','-').Trim('-')
    family = $familyName
    url = $url
    sample_materials = $sample
  }
}

$output = [ordered]@{
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
  source_intake = 'generated/unreal_portfolio_intake.json'
  scene = $sceneName
  urls = [ordered]@{
    hero = $heroUrl
    passport = $passportUrl
    performance_card = $performanceUrl
    process_flow = $processFlowUrl
    status_badge = $needsBadgeUrl
  }
  capture_slots = $captureSlotUrls
  breakdowns = $breakdowns
  pcg_graph_metadata_urls = $pcgGraphUrls
}

$outJson = Join-Path $Root 'generated\melodia_embed_urls.json'
$outMd = Join-Path $Root 'generated\melodia_embed_urls.md'
$output | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $outJson -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# Melodia Embed URLs (Wix-ready)")
$md.Add("")
$md.Add("Generated: $($output.generated_at)")
$md.Add("Scene: $sceneName")
$md.Add("")
$md.Add("## Core")
$md.Add("")
$tick = [char]96
$md.Add("- Hero: $tick$heroUrl$tick")
$md.Add("- Passport: $tick$passportUrl$tick")
$md.Add("- Performance: $tick$performanceUrl$tick")
$md.Add("- Process flow: $tick$processFlowUrl$tick")
$md.Add("- Status badge: $tick$needsBadgeUrl$tick")
$md.Add("")
$md.Add("## Shader family breakdown cards")
$md.Add("")
foreach ($bd in $breakdowns) {
  $md.Add("- $($bd.family): $tick$($bd.url)$tick")
}
$md.Add("")
$md.Add("## Capture slots (from unreal_capture_brief.json)")
$md.Add("")
if ($captureSlotUrls.Count -eq 0) {
  $md.Add("- No capture brief found, or it has no slots.")
} else {
  foreach ($slot in $captureSlotUrls) {
    $md.Add("- $($slot.priority). $($slot.id) ($($slot.destination_group)): $tick$($slot.url)$tick")
  }
}
$md.Add("")
$md.Add("## PCG graph metadata (if present)")
$md.Add("")
if ($pcgGraphUrls.Count -eq 0) {
  $md.Add("- None in intake yet.")
} else {
  foreach ($u in $pcgGraphUrls) { $md.Add("- $tick$u$tick") }
}

$md -join "`r`n" | Set-Content -LiteralPath $outMd -Encoding UTF8

Write-Host "OK wrote generated/melodia_embed_urls.json"
Write-Host "OK wrote generated/melodia_embed_urls.md"

