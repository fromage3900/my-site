#!/usr/bin/env python3
"""Build responsive WebP derivatives for images explicitly curated on wix/curated-art.html."""
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

try:
    from PIL import Image
except ImportError:
    print("Pillow is required: python -m pip install pillow", file=sys.stderr)
    raise

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "wix" / "curated-art.html"
OUT = ROOT / "generated" / "optimized" / "curated-art"
WIDTHS = (480, 800, 1280)
QUALITY = 82


class CuratedImageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.sources: list[str] = []

    def handle_starttag(self, tag: str, attrs):
        if tag != "img":
            return
        data = dict(attrs)
        src = data.get("src")
        if src and "data-art-optimize" in data and src.startswith("../generated/assets/"):
            self.sources.append(src)


def output_stem(src: str) -> str:
    stem = Path(src).stem
    return re.sub(r"[^a-zA-Z0-9_-]+", "-", stem)


def main() -> int:
    parser = CuratedImageParser()
    parser.feed(PAGE.read_text(encoding="utf-8"))
    unique = list(dict.fromkeys(parser.sources))
    OUT.mkdir(parents=True, exist_ok=True)

    written = 0
    for src in unique:
        source = (PAGE.parent / src).resolve()
        if not source.is_file():
            print(f"missing curated source: {source}", file=sys.stderr)
            return 2

        with Image.open(source) as original:
            original.load()
            image = original.convert("RGBA" if "A" in original.getbands() else "RGB")
            for target_width in WIDTHS:
                width = min(target_width, image.width)
                height = max(1, round(image.height * (width / image.width)))
                resized = image if width == image.width else image.resize((width, height), Image.Resampling.LANCZOS)
                out = OUT / f"{output_stem(src)}-{target_width}.webp"
                resized.save(out, "WEBP", quality=QUALITY, method=6)
                written += 1

    print(f"curated-art: wrote {written} WebP derivatives from {len(unique)} originals")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
