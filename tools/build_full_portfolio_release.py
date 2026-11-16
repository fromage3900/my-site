#!/usr/bin/env python3
"""Build a NON-LIVE full Melodia portfolio preview from existing, authored pages.

Preserves original Night Velvet HTML, source images and scripts: no synthetic
render replacement, no wholesale repository export, no automatic deployment.
Only explicitly listed visitor pages and recursively referenced local assets
can enter the preview. Missing refs are reported, never silently fabricated.
"""
from __future__ import annotations

import argparse
from collections import deque
from html.parser import HTMLParser
import json
from pathlib import Path
import posixpath
import re
from shutil import copy2, rmtree
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_portfolio_release"
STALE_MANIFEST = ROOT / "content/stale-render-archive-20261115.json"
# Approved for SOURCE PREVIEW, not automatically approved for a public release.
PAGES = (
    "index.html",
    "curated-art.html",
    "world-bible.html",
    "portfolio-moodboard.html",
    "melusina-photo-studio.html",
    "shader-breakdowns.html",
    "zbrush-breakdown.html",
    "pipeline.html",
    "touchdesigner-architecture.html",
    "faraway-mother-couture.html",
    "hero-renders.html",
    "melodia-living-worlds.html",
    "realtime-3d-viewer.html",
    "constellation-brush.html",
    "sakura-case-study.html",
    "space-cathedral.html",
    "pcg-system-impact.html",
    "melodia-stage-character.html",
    "resume.html",
)
REQUIRED = (
    "index.html", "curated-art.html", "world-bible.html",
    "portfolio-moodboard.html", "melusina-photo-studio.html",
    "shader-breakdowns.html", "realtime-3d-viewer.html",
    "constellation-brush.html", "resume.html",
)
# Only binary/text asset extensions expected in the public visitor bundle.
ASSET_EXTS = frozenset({
    ".css", ".js", ".json", ".svg", ".png", ".webp", ".jpg", ".jpeg",
    ".gif", ".webm", ".mp4", ".glb", ".gltf", ".wasm", ".ico",
    ".woff", ".woff2", ".ttf", ".otf",
})
ATTRS = {"src", "href", "poster", "data-src", "data-full", "data-poster",
         "data-model", "data-model-src", "data-texture", "data-map", "srcset"}
CSS_URL = re.compile(r"url\(\s*['\"]?([^)'\"\s]+)", re.I)
CSS_IMPORT = re.compile(r"@import\s+(?:url\()?['\"]([^'\"]+)", re.I)
# Explicit dynamic files from known original visual components. Never scan
# the whole assets directory, never include miscellaneous internal files.
EXTRA_RUNTIME_FILES = (
    "wix/celestial-brush-sitewide.js",
    "wix/celestial-brush-overlay-engine.js",
    "wix/melodia-photobooth.js",
    "wix/melodia-photobooth.css",
    "wix/melodia-3d-viewport.js",
    "wix/assets/figma/nv-rose-satin.svg",
    "wix/assets/figma/nv-pearl-eclipse.svg",
    "wix/assets/figma/nv-sakura-cascade.svg",
)

class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = set()

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if not value or key not in ATTRS:
                continue
            if key == "srcset":
                for part in value.split(","):
                    self.urls.add(part.strip().split()[0])
            else:
                self.urls.add(value)

def resolve(origin: str, raw: str) -> str | None:
    raw = raw.strip()
    if not raw or raw.startswith(("#", "//", "data:", "blob:", "mailto:", "tel:")):
        return None
    u = urlsplit(raw)
    if u.scheme or u.netloc or not u.path:
        return None
    path = unquote(u.path)
    if path.startswith("/my-site/"):
        path = path[len("/my-site/"):]
    elif path.startswith("/"):
        path = path.lstrip("/")
    else:
        path = posixpath.join(posixpath.dirname(origin), path)
    path = posixpath.normpath(path)
    if path in (".", "..") or path.startswith("../"):
        return None
    # A directory navigation is not an explicit referenced file.
    if not Path(path).suffix:
        return None
    return path

def references(path: str) -> set[str]:
    text = (ROOT / path).read_text(encoding="utf-8-sig", errors="replace")
    extension = Path(path).suffix.lower()
    if extension == ".html":
        parser = References()
        parser.feed(text)
        raw = parser.urls | set(CSS_URL.findall(text))
    elif extension == ".css":
        raw = set(CSS_URL.findall(text)) | set(CSS_IMPORT.findall(text))
    else:
        # JS dynamic asset refs need explicit review; avoid guessing runtime URLs.
        raw = set()
    return {res for value in raw if (res := resolve(path, value))}

