#!/usr/bin/env python3
"""Fail if a GitHub Pages build silently collapses the full Melodia site.

Run AFTER tools/build_restored_website.py, against the actual upload artifact.
This is a preservation check, not proof of render quality or live Wix status.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_recruiter_release"  # Historical folder name; now restored ORIGINAL site.
EXPECTED_ROUTES = {
    "index.html", "curated-art.html", "world-bible.html",
    "portfolio-moodboard.html", "melusina-photo-studio.html",
    "constellation-brush.html", "realtime-3d-viewer.html",
    "melodia-living-worlds.html", "shader-breakdowns.html",
    "hero-renders.html", "faraway-mother-couture.html",
    "resume.html",
}
EXPECTED_ASSETS = {
    "wix/celestial-brush-sitewide.js",
    "wix/celestial-brush-overlay-engine.js",
    "wix/melodia-starfield.js",
    "wix/melodia-dream-shaders.js",
    "wix/melodia-photobooth.js",
    "wix/melodia-3d-viewport.js",
    "wix/assets/figma/nv-rose-satin.svg",
    "wix/assets/figma/nv-sakura-cascade.svg",
    "wix/assets/figma/nv-pearl-eclipse.svg",
    "generated/optimized/curated-art/melusina_beauty_eevee_20260715c_01-1280.webp",
}

def main() -> int:
    manifest_path = OUT / "published-manifest.json"
    if not manifest_path.is_file():
        raise SystemExit("FAIL: actual Pages artifact manifest is missing")
    m = json.loads(manifest_path.read_text(encoding="utf-8"))
    if m.get("release_contract") != "original-interactive-website/v2":
        raise SystemExit("FAIL: Pages artifact reverted to recruiter-only contract")
    pages = set(m.get("public_pages", []))
    missing_pages = sorted(EXPECTED_ROUTES - pages)
    missing_assets = sorted(p for p in EXPECTED_ASSETS if not (OUT / p).is_file())
    if missing_pages or len(pages) < 30:
        raise SystemExit(f"FAIL: original portfolio page regression: {missing_pages}; total={len(pages)}")
    if missing_assets:
        raise SystemExit(f"FAIL: original interactive/image assets lost: {missing_assets}")
    if m.get("file_count", 0) < 300:
        raise SystemExit("FAIL: Pages artifact collapsed below 300 intentional files")
    for page in EXPECTED_ROUTES:
        if not (OUT / "wix" / page).is_file():
            raise SystemExit(f"FAIL: public route missing from actual output: {page}")
    home = (OUT / "wix/index.html").read_text(encoding="utf-8")
    for marker in ("An atelier of curiosities.", "portfolio-moodboard.html",
                   "melusina-photo-studio.html", "constellation-brush.html",
                   "realtime-3d-viewer.html"):
        if marker not in home:
            raise SystemExit(f"FAIL: actual published homepage lost {marker}")
    rejected = json.loads((ROOT / "content/stale-render-archive-20261115.json").read_text(encoding="utf-8"))
    republished = [entry["path"] for entry in rejected["files"]
                   if (OUT / entry["path"]).exists()]
    if republished:
        raise SystemExit(f"FAIL: archived rejected artwork republished: {republished}")
    print(f"[OK] Anti-stub: {len(pages)} authentic pages, "
          f"{m['file_count']} files, original 3D galleries, animations, "
          f"Figma ornaments and original Three.js runtime present.")
    print("NOTE: does not certify visual quality, HTTP response, external 3D CDNs or Wix shell.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
