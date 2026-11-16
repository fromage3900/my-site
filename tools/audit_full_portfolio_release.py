#!/usr/bin/env python3
"""Report gaps between the editable Wix portfolio and the deployed four-page subset.

ADVISORY by default. --strict fails on missing, rejected, or absent core routes.
Does not mutate source, copy media, publish a website, or treat all archived
assets as approved. Intended as the first gate for a reviewed full-site release.
"""
from __future__ import annotations

import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import posixpath
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "content/stale-render-archive-20261115.json"
RELEASE_MANIFEST = ROOT / "_recruiter_release/published-manifest.json"

# Deliberately an intended VISITOR scope, not the entire wix/ source tree.
# Some linked studies may require additional review; this audit does not approve them.
VISITOR_ROUTES = (
    "index.html",
    "curated-art.html",
    "world-bible.html",
    "portfolio-moodboard.html",
    "melusina-photo-studio.html",
    "realtime-3d-viewer.html",
    "melodia-living-worlds.html",
    "constellation-brush.html",
    "shader-breakdowns.html",
    "resume.html",
)
REQUIRED_EXPERIENCES = (
    "portfolio-moodboard.html",
    "melusina-photo-studio.html",
    "realtime-3d-viewer.html",
    "constellation-brush.html",
)
ASSET_ATTRS = {"src", "poster", "data-src", "data-full", "data-poster"}
LOCAL_TARGET_EXTS = {".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".webp",
                     ".svg", ".gif", ".webm", ".mp4", ".glb", ".gltf", ".json"}


def local_path(page: str, raw_url: str) -> str | None:
    raw_url = raw_url.strip()
    if not raw_url or raw_url.startswith(("#", "//")):
        return None
    parsed = urlsplit(raw_url)
    if parsed.scheme or parsed.netloc:
        return None
    name = unquote(parsed.path)
    if not name:
        return None
    if name.startswith("/my-site/"):
        name = name[len("/my-site/"):]
    elif name.startswith("/"):
        name = name.lstrip("/")
    else:
        name = posixpath.join(posixpath.dirname(page), name)
    normalized = posixpath.normpath(name)
    if normalized == ".." or normalized.startswith("../"):
        return None
    if Path(normalized).suffix.lower() not in LOCAL_TARGET_EXTS:
        return None
    return normalized


class LinkCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if not value:
                continue
            if key in ASSET_ATTRS or key == "href":
                self.refs.add(value)
            elif key == "srcset":
                for part in value.split(","):
                    candidate = part.strip().split(" ")[0]
                    if candidate:
                        self.refs.add(candidate)


def inventory() -> dict:
    stale = {item["path"] for item in json.loads(ARCHIVE.read_text(encoding="utf-8"))["files"]}
    release = {}
    if RELEASE_MANIFEST.exists():
        release = json.loads(RELEASE_MANIFEST.read_text(encoding="utf-8"))
    release_routes = set(release.get("pages", []))
    release_experiences = {posixpath.basename(x) for x in release.get("experiences", [])}
    if not release_routes:
        # Read the actual deployed compiler if the generated folder is absent.
        compiler = (ROOT / "tools/build_recruiter_release.py").read_text(encoding="utf-8")
        release_routes = set(re.findall(
            r'^    "([^"]+\.html)": base\(', compiler, flags=re.MULTILINE
        ))
        for name in REQUIRED_EXPERIENCES:
            if '"wix/' + name + '"' in compiler:
                release_experiences.add(name)
    shipped = release_routes | release_experiences
    items = {}
    all_missing: set[str] = set()
    all_rejected: set[str] = set()
    for name in VISITOR_ROUTES:
        relative = "wix/" + name
        source = ROOT / relative
        if not source.is_file():
            items[name] = {"source_exists": False, "published": name in shipped,
                           "missing_targets": [], "rejected_targets": []}
            all_missing.add(relative)
            continue
        parser = LinkCollector()
        parser.feed(source.read_text(encoding="utf-8-sig"))
        targets = sorted({path for raw in parser.refs
                          if (path := local_path(relative, raw))})
        missing = [target for target in targets if not (ROOT / target).is_file()]
        rejected = [target for target in targets if target in stale]
        all_missing.update(missing)
        all_rejected.update(rejected)
        items[name] = {
            "source_exists": True,
            "published": name in shipped,
            "local_target_count": len(targets),
            "missing_targets": missing,
            "rejected_targets": rejected,
        }
    return {
        "source": "fromage3900/my-site: wix/",
        "deployed_compiler": "tools/build_recruiter_release.py",
        "release_manifest_found": RELEASE_MANIFEST.exists(),
        "currently_published_routes": sorted(release_routes),
        "currently_published_experiences": sorted(release_experiences),
        "visitor_route_candidates": items,
        "missing_required_experiences": sorted(set(REQUIRED_EXPERIENCES) - shipped),
        "missing_source_targets": sorted(all_missing),
        "referenced_archived_media": sorted(all_rejected),
        "safety_note": "Static links only. JS-created URLs, external embeds, runtime rendering, "
                       "image quality, source-of-truth synchronization and physical touch "
                       "behaviour still need separate verification.",
    }


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--strict", action="store_true", help="Fail if any core preservation gate fails")
    p.add_argument("--output", type=Path, help="Optional destination for JSON report")
    args = p.parse_args()
    report = inventory()
    print(json.dumps(report, indent=2))
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    if args.strict and (report["missing_required_experiences"]
                        or report["missing_source_targets"]
                        or report["referenced_archived_media"]):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