def build() -> dict:
    rejected = {i["path"] for i in
                json.loads(STALE_MANIFEST.read_text(encoding="utf-8"))["files"]}
    queue = deque("wix/" + p for p in PAGES)
    queue.extend(EXTRA_RUNTIME_FILES)
    queued = set(queue)
    files, missing, blocked, links, unresolved = set(), set(), set(), set(), {}
    candidate_pages = {"wix/" + p for p in PAGES}
    while queue:
        path = queue.popleft()
        queued.discard(path)
        if path in files:
            continue
        if path in rejected:
            blocked.add(path)
            continue
        source = ROOT / path
        if not source.is_file():
            missing.add(path)
            continue
        ext = source.suffix.lower()
        if ext != ".html" and ext not in ASSET_EXTS:
            blocked.add(path)
            continue
        files.add(path)
        if ext not in {".html", ".css"}:
            continue
        local = references(path)
        for target in local:
            if target.endswith(".html"):
                if target not in candidate_pages:
                    links.add(target)
                    unresolved.setdefault(path, []).append(target)
                continue
            if Path(target).suffix.lower() in ASSET_EXTS:
                if target not in files and target not in queued:
                    queue.append(target)
                    queued.add(target)
    if OUT.exists():
        rmtree(OUT)
    OUT.mkdir(parents=True)
    for path in sorted(files):
        dest = OUT / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        copy2(ROOT / path, dest)
    # Transparent landing redirect; original Wix source homepage remains intact.
    (OUT / "index.html").write_text(
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<meta http-equiv="refresh" content="0;url=wix/index.html">'
        '<meta name="robots" content="noindex,nofollow">'
        '<title>Melodia / Full Portfolio Preview</title></head><body>'
        '<p><a href="wix/index.html">Enter the original portfolio</a></p>'
        '</body></html>', encoding="utf-8")
    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    (OUT / "robots.txt").write_text(
        "User-agent: *\nDisallow: /\n", encoding="utf-8")
    (OUT / "404.html").write_text(
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="robots" content="noindex,nofollow">'
        '<title>Not in preview · Melodia</title></head><body>'
        '<h1>This page is not yet part of the reviewed preview.</h1>'
        '<a href="wix/index.html">Return to the full portfolio</a>'
        '</body></html>', encoding="utf-8")
    current_routes = sorted(path for path in files if path.endswith(".html"))
    report = {
        "contract": "full-portfolio-preview/v1",
        "non_live": True,
        "source_repo": "fromage3900/my-site",
        "home": "wix/index.html",
        "visitor_routes": current_routes,
        "total_source_files": len(files),
        "total_bytes": sum((ROOT / p).stat().st_size for p in files),
        "missing_assets": sorted(missing),
        "blocked_rejected_assets": sorted(blocked),
        "linked_pages_needing_route_decision": sorted(links),
        "unresolved_link_origins": {k: sorted(v) for k, v in sorted(unresolved.items())},
        "required_routes_missing": sorted({"wix/" + p for p in REQUIRED} - files),
        "review_holds": [
            "Source home still references a previously user-rejected Sakura Dream hero; choose a real approved replacement before release",
            "Dynamic JavaScript asset references and original Three.js model imports require browser review",
            "Any missing referenced media or HTML routes must be fixed before public deployment",
            "All restored pages and original archived art require honest provenance and art-direction review",
            "Physical iPhone Safari and Wix Studio shell are separate acceptance gates",
        ],
        "original_source_preserved": True,
    }
    (OUT / "published-manifest.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8")
    # Primary safeguard: no historic rejected binary can ever enter output.
    actual = {p.relative_to(OUT).as_posix() for p in OUT.rglob("*") if p.is_file()}
    if actual & rejected:
        raise RuntimeError("Previously rejected media unexpectedly copied")
    if report["required_routes_missing"]:
        raise RuntimeError("Original visitor routes missing: " +
                           repr(report["required_routes_missing"]))
    if len(current_routes) < 9:
        raise RuntimeError("Stub regression: fewer than nine genuine source pages")
    print(f"[OK] Full-site preview: {len(current_routes)} original pages, "
          f"{len(files)} source files, {report['total_bytes']/1e6:.1f} MB")
    print(f"[REVIEW] missing={len(missing)}, excluded archived={len(blocked)}, "
          f"linked routes not approved={len(links)}")
    return report

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--strict", action="store_true",
                        help="Also fail for missing assets and unresolved links")
    args = parser.parse_args()
    report = build()
    if args.strict and (report["missing_assets"] or
                        report["blocked_rejected_assets"] or
                        report["linked_pages_needing_route_decision"]):
        return 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
