#!/usr/bin/env python3
"""Preservation contract for the original image-first folio and photo booth.

Does not approve the renders for publication. Ensures future repo cleanups
cannot silently sever the preserved gallery and cinematic stills.
"""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
WIX = ROOT / "wix"
REQUIRED = [
    "docs/MOODBOARD_COMPOSITION_2026-09-05.md",
    "wix/melodia-gallery-grid.html",
    "wix/melodia-photobooth.js",
    "wix/melodia-photobooth.css",
    "wix/melodia-stage-character.html",
    "wix/portfolio-moodboard.html",
    "wix/melusina-photo-studio.html",
    "generated/assets/character/melusina_beauty_eevee_20260715c_01.png",
    "generated/assets/character-loops/melusina_glam_macro_postcard_4s_poster.png",
    "generated/assets/character/melusina_waterhair_macro.png",
]

class LocalReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        for name in ("src", "href"):
            value = attributes.get(name)
            if value and not value.startswith(("http:", "https:", "mailto:", "data:", "#", "javascript:")):
                self.paths.append(value.split("#", 1)[0].split("?", 1)[0])

def verify() -> None:
    for name in REQUIRED:
        assert (ROOT / name).is_file(), f"Missing preserved source: {name}"
    moodboard = (WIX / "portfolio-moodboard.html").read_text(encoding="utf-8")
    studio = (WIX / "melusina-photo-studio.html").read_text(encoding="utf-8")
    original = (ROOT / "docs/MOODBOARD_COMPOSITION_2026-09-05.md").read_text(encoding="utf-8")
    photobooth = (WIX / "melodia-photobooth.js").read_text(encoding="utf-8")
    assert "13-column Fibonacci" in original
    for columns in (13, 8, 5):
        assert f"repeat({columns},minmax(0,1fr))" in moodboard, f"Missing {columns}-column moodboard"
    assert "tile hero" in moodboard and "tile detail" in moodboard
    assert "melusina_beauty_eevee_20260715c_01-1280.webp" in moodboard
    assert "melusina_glam_macro_postcard_4s_poster.png" in moodboard
    assert "water-token-artifact" in moodboard and "water-token-activate" in moodboard
    assert "realtime-3d-viewer.html?embed=1&asset=melody-token-water" in moodboard
    assert (WIX / "models/SM_Orn_MelodyToken_Water.obj").is_file(), "Authored OBJ for embedded 3D card is missing"
    existing_viewer = (WIX / "realtime-3d-viewer.html").read_text(encoding="utf-8")
    assert "portfolio-frame-embed" in existing_viewer
    assert 'data-asset="violin"' in existing_viewer, "Original full viewer must remain intact"
    assert "MelodiaPhotobooth.init('#melusina-photobooth-mount')" in studio
    assert "melodia-photobooth.js" in studio and "melodia-photobooth.css" in studio
    assert "Glam Pose I" in photobooth and "50mm Prime" in photobooth and "Sakura Bloom" in photobooth
    for page_name, content in (("portfolio-moodboard.html", moodboard), ("melusina-photo-studio.html", studio)):
        assert 'name="robots" content="noindex,nofollow"' in content, f"Review page became public unexpectedly: {page_name}"
        parser = LocalReferences()
        parser.feed(content)
        for path in parser.paths:
            target = (WIX / path).resolve()
            assert target.is_relative_to(ROOT), f"Path escaped repository: {page_name}: {path}"
            assert target.is_file(), f"Missing linked asset: {page_name}: {path}"
    # All original switchable pose references must remain real files, not
    # broken options that silently fallback to the same portrait.
    poses = re.findall(r"src:\s*'([^']+)'", photobooth)
    assert len(poses) >= 5, f"Lost photobooth poses: {len(poses)}"
    for path in poses:
        assert (WIX / path).resolve().is_file(), f"Missing original photobooth pose: {path}"
    print("[OK] Original 3D moodboard, EEVEE image evidence and interactive photo booth preserved.")

if __name__ == "__main__":
    verify()
