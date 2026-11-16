#!/usr/bin/env python3
"""Preserve real source brush and prevent silent removal from strict public routes."""
from pathlib import Path
import importlib.util
import sys

ROOT = Path(__file__).resolve().parents[1]
def read(p): return (ROOT / p).read_text(encoding="utf-8-sig")
def must(condition, why):
    if not condition: raise AssertionError(why)

brush = read("wix/constellation-brush.html")
bridge = read("wix/celestial-brush-sitewide.js")
engine = read("wix/celestial-brush-overlay-engine.js")
nav = read("wix/melodia-site-nav.js")
release = read("tools/build_recruiter_release.py")
for symbol in ("function onMove(e)", "function delicateStar", "function spawnOrbit",
               "THREE.WebGLRenderer", "function seed()"):
    must(symbol in brush, f"Original standalone gesture brush lost: {symbol}")
for symbol in ("function onMove(e)", "function delicateStar", "function spawnOrbit",
               "THREE.WebGLRenderer", "const overlayMode = true"):
    must(symbol in engine, f"Original gesture math lost from transparent derivative: {symbol}")
must("if (!overlayMode) scene.add(bg)" in engine, "Overlay must be transparent")
must("if (!overlayMode) seed()" in engine, "Overlay should not cover site with idle stars")
must("window.MelodiaCelestialBrushInput" in engine, "Original gesture input is no longer forwarded")
must("canvas.dataset.celestialSitewide" in bridge, "Sitewide native canvas contract was lost")
must("if (window.top !== window.self) return;" not in bridge,
     "Wix iframe incorrectly suppresses site-wide brush")
must("pointer-events:none" in bridge,
     "Wix embedded cursor must not block clickable portfolio content")
must("prefers-reduced-motion:no-preference" in bridge, "Reduced-motion guard lost")
must("pointer-events:none" in bridge, "Brush must not intercept links")
must("pointermove" in bridge and "MelodiaCelestialBrushInput.move" in bridge, "Brush no longer follows cursor")
must("celestial-brush-sitewide.js" in nav, "Source shared nav no longer mounts brush")
for page in ("wix/portfolio-moodboard.html", "wix/melusina-photo-studio.html"):
    must("celestial-brush-sitewide.js" in read(page), f"Standalone gallery lost brush: {page}")
must('"wix/celestial-brush-sitewide.js"' in release, "Strict release excludes brush runtime")
must('"wix/celestial-brush-overlay-engine.js"' in release, "Strict release excludes derived original engine")
must('src="celestial-brush-sitewide.js' in release, "Strict public routes do not boot brush")
must('"generated/assets/unreal/contact-sheets/Faraway_COP_Foundry_Breakdown.webp"' in release,
     "Approved COP technical contact sheet missing")
must("Melusina — Ground contact and layered costume" in release,
     "Measured character technical breakdown disappeared")
must((ROOT / "generated/assets/unreal/contact-sheets/Faraway_COP_Foundry_Breakdown.webp").is_file(),
     "COP contact sheet file is missing")
# Check generated output as well: the published pages are NOT the source wix pages.
spec = importlib.util.spec_from_file_location("recruiter_release", ROOT / "tools/build_recruiter_release.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
mod.main()
out = ROOT / "_recruiter_release/wix"
for name in ("index.html", "curated-art.html", "technical-art.html", "resume.html"):
    html = (out / name).read_text(encoding="utf-8")
    must("celestial-brush-sitewide.js" in html, f"Sitewide brush absent in published {name}")
must((out / "celestial-brush-sitewide.js").is_file(), "Published sitewide bridge missing")
must((out / "celestial-brush-overlay-engine.js").is_file(), "Published Three.js brush engine missing")
must((out / "constellation-brush.html").is_file(), "Published original brush missing")
must((ROOT / "_recruiter_release/generated/assets/unreal/contact-sheets/Faraway_COP_Foundry_Breakdown.webp").is_file(),
     "Published technical contact sheet missing")
print("OK: original constellation brush + sitewide desktop overlay + sourced tech evidence retained.")
