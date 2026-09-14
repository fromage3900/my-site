#!/usr/bin/env python3
"""Tiered asset validation for Melodia portfolio.

Hard tier (blocks deploy): Baroque/SoftMG game-UI slots + motion CSS/JS
Soft tier (warns only): Portfolio chrome + deprecated ornate slots
"""

import json
import sys
import pathlib
from typing import Dict, List, Set, Any


ROOT = pathlib.Path(__file__).parent.parent / "generated" / "assets" / "melodia-game-ui"
ART_SOURCE = ROOT / "ART_SOURCE.json"

# Hard tier: game-critical assets that must exist
TIER_HARD_KEYS: List[str] = [
    "baroque_slots",
    "softmg_nikki_fab_pass.slots",
    "motion_connect_pass.web",  # CSS/JS files
]

# Soft tier: portfolio polish assets (warn only)
TIER_SOFT_KEYS: List[str] = [
    "portfolio_chrome_pass.slots",
    "ornate_slots",
]


def get_nested(data: Dict[str, Any], key_path: str) -> List[str]:
    """Traverse nested dict with dot notation: 'softmg_nikki_fab_pass.slots'"""
    node: Any = data
    for part in key_path.split("."):
        if isinstance(node, dict):
            node = node.get(part, {})
        else:
            return []
    if isinstance(node, list):
        return [str(x) for x in node]
    return []


def check_files_exist(assets: List[str], base: pathlib.Path) -> List[str]:
    """Return list of missing asset filenames."""
    missing = []
    for asset in assets:
        # Handle CSS/JS files (motion_connect_pass.web)
        if asset.endswith((".css", ".js")):
            # These are already relative to repo root (wix/)
            asset_path = pathlib.Path(__file__).parent.parent / asset
            if not asset_path.exists():
                missing.append(asset)
        else:
            # PNG/WebM assets in generated/assets/melodia-game-ui/
            asset_path = base / asset
            if not asset_path.exists():
                missing.append(asset)
    return missing


def main() -> int:
    if not ART_SOURCE.exists():
        print(f"::error::ART_SOURCE.json not found at {ART_SOURCE}")
        return 1

    art = json.loads(ART_SOURCE.read_text(encoding="utf-8"))

    hard_missing = []
    for key in TIER_HARD_KEYS:
        assets = get_nested(art, key)
        missing = check_files_exist(assets, ROOT)
        hard_missing.extend(missing)

    soft_missing = []
    for key in TIER_SOFT_KEYS:
        assets = get_nested(art, key)
        missing = check_files_exist(assets, ROOT)
        soft_missing.extend(missing)

    # Output for GitHub Actions annotations
    if hard_missing:
        print(f"::error::HARD TIER MISSING ({len(hard_missing)}): {', '.join(hard_missing)}")
        return 1

    if soft_missing:
        print(f"::warning::SOFT TIER MISSING ({len(soft_missing)}): {', '.join(soft_missing)}")

    print(f"[OK] Asset validation passed — Hard: 0 missing, Soft: {len(soft_missing)} missing")
    return 0


if __name__ == "__main__":
    sys.exit(main())