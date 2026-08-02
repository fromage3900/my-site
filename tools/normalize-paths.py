#!/usr/bin/env python3
"""
Path Normalization Script for Hybrid Wix + GitHub Pages Deployment

Usage:
    python tools/normalize-paths.py wix     # Rewrite GitHub URLs → relative for Wix editing
    python tools/normalize-paths.py github  # Rewrite relative paths → GitHub Pages URLs for deploy
"""

import re
import sys
from pathlib import Path

WIX_DIR = Path(__file__).parent.parent / "wix"
GITHUB_BASE = "https://fromage3900.github.io/my-site"

# Patterns to rewrite
REL_TO_GITHUB = [
    (r'\.\./generated/', f'{GITHUB_BASE}/generated/'),
    (r'src="\.\./', f'src="{GITHUB_BASE}/'),
    (r'href="\.\./', f'href="{GITHUB_BASE}/'),
    (r'url\(\.\./', f'url({GITHUB_BASE}/'),
]

GITHUB_TO_REL = [
    (rf'{re.escape(GITHUB_BASE)}/generated/', '../generated/'),
    (rf'{re.escape(GITHUB_BASE)}/', '../'),
]

def normalize(mode: str) -> int:
    if mode == "wix":
        patterns = GITHUB_TO_REL
        desc = "GitHub → relative (Wix)"
    elif mode == "github":
        patterns = REL_TO_GITHUB
        desc = "relative → GitHub (deploy)"
    else:
        print(f"Usage: python normalize-paths.py [wix|github]")
        return 1

    print(f"[{desc}] Normalizing paths in {WIX_DIR}...")
    count = 0

    for html_file in WIX_DIR.glob("*.html"):
        text = html_file.read_text(encoding="utf-8")
        original = text

        for pattern, repl in patterns:
            text = re.sub(pattern, repl, text)

        if text != original:
            html_file.write_text(text, encoding="utf-8")
            count += 1
            print(f"  ✓ {html_file.name}")

    print(f"Done: {count} files modified")
    return 0

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python normalize-paths.py [wix|github]")
        sys.exit(1)
    sys.exit(normalize(sys.argv[1].lower()))