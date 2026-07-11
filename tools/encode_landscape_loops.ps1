param(
  [string]$ProjectRoot = "g:\EnvironmentPortfolio\BS_GodFile",
  [string]$SiteRoot = "",
  [int]$BitrateKbps = 2800,
  [int]$DurationSec = 10,
  [switch]$FromStills,
  [switch]$DryRun
)

<#
.SYNOPSIS
  Encode landscape UDS day/night loops to webm for the Melodia site.

.DESCRIPTION
  Prefer frame folders from setup_landscape_uds_loops.py under
  Saved/Portfolio/Renders/LandscapeLoops/<WP_*>/.

  With -FromStills (or when frame folders are empty), synthesize a day/night
  color-cycle webm from NightShift terrain posters so the site is not empty
  while waiting on in-editor UDS capture.
#>

$ErrorActionPreference = 'Continue'

if ([string]::IsNullOrWhiteSpace($SiteRoot)) {
  $SiteRoot = Join-Path $ProjectRoot 'my-site-clean'
}

$loopsRoot = Join-Path $ProjectRoot 'Saved\Portfolio\Renders\LandscapeLoops'
$nightshiftDir = Join-Path $SiteRoot 'generated\assets\nightshift'
$webAssetDir = Join-Path $SiteRoot 'generated\assets\landscape-loops'
$webManifestPath = Join-Path $SiteRoot 'generated\landscape_loops_manifest.json'
$srcManifestPath = Join-Path $ProjectRoot 'Saved\Portfolio\LandscapeLoops\landscape_loops_manifest.json'

$pillars = @(
  @{ id = 'WP_SakuraDream'; poster = 'WP_SakuraDream_terrain.png'; label = 'Sakura Dream'; caption = 'UDS day/night cycle — L_WP_SakuraDream terrain-forward.' },
  @{ id = 'WP_SpaceCathedral'; poster = 'WP_SpaceCathedral_terrain.png'; label = 'Space Cathedral'; caption = 'UDS day/night cycle — L_WP_SpaceCathedral terrain-forward.' },
  @{ id = 'WP_BaroqueGrotto'; poster = 'WP_BaroqueGrotto_terrain.png'; label = 'Baroque Grotto'; caption = 'UDS day/night cycle — L_WP_BaroqueGrotto terrain-forward.' },
  @{ id = 'WP_CosmicOrrery'; poster = 'WP_CosmicOrrery_terrain.png'; label = 'Cosmic Orrery'; caption = 'UDS day/night cycle — L_WP_CosmicOrrery terrain-forward.' }
)

function Get-FfmpegPath {
  $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $winget = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter 'ffmpeg.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($winget) { return $winget.FullName }
  return $null
}

$ffmpeg = Get-FfmpegPath
if (-not $ffmpeg) {
  Write-Host "WARN ffmpeg not found - writing poster-only manifest stubs."
}

New-Item -ItemType Directory -Force -Path $webAssetDir | Out-Null
New-Item -ItemType Directory -Force -Path $loopsRoot | Out-Null

$entries = New-Object System.Collections.Generic.List[object]

