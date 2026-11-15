#!/usr/bin/env python3
"""Prevent known-rejected portfolio renders from reappearing on active source."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "content" / "stale-render-archive-20261115.json"

def main() -> int:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    files = data.get("files", [])
    paths = [item["path"] for item in files]
    if data.get("count") != len(paths) or len(paths) != len(set(paths)):
        print("::error::Stale-render archive manifest has a count or duplicate-path error")
        return 1
    reintroduced = [path for path in paths if (ROOT / path).exists()]
    if reintroduced:
        for path in reintroduced:
            print(f"::error::Previously rejected render reintroduced: {path}")
        return 1
    print(f"[OK] {len(paths)} archived/rejected media paths are absent from active source.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
