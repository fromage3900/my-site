#!/usr/bin/env python3
"""
Figma MCP Server — Local dev bridge (stdio transport).

Bridges Figma REST API → local filesystem for Melodia portfolio.
Runs on your machine only. Uses personal access token from FIGMA_TOKEN env var.

Usage:
    FIGMA_TOKEN=xxx python tools/figma_mcp.py

MCP Tools exposed:
- figma_export_kit(frame_node_id, dest_dir) -> exports PNGs + writes ART_SOURCE.json
- figma_export_motion_board(board_node_id, dest_dir) -> exports motion nodes + writes melodia-motion-connect.json
- figma_get_file_meta(file_key) -> returns file structure for debugging
- figma_list_components(file_key) -> lists all components in the file
"""

import os
import sys
import json
import asyncio
import base64
import hashlib
import mimetypes
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import httpx

# ============================================================
# Config
# ============================================================
FIGMA_API_BASE = "https://api.figma.com/v1"
FILE_KEY = "Yx8ud7n39NdWZvnNvo4Xlf"  # Melodia Grandmaster file
TOKEN = os.getenv("FIGMA_TOKEN")

if not TOKEN:
    print("ERROR: FIGMA_TOKEN env var not set", file=sys.stderr)
    sys.exit(1)

HEADERS = {"X-Figma-Token": TOKEN}
TIMEOUT = httpx.Timeout(60.0)

# Node IDs we care about (from ART_SOURCE.json)
NODE_MAP = {
    "softmg_kit": "61:531",           # Game/SoftMG_Kit
    "filigree_baroque": "58:716",     # Game/FiligreeBatchO_Baroque
    "motion_board": "41:242",         # Game/RhythmReactivityBoard
}

# Export settings
EXPORT_SCALE = 2
EXPORT_FORMAT = "png"

# ============================================================
# HTTP Client
# ============================================================
class FigmaClient:
    def __init__(self):
        self.client = httpx.AsyncClient(headers=HEADERS, timeout=TIMEOUT)

    async def close(self):
        await self.client.aclose()

    async def get(self, path: str, params: dict = None) -> dict:
        url = urljoin(FIGMA_API_BASE, path)
        resp = await self.client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()

    async def download_image(self, url: str) -> bytes:
        resp = await self.client.get(url)
        resp.raise_for_status()
        return resp.content

    # --- High-level endpoints ---

    async def get_file(self, file_key: str) -> dict:
        """Get full file structure (nodes, components, styles)."""
        return await self.get(f"/files/{file_key}")

    async def get_file_nodes(self, file_key: str, node_ids: List[str]) -> dict:
        """Get specific nodes by ID."""
        params = {"ids": ",".join(node_ids)}
        return await self.get(f"/files/{file_key}/nodes", params)

    async def get_image_urls(self, file_key: str, node_ids: List[str], scale: int = 2, format: str = "png") -> dict:
        """Get download URLs for node exports."""
        params = {
            "ids": ",".join(node_ids),
            "scale": scale,
            "format": format,
        }
        return await self.get(f"/images/{file_key}", params)

    async def get_components(self, file_key: str) -> dict:
        """List all components in file."""
        return await self.get(f"/files/{file_key}/components")

    async def get_component(self, file_key: str, component_key: str) -> dict:
        """Get single component metadata."""
        return await self.get(f"/files/{file_key}/components/{component_key}")


# ============================================================
# Export Logic
# ============================================================
async def export_node_images(client: FigmaClient, node_ids: List[str], dest: Path) -> Dict[str, str]:
    """Export PNGs for node IDs, return mapping of node_id -> local filename."""
    dest.mkdir(parents=True, exist_ok=True)

    # 1. Get image URLs from Figma
    img_data = await client.get_image_urls(FILE_KEY, node_ids, EXPORT_SCALE, EXPORT_FORMAT)
    images = img_data.get("images", {})

    # 2. Download each
    mapping = {}
    for node_id, url in images.items():
        if not url:
            print(f"  ⚠ No export URL for {node_id}", file=sys.stderr)
            continue

        # Generate stable filename from node ID
        safe_id = node_id.replace(":", "_")
        ext = f".{EXPORT_FORMAT}"
        filename = f"T_Melodia_{safe_id}{ext}"
        filepath = dest / filename

        content = await client.download_image(url)
        filepath.write_bytes(content)
        mapping[node_id] = filename
        print(f"  ✓ Exported {node_id} -> {filename}")

    return mapping


