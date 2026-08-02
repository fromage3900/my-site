# Sync Surreal Architecture deploy tree to live Blender 5.1 addons.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$deploy = Join-Path $root "deploy"
$live = Join-Path $env:APPDATA "Blender Foundation\Blender\5.1\scripts\addons"

Copy-Item (Join-Path $deploy "surreal_architecture_gen.py") (Join-Path $live "surreal_architecture_gen.py") -Force
Get-ChildItem (Join-Path $deploy "surreal_arch") -Filter "*.py" -Recurse | ForEach-Object {
    $rel = $_.FullName.Substring((Join-Path $deploy "surreal_arch").Length)
    $dest = Join-Path (Join-Path $live "surreal_arch") $rel
    $destDir = Split-Path -Parent $dest
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item $_.FullName $dest -Force
}
if (Test-Path (Join-Path $deploy "surreal_greybox")) {
    Copy-Item (Join-Path $deploy "surreal_greybox") (Join-Path $live "surreal_greybox") -Recurse -Force
}
if (Test-Path (Join-Path $deploy "surreal_world")) {
    Get-ChildItem (Join-Path $deploy "surreal_world") -Filter "*.py" -Recurse | ForEach-Object {
        $rel = $_.FullName.Substring((Join-Path $deploy "surreal_world").Length)
        $dest = Join-Path (Join-Path $live "surreal_world") $rel
        $destDir = Split-Path -Parent $dest
        if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
        Copy-Item $_.FullName $dest -Force
    }
}
if (Test-Path (Join-Path $deploy "surreal_os")) {
    $destOs = Join-Path $live "surreal_os"
    if (Test-Path $destOs) { Remove-Item $destOs -Recurse -Force }
    Copy-Item (Join-Path $deploy "surreal_os") $destOs -Recurse -Force
}
Write-Host "Synced deploy -> live Blender addons"
