param(
  [string]$ProjectRoot = "g:\EnvironmentPortfolio\BS_GodFile",
  [string]$SiteRoot = "",
  [int]$BitrateKbps = 3000,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($SiteRoot)) {
  $SiteRoot = Join-Path $ProjectRoot 'my-site-clean'
}

$loopsRoot = Join-Path $ProjectRoot 'Saved\Portfolio\Renders\MaterialLoops'
$manifestPath = Join-Path $ProjectRoot 'Saved\Portfolio\MaterialLoops\loops_manifest.json'
$miManifestPath = Join-Path $ProjectRoot 'Saved\Portfolio\MaterialLoops\mi_preview_manifest.json'
$webAssetDir = Join-Path $SiteRoot 'generated\assets\material-loops'
$webManifestPath = Join-Path $SiteRoot 'generated\material_loops_manifest.json'

function Get-FfmpegPath {
  $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $common = @(
    'C:\ffmpeg\bin\ffmpeg.exe',
    'C:\Program Files\ffmpeg\bin\ffmpeg.exe'
  )
  foreach ($p in $common) {
    if (Test-Path -LiteralPath $p) { return $p }
  }
  return $null
}

function Get-FramePattern {
  param([string]$Dir, [string]$MiId)
  $patterns = @(
    (Join-Path $Dir "$MiId`_*.png"),
    (Join-Path $Dir '*.png')
  )
  foreach ($pat in $patterns) {
    $files = @(Get-ChildItem -LiteralPath $Dir -Filter ([System.IO.Path]::GetFileName($pat)) -ErrorAction SilentlyContinue)
    if ($files.Count -gt 0) { return $files[0].FullName }
  }
  $any = @(Get-ChildItem -LiteralPath $Dir -Filter '*.png' -ErrorAction SilentlyContinue | Sort-Object Name)
  if ($any.Count -gt 0) {
    return $any[0].FullName
  }
  return $null
}

$ffmpeg = Get-FfmpegPath
if (-not $ffmpeg) {
  Write-Host "WARN ffmpeg not found - writing manifest stubs only."
}

New-Item -ItemType Directory -Force -Path $webAssetDir | Out-Null

$miMeta = @{}
if (Test-Path -LiteralPath $miManifestPath) {
  $miManifest = Get-Content -LiteralPath $miManifestPath -Raw | ConvertFrom-Json
  foreach ($entry in @($miManifest.entries)) {
    if ($entry.id) { $miMeta[$entry.id] = $entry }
  }
}

$entries = New-Object System.Collections.Generic.List[object]
if (-not (Test-Path -LiteralPath $loopsRoot)) {
  New-Item -ItemType Directory -Force -Path $loopsRoot | Out-Null
}

$dirs = @(Get-ChildItem -LiteralPath $loopsRoot -Directory -ErrorAction SilentlyContinue)
foreach ($dir in $dirs) {
  $miId = $dir.Name
  $pngs = @(Get-ChildItem -LiteralPath $dir.FullName -Filter '*.png' -ErrorAction SilentlyContinue | Sort-Object Name)
  if ($pngs.Count -eq 0) { continue }

  $webmName = "$miId.webm"
  $webmDest = Join-Path $webAssetDir $webmName
  $encoded = $false

  if ($ffmpeg) {
    $inputPattern = Join-Path $dir.FullName "$miId`_%04d.png"
    if (-not (Test-Path -LiteralPath ($inputPattern -replace '%04d', '0000'))) {
      $inputPattern = Join-Path $dir.FullName '%04d.png'
      if (-not (Test-Path -LiteralPath ($inputPattern -replace '%04d', '0001'))) {
        $renamed = 0
        foreach ($png in $pngs) {
          $renamed++
          $target = Join-Path $dir.FullName ("{0}_{1:D4}.png" -f $miId, $renamed)
          if ($png.FullName -ne $target) {
            Copy-Item -LiteralPath $png.FullName -Destination $target -Force
          }
        }
        $inputPattern = Join-Path $dir.FullName "$miId`_%04d.png"
      }
    }

    $ffArgs = @(
      '-y',
      '-framerate', '30',
      '-i', $inputPattern,
      '-c:v', 'libvpx-vp9',
      '-b:v', "${BitrateKbps}k",
      '-pix_fmt', 'yuv420p',
      '-an',
      $webmDest
    )
    if ($DryRun) {
      Write-Host "DRY ffmpeg $($ffArgs -join ' ')"
    } else {
      & $ffmpeg @ffArgs 2>&1 | Out-Null
      $encoded = Test-Path -LiteralPath $webmDest
    }
  }

  $meta = $miMeta[$miId]
  $poster = $pngs[0].Name
  $entries.Add([ordered]@{
    id = $miId
    asset_path = if ($meta) { $meta.asset_path } else { $null }
    profile = if ($meta) { $meta.profile } else { $null }
    preview_mesh = if ($meta) { $meta.preview_mesh } else { $null }
    backdrop = if ($meta) { $meta.backdrop } else { $null }
    priority = if ($meta) { $meta.priority } else { 'catalog' }
    frame_count = $pngs.Count
    duration_sec = [Math]::Round($pngs.Count / 30.0, 2)
    source_dir = $dir.FullName
    webm_path = if ($encoded) { "../generated/assets/material-loops/$webmName" } else { $null }
    local_relative_path = if ($encoded) { "generated/assets/material-loops/$webmName" } else { $null }
    poster_frame = $poster
    encoded = $encoded
    status = if ($encoded) { 'web_ready' } else { 'needs_encode' }
  }) | Out-Null
}

$loopsManifest = [ordered]@{
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
  generated_by = 'encode_material_loops.ps1'
  frame_rate = 30
  loop_frames = 120
  count = $entries.Count
  entries = @($entries | Sort-Object { if ($_.priority -eq 'hero') { 0 } else { 1 } }, id)
}

$loopsManifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
$loopsManifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $webManifestPath -Encoding UTF8

$encodedCount = @($entries | Where-Object { $_.encoded }).Count
Write-Host "OK wrote $manifestPath"
Write-Host "OK wrote $webManifestPath"
Write-Host ("OK encoded {0} of {1} loops" -f $encodedCount, $entries.Count)