foreach ($p in $pillars) {
  $miId = $p.id
  $frameDir = Join-Path $loopsRoot $miId
  $pngs = @()
  if (Test-Path -LiteralPath $frameDir) {
    $pngs = @(Get-ChildItem -LiteralPath $frameDir -Filter '*.png' -ErrorAction SilentlyContinue | Sort-Object Name)
  }

  $webmName = "$miId.webm"
  $webmDest = Join-Path $webAssetDir $webmName
  $posterRel = "../generated/assets/nightshift/$($p.poster)"
  $posterAbs = Join-Path $nightshiftDir $p.poster
  $encoded = $false
  $source = 'none'

  if ($ffmpeg -and $pngs.Count -ge 8 -and -not $FromStills) {
    $inputPattern = Join-Path $frameDir "$miId`_%04d.png"
    if (-not (Test-Path -LiteralPath ($inputPattern -replace '%04d', '0000'))) {
      $inputPattern = Join-Path $frameDir '%04d.png'
    }
    $ffArgs = @(
      '-y', '-framerate', '30', '-i', $inputPattern,
      '-c:v', 'libvpx-vp9', '-b:v', "${BitrateKbps}k",
      '-pix_fmt', 'yuv420p', '-an', $webmDest
    )
    if ($DryRun) {
      Write-Host "DRY ffmpeg $($ffArgs -join ' ')"
    } else {
      $prevEap = $ErrorActionPreference
      $ErrorActionPreference = 'SilentlyContinue'
      & $ffmpeg @ffArgs 2>$null | Out-Null
      $ErrorActionPreference = $prevEap
      $encoded = Test-Path -LiteralPath $webmDest
      $source = 'uds_frames'
      if ($encoded) { Write-Host "OK encoded $webmName ($source)" }
    }
  } elseif ($ffmpeg -and (Test-Path -LiteralPath $posterAbs)) {
    # Synthesize day/night crossfade from terrain still (interim until UDS capture)
    $tmpDir = Join-Path $webAssetDir "_tmp_$miId"
    New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
    $dayPng = Join-Path $tmpDir 'day.png'
    $nightPng = Join-Path $tmpDir 'night.png'
    $half = [Math]::Max(3, [int]($DurationSec / 2))
    $fade = [Math]::Min(2.5, $half - 0.5)
    $offset = $half - ($fade / 2.0)

    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    & $ffmpeg -y -i $posterAbs -vf "eq=brightness=0.08:saturation=1.15:contrast=1.05,scale=1280:-2" -frames:v 1 $dayPng 2>$null | Out-Null
    & $ffmpeg -y -i $posterAbs -vf "eq=brightness=-0.22:saturation=0.78:gamma_r=0.88:gamma_b=1.2:contrast=1.08,scale=1280:-2" -frames:v 1 $nightPng 2>$null | Out-Null

    if ((Test-Path -LiteralPath $dayPng) -and (Test-Path -LiteralPath $nightPng)) {
      $fc = "[0:v][1:v]xfade=transition=fade:duration=${fade}:offset=${offset},format=yuv420p"
      $ffArgs = @(
        '-y',
        '-loop', '1', '-t', "$half", '-i', $dayPng,
        '-loop', '1', '-t', "$half", '-i', $nightPng,
        '-filter_complex', $fc,
        '-c:v', 'libvpx-vp9', '-b:v', "${BitrateKbps}k",
        '-an', '-t', "$DurationSec",
        $webmDest
      )
      if ($DryRun) {
        Write-Host "DRY still-cycle ffmpeg $($ffArgs -join ' ')"
      } else {
        & $ffmpeg @ffArgs 2>$null | Out-Null
        $encoded = Test-Path -LiteralPath $webmDest
        $source = 'still_daynight_synth'
        if ($encoded) { Write-Host "OK encoded $webmName ($source)" } else { Write-Host "WARN encode failed for $miId" }
      }
    } else {
      Write-Host "WARN day/night stills failed for $miId"
    }
    $ErrorActionPreference = $prevEap
    Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
  }

  $entries.Add([ordered]@{
    id = $miId
    label = $p.label
    caption = $p.caption
    poster = $posterRel
    poster_file = $p.poster
    frame_count = $pngs.Count
    duration_sec = $DurationSec
    webm_path = if ($encoded) { "../generated/assets/landscape-loops/$webmName" } else { $null }
    local_relative_path = if ($encoded) { "generated/assets/landscape-loops/$webmName" } else { $null }
    encoded = $encoded
    source = $source
    status = if ($encoded) { 'web_ready' } else { 'needs_capture' }
    priority = 'hero'
  }) | Out-Null
}

$readyCount = 0
foreach ($e in $entries) {
  if ($e['encoded'] -eq $true) { $readyCount++ }
}

$manifest = [ordered]@{
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
  generated_by = 'encode_landscape_loops.ps1'
  frame_rate = 30
  loop_seconds = $DurationSec
  count = $entries.Count
  web_ready = $readyCount
  entries = @($entries)
}

$manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $webManifestPath -Encoding UTF8
New-Item -ItemType Directory -Force -Path (Split-Path $srcManifestPath) | Out-Null
$manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $srcManifestPath -Encoding UTF8

Write-Host "OK wrote $webManifestPath"
Write-Host ("OK encoded {0} of {1} landscape loops" -f $manifest.web_ready, $entries.Count)
