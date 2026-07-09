param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$RendersRoot = 'G:\EnvironmentPortfolio\BS_GodFile\Saved\Portfolio\Renders',
  [switch]$NoCopy
)

$ErrorActionPreference = 'Stop'

function New-Slug {
  param([string]$Value)
  $slug = $Value.ToLowerInvariant() -replace '[^a-z0-9]+', '-'
  $slug = $slug.Trim('-')
  if ([string]::IsNullOrWhiteSpace($slug)) { return 'untitled' }
  return $slug
}

function Get-RenderGroup {
  param([string]$RelativePath, [string]$FileName)
  $rel = $RelativePath.ToLowerInvariant()
  $name = $FileName.ToLowerInvariant()
  if ($rel -match 'nightshift') { return 'nightshift' }
  if ($rel -match '\\hero\\' -or $rel -match '^hero\\') { return 'hero' }
  if ($rel -match '\\materials\\' -or $rel -match '^materials\\') { return 'materials' }
  if ($rel -match '\\breakdown\\' -or $rel -match '^breakdown\\') { return 'breakdown' }
  if ($rel -match '\\pcg\\' -or $name -match 'pcg|heatmap') { return 'pcg' }
  if ($name -match 'nikkihero|iridescence|thinfilm|dreamrim|shadowramp|volumetric|water_layered') { return 'shader_proof' }
  if ($name -match 'sakura|scene_sakura') { return 'sakura_mood' }
  return 'discovered'
}

function Get-Caption {
  param([string]$FileName, [string]$Group)
  switch -Regex ($FileName) {
    'NikkiHero_grid_v5_triplanar' { return 'Nikki hero grid v5 - triplanar mapping proof on M_Master_Toon_Universal instances.' }
    'NikkiHero_grid' { return 'Nikki-style surface polish grid - sheen, sparkle, pastel grading iterations.' }
    'Scene_SakuraDream_v2' { return 'Sakura Dream scene composition v2 - route and atmosphere read.' }
    'Scene_SakuraDream' { return 'Sakura Dream scene composition - shrine meadow mood plate.' }
    'Sakura_surfaces_grid' { return 'Sakura surface language comparison grid.' }
    'Sakura_StonePath' { return 'Sakura stone path material / trim read.' }
    'Iridescence_thinfilm_v3' { return 'Thin-film iridescence v3 - fashion-fantasy surface response.' }
    'Iridescence_thinfilm' { return 'Thin-film iridescence iteration - stylized sheen development.' }
    'Water_layered_waves' { return 'Layered stylized water surface proof.' }
    'DreamRim_test' { return 'Dream rim lighting / contact highlight test.' }
    'VolumetricInk_test' { return 'Volumetric ink wash atmosphere test.' }
    'ShadowRamp_test' { return 'Stylized shadow ramp tuning plate.' }
    'pcg_heatmap' { return 'PCG exclusion heatmap - ZEN_SHRINE_AXIS route proof.' }
    'Cam_Hero_Establishing' { return 'Hero establishing camera - composition and traversal read.' }
    'grid_cosmic' { return 'Cosmic SDF instance preview grid.' }
    'grid_nikki' { return 'Nikki hero SDF preview grid.' }
    'WP_.*_terrain' { return 'WP pillar terrain preview from NightShift capture.' }
    'celestial_nebula_nasa' { return 'CelestialNebula with NASA star map sphere.' }
    default { return "Portfolio render - $Group plate from Saved/Portfolio/Renders." }
  }
}

if (-not (Test-Path -LiteralPath $RendersRoot)) {
  throw "Renders root not found: $RendersRoot"
}

$destDir = Join-Path $Root 'generated\assets\portfolio-scan'
if (-not $NoCopy) { New-Item -ItemType Directory -Force -Path $destDir | Out-Null }

# Priority picks - always include when present (recruiter-facing)
$priorityNames = @(
  'NikkiHero_grid_v5_triplanar.png',
  'Scene_SakuraDream_v2.png',
  'Scene_SakuraDream.png',
  'Sakura_surfaces_grid.png',
  'Sakura_StonePath_fixed.png',
  'Iridescence_thinfilm_v3.png',
  'Water_layered_waves.png',
  'DreamRim_test.png',
  'pcg_heatmap.png'
)

$items = New-Object System.Collections.Generic.List[object]
$seen = @{}

