param(
  [string]$ProjectRoot = "G:\EnvironmentPortfolio\BS_GodFile",
  [string]$SiteRoot = "",
  [int]$Fps = 24,
  [int]$BitrateKbps = 2500,
  [int]$MaxWidth = 1080,
  [switch]$DryRun,
  [switch]$KeepFrames
)

<#
.SYNOPSIS
  Encode Melusina EEVEE image sequences to looping WebM for the portfolio site.

.DESCRIPTION
  Blender often dumps frames as `name.png0001.png` when the output path already
  includes `.png` before the frame counter. This script finds those dumps under
  generated/assets/character/, encodes VP9 WebM (same pattern as landscape /
  material loops), and writes generated/character_loops_manifest.json.

  Do NOT upload raw PNG sequences to GitHub Pages (~5MB x 240 frames).
#>

$ErrorActionPreference = 'Continue'

if ([string]::IsNullOrWhiteSpace($SiteRoot)) {
  $SiteRoot = Join-Path $ProjectRoot 'my-site-clean'
}

$charDir = Join-Path $SiteRoot 'generated\assets\character'
$webAssetDir = Join-Path $SiteRoot 'generated\assets\character-loops'
$manifestPath = Join-Path $SiteRoot 'generated\character_loops_manifest.json'
$tmpFramesRoot = Join-Path $webAssetDir '_frames'

function Get-FfmpegPath {
  $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $winget = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter 'ffmpeg.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($winget) { return $winget.FullName }
  foreach ($p in @('C:\ffmpeg\bin\ffmpeg.exe', 'C:\Program Files\ffmpeg\bin\ffmpeg.exe')) {
    if (Test-Path -LiteralPath $p) { return $p }
  }
  return $null
}

# Known dumps: Blender "filename.png####" → filename.png0001.png
$sequences = @(
  @{
    id = 'melusina_glam_audvis'
    label = 'Glam · hair / AudVis master (10s)'
    caption = 'Full EEVEE stage loop encode source — not the live stage slot.'
    glob = 'melusina_glam_audvis_001.png????.png'
    pattern = 'melusina_glam_audvis_001.png%04d.png'
    poster_candidates = @(
      'melusina_glam_audvis_001.png'
      'melusina_beauty_eevee_20260715c_01.png'
      'melusina_eevee_glam_20260715c_01.png'
    )
    start = 1
    slot = 'stage.hair_loop_master'
    status_when_ready = 'encode_source'
  }
)

# After the full master encode, also emit live 4s + macro postcard from the WebM when present.
function Encode-LiveLoopsFromMaster {
  param([string]$FfmpegPath, [string]$WebAssetDir, [int]$BitrateKbps)
  $master = Join-Path $WebAssetDir 'melusina_glam_audvis.webm'
  if (-not (Test-Path -LiteralPath $master)) {
    Write-Host 'WARN live 4s loops: master webm missing'
    return @()
  }
  $live = New-Object System.Collections.Generic.List[object]
  $four = Join-Path $WebAssetDir 'melusina_glam_audvis_4s.webm'
  $fourPoster = Join-Path $WebAssetDir 'melusina_glam_audvis_4s_poster.png'
  $macro = Join-Path $WebAssetDir 'melusina_glam_macro_postcard_4s.webm'
  $macroPoster = Join-Path $WebAssetDir 'melusina_glam_macro_postcard_4s_poster.png'

  if (-not $DryRun) {
    & $FfmpegPath -y -i $master -t 4 -an -c:v libvpx-vp9 -b:v ("{0}k" -f $BitrateKbps) -pix_fmt yuv420p $four 2>$null | Out-Null
    & $FfmpegPath -y -i $master -t 4 -an -vf "scale=iw*1.55:ih*1.55:flags=lanczos,crop=1080:1350:(in_w-1080)/2:(in_h-1350)*0.18" -c:v libvpx-vp9 -b:v ("{0}k" -f $BitrateKbps) -pix_fmt yuv420p $macro 2>$null | Out-Null
    if (Test-Path -LiteralPath $four) {
      & $FfmpegPath -y -i $four -update 1 -frames:v 1 -vf 'scale=1080:-2' $fourPoster 2>$null | Out-Null
    }
    if (Test-Path -LiteralPath $macro) {
      & $FfmpegPath -y -i $macro -update 1 -frames:v 1 -vf 'scale=1080:-2' $macroPoster 2>$null | Out-Null
    }
  }

  $live.Add([ordered]@{
    id = 'melusina_glam_audvis_4s'
    label = 'Glam · hair / AudVis 4s loop'
    caption = 'First 4 seconds of the EEVEE AudVis hair sway — looped for stage.'
    frame_count = 96
    fps = $Fps
    duration_sec = 4
    max_width = $MaxWidth
    poster = if (Test-Path $fourPoster) { '../generated/assets/character-loops/melusina_glam_audvis_4s_poster.png' } else { $null }
    webm_path = if (Test-Path $four) { '../generated/assets/character-loops/melusina_glam_audvis_4s.webm' } else { $null }
    local_relative_path = if (Test-Path $four) { 'generated/assets/character-loops/melusina_glam_audvis_4s.webm' } else { $null }
    encoded = (Test-Path $four)
    source = 'audvis_webm_trim'
    status = if (Test-Path $four) { 'web_ready' } else { 'needs_encode' }
    slot = 'stage.hair_loop'
  }) | Out-Null

  $live.Add([ordered]@{
    id = 'melusina_glam_macro_postcard_4s'
    label = 'Hair FX · macro postcard'
    caption = 'Macro zoom of the 4s AudVis loop — face/hair fill for social postcard crops.'
    frame_count = 96
    fps = $Fps
    duration_sec = 4
    max_width = $MaxWidth
    poster = if (Test-Path $macroPoster) { '../generated/assets/character-loops/melusina_glam_macro_postcard_4s_poster.png' } else { $null }
    webm_path = if (Test-Path $macro) { '../generated/assets/character-loops/melusina_glam_macro_postcard_4s.webm' } else { $null }
    local_relative_path = if (Test-Path $macro) { 'generated/assets/character-loops/melusina_glam_macro_postcard_4s.webm' } else { $null }
    encoded = (Test-Path $macro)
    source = 'audvis_4s_macro_crop'
    status = if (Test-Path $macro) { 'web_ready' } else { 'needs_encode' }
    slot = 'stage.hair_postcard'
  }) | Out-Null

  return $live
}

