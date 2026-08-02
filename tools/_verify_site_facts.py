# -*- coding: utf-8 -*-
"""Verify site facts: store gates, hero plates, claim registry, no bangs."""
from __future__ import annotations

import json
import re
from pathlib import Path

SITE = Path(r"G:\EnvironmentPortfolio\BS_GodFile\my-site-clean")
WIX = SITE / "wix"
GEN = SITE / "generated"
ISSUES: list[str] = []
OK: list[str] = []

# Bangs-class forbidden phrases on polished pages (case-insensitive)
FORBIDDEN = [
    (r"product page live", "claims product live"),
    (r"15\s*FBX\)?\s*packed|packed\s*\(15\s*FBX\)", "claims 15 FBX packed"),
    (r"profile bangs|bangs plate|melusina_profile_bangs", "bangs claim"),
    (r"playable iOS kit|playable mood|playable rhythm slice", "playable overclaim"),
    (r"\bTonight\b", "ephemeral Tonight status"),
    (r"overnight (?:build|queue)", "ephemeral overnight status"),
    (r"project-name-hero\.png", "placeholder hero"),
    (r"Four owned levels", "owned-levels overclaim"),
]

CLAIM_PAGES = (
    "index.html",
    "recruiter-one-sheet.html",
    "application-hub.html",
    "sakura-case-study.html",
    "ornament-kitbash.html",
    "melodia-gameplay-loop.html",
    "melodia-systems.html",
    "melodia-melusina.html",
    "hero-renders.html",
    "design-specs.html",
    "commissions.html",
    "asset-scouting.html",
)


def check(cond: bool, ok: str, bad: str) -> None:
    (OK if cond else ISSUES).append(ok if cond else bad)


