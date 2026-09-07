#!/usr/bin/env python3
"""Recruiter-facing portfolio hardening gate.

Checks only claims/presentation contracts that should never regress silently:
- canonical public pages have stable canonical + social metadata
- social images are absolute raster URLs
- no noindex on canonical pages
- no recruiter-facing placeholder language on canonical pages
- known rejected render plates do not leak back into public/reviewer HTML
- root gateway prioritizes selected work before experiments

This intentionally complements, rather than replaces, validate_portfolio.ps1.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WIX = ROOT / "wix"
BASE = "https://fromage3900.github.io/my-site"
MANIFEST = json.loads((WIX / "public-routes.json").read_text(encoding="utf-8"))

CANONICAL = [str(x) for x in MANIFEST.get("canonical", [])]
PUBLIC = sorted(
    set(
        CANONICAL
        + [str(x) for x in MANIFEST.get("secondary_case_studies", [])]
        + [str(x) for x in MANIFEST.get("public_supporting", [])]
        + [str(x) for x in MANIFEST.get("targeted_evidence", [])]
        + [str(x) for x in MANIFEST.get("experience_labs", [])]
    )
)

BANNED_CANONICAL_PHRASES = (
    "beauty pending",
    "world beauty pending",
    "route beauty pending",
    "sandbox beauty pending",
    "awaiting capture",
    "[coming]",
    "coming soon",
    "lorem ipsum",
)

# These are pixel-reviewed rejections, not merely old filenames.
REJECTED_PUBLIC_PLATES = (
    "melusina_cam_beauty_nikki_2026-08-13",
    "WP_SpaceCathedral_terrain.png",
    "hero_l_wp_sakuradream_1920x1080.png",
    "rose_window_void_iri_beauty_34.png",
)

def meta_content(html: str, *, name: str | None = None, prop: str | None = None) -> str | None:
    key = "name" if name is not None else "property"
    value = name if name is not None else prop
    assert value is not None
    pat = re.compile(
        rf"<meta\s+[^>]*{key}=[\"']{re.escape(value)}[\"'][^>]*content=[\"']([^\"']+)[\"'][^>]*>",
        re.I,
    )
    m = pat.search(html)
    if m:
        return m.group(1).strip()

    # tolerate content appearing before name/property
    pat2 = re.compile(
        rf"<meta\s+[^>]*content=[\"']([^\"']+)[\"'][^>]*{key}=[\"']{re.escape(value)}[\"'][^>]*>",
        re.I,
    )
    m = pat2.search(html)
    return m.group(1).strip() if m else None


def canonical_href(html: str) -> str | None:
    m = re.search(r"<link\s+[^>]*rel=[\"']canonical[\"'][^>]*href=[\"']([^\"']+)[\"'][^>]*>", html, re.I)
    if m:
        return m.group(1).strip()
    m = re.search(r"<link\s+[^>]*href=[\"']([^\"']+)[\"'][^>]*rel=[\"']canonical[\"'][^>]*>", html, re.I)
    return m.group(1).strip() if m else None


def fail(errors: list[str], message: str) -> None:
    errors.append(message)
    print(f"FAIL {message}")


def main() -> int:
    errors: list[str] = []

    for route in CANONICAL:
        path = WIX / route
        if not path.is_file():
            fail(errors, f"missing canonical page wix/{route}")
            continue

        html = path.read_text(encoding="utf-8")
        lower = html.lower()
        expected = f"{BASE}/wix/{route}"

        if canonical_href(html) != expected:
            fail(errors, f"wix/{route}: canonical must be {expected}")

        robots = (meta_content(html, name="robots") or "").lower()
        if "noindex" in robots:
            fail(errors, f"wix/{route}: canonical page must not be noindex")

        for field, value in (
            ("description", meta_content(html, name="description")),
            ("og:title", meta_content(html, prop="og:title")),
            ("og:description", meta_content(html, prop="og:description")),
            ("og:url", meta_content(html, prop="og:url")),
            ("og:image", meta_content(html, prop="og:image")),
            ("twitter:card", meta_content(html, name="twitter:card")),
            ("twitter:image", meta_content(html, name="twitter:image")),
        ):
            if not value:
                fail(errors, f"wix/{route}: missing {field}")

        if meta_content(html, prop="og:url") not in (None, expected):
            fail(errors, f"wix/{route}: og:url must match canonical")

        og_image = meta_content(html, prop="og:image") or ""
        if og_image and not og_image.startswith("https://"):
            fail(errors, f"wix/{route}: og:image must be absolute https")
        if og_image.lower().endswith(".svg"):
            fail(errors, f"wix/{route}: og:image must be raster for social crawlers")

        for phrase in BANNED_CANONICAL_PHRASES:
            if phrase in lower:
                fail(errors, f"wix/{route}: recruiter placeholder phrase leaked: {phrase!r}")

    # Public/reviewer HTML may discuss work in progress, but rejected pixels must never return.
    for route in PUBLIC:
        path = WIX / route
        if not path.is_file():
            continue
        html = path.read_text(encoding="utf-8")
        for plate in REJECTED_PUBLIC_PLATES:
            if plate in html:
                fail(errors, f"wix/{route}: rejected plate leaked into public HTML: {plate}")

    root = (ROOT / "index.html").read_text(encoding="utf-8")
    selected_i = root.find('href="wix/curated-art.html"')
    sanctuary_i = root.find('href="melodia/sanctuary/"')
    if selected_i < 0:
        fail(errors, "root gateway has no Selected Art entry")
    if sanctuary_i >= 0 and selected_i >= 0 and selected_i > sanctuary_i:
        fail(errors, "root gateway puts interactive experiment before recruiter-selected work")

    if errors:
        print(f"\nShowcase polish gate: {len(errors)} failure(s)")
        return 1

    print(
        f"OK showcase polish: {len(CANONICAL)} canonical pages, "
        f"{len(PUBLIC)} public/reviewer routes, rejected-plate guard active"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
