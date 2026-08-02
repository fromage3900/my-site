param(
  [string]$ProjectRoot = "g:\EnvironmentPortfolio\BS_GodFile",
  [string]$SiteRoot = "",
  [int]$BitrateKbps = 2200,
  [int]$DurationSec = 4,
  [switch]$DryRun
)

<#
.SYNOPSIS
  Interim material-loop webms from NightShift MI sphere stills on void-safe framing.
  Replace with MRQ orbit captures from run_mi_preview_mrq.py when Unreal is available.
#>

$ErrorActionPreference = 'Continue'
if ([string]::IsNullOrWhiteSpace($SiteRoot)) {
  $SiteRoot = Join-Path $ProjectRoot 'my-site-clean'
}

$nightshiftDir = Join-Path $SiteRoot 'generated\assets\nightshift'
$webAssetDir = Join-Path $SiteRoot 'generated\assets\material-loops'
$webManifestPath = Join-Path $SiteRoot 'generated\material_loops_manifest.json'
$srcManifestPath = Join-Path $ProjectRoot 'Saved\Portfolio\MaterialLoops\loops_manifest.json'

# Priority Infold set — cosmic + Nikki heroes
$priority = @(
  'MI_Cosmic_AuroraVeil', 'MI_Cosmic_EclipseHalo', 'MI_Cosmic_VoidDeep',
  'MI_Cosmic_StarfieldA', 'MI_Cosmic_PurpleNebulaA', 'MI_Cosmic_BlueNebulaA',
  'MI_SDF_RosyQuartz', 'MI_SDF_IvoryScrollwork', 'MI_SDF_Nebula_Veil',
  'MI_SDF_VoidStarlight', 'MI_SDF_Aurora_Band', 'MI_SDF_CelestialVinyl',
  'celestial_nebula_nasa_sphere'
)

function Get-FfmpegPath {
  $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $winget = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter 'ffmpeg.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($winget) { return $winget.FullName }
  return $null
}

$ffmpeg = Get-FfmpegPath
New-Item -ItemType Directory -Force -Path $webAssetDir | Out-Null

$entries = New-Object System.Collections.Generic.List[object]
$readyCount = 0

foreach ($id in $priority) {
  $src = Join-Path $nightshiftDir "$id.png"
  if (-not (Test-Path -LiteralPath $src)) { continue }
  $webmName = "$id.webm"
  $webmDest = Join-Path $webAssetDir $webmName
  $encoded = $false

  if ($ffmpeg) {
    # Slow zoom + slight brightness pulse; pad on void color so framing stays centered
    $vf = "scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:color=0x0d1224,zoompan=z='min(zoom+0.0008,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1080:fps=30,eq=brightness='0.04*sin(2*PI*n/120)':saturation=1.05"
    # zoompan expressions can fail on some builds — fall back to simple pad+eq
    $vfSimple = "scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:color=0x0d1224,eq=brightness=0.02:saturation=1.08"
    $ffArgs = @(
      '-y', '-loop', '1', '-i', $src, '-t', "$DurationSec",
      '-vf', $vfSimple,
      '-c:v', 'libvpx-vp9', '-b:v', "${BitrateKbps}k",
      '-pix_fmt', 'yuv420p', '-an', $webmDest
    )
    if ($DryRun) {
      Write-Host "DRY $($ffArgs -join ' ')"
    } else {
      $prev = $ErrorActionPreference
      $ErrorActionPreference = 'SilentlyContinue'
      & $ffmpeg @ffArgs 2>$null | Out-Null
      $ErrorActionPreference = $prev
      $encoded = Test-Path -LiteralPath $webmDest
      if ($encoded) { Write-Host "OK $webmName"; $readyCount++ } else { Write-Host "WARN $id" }
    }
  }

  $isHero = $id -match 'RosyQuartz|AuroraVeil|nasa|VoidDeep|Nebula_Veil'
  $entries.Add([ordered]@{
    id = $id
    asset_path = $null
    profile = 'TP_Default'
    preview_mesh = 'sphere'
    backdrop = 'Melodia_VoidGradient'
    priority = if ($isHero) { 'hero' } else { 'catalog' }
    frame_count = if ($encoded) { $DurationSec * 30 } else { 0 }
    duration_sec = $DurationSec
    source_dir = $nightshiftDir
    webm_path = if ($encoded) { "../generated/assets/material-loops/$webmName" } else { $null }
    local_relative_path = if ($encoded) { "generated/assets/material-loops/$webmName" } else { $null }
    poster_frame = "$id.png"
    poster = "../generated/assets/nightshift/$id.png"
    encoded = $encoded
    status = if ($encoded) { 'web_ready' } else { 'needs_encode' }
    source = 'nightshift_still_void_pad'
  }) | Out-Null
}

$manifest = [ordered]@{
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
  generated_by = 'encode_material_loops_from_stills.ps1'
  frame_rate = 30
  loop_frames = $DurationSec * 30
  count = $entries.Count
  web_ready = $readyCount
  note = 'Interim void-padded loops from NightShift stills. Re-run MRQ orbit capture when UE studio is ready.'
  entries = @($entries)
}

$manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $webManifestPath -Encoding UTF8
New-Item -ItemType Directory -Force -Path (Split-Path $srcManifestPath) | Out-Null
$manifest | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $srcManifestPath -Encoding UTF8
Write-Host "OK wrote $webManifestPath ($readyCount ready)"
