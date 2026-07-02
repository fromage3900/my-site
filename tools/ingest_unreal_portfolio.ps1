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
$assetDir = Join-Path $Root 'generated\assets\unreal'
if (-not $NoAssetCopy) { New-Item -ItemType Directory -Force -Path $assetDir | Out-Null }

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
      'materials' { 72 - $index }
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

$cardsJson = ($intake.render_cards | ConvertTo-Json -Depth 12 -Compress)
$familiesJson = ($intake.shader_families | ConvertTo-Json -Depth 12 -Compress)
$countsJson = ($intake.counts | ConvertTo-Json -Depth 8 -Compress)
$readinessJson = ($intake.readiness | ConvertTo-Json -Depth 8 -Compress)
$sceneName = if ($package.scene.scene_name) { $package.scene.scene_name } else { 'Unreal Portfolio Package' }
$engine = if ($package.scene.engine) { $package.scene.engine } else { 'Unreal Engine' }
$updated = (Get-Date).ToString('yyyy-MM-dd HH:mm')

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Render Constellation | Brennan Shepherd</title>
<meta name="description" content="A reusable Unreal portfolio intake dashboard for render plates, shader families, Niagara breakdowns, PCG proof, and website publishing readiness." />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--void:#080b13;--astral:#12182d;--plum:#2d203c;--gold:#c8a45e;--paper:#fffaf2;--ivory:#f7f2ea;--ink:#221a2a;--muted:#6d6275;--lavender:#e9e5f2;--line:rgba(200,164,94,.32);--max:1180px}*{box-sizing:border-box}body{margin:0;background:var(--ivory);color:var(--ink);font-family:"IBM Plex Mono",monospace;letter-spacing:0}a{color:inherit;text-decoration:none}img{display:block;max-width:100%}.nav{position:sticky;top:0;z-index:10;display:flex;justify-content:space-between;gap:18px;align-items:center;padding:14px 34px;border-bottom:1px solid var(--line);background:rgba(247,242,234,.92);backdrop-filter:blur(14px)}.brand{font-family:Cinzel,serif;font-weight:700;font-size:.78rem;letter-spacing:.18em;text-transform:uppercase}.nav a:last-child{padding:10px 14px;background:var(--astral);color:var(--lavender);font-size:.68rem;letter-spacing:.14em;text-transform:uppercase}.hero{position:relative;overflow:hidden;padding:86px 34px 52px;background:linear-gradient(135deg,var(--void),var(--plum));color:var(--lavender)}.hero:before{content:"";position:absolute;inset:0;opacity:.18;background:radial-gradient(circle at 12% 20%,#fff 0 1px,transparent 1.8px);background-size:90px 90px}.inner{position:relative;width:min(100%,var(--max));margin:0 auto}.kicker,.meta{margin:0;color:#e4c990;font-size:.7rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;line-height:1.7}h1,h2,h3{margin:0;font-family:Fraunces,Georgia,serif;font-weight:500;letter-spacing:0}h1{max-width:920px;margin-top:12px;font-size:clamp(3.2rem,8vw,7.5rem);line-height:.88}h2{font-size:clamp(2.4rem,5vw,4.8rem);line-height:.94}h3{font-size:1.8rem;line-height:1}.lede{max-width:760px;color:rgba(233,229,242,.78);font-family:Fraunces,serif;font-style:italic;font-size:1.45rem;line-height:1.36}.band{padding:82px 34px}.paper{background:var(--ivory)}.astral{background:linear-gradient(135deg,var(--astral),var(--plum));color:var(--lavender)}.section-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,430px);gap:46px;align-items:end;margin-bottom:34px}.section-head p{margin:0;color:var(--muted);line-height:1.7}.astral .section-head p{color:rgba(233,229,242,.72)}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border:1px solid var(--line)}.stat{padding:22px;background:rgba(255,255,255,.74)}.astral .stat{background:rgba(255,255,255,.05)}.stat strong{display:block;margin-top:8px;font-family:Fraunces,serif;font-size:2.4rem;font-weight:500}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{overflow:hidden;border:1px solid var(--line);background:var(--paper)}.thumb{aspect-ratio:16/10;background:linear-gradient(135deg,rgba(18,24,45,.16),rgba(200,164,94,.12));display:grid;place-items:center;color:var(--muted);text-align:center;padding:18px}.thumb img{width:100%;height:100%;object-fit:cover}.card-body{padding:18px}.card-body p{color:var(--muted);line-height:1.58}.pill{display:inline-flex;margin:0 8px 8px 0;padding:7px 9px;border:1px solid var(--line);font-size:.68rem;letter-spacing:.12em;text-transform:uppercase}.family-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.family{border:1px solid rgba(200,164,94,.3);padding:18px;background:rgba(255,255,255,.06)}.family strong{display:block;color:#e4c990;font-family:Fraunces,serif;font-size:1.35rem;font-weight:500}.family p{color:rgba(233,229,242,.68);line-height:1.54}.needs{display:grid;gap:12px}.need{padding:16px 18px;border-left:4px solid var(--gold);background:rgba(255,255,255,.72);line-height:1.6}.buttons{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.button{display:inline-flex;min-height:42px;align-items:center;padding:10px 14px;border:1px solid var(--line);background:var(--astral);color:var(--lavender);font-size:.68rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase}.footer{padding:36px 34px;background:var(--void);color:rgba(233,229,242,.68);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase}@media(max-width:900px){.section-head,.grid,.family-grid,.stats{grid-template-columns:1fr}.nav{padding:12px 18px}.band,.hero{padding-left:18px;padding-right:18px}}
</style>
</head>
<body>
<header class="nav"><a class="brand" href="application-hub.html">Brennan Shepherd / Render Constellation</a><a href="../generated/unreal_portfolio_intake.json">Intake JSON</a></header>
<section class="hero"><div class="inner"><p class="kicker">Reusable Unreal to web intake</p><h1>Every render has a job.</h1><p class="lede">This dashboard reads the Unreal portfolio package, copies web-ready plates, and turns hero renders, shader families, Niagara gaps, and PCG proof into a recruiter-readable production map.</p><div class="buttons"><a class="button" href="shader-breakdowns.html">Shader pages</a><a class="button" href="hero-renders.html">Hero renders</a><a class="button" href="application-hub.html">Application hub</a></div></div></section>
<section class="band paper"><div class="inner"><div class="section-head"><div><p class="kicker">Package Snapshot</p><h2>$sceneName</h2></div><p>Generated $updated from <strong>$engine</strong>. The score is not a quality judgment; it measures whether the site has enough proof to explain the work quickly.</p></div><div class="stats" id="stats"></div></div></section>
<section class="band paper"><div class="inner"><div class="section-head"><div><p class="kicker">Render Cards</p><h2>Promote, explain, or recapture.</h2></div><p>Hero and material plates are web-ready when copied into the repo. Breakdown and PCG slots become the checklist for Claude and Unreal tonight.</p></div><div class="grid" id="cards"></div></div></section>
<section class="band astral"><div class="inner"><div class="section-head"><div><p class="kicker">Shader Families</p><h2>Material language as a map.</h2></div><p>Families are grouped from Unreal metadata so the website can decide which shader stories deserve full Melodia breakdown cards.</p></div><div class="family-grid" id="families"></div></div></section>
<section class="band paper"><div class="inner"><div class="section-head"><div><p class="kicker">Next Capture Needs</p><h2>What tonight's render pass should fill.</h2></div><p>These needs come from the package itself. When Claude sends new captures, rerun the intake script and this page will update.</p></div><div class="needs" id="needs"></div><div class="buttons"><a class="button" href="../generated/wix_embed_manifest.json">Wix manifest</a><a class="button" href="../generated/infold_research_alignment.json">Infold alignment</a></div></div></section>
<footer class="footer"><div class="inner">Render Constellation / generated from portfolio_package.json / Brennan Shepherd</div></footer>
<script>
const COUNTS = $countsJson;
const READINESS = $readinessJson;
const CARDS = $cardsJson;
const FAMILIES = $familiesJson;
const statData = [
  ['Readiness', READINESS.score + '/100'],
  ['Web-ready plates', COUNTS.renders_web_ready + '/' + COUNTS.renders_total],
  ['Shader families', COUNTS.shader_families],
  ['Material instances', COUNTS.material_instances]
];
function esc(value){return String(value == null ? '' : value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
document.getElementById('stats').innerHTML = statData.map(function(pair){return '<article class="stat"><span class="meta">' + esc(pair[0]) + '</span><strong>' + esc(pair[1]) + '</strong></article>';}).join('');
document.getElementById('cards').innerHTML = CARDS.map(function(card){var q = String.fromCharCode(39); var media = card.web_path ? "<img " + "sr" + "c=" + q + esc(card.web_path) + q + " alt=" + q + esc(card.filename) + q + ">" : "<span>" + esc(card.status) + "</span>"; return '<article class="card"><div class="thumb">' + media + '</div><div class="card-body"><span class="pill">' + esc(card.group) + '</span><span class="pill">' + esc(card.status) + '</span><h3>' + esc(card.filename) + '</h3><p>' + esc(card.caption) + '</p></div></article>';}).join('');
document.getElementById('families').innerHTML = FAMILIES.map(function(family){return '<article class="family"><strong>' + esc(family.family) + '</strong><p>' + esc(family.count) + ' materials</p><p>' + (family.sample_materials || []).slice(0,3).map(esc).join('<br>') + '</p></article>';}).join('');
document.getElementById('needs').innerHTML = (READINESS.next_needs || []).map(function(need){return '<div class="need">' + esc(need) + '</div>';}).join('') || '<div class="need">No urgent gaps detected. Keep curating the strongest captures.</div>';
</script>
</body>
</html>
"@

$htmlPath = Join-Path $Root 'wix\render-constellation.html'
$html | Set-Content -LiteralPath $htmlPath -Encoding UTF8

Write-Host "OK wrote $intakePath"
Write-Host "OK wrote $htmlPath"
Write-Host "OK copied $webReady render assets into $assetDir"
Write-Host "STATUS $($intake.readiness.label) score=$($intake.readiness.score)"


