#!/usr/bin/env python3
"""Enforce the recruiter showcase freeze from content/showcase-freeze.json.

The gate compares the current tree against the freeze base SHA. Any changed path
outside the explicit allowlist fails CI. This makes "soft freeze" operational,
not just a note in a document.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "content" / "showcase-freeze.json"


def git(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=check,
    )


def main() -> int:
    if not MANIFEST_PATH.is_file():
        print("FAIL showcase freeze manifest is missing")
        return 1

    data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    status = str(data.get("status", "")).strip()
    if status not in {"soft_freeze", "hard_freeze"}:
        print(f"OK showcase freeze inactive: status={status or 'unset'}")
        return 0

    base = str(data.get("base_sha", "")).strip()
    if len(base) != 40:
        print("FAIL showcase freeze base_sha must be a 40-character commit SHA")
        return 1

    # A shallow Actions checkout may not contain the freeze anchor. Fetch just
    # that commit when possible rather than pulling the repository's full history.
    probe = git("cat-file", "-e", f"{base}^{{commit}}", check=False)
    if probe.returncode != 0:
        fetched = git("fetch", "--no-tags", "--depth=1", "origin", base, check=False)
        if fetched.returncode != 0:
            print("FAIL could not fetch showcase freeze base commit")
            print(fetched.stderr.strip())
            return 1

    head = git("rev-parse", "HEAD").stdout.strip()
    changed_raw = git("diff", "--name-only", f"{base}..{head}").stdout
    changed = [line.strip() for line in changed_raw.splitlines() if line.strip()]

    exact = {str(x) for x in data.get("allowed_exact", [])}
    prefixes = tuple(str(x) for x in data.get("allowed_prefixes", []))

    blocked = [
        path for path in changed
        if path not in exact and not any(path.startswith(prefix) for prefix in prefixes)
    ]

    if blocked:
        print(f"FAIL showcase {status}: {len(blocked)} changed path(s) are outside the freeze allowlist")
        for path in blocked:
            print(f"  - {path}")
        print("\nUpdate content/showcase-freeze.json deliberately before making a freeze exception.")
        return 1

    print(
        f"OK showcase {status}: {len(changed)} changed path(s) since "
        f"{base[:8]} are within the approved sendoff scope"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