def main() -> int:
    cat = json.loads((GEN / "ornament_kitbash_catalog.json").read_text(encoding="utf-8"))
    check(cat.get("store_live") is False, "store_live=false (correct until Gumroad)", "store_live should be false")
    check(cat.get("artstation_live") is False, "artstation_live=false", "artstation_live should be false")
    check(cat.get("mesh_count") == 15, "mesh_count=15", f"mesh_count={cat.get('mesh_count')} expected 15")
    check(len(cat.get("meshes") or []) == 15, "15 mesh rows", f"mesh rows={len(cat.get('meshes') or [])}")

    copy = json.loads((SITE / "content" / "site-copy.json").read_text(encoding="utf-8"))
    check("pages" in copy and "index" in copy["pages"], "site-copy has index", "site-copy missing pages.index")
    check(copy.get("global", {}).get("brand") == "Brennan Shepherd", "brand SSOT ok", "brand mismatch")
    copy_blob = json.dumps(copy)
    for pat, label in FORBIDDEN:
        if re.search(pat, copy_blob, re.I):
            ISSUES.append(f"site-copy.json {label}: /{pat}/")
        else:
            OK.append(f"site-copy clear of {label}")

    plates = SITE / "content" / "site-plates.json"
    check(plates.is_file(), "site-plates.json present", "missing site-plates.json")
    if plates.is_file():
        pdata = json.loads(plates.read_text(encoding="utf-8"))
        slots = pdata.get("slots") or {}
        check("index.hero" in slots, "index.hero slot", "missing index.hero slot")
        check("recruiter.hero" in slots, "recruiter.hero slot", "missing recruiter.hero slot")
        for key in ("index.hero", "recruiter.hero", "hub.melusina", "stage.beauty"):
            path = (slots.get(key) or {}).get("path", "")
            if "_001.png" in path:
                ISSUES.append(f"slot {key} points at mauve blank")
            elif "void_iri" in path:
                ISSUES.append(f"slot {key} still on void_iri interim")
            else:
                OK.append(f"slot {key} = {path}")

    kitbash = (WIX / "ornament-kitbash.html").read_text(encoding="utf-8", errors="ignore")
    check('id="kitbashPrice" hidden' in kitbash or "kitbashPrice\" hidden" in kitbash, "kitbash price hidden until store_live", "kitbash price not hidden by default")

    char = GEN / "assets" / "character"
    void_iri = char / "melusina_beauty_void_iri.png"
    check(void_iri.is_file() and void_iri.stat().st_size > 50_000, "void_iri beauty present", "missing void_iri beauty")

    def _png_entropy_ok(path: Path) -> bool:
        try:
            from PIL import Image  # type: ignore
        except ImportError:
            return path.stat().st_size > 2_800_000
        im = Image.open(path).convert("RGB")
        im = im.resize((64, 80))
        colors = im.getcolors(maxcolors=64 * 80) or []
        return len(colors) >= 48

    dated = sorted(char.glob("melusina_beauty_nikki_????????_??.png"), reverse=True)
    if dated and _png_entropy_ok(dated[0]):
        OK.append(f"dated beauty {dated[0].name}")
    else:
        ISSUES.append("no entropy-ok dated melusina_beauty_nikki_YYYYMMDD_nn.png")

    # No bangs checks as gates
    OK.append("bangs not required (purged)")

    for blank in (
        "melusina_beauty_nikki_001.png",
        "melusina_beauty_jewelry_001.png",
        "melusina_low_nikki_001.png",
        "melusina_water_splash_001.png",
        "melusina_glam_audvis_001.png",
    ):
        wired = False
        for html in WIX.glob("*.html"):
            if blank in html.read_text(encoding="utf-8", errors="ignore"):
                wired = True
                ISSUES.append(f"{html.name} still wires mauve blank {blank}")
        js = WIX / "melodia-stage-passport.js"
        if js.is_file() and blank in js.read_text(encoding="utf-8", errors="ignore"):
            wired = True
            ISSUES.append(f"melodia-stage-passport.js wires mauve blank {blank}")
        if not wired:
            OK.append(f"{blank} unwired")

    for name in CLAIM_PAGES:
        path = WIX / name
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for pat, label in FORBIDDEN:
            # Allow kitbash catalog JS to mention prices in code when hidden — but not visible default text "Launch $24" without hidden
            if name == "ornament-kitbash.html" and "Launch $" in pat:
                continue
            if re.search(pat, text, re.I):
                ISSUES.append(f"{name} {label}: /{pat}/")

    # Visible Launch $24 only if not hidden attribute on price element
    if 'id="kitbashPrice"' in kitbash and "Launch $24" in kitbash:
        if "hidden" not in kitbash[kitbash.find("kitbashPrice") : kitbash.find("kitbashPrice") + 80]:
            ISSUES.append("ornament-kitbash visible Launch $24 without hidden")

    pp = GEN / "passports" / "melusina_passport.json"
    if pp.is_file():
        pdata = json.loads(pp.read_text(encoding="utf-8"))
        rows = {r[0]: r[1] for r in pdata.get("rows") or []}
        check("EEVEE" in str(rows.get("Engine", "")), "passport Engine=EEVEE", f"passport Engine={rows.get('Engine')}")
        check(
            "v7" in str(rows.get("Software", "")) or pdata.get("version") == "stage-v7",
            "passport Stage v7",
            "passport still on old stage label",
        )
        check("Cycles" not in str(rows.get("Engine", "")), "passport not Cycles", "passport still says Cycles")
        check("bangs" not in str(rows.get("Capture", "")).lower(), "passport Capture not bangs", "passport Capture mentions bangs")
    else:
        ISSUES.append("melusina_passport.json missing")

    hub = (WIX / "application-hub.html").read_text(encoding="utf-8", errors="ignore")
    check("Final-year Humber" in hub, "hub education claim present", "hub missing Humber education line")

    editing = SITE / "EDITING.md"
    check(editing.is_file(), "EDITING.md present", "missing EDITING.md")

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