$ffmpeg = Get-FfmpegPath
if (-not $ffmpeg) {
  Write-Error "ffmpeg not found. Install ffmpeg, then re-run."
  exit 1
}

New-Item -ItemType Directory -Force -Path $webAssetDir | Out-Null
$entries = New-Object System.Collections.Generic.List[object]

foreach ($seq in $sequences) {
  $frames = @(Get-ChildItem -LiteralPath $charDir -Filter $seq.glob -ErrorAction SilentlyContinue | Sort-Object Name)
  $id = $seq.id
  $webmName = "$id.webm"
  $webmDest = Join-Path $webAssetDir $webmName
  $posterName = "$id`_poster.png"
  $posterDest = Join-Path $webAssetDir $posterName
  $encoded = $false
  $source = 'none'
  $frameCount = $frames.Count

  Write-Host "SEQ $id frames=$frameCount"

  if ($frameCount -lt 8) {
    Write-Host ("WARN {0}: need >= 8 frames (found {1}) - skipping encode" -f $id, $frameCount)
  } else {
    # Prefer direct concat via odd Blender naming; fall back to numbered copies
    $directFirst = Join-Path $charDir ($seq.pattern -replace '%04d', ('{0:D4}' -f $seq.start))
    $useDirect = Test-Path -LiteralPath $directFirst
    $inputPattern = $null
    $startNumber = $seq.start

    if ($useDirect) {
      $inputPattern = Join-Path $charDir $seq.pattern
      $source = 'blender_png_dump'
    } else {
      $frameDir = Join-Path $tmpFramesRoot $id
      New-Item -ItemType Directory -Force -Path $frameDir | Out-Null
      $i = 0
      foreach ($f in $frames) {
        $i++
        $target = Join-Path $frameDir ("{0:D4}.png" -f $i)
        if (-not (Test-Path -LiteralPath $target)) {
          # Hard-link when possible to avoid doubling ~1GB
          try {
            New-Item -ItemType HardLink -Path $target -Target $f.FullName -ErrorAction Stop | Out-Null
          } catch {
            Copy-Item -LiteralPath $f.FullName -Destination $target -Force
          }
        }
      }
      $inputPattern = Join-Path $frameDir '%04d.png'
      $startNumber = 1
      $source = 'renamed_frames'
      $frameCount = $i
    }

    $vf = "scale=${MaxWidth}:-2:flags=lanczos"
    $ffArgs = @(
      '-y',
      '-framerate', "$Fps",
      '-start_number', "$startNumber",
      '-i', $inputPattern,
      '-frames:v', "$frameCount",
      '-vf', $vf,
      '-c:v', 'libvpx-vp9',
      '-b:v', ("{0}k" -f $BitrateKbps),
      '-pix_fmt', 'yuv420p',
      '-an',
      $webmDest
    )

    if ($DryRun) {
      Write-Host ("DRY ffmpeg {0}" -f ($ffArgs -join ' '))
      # Treat existing WebM as ready so dry-run does not clobber a good manifest.
      $encoded = Test-Path -LiteralPath $webmDest
      if ($encoded) { $source = 'existing_webm' }
    } else {
      Write-Host ("ENC {0} ({1}, {2} fps, maxW={3})" -f $webmName, $source, $Fps, $MaxWidth)
      $prev = $ErrorActionPreference
      $ErrorActionPreference = 'SilentlyContinue'
      & $ffmpeg @ffArgs 2>&1 | Out-Null
      $ErrorActionPreference = $prev
      $encoded = Test-Path -LiteralPath $webmDest
      if ($encoded) {
        $mb = [math]::Round((Get-Item -LiteralPath $webmDest).Length / 1MB, 2)
        Write-Host ("OK {0} {1}MB" -f $webmName, $mb)
      } else {
        Write-Host ("WARN encode failed for {0}" -f $id)
      }
    }

    if (-not $KeepFrames -and $source -eq 'renamed_frames') {
      Remove-Item -LiteralPath (Join-Path $tmpFramesRoot $id) -Recurse -Force -ErrorAction SilentlyContinue
    }
  }

  # Poster: first candidate that exists, else first sequence frame
  $posterSrc = $null
  foreach ($c in $seq.poster_candidates) {
    $p = Join-Path $charDir $c
    if (Test-Path -LiteralPath $p) { $posterSrc = $p; break }
  }
  if (-not $posterSrc -and $frames.Count -gt 0) { $posterSrc = $frames[0].FullName }

  if ($posterSrc -and -not $DryRun) {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    & $ffmpeg -y -i $posterSrc -vf "scale=${MaxWidth}:-2" -frames:v 1 $posterDest 2>$null | Out-Null
    $ErrorActionPreference = $prev
  }

  $posterOk = Test-Path -LiteralPath $posterDest
  $duration = if ($frameCount -gt 0) { [math]::Round($frameCount / [double]$Fps, 2) } else { 0 }

  $slot = if ($seq.ContainsKey('slot') -and $seq.slot) { $seq.slot } else { 'stage.hair_loop_master' }
  $readyStatus = if ($seq.ContainsKey('status_when_ready') -and $seq.status_when_ready) { $seq.status_when_ready } else { 'web_ready' }

  $entries.Add([ordered]@{
    id = $id
    label = $seq.label
    caption = $seq.caption
    frame_count = $frameCount
    fps = $Fps
    duration_sec = $duration
    max_width = $MaxWidth
    poster = if ($posterOk) { "../generated/assets/character-loops/$posterName" } else { $null }
    webm_path = if ($encoded) { "../generated/assets/character-loops/$webmName" } else { $null }
    local_relative_path = if ($encoded) { "generated/assets/character-loops/$webmName" } else { $null }
    encoded = $encoded
    source = $source
    status = if ($encoded) { $readyStatus } else { 'needs_encode' }
    slot = $slot
  }) | Out-Null
}

