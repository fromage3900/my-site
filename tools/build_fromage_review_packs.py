#!/usr/bin/env python3
"""Build existing FROMΔGE image assets into review-only ZIPs; never publish them as products."""
import argparse
import hashlib
import json
import os
import struct
import zipfile
from pathlib import Path

PACKS = {
    "obs-overlays": ("generated/products/obs-overlays", 25),
    "twitch-emotes": ("generated/products/twitch-emotes", 136),
    "postcards": ("generated/products/postcards", 14),
    "wallpapers": ("generated/products/wallpaper-packs", 84),
    "fantasy-fabrics": ("wix/textures/pbr", 30),
}

NOT_FOR_SALE = """# INTERNAL REVIEW — NOT FOR SALE

These are source files staged from the existing FROMΔGE portfolio repository.
This archive is not a finished retail product and grants NO commercial license.
Review image quality, creator rights, duplicates, compatibility, documentation,
license terms and true buyer download behavior before offering to customers.

OBS: The README mentions an OBS scene collection JSON not found in the source.
Emotes: Check the actual unique designs, alpha channels and platform size rules.
Postcards: README and print specification disagree on bleed (0.25 vs 0.125 in).
Wallpapers: Check artwork, cropping, compatibility and resale provenance.
Fabrics: Six source families; check tileability, channels, author rights and maps.
Aliases and character-specific textures are excluded.

Do not upload this review archive to Gumroad or advertise it as finished.
"""


def png_dimensions(path):
    with path.open("rb") as f:
        header = f.read(24)
    if len(header) != 24 or header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        raise ValueError(f"Not a valid PNG: {path}")
    return list(struct.unpack(">II", header[16:24]))


def build(root, output, name):
    folder, expected_pngs = PACKS[name]
    source = root / folder
    if not source.is_dir():
        raise FileNotFoundError(f"Missing source: {source}")
    if name == "fantasy-fabrics":
        canonical = ("BaroqueFiligreeLace", "CelestialWeave", "GildedBrocade", "GoldEmbroidery", "RoyalVelvet", "SheerSilk")
        images = sorted(p for p in source.glob("T_Fabric_*.png") if any(p.name.startswith("T_Fabric_" + material + "_") for material in canonical))
    else:
        images = sorted(source.rglob("*.png"))
    if len(images) != expected_pngs:
        raise RuntimeError(f"{name}: expected {expected_pngs} PNGs; found {len(images)}")
    records = []
    files = images if name == "fantasy-fabrics" else sorted(p for p in source.rglob("*") if p.is_file())
    for path in files:
        raw = path.read_bytes()
        record = {
            "path": path.relative_to(source).as_posix(),
            "bytes": len(raw),
            "sha256": hashlib.sha256(raw).hexdigest(),
        }
        if path.suffix.lower() == ".png":
            record["pixel_dimensions"] = png_dimensions(path)
        records.append(record)
    manifest = {
        "name": name,
        "source_repository": "fromage3900/my-site",
        "source_commit": os.environ.get("GITHUB_SHA", "unrecorded"),
        "stage": "internal-review-only",
        "commercial_ready": False,
        "files": records,
    }
    output.mkdir(parents=True, exist_ok=True)
    outfile = output / ("FROMAGE_" + name.upper().replace("-", "_") + "_REVIEW_ONLY.zip")
    with zipfile.ZipFile(outfile, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for path in files:
            archive.write(path, path.relative_to(source).as_posix())
        archive.writestr("REVIEW_NOT_FOR_SALE.md", NOT_FOR_SALE)
        archive.writestr("MANIFEST.json", json.dumps(manifest, indent=2) + "\n")
    return {"name": name, "zip": outfile.name, "files": len(files), "pngs": len(images), "bytes": outfile.stat().st_size}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    ap.add_argument("--output-dir", default="staged_packs")
    ap.add_argument("--packs", nargs="+", choices=PACKS, default=["obs-overlays", "twitch-emotes", "postcards", "fantasy-fabrics"])
    args = ap.parse_args()
    root = Path(args.root).resolve()
    dest = Path(args.output_dir).resolve()
    result = [build(root, dest, pack) for pack in args.packs]
    (dest / "STAGING_SUMMARY.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
