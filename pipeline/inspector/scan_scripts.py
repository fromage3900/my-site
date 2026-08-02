#!/usr/bin/env python3
"""Read-only scanner: walks Content/Python/, extracts imports & entry points,
writes JSON report to pipeline/inspector/scan_report.json.

Usage:
    python pipeline/inspector/scan_scripts.py           # from project root
    py   pipeline/inspector/scan_scripts.py             # Windows fallback

No project files are modified.
"""
from __future__ import annotations

import ast
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[2]
CONTENT_PYTHON = PROJECT_ROOT / "Content" / "Python"
REPORT_PATH = PROJECT_ROOT / "pipeline" / "inspector" / "scan_report.json"


def _is_python_file(path: Path) -> bool:
    return path.suffix == ".py" and not path.name.startswith(".")


def _parse_imports(source: str) -> list[str]:
    """Extract all import statements using AST (safe, no execution)."""
    imports: list[str] = []
    try:
        tree = ast.parse(source)
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(f"import {alias.name}")
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                names = [alias.name for alias in node.names]
                imports.append(f"from {module} import {', '.join(names)}")
    except SyntaxError:
        imports.append("__PARSE_ERROR__")
    return imports


def _detect_entry_points(source: str) -> list[str]:
    """Find top-level function defs that look like pipeline entry points."""
    entry_points: list[str] = []
    try:
        tree = ast.parse(source)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                name = node.name
                # Common entry-point patterns in the project
                if name in ("main", "build_all", "run", "run_tick") or name.startswith(
                    ("setup_", "audit_", "run_")
                ):
                    entry_points.append(name)
    except SyntaxError:
        pass
    return sorted(set(entry_points))


def _detect_external_calls(source: str) -> list[str]:
    """Heuristic: find string literals referencing external executables or scripts."""
    calls: set[str] = set()
    try:
        tree = ast.parse(source)
        for node in ast.walk(tree):
            if isinstance(node, ast.Constant) and isinstance(node.value, str):
                val = node.value.lower()
                if val.endswith((".exe", ".bat", ".ps1", ".sh")):
                    calls.add(node.value)
                elif "unrealeditor" in val or "ue_5" in val:
                    calls.add("UnrealEditor")
                elif val.endswith(".py") and ".." not in val:
                    calls.add(node.value)
    except SyntaxError:
        pass
    return sorted(calls)


def scan_scripts() -> dict[str, Any]:
    """Scan Content/Python/ and return structured report."""
    if not CONTENT_PYTHON.is_dir():
        print(f"ERROR: {CONTENT_PYTHON} not found. Run from project root.")
        sys.exit(1)

    scripts: list[dict[str, Any]] = []
    orphaned: list[str] = []

    for py_file in sorted(CONTENT_PYTHON.rglob("*.py")):
        if not _is_python_file(py_file):
            continue

        rel_path = str(py_file.relative_to(PROJECT_ROOT).as_posix())
        source = py_file.read_text(encoding="utf-8", errors="replace")

        imports = _parse_imports(source)
        entry_points = _detect_entry_points(source)
        external_calls = _detect_external_calls(source)

        script_entry: dict[str, Any] = {
            "path": rel_path,
            "imports": imports,
            "entry_points": entry_points,
            "external_calls": external_calls,
        }
        scripts.append(script_entry)

        # Orphan heuristic: has no entry_point at all (no main/build_all/setup_/audit_/run_)
        if not entry_points:
            orphaned.append(rel_path)

    report: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generated_by": "scan_scripts.py",
        "ok": True,
        "project_root": str(PROJECT_ROOT),
        "total_scripts": len(scripts),
        "orphan_count": len(orphaned),
        "scripts": scripts,
        "orphan_scripts": orphaned,
    }

    return report


def write_report(report: dict[str, Any]) -> Path:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return REPORT_PATH


def main() -> int:
    print(f"Scanning {CONTENT_PYTHON} ...")
    report = scan_scripts()

    out_path = write_report(report)
    print(f"Report written to {out_path}")
    print(f"  Scripts found: {report['total_scripts']}")
    print(f"  Orphan scripts (no entry point): {report['orphan_count']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())