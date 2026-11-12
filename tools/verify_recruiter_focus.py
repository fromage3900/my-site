#!/usr/bin/env python3
"""Prevent recruiter-first portfolio paths from drifting back to web-toy navigation."""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
WIX = ROOT / "wix"
errors = []

def require(ok, message):
    if not ok:
        errors.append(message)
        print("FAIL", message)

def page(name):
    return (ROOT / name).read_text(encoding="utf-8-sig")

root = page("index.html")
home = page("wix/index.html")
worlds = page("wix/world-bible.html")
nav = page("wix/melodia-site-nav.js")
manifest = json.loads(page("wix/public-routes.json"))
sitemap = page("sitemap.xml")

require("three.min.js" not in root and "WebGLRenderer" not in root, "root gateway loads WebGL")
require("location.replace('wix/index.html'" in root, "root gateway should enter portfolio directly")
require('href="wix/curated-art.html"' in root, "root gateway lacks Selected Art")
require(len(re.findall(r'<a class="home-foyer-card', home)) == 4, "homepage must have exactly four recruiter destination cards")
require('data-effects="none"' in home, "homepage decorative effects are not disabled")
require("<video" not in home and "td-lookdev-switcher" not in home, "homepage toy/video reintroduced")
require('faraway-mother-couture.html' in home, "homepage missing Faraway feature")
require("melodia-starfield.js" not in home, "homepage starfield loaded")

names = ["House", "KaleidoNave", "Poitou", "Sea Above", "Faraway Mother"]
positions = [worlds.find("<h3>" + name + "</h3>") for name in names]
require(all(pos >= 0 for pos in positions) and positions == sorted(positions), "current five-world order drifted")
require("melodia-planetarium.js" not in worlds, "World Bible loaded planetarium")
require("Sakura Dream" in worlds and "earlier" in worlds.lower(), "historical world research not clearly labeled")
require("Living Worlds · Web Study" in nav and "href:'world-bible.html'" in nav, "shared nav lost reviewer route")

archived = ["cosmic-orrery.html", "application-hub.html", "render-constellation.html",
            "realtime-3d-viewer.html", "melodia-atelier-lab.html"]
for filename in archived:
    content = page("wix/" + filename)
    require(bool(re.search(r'<meta\s+name="robots"\s+content="[^"]*noindex', content)), filename + " must be noindex")
    require("/wix/" + filename not in sitemap, filename + " must not be in sitemap")

require("faraway-mother-couture.html" in sitemap, "Faraway feature missing from sitemap")
require("faraway-mother-couture.html" in manifest["public_supporting"], "Faraway missing route classification")
require("application-hub.html" not in manifest["canonical"], "Architecture Hub accidentally made primary")
require("cosmic-orrery.html" not in manifest["canonical"], "Cosmic Orrery accidentally made primary")

for filename in [
    "hero-sakura-dream-ink-shrine.webp",
    "faraway_hero_heart_gate.webp",

    "faraway_cathedral_nave.webp",
    "nikki9-kaleido-nave-hero.webp",
    "nikki9-melusina-morning-matrix.webp",
]:
    require((ROOT / "generated/assets/unreal" / filename).is_file(), "missing featured image " + filename)

if errors:
    print(f"Recruiter focus: {len(errors)} failure(s)")
    sys.exit(1)
print("OK recruiter focus: four destinations, five worlds, archived labs and hero images")