async def export_softmg_kit(client: FigmaClient, dest: Path) -> dict:
    """Export SoftMG Kit frame and all child components."""
    print("📦 Exporting SoftMG Kit...")

    # Get the frame node
    nodes_data = await client.get_file_nodes(FILE_KEY, [NODE_MAP["softmg_kit"]])
    kit_node = nodes_data["nodes"][NODE_MAP["softmg_kit"]]["document"]

    # Find all child component nodes (RECTANGLE/COMPONENT with exportable names)
    child_ids = []
    expected_slots = [
        "SoftMG/ParchmentPanel",
        "SoftMG/ScrollEdge",
        "SoftMG/SealSP",
        "SoftMG/SealULT",
        "SoftMG/LaneInk",
        "SoftMG/Hitline",
        "SoftMG/PillowChip",
    ]

    def find_children(node):
        if isinstance(node, dict):
            name = node.get("name", "")
            if name in expected_slots and "id" in node:
                child_ids.append(node["id"])
            for child in node.get("children", []):
                find_children(child)

    find_children(kit_node)

    # Export images
    mapping = await export_node_images(client, child_ids, dest)

    # Build ART_SOURCE.json update
    return {
        "softmg_nikki_fab_pass": {
            "figma_status": "exported",
            "exported_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
            "slots": [mapping.get(nid, f"MISSING_{nid}") for nid in child_ids],
            "figma_nodes": {name: nid for name, nid in zip(expected_slots, child_ids)},
        }
    }


async def export_filigree_baroque(client: FigmaClient, dest: Path) -> dict:
    """Export FiligreeBatchO_Baroque frame and children."""
    print("📦 Exporting Filigree Batch O Baroque...")

    nodes_data = await client.get_file_nodes(FILE_KEY, [NODE_MAP["filigree_baroque"]])
    baroque_node = nodes_data["nodes"][NODE_MAP["filigree_baroque"]]["document"]

    expected_slots = [
        "FiligreeBatchO_Baroque",
        "CornerBaroque",
        "DividerScroll",
        "CrestBaroque",
        "MedallionRosette",
        "BraceVolute",
    ]

    child_ids = []

    def find_children(node):
        if isinstance(node, dict):
            name = node.get("name", "")
            if name in expected_slots and "id" in node:
                child_ids.append(node["id"])
            for child in node.get("children", []):
                find_children(child)

    find_children(baroque_node)

    mapping = await export_node_images(client, child_ids, dest)

    return {
        "baroque_slots": [mapping.get(nid, f"MISSING_{nid}") for nid in child_ids],
        "figma_nodes": {name: nid for name, nid in zip(expected_slots, child_ids)},
    }