Get-ChildItem -LiteralPath $RendersRoot -Recurse -File |
  Where-Object { $_.Extension -match '^\.(png|jpe?g)$' -and $_.Name -notmatch 'manifest' } |
  Sort-Object LastWriteTime -Descending |
  ForEach-Object {
    $rel = $_.FullName.Substring($RendersRoot.Length).TrimStart('\')
    $group = Get-RenderGroup -RelativePath $rel -FileName $_.Name
    $slug = New-Slug ($rel -replace '\\', '-' -replace '\.[^.]+$', '')
    if ($seen.ContainsKey($slug)) { return }
    $seen[$slug] = $true

    $isPriority = $priorityNames -contains $_.Name
    $isNightshift = $group -eq 'nightshift'
    $copyToScan = (-not $isNightshift) -and (
      $isPriority -or
      $group -in @('shader_proof', 'sakura_mood', 'discovered') -and $_.DirectoryName -eq $RendersRoot
    )

    $webPath = $null
    $copied = $false
    if ($isNightshift) {
      $webPath = "../generated/assets/nightshift/$($_.Name)"
      $copied = Test-Path -LiteralPath (Join-Path $Root "generated\assets\nightshift\$($_.Name)")
    } elseif ($copyToScan -and -not $NoCopy) {
      $destFile = "$slug$($_.Extension.ToLower())"
      $destPath = Join-Path $destDir $destFile
      Copy-Item -LiteralPath $_.FullName -Destination $destPath -Force
      $webPath = "../generated/assets/portfolio-scan/$destFile"
      $copied = $true
    } elseif ($group -eq 'hero' -or $group -eq 'materials' -or $group -eq 'breakdown') {
      $webPath = $null
      $copied = $false
    }

    $priority = switch ($group) {
      'nightshift' { 90 }
      'shader_proof' { if ($isPriority) { 88 } else { 72 } }
      'sakura_mood' { 86 }
      'hero' { 70 }
      'materials' { 65 }
      'breakdown' { 80 }
      'pcg' { 82 }
      default { 60 }
    }
    if ($isPriority) { $priority += 5 }

    $items.Add([ordered]@{
      id = $slug
      filename = $_.Name
      source_path = $_.FullName
      relative_path = $rel
      group = $group
      web_path = $webPath
      copied = $copied
      priority = $priority
      status = if ($webPath) { 'web_ready' } else { 'source_only' }
      caption = Get-Caption -FileName ($_.BaseName) -Group $group
      mtime = $_.LastWriteTimeUtc.ToString('o')
      bytes = $_.Length
    }) | Out-Null
  }

$cutoff = (Get-Date).ToUniversalTime().AddHours(-24)
$newIn24h = @($items | Where-Object {
  try { [datetime]$_.mtime -gt $cutoff } catch { $false }
} | ForEach-Object {
  [ordered]@{ id = $_.id; filename = $_.filename; group = $_.group; mtime = $_.mtime }
})

$catalog = [ordered]@{
  scanned_at = (Get-Date).ToUniversalTime().ToString('o')
  source_root = $RendersRoot
  counts = [ordered]@{
    total = $items.Count
    web_ready = @($items | Where-Object { $_.status -eq 'web_ready' }).Count
    nightshift = @($items | Where-Object { $_.group -eq 'nightshift' }).Count
    shader_proof = @($items | Where-Object { $_.group -eq 'shader_proof' }).Count
    sakura_mood = @($items | Where-Object { $_.group -eq 'sakura_mood' }).Count
    hero = @($items | Where-Object { $_.group -eq 'hero' }).Count
  }
  recruiter_picks = @(
    'nightshift/WP_SakuraDream_terrain.png',
    'nightshift/celestial_nebula_nasa_sphere.png',
    'nightshift/grid_nikki_heroes.png',
    'NikkiHero_grid_v5_triplanar.png',
    'Scene_SakuraDream_v2.png',
    'Iridescence_thinfilm_v3.png'
  )
  new_in_last_24h = $newIn24h
  items = @($items | Sort-Object { -$_.priority }, { $_.mtime })
}

$dest = Join-Path $Root 'generated\portfolio_render_catalog.json'
$catalog | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $dest -Encoding UTF8
Write-Host "OK wrote $dest ($($items.Count) renders, $(@($items | Where-Object copied).Count) copied to portfolio-scan)"
