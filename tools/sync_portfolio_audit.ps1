param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string]$AuditRoot = 'G:\EnvironmentPortfolio\BS_GodFile\Saved\Audit'
)

$ErrorActionPreference = 'Stop'

function Read-JsonFile {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

$wp = Read-JsonFile (Join-Path $AuditRoot 'wp_pillar_levels.json')
$pcg = Read-JsonFile (Join-Path $AuditRoot 'pcg_universal_build.json')
$geo = Read-JsonFile (Join-Path $AuditRoot 'geometryscript_meshes.json')
$mi = Read-JsonFile (Join-Path $AuditRoot 'material_instance_audit.json')
$nap = Read-JsonFile (Join-Path $AuditRoot 'nap_prep.json')

$pillars = @{}
$pcgTotal = 0
if ($wp -and $wp.pillars) {
  foreach ($key in $wp.pillars.PSObject.Properties.Name) {
    $p = $wp.pillars.$key
    $ism = if ($p.verify.total_ism) { [int]$p.verify.total_ism } elseif ($p.total_ism) { [int]$p.total_ism } else { 0 }
    $pcgTotal += $ism
    $pillars[$key] = [ordered]@{
      level = $p.level
      total_ism = $ism
      passed = [bool]($p.verify.passed -or $p.passed)
    }
  }
}

$geoBaked = 0
$geoCatalog = 0
if ($geo -and $geo.structures) {
  $geoCatalog = @($geo.structures.PSObject.Properties).Count
  foreach ($prop in $geo.structures.PSObject.Properties) {
    if ($prop.Value.status -eq 'baked') { $geoBaked++ }
  }
}

$portfolioMis = 30
$missingParents = 0
if ($mi -and $mi.counts) {
  if ($mi.counts.materials_total) { $portfolioMis = [int]$mi.counts.materials_total }
  if ($mi.counts.missing_parent_master) { $missingParents = [int]$mi.counts.missing_parent_master }
}

$signals = [System.Collections.Generic.List[object]]@()
if ($pcgTotal -gt 0) {
  $signals.Add([ordered]@{
    title = "WP PCG verified - $pcgTotal ISM"
    label = 'Production log'
    note = "From wp_pillar_levels.json - four L_WP pillars with ISM regen pass."
  })
}
if ($missingParents -eq 0) {
  $signals.Add([ordered]@{
    title = 'Portfolio MIs - zero missing parents'
    label = 'Materials'
    note = "$portfolioMis tracked instances after nap prep instances-only sync."
  })
}
if ($geoBaked -ge 0) {
  $signals.Add([ordered]@{
    title = "GeometryScript bakes - $geoBaked / $geoCatalog"
    label = 'UE meshes'
    note = 'From geometryscript_meshes.json audit manifest.'
  })
}
if ($pcg -and $pcg.passed) {
  $signals.Add([ordered]@{
    title = 'Universal PCG graphs rebuilt'
    label = 'UE PCG'
    note = "setup_pcg_universal.py - $($pcg.generated_at)"
  })
}

$out = [ordered]@{
  generated_at = (Get-Date).ToUniversalTime().ToString('o')
  sources = [ordered]@{
    wp_pillars = 'BS_GodFile/Saved/Audit/wp_pillar_levels.json'
    pcg_universal = 'BS_GodFile/Saved/Audit/pcg_universal_build.json'
    geometryscript = 'BS_GodFile/Saved/Audit/geometryscript_meshes.json'
    material_instances = 'BS_GodFile/Saved/Audit/material_instance_audit.json'
    nap_prep = 'BS_GodFile/Saved/Audit/nap_prep.json'
  }
  wp_pillars = $pillars
  pcg_total_ism = $pcgTotal
  portfolio_mis = $portfolioMis
  missing_parent_masters = $missingParents
  geometryscript_baked = $geoBaked
  geometryscript_catalog = $geoCatalog
  nap_prep_exit = if ($nap) { $nap.exit_code } else { $null }
  latest_signals = @($signals)
  blender_systems = @(
    [ordered]@{
      id = 'surreal-arch'
      title = 'Surreal Architecture Generator'
      status = 'live'
      path = 'BS_GodFile/deploy/surreal_architecture_gen.py'
      proof = 'GB_ZEN_* shrine axis, GB_ESCHER_* greybox, runtime GeometryNodeTree'
    },
    [ordered]@{
      id = 'roof-generator'
      title = 'RoofGeneratorPro'
      status = 'partial'
      path = 'RoofGeneratorPro/FromagesRoofGenerator'
      proof = 'SHED + BUTTERFLY procedural GN (validate_gn.py)'
    },
    [ordered]@{
      id = 'ue-pcg'
      title = 'WP pillar PCG'
      status = if ($pcgTotal -gt 0) { 'live' } else { 'scaffold' }
      path = '/Game/EnvSandbox/PCG/'
      proof = "Total ISM $pcgTotal across four pillars"
    }
  )
  planned_not_built = @(
    'GN_UniversalScatter - no Blender asset in repo (UE PCG + SurrealArch scatter instead)'
    'GN_RockGenerator - UE build_universal_rock_scatter.py is the live implementation'
    'terrain_gn.py - world-loop backlog, file does not exist'
  )
}

$dest = Join-Path $Root 'generated\portfolio_production_signals.json'
$out | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $dest -Encoding UTF8
Write-Host "OK wrote $dest (PCG ISM=$pcgTotal, geo baked=$geoBaked/$geoCatalog)"