async def export_motion_board(client: FigmaClient, dest: Path) -> dict:
    """Export motion board nodes and generate melodia-motion-connect.json."""
    print("📦 Exporting Motion Board (RhythmReactivityBoard)...")

    nodes_data = await client.get_file_nodes(FILE_KEY, [NODE_MAP["motion_board"]])
    board_node = nodes_data["nodes"][NODE_MAP["motion_board"]]["document"]

    # Motion nodes we need (from melodia-motion-connect.json)
    motion_nodes = {
        "95:1857": "Motion/StaffShimmer",
        "95:1858": "Motion/NoteTrailIri",
        "95:1859": "Motion/BreakCrestReveal",
        "41:249": "Motion/FiligreeBreathe",
        "41:287": "Motion/DividerScroll",
        "41:313": "Motion/BraceVolute",
        "41:341": "Motion/GradeHalo/Perfect",
        "41:354": "Motion/GradePopLuxury",
        "41:357": "Motion/StreakGlowEdge",
        "41:362": "Motion/CrestBaroque",
        "41:380": "Motion/HitlinePulse",
        "41:381": "Motion/PhaseDim",
        "41:386": "Motion/ULTArcPulse",
        "41:388": "Motion/SPMeterShimmer",
        "41:390": "Motion/MobileLanePress",
        "58:721": "Motion/PortraitIri",
        "58:760": "Motion/BaroqueMedallion",
        "58:783": "Motion/BraceVoluteSheen",
    }

    # Find all motion node IDs in the board
    found_ids = []

    def find_motion(node):
        if isinstance(node, dict):
            nid = node.get("id")
            if nid in motion_nodes:
                found_ids.append(nid)
            for child in node.get("children", []):
                find_motion(child)

    find_motion(board_node)

    # Export PNGs (for reference/preview)
    mapping = await export_node_images(client, found_ids, dest)

    # Generate motion-connect.json (the real deliverable)
    # We read the existing manifest and update the authored_2026-07-17 section
    manifest_path = Path("wix/melodia-motion-connect.json")
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
    else:
        manifest = {}

    # Update authored nodes with fresh export timestamp
    manifest.setdefault("motion_connect_pass", {})["last_export"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
    manifest["motion_connect_pass"]["figma_export_status"] = "exported"
    manifest["motion_connect_pass"]["exported_nodes"] = {nid: mapping.get(nid) for nid in found_ids}

    return {"motion_connect": manifest}


# ============================================================
# MCP Protocol (stdio JSON-RPC)
# ============================================================
class MCPServer:
    def __init__(self):
        self.client = FigmaClient()
        self.tools = {
            "figma_export_kit": self.tool_export_kit,
            "figma_export_motion_board": self.tool_export_motion_board,
            "figma_get_file_meta": self.tool_get_file_meta,
            "figma_list_components": self.tool_list_components,
        }

    async def close(self):
        await self.client.close()

    async def handle_request(self, request: dict) -> dict:
        method = request.get("method")
        params = request.get("params", {})
        req_id = request.get("id")

        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "figma-melodia", "version": "1.0.0"},
                },
            }

        elif method == "tools/list":
            tool_list = [
                {"name": name, "description": fn.__doc__ or "", "inputSchema": {"type": "object", "properties": {}}}
                for name, fn in self.tools.items()
            ]
            return {"jsonrpc": "2.0", "id": req_id, "result": {"tools": tool_list}}

        elif method == "tools/call":
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            if tool_name in self.tools:
                try:
                    result = await self.tools[tool_name](tool_args)
                    return {"jsonrpc": "2.0", "id": req_id, "result": {"content": [{"type": "text", "text": result}]}}
                except Exception as e:
                    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32603, "message": str(e)}}
            else:
                return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": f"Unknown tool: {tool_name}"}}

        return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": f"Unknown method: {method}"}}

    # --- Tool implementations ---

    async def tool_export_kit(self, args: dict) -> str:
        """Export SoftMG Kit + Filigree Baroque frames to generated/assets/melodia-game-ui/"""
        dest = Path(args.get("dest", "generated/assets/melodia-game-ui")).resolve()
        dest.mkdir(parents=True, exist_ok=True)

        results = {}
        results.update(await export_softmg_kit(self.client, dest))
        results.update(await export_filigree_baroque(self.client, dest))

        # Merge into ART_SOURCE.json
        art_source_path = dest / "ART_SOURCE.json"
        if art_source_path.exists():
            art = json.loads(art_source_path.read_text())
        else:
            art = {}

        art.update(results)
        art["last_full_export"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"

        art_source_path.write_text(json.dumps(art, indent=2))
        return f"✅ Exported kit to {dest}\nUpdated ART_SOURCE.json"

    async def tool_export_motion_board(self, args: dict) -> str:
        """Export motion board + update melodia-motion-connect.json"""
        dest = Path(args.get("dest", "generated/assets/melodia-game-ui")).resolve()
        result = await export_motion_board(self.client, dest)

        # Write updated manifest
        manifest_path = Path("wix/melodia-motion-connect.json")
        manifest_path.write_text(json.dumps(result["motion_connect"], indent=2))

        return f"✅ Exported motion board\nUpdated {manifest_path}"

    async def tool_get_file_meta(self, args: dict) -> str:
        """Get file metadata (pages, components count)."""
        file_data = await self.client.get_file(FILE_KEY)
        pages = file_data.get("document", {}).get("children", [])
        meta = {
            "file_key": FILE_KEY,
            "name": file_data.get("name"),
            "last_modified": file_data.get("lastModified"),
            "version": file_data.get("version"),
            "pages": [{"id": p["id"], "name": p["name"]} for p in pages],
        }
        return json.dumps(meta, indent=2)

    async def tool_list_components(self, args: dict) -> str:
        """List all components in the Figma file."""
        comps = await self.client.get_components(FILE_KEY)
        items = []
        for key, comp in comps.get("components", {}).items():
            items.append({"key": key, "name": comp.get("name"), "description": comp.get("description", "")})
        return json.dumps({"count": len(items), "components": items}, indent=2)


async def stdio_loop():
    """Main stdio loop for MCP transport."""
    server = MCPServer()
    try:
        while True:
            line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
            if not line:
                break
            line = line.strip()
            if not line:
                continue
            try:
                request = json.loads(line)
                response = await server.handle_request(request)
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
            except json.JSONDecodeError:
                continue
    finally:
        await server.close()


if __name__ == "__main__":
    asyncio.run(stdio_loop())