# Live stage loops: 4s trim + macro postcard (prefer these over the 10s master)
$liveEntries = Encode-LiveLoopsFromMaster -FfmpegPath $ffmpeg -WebAssetDir $webAssetDir -BitrateKbps $BitrateKbps
# Prepend live entries so hair_loop resolves to 4s first
$ordered = New-Object System.Collections.Generic.List[object]
foreach ($le in $liveEntries) { $ordered.Add($le) | Out-Null }
foreach ($e in $entries) { $ordered.Add($e) | Out-Null }
$entries = $ordered

$ready = 0
foreach ($e in $entries) {
  if ($e['status'] -eq 'web_ready') { $ready++ }
}

$entryArray = @()
foreach ($e in $entries) { $entryArray += $e }

$manifest = [ordered]@{
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
  generated_by = 'encode_melusina_loops.ps1'
  notes = 'Live hair slot uses first 4s of AudVis. Full 10s master kept as encode source only. Do not commit raw PNG dumps.'
  count = $entries.Count
  web_ready = $ready
  entries = $entryArray
}

($manifest | ConvertTo-Json -Depth 12) | Set-Content -LiteralPath $manifestPath -Encoding UTF8
Write-Host ("OK wrote {0} ({1}/{2} web_ready)" -f $manifestPath, $ready, $entries.Count)
if ($ready -lt 1) { exit 2 }
