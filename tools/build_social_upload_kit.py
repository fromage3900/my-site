"""Build social / OG crop kit from Melodia hero plates."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "generated" / "social"

SOURCES = {
    # Current EEVEE glam keeper — never Miraland / T-pose postcard
    "stage_melusina": ROOT / "generated/assets/character/melusina_beauty_eevee_20260715c_01.png",
    "vow_cross": ROOT / "generated/assets/cross/cross_komikaze_beauty_34.png",
}

SPECS = {
    "og_1200x630": (1200, 630),
    "square_1080": (1080, 1080),
    "story_1080x1920": (1080, 1920),
    "twitter_1600x900": (1600, 900),
}


def cover_crop(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    tw, th = size
    im = im.convert("RGB")
    sw, sh = im.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    if sh >= sw:
        top = max(0, top - nh // 20)
    return im.crop((left, top, left + tw, top + th))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sources = dict(SOURCES)
    orn_dir = ROOT / "generated/assets/ornaments"
    if orn_dir.is_dir():
        beauty = sorted(orn_dir.glob("*beauty*.png"))
        plates = beauty or sorted(orn_dir.glob("*.png"))
        if plates:
            sources["ornament_plate"] = plates[0]

    crops = []
    for key, src in sources.items():
        if not src.exists():
            print("MISS", src)
            continue
        im = Image.open(src)
        for label, size in SPECS.items():
            name = f"{key}__{label}.jpg"
            dest = OUT / name
            cover_crop(im, size).save(dest, "JPEG", quality=88, optimize=True)
            crops.append(
                {
                    "id": f"{key}/{label}",
                    "file": f"generated/social/{name}",
                    "size": list(size),
                    "source": src.relative_to(ROOT).as_posix(),
                    "bytes": dest.stat().st_size,
                }
            )
            print("OK", name, size)

    default = OUT / "og-default.jpg"
    pref = OUT / "stage_melusina__og_1200x630.jpg"
    if pref.exists():
        Image.open(pref).save(default, "JPEG", quality=90, optimize=True)
        print("DEFAULT", default.name)

    # Legacy stage_diorama__* filenames → remount from glam so old links never show T-pose
    glam = sources.get("stage_melusina")
    if glam and glam.exists():
        im = Image.open(glam)
        for label, size in SPECS.items():
            legacy = OUT / f"stage_diorama__{label}.jpg"
            cover_crop(im, size).save(legacy, "JPEG", quality=88, optimize=True)
            print("LEGACY_REMOUNT", legacy.name)

    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "store_live": False,
        "site": "https://fromage3900.github.io/my-site/",
        "crops": crops,
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print("crops", len(crops))


if __name__ == "__main__":
    main()
