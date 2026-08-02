param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

$jsonFiles = @(
  'generated/deployment_manifest.json',
  'generated/infold_asset_scouting_manifest.json',
  'generated/local_asset_inventory.json',
  'generated/infold_application_campaign.json',
  'generated/application_tracker.json',
  'generated/infold_research_alignment.json',
  'generated/wix_embed_manifest.json',
  'generated/unreal_portfolio_intake.json',
  'generated/unreal_capture_brief.json',
  'generated/portfolio_roadmap.json',
  'generated/application_packet.json'
)

foreach ($file in $jsonFiles) {
  $path = Join-Path $Root $file
  if (-not (Test-Path -LiteralPath $path)) { throw "Missing JSON: $file" }
  Get-Content -LiteralPath $path -Raw | ConvertFrom-Json | Out-Null
  Write-Host "OK JSON $file"
}

$pages = Get-ChildItem -LiteralPath (Join-Path $Root 'wix') -Filter '*.html' -File
$missing = New-Object System.Collections.Generic.List[string]
foreach ($page in $pages) {
  $html = Get-Content -LiteralPath $page.FullName -Raw
  $matches = [regex]::Matches($html, 'href="([^"]+)"|src="([^"]+)"')
  foreach ($match in $matches) {
    $ref = if ($match.Groups[1].Value) { $match.Groups[1].Value } else { $match.Groups[2].Value }
    if ($ref -match '^(https?:|mailto:|#)' -or $ref -match '\$\{' -or [string]::IsNullOrWhiteSpace($ref)) { continue }
    $clean = ($ref -split '#')[0]
    $clean = ($clean -split '\?')[0]
    if ([string]::IsNullOrWhiteSpace($clean)) { continue }
    $full = [System.IO.Path]::GetFullPath((Join-Path $page.DirectoryName $clean))
    if (-not (Test-Path -LiteralPath $full)) {
      $relativePage = $page.FullName
      if ($relativePage.StartsWith($Root)) { $relativePage = $relativePage.Substring($Root.Length).TrimStart([char[]]@('\','/')) }
      $missing.Add("$relativePage -> $ref")
    }
  }
}

if ($missing.Count -gt 0) {
  $missing | ForEach-Object { Write-Host "MISSING $_" }
  throw "Portfolio validation failed with $($missing.Count) missing local references."
}

Write-Host "OK portfolio validation passed for $($pages.Count) pages"


