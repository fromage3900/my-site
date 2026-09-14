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

function Test-LocalReference {
  param(
    [string]$PagePath,
    [string]$Reference
  )

  if ([string]::IsNullOrWhiteSpace($Reference)) { return $null }
  if ($Reference -match '^(https?:|mailto:|tel:|javascript:|data:|blob:|#)' -or
      $Reference -match '\$\{' -or
      $Reference -match '%%[^%]+%%') {
    return $null
  }

  $clean = ($Reference -split '#')[0]
  $clean = ($clean -split '\?')[0]
  if ([string]::IsNullOrWhiteSpace($clean)) { return $null }

  $pageDirectory = Split-Path -Parent $PagePath
  $full = [System.IO.Path]::GetFullPath((Join-Path $pageDirectory $clean))
  $rootFull = [System.IO.Path]::GetFullPath($Root).TrimEnd('\', '/')
  $insideRepo = $full.Equals($rootFull, [StringComparison]::OrdinalIgnoreCase) -or
    $full.StartsWith($rootFull + '\', [StringComparison]::OrdinalIgnoreCase) -or
    $full.StartsWith($rootFull + '/', [StringComparison]::OrdinalIgnoreCase)

  if (-not $insideRepo -or -not (Test-Path -LiteralPath $full)) {
    return $Reference
  }

  return $null
}

$pages = Get-ChildItem -LiteralPath (Join-Path $Root 'wix') -Filter '*.html' -File
$missing = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)

foreach ($page in $pages) {
  $html = Get-Content -LiteralPath $page.FullName -Raw
  $relativePage = $page.FullName
  if ($relativePage.StartsWith($Root)) {
    $relativePage = $relativePage.Substring($Root.Length).TrimStart([char[]]@('\','/'))
  }

  $matches = [regex]::Matches($html, '(?:href|src|poster)="([^"]+)"')
  foreach ($match in $matches) {
    $bad = Test-LocalReference -PagePath $page.FullName -Reference $match.Groups[1].Value
    if ($bad) { [void]$missing.Add("$relativePage -> $bad") }
  }

  $srcsets = [regex]::Matches($html, 'srcset="([^"]+)"')
  foreach ($srcset in $srcsets) {
    $candidates = $srcset.Groups[1].Value -split ','
    foreach ($candidate in $candidates) {
      $ref = (($candidate.Trim()) -split '\s+')[0]
      $bad = Test-LocalReference -PagePath $page.FullName -Reference $ref
      if ($bad) { [void]$missing.Add("$relativePage -> $bad") }
    }
  }
}

if ($missing.Count -gt 0) {
  $missing | Sort-Object | ForEach-Object { Write-Host "MISSING $_" }
  throw "Portfolio validation failed with $($missing.Count) unique missing local references."
}

Write-Host "OK portfolio validation passed for $($pages.Count) pages"


# PUBLIC ROUTE SYNC
$publicManifestPath = Join-Path $Root 'wix/public-routes.json'
if (-not (Test-Path -LiteralPath $publicManifestPath)) {
  throw "Missing public route manifest: wix/public-routes.json"
}
$publicManifest = Get-Content -LiteralPath $publicManifestPath -Raw | ConvertFrom-Json
$publicBuild = [string]$publicManifest.build
$requiredPublicMarkers = @(
  'melodia-luxury-type.css',
  'melodia-editorial.css',
  'melodia-site-nav.js',
  'melodia-editorial.js'
)

foreach ($route in $publicManifest.canonical) {
  $routePath = Join-Path $Root (Join-Path 'wix' ([string]$route))
  if (-not (Test-Path -LiteralPath $routePath)) {
    throw "Missing canonical public route: wix/$route"
  }

  $routeHtml = Get-Content -LiteralPath $routePath -Raw
  $buildMarker = 'name="melodia-build" content="' + $publicBuild + '"'
  if ($routeHtml -notlike ('*' + $buildMarker + '*')) {
    throw "Public route build drift: wix/$route does not declare $publicBuild"
  }

  foreach ($marker in $requiredPublicMarkers) {
    if ($routeHtml -notlike ('*' + $marker + '*')) {
      throw "Public route stack drift: wix/$route is missing $marker"
    }
  }
}

Write-Host "OK public route sync build $publicBuild across $($publicManifest.canonical.Count) canonical pages"


# ROUTE HYGIENE
function Assert-NoIndexRoute {
  param(
    [string]$Route,
    [string]$Category
  )

  $routePath = Join-Path $Root (Join-Path 'wix' $Route)
  if (-not (Test-Path -LiteralPath $routePath)) {
    throw "Missing $Category route: wix/$Route"
  }

  $routeHtml = Get-Content -LiteralPath $routePath -Raw
  if ($routeHtml -notmatch 'name=["'']robots["''][^>]*content=["''][^"'']*noindex') {
    throw "Route hygiene failed: wix/$Route ($Category) must declare noindex"
  }
}

foreach ($route in $publicManifest.internal_not_navigation) {
  Assert-NoIndexRoute -Route ([string]$route) -Category 'internal'
}

foreach ($route in $publicManifest.component_examples) {
  Assert-NoIndexRoute -Route ([string]$route) -Category 'component'
}

foreach ($route in $publicManifest.retired_redirects) {
  Assert-NoIndexRoute -Route ([string]$route) -Category 'retired'
  $retiredPath = Join-Path $Root (Join-Path 'wix' ([string]$route))
  $retiredHtml = Get-Content -LiteralPath $retiredPath -Raw
  if ($retiredHtml -notmatch 'http-equiv=["'']refresh["'']' -or
      $retiredHtml -notmatch 'rel=["'']canonical["'']') {
    throw "Route hygiene failed: wix/$route retired route must redirect and declare canonical"
  }
}

Write-Host "OK route hygiene: internal/component/retired boundaries enforced"


# REVIEWER-PRIORITY SUPPORTING ROUTES
foreach ($route in $publicManifest.reviewer_priority_supporting) {
  $routePath = Join-Path $Root (Join-Path 'wix' ([string]$route))
  if (-not (Test-Path -LiteralPath $routePath)) {
    throw "Missing reviewer-priority route: wix/$route"
  }

  $routeHtml = Get-Content -LiteralPath $routePath -Raw
  $buildMarker = 'name="melodia-build" content="' + $publicBuild + '"'
  if ($routeHtml -notlike ('*' + $buildMarker + '*')) {
    throw "Reviewer route build drift: wix/$route does not declare $publicBuild"
  }

  foreach ($marker in $requiredPublicMarkers) {
    if ($routeHtml -notlike ('*' + $marker + '*')) {
      throw "Reviewer route stack drift: wix/$route is missing $marker"
    }
  }
}

Write-Host "OK reviewer-priority route sync build $publicBuild across $($publicManifest.reviewer_priority_supporting.Count) supporting pages"
