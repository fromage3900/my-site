#!/usr/bin/env python3
"""
Verify Deployment Manifest — checks that all assets in deployment_manifest.json resolve (200 OK)
Run after GitHub Pages deploy to validate live URLs.
"""

import argparse
import json
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

GENERATED_DIR = Path(__file__).resolve().parent.parent / "generated"
MANIFEST_CANDIDATES = (
    GENERATED_DIR / "deployment_manifest.json",
    GENERATED_DIR / "deployment-manifest.json",
)

def check_url(url: str) -> tuple[str, int, str]:
    """Return (url, status_code, error_msg)"""
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=10) as resp:
            return url, resp.status, ""
    except urllib.error.HTTPError as e:
        return url, e.code, f"HTTP {e.code}"
    except Exception as e:
        return url, 0, str(e)

def main() -> int:
    parser = argparse.ArgumentParser(description="Verify deployment asset URLs.")
    parser.add_argument(
        "--manifest",
        default=None,
        help="manifest path; defaults to deployment_manifest.json with legacy fallback",
    )
    args = parser.parse_args()
    manifest_path = Path(args.manifest).expanduser().resolve() if args.manifest else next(
        (path for path in MANIFEST_CANDIDATES if path.exists()),
        MANIFEST_CANDIDATES[0],
    )

    if not manifest_path.exists():
        print(f"::warning:: Manifest not found at {manifest_path}")
        return 0  # Don't fail if manifest doesn't exist yet

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    urls = []

    # Collect all asset URLs from manifest
    def collect_urls(obj):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k in ("url", "src", "href", "image") and isinstance(v, str) and v.startswith("http"):
                    urls.append(v)
                else:
                    collect_urls(v)
        elif isinstance(obj, list):
            for item in obj:
                collect_urls(item)

    collect_urls(manifest)

    if not urls:
        print("No URLs found in manifest")
        return 0

    print(f"Checking {len(urls)} asset URLs...")
    failed = []

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(check_url, u): u for u in urls}
        for future in as_completed(futures):
            url, status, err = future.result()
            if status == 200:
                print(f"  ✓ {url}")
            else:
                print(f"  ✗ {url} — {status} {err}")
                failed.append((url, status, err))

    if failed:
        print(f"\n::error::{len(failed)} asset(s) failed to resolve")
        for url, status, err in failed:
            print(f"  {url} — {status} {err}")
        return 1

    print("\n✅ All assets resolve successfully")
    return 0

if __name__ == "__main__":
    sys.exit(main())