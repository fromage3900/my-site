param(
  [string]$ProjectRoot = "g:\EnvironmentPortfolio\BS_GodFile",
  [string]$SiteRoot = "",
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($SiteRoot)) {
  $SiteRoot = Join-Path $ProjectRoot 'my-site-clean'
}

$statusPath = Join-Path $ProjectRoot 'Saved\Portfolio\MaterialLoops\pipeline_status.json'
$allowedPrefixes = @(
  'wix/',
  'generated/',
  'Saved/Portfolio/MaterialLoops/',
  'Content/Python/mi_preview',
  'Content/Python/run_mi_preview',
  'Content/Python/setup_mi_preview',
  'Content/Python/setup_material_preview',
  'Tools/publish_material_loops.ps1',
  'Tools/capture_material_loops.ps1',
  'my-site-clean/'
)

$blockedPatterns = @(
  '\.env',
  'credentials',
  'Saved/Config',
  'secret',
  '\.pem$',
  '\.key$'
)

function Test-PathAllowed {
  param([string]$Path)
  $norm = ($Path -replace '\\', '/').Trim()
  foreach ($prefix in $allowedPrefixes) {
    if ($norm.StartsWith($prefix) -or $norm -like "*$prefix*") { return $true }
  }
  if ($norm -match '^BS_GodFile/(wix|generated|Content/Python|Tools|Saved/Portfolio/MaterialLoops)') { return $true }
  if ($norm -match 'my-site-clean') { return $true }
  return $false
}

function Test-PathBlocked {
  param([string]$Path)
  foreach ($pat in $blockedPatterns) {
    if ($Path -match $pat) { return $true }
  }
  return $false
}

Push-Location $SiteRoot
try {
  $repoRoot = git rev-parse --show-toplevel 2>$null
  if (-not $repoRoot) {
    Write-Host "ERROR: not a git repository at $SiteRoot"
    exit 1
  }
  Set-Location $repoRoot

  $status = git status --porcelain
  if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "OK nothing to commit"
    exit 0
  }

  $lines = @($status -split "`n" | Where-Object { $_.Trim() })
  $bad = @()
  $files = @()
  foreach ($line in $lines) {
    if ($line.Length -lt 4) { continue }
    $path = $line.Substring(3).Trim('"')
    $files += $path
    if (Test-PathBlocked $path) { $bad += "blocked:$path"; continue }
    if (-not (Test-PathAllowed $path)) { $bad += "unexpected:$path" }
  }

  if ($bad.Count -gt 0) {
    Write-Host "BLOCKED auto-publish:"
    $bad | ForEach-Object { Write-Host "  $_" }
    @{
      pushed = $false
      failures = $bad
      wix_republish_required = $true
    } | ConvertTo-Json | Set-Content -LiteralPath $statusPath -Encoding UTF8
    exit 1
  }

  $loopIds = @()
  $lmPath = Join-Path $SiteRoot 'generated\material_loops_manifest.json'
  if (Test-Path -LiteralPath $lmPath) {
    $lm = Get-Content -LiteralPath $lmPath -Raw | ConvertFrom-Json
    $loopIds = @($lm.entries | Where-Object { $_.encoded } | Select-Object -First 5 | ForEach-Object { $_.id })
  }
  $label = if ($loopIds.Count -gt 0) { ($loopIds -join ', ') } else { 'pipeline update' }
  $msg = "Publish material loops: $label"

  if ($DryRun) {
    Write-Host "DRY RUN would commit: $msg"
    Write-Host ($files -join "`n")
    exit 0
  }

  git add wix generated tools
  if (Test-Path -LiteralPath 'generated/assets/material-loops') {
    git add generated/assets/material-loops
  }
  git add generated/material_loops_manifest.json 2>$null
  git commit -m $msg
  git push origin HEAD
  Write-Host "OK pushed: $msg"
  @{
    pushed = $true
    commit_message = $msg
    files = $files
    wix_republish_required = $true
  } | ConvertTo-Json | Set-Content -LiteralPath $statusPath -Encoding UTF8
} finally {
  Pop-Location
}
