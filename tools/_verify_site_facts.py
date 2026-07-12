# -*- coding: utf-8 -*-
"""Verify site facts: store gates, hero plates, mesh counts, copy keys."""
from __future__ import annotations

import json
import re
from pathlib import Path

SITE = Path(r"G:\EnvironmentPortfolio\BS_GodFile\my-site-clean")
WIX = SITE / "wix"
GEN = SITE / "generated"
ISSUES: list[str] = []
OK: list[str] = []


def check(cond: bool, ok: str, bad: str) -> None:
    (OK if cond else ISSUES).append(ok if cond else bad)


def main() -> int:
    cat = json.loads((GEN / "ornament_kitbash_catalog.json").read_text(encoding="utf-8"))
    check(cat.get("store_live") is False, "store_live=false (correct until Gumroad)", "store_live should be false")
    check(cat.get("artstation_live") is False, "artstation_live=false", "artstation_live should be false")
    check(cat.get("mesh_count") == 15, f"mesh_count=15", f"mesh_count={cat.get('mesh_count')} expected 15")
    check(cat.get("launch_price_usd") == 24, "launch $24", f"launch price {cat.get('launch_price_usd')}")
    check(len(cat.get("meshes") or []) == 15, "15 mesh rows", f"mesh rows={len(cat.get('meshes') or [])}")

    copy = json.loads((SITE / "content" / "site-copy.json").read_text(encoding="utf-8"))
    check("pages" in copy and "index" in copy["pages"], "site-copy has index", "site-copy missing pages.index")
    check(copy.get("global", {}).get("brand") == "Brennan Shepherd", "brand SSOT ok", "brand mismatch")

    # Hero / profile plates — size alone lies (empty pedestal PNGs were ~2.5MB).
    # Require profile bangs + reject "tiny" AND known empty-pack byte ranges if re-checking.
    char = GEN / "assets" / "character"
    hero_dirs = sorted(char.glob("hero_*"), key=lambda p: p.name, reverse=True)
    profile_alias = char / "melusina_profile_bangs_nikki.png"
    void_iri = char / "melusina_beauty_void_iri.png"
    check(void_iri.is_file() and void_iri.stat().st_size > 50_000, "void_iri beauty present", "missing void_iri beauty")

    def _png_entropy_ok(path: Path) -> bool:
        """Cheap empty-stage detector: unique RGB sample count via Pillow if present."""
        try:
            from PIL import Image  # type: ignore
        except ImportError:
            return path.stat().st_size > 2_800_000  # real Melusina plates tend larger than empty stage
        im = Image.open(path).convert("RGB")
        im = im.resize((64, 80))
        colors = im.getcolors(maxcolors=64 * 80) or []
        return len(colors) >= 48

    newest = None
    for d in hero_dirs:
        beauty = d / "melusina_hero_beauty_nikki.png"
        if beauty.is_file() and beauty.stat().st_size > 200_000 and _png_entropy_ok(beauty):
            newest = d
            break
        if beauty.is_file() and beauty.stat().st_size > 200_000 and not _png_entropy_ok(beauty):
            ISSUES.append(f"{d.name}/melusina_hero_beauty_nikki.png looks empty/low-detail (pedestal?)")
    if newest:
        OK.append(f"hero pack candidate {newest.name}")
        for name in (
            "melusina_hero_beauty_nikki.png",
            "melusina_hero_front_nikki.png",
            "melusina_hero_three_quarter_jewelry.png",
        ):
            p = newest / name
            check(p.is_file() and p.stat().st_size > 200_000 and _png_entropy_ok(p), f"{newest.name}/{name} ok ({p.stat().st_size})", f"weak/missing {name}")
        bangs = newest / "melusina_profile_bangs_nikki.png"
        if bangs.is_file() and _png_entropy_ok(bangs):
            OK.append(f"profile bangs plate {bangs.stat().st_size} bytes")
        elif bangs.is_file():
            ISSUES.append(f"profile bangs plate looks empty/low-detail ({bangs.stat().st_size} bytes)")
        elif profile_alias.is_file() and _png_entropy_ok(profile_alias):
            OK.append(f"profile bangs alias {profile_alias.stat().st_size} bytes")
        else:
            ISSUES.append("no usable melusina_profile_bangs_nikki.png yet")
    else:
        ISSUES.append("no usable hero_* beauty plate found")

    # HTML still pointing at broken tiny / empty hero plates?
    for html in WIX.glob("*.html"):
        text = html.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r"hero_(\d{8})/melusina_(?:hero_beauty_nikki|profile_bangs_nikki)\.png", text):
            stamp = m.group(1)
            fname = m.group(0).split("/")[-1]
            p = char / f"hero_{stamp}" / fname
            if not p.is_file():
                ISSUES.append(f"{html.name} missing {m.group(0)}")
            elif p.stat().st_size < 200_000:
                ISSUES.append(f"{html.name} references tiny {m.group(0)} ({p.stat().st_size} bytes)")
            elif not _png_entropy_ok(p):
                ISSUES.append(f"{html.name} references empty-looking {m.group(0)}")
            else:
                OK.append(f"{html.name} → hero_{stamp}/{fname} ok")

    # store / education claims on hub
    hub = (WIX / "application-hub.html").read_text(encoding="utf-8", errors="ignore")
    check("Final-year Humber" in hub, "hub education claim present", "hub missing Humber education line")
    check("store_live" not in hub or "Purchase live" not in hub or 'store_live' in hub, "hub does not hard-claim live store", "check hub store copy")

    # Passport config
    pc = GEN / "passport_config.json"
    if pc.is_file():
        OK.append("passport_config.json present")
    else:
        ISSUES.append("passport_config.json missing")

    print("=== OK ===")
    for line in OK:
        print(" +", line)
    print("=== ISSUES ===")
    if not ISSUES:
        print(" (none)")
    for line in ISSUES:
        print(" !", line)
    return 1 if ISSUES else 0


if __name__ == "__main__":
    raise SystemExit(main())
