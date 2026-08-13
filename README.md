# Melodia — Live Collaborative Environment Art Platform

UE 5.8 + Blender 5.2 production platform for stylized portfolio work: Melodia Studio Geometry Nodes (165 builders / 12 GN Stack categories), Unreal C++ JRPG slice, and DCC bridges.

## Recruiter sendoff (30 seconds) — 2026-08-13

**Who:** Brennan Shepherd — stylized environment & technical artist, Humber 3D Animation, Toronto.

**What shipped:** Melodia Studio on Blender 5.2 (**165 GN builders / 12 categories**, presets **33/165 (20%)**, 100 looks) plus a UE 5.8 C++ Persona-lite slice. Opening route `L_MelusinaMorning` → `L_KaleidoNave`. Rhythm and QuillScript owner-lock worked; A1 stock battle is still open.

**Stack:** Unreal 5.8 C++, Blender 5.2 Geometry Nodes, PCG, hybrid **Komikaze NPR + UE Toon**. Character polish is that hybrid — not a Genshin SDF ship. Cine water-hair is Geometry Cache (Alembic 1–240) + Niagara drip; gameplay fallback is `SK_MelusinaHair`. Idle is mocap `A_Melusina_Idle_Mocap_RootX` (Blender idle is on disk, not wired). `WBP_MainMenu` fonts are Syne / Instrument Serif via `F_Melodia_UI`.

**Plates:** Flip EEVEE glam stills are local cine. Cam_Beauty on live v22 (Nikki 900/550/280/140, Review_Queue hidden) reads bald because Flip cache globules sit below the scalp (max Z ≈ 1.015 vs head ≈ 1.442) — existing 1–240 cache, not a new bake. That still is not full cine water-hair. Unreal B2 Cam_Beauty is still pending.

**Skim these:** [One-sheet](wix/recruiter-one-sheet.html) · [Home](wix/index.html) · [Melodia Studio](wix/geometry-nodes.html) · [Melusina](wix/melodia-stage-character.html) · [Resume](wix/resume.html)

**As of 2026-08-13.** Live agent MCP is **BlenderMCP :9876**. Melodia Studio Live Bridge LiveLink is a stub. Port 9317 is legacy.

---

## Onboarding: Live Collaborative Level Designer

> Two designers, one live session. Connect BlenderMCP on 9876. ~10 minutes to first agent ping.

### Prerequisites

- [x] **Unreal Engine 5.8** — open `BS_GodFile.uproject`, wait for shader compile
- [x] **Blender 5.2** — N-panel → **Melodia Studio** tab
- [x] **VOICEVOX 0.25+** — [download](https://voicevox.hiroshiba.jp/) → install → launch
- [x] **One Blender instance only** — multiple instances conflict on port 9876

---

### Step 1 — Verify the bridge ports

| Service | Check | Expected |
|---------|-------|----------|
| UE MCP | `curl http://127.0.0.1:9316/health` | JSON health from Monolith MCP |
| BlenderMCP | N → **BlenderMCP** → **Connect to MCP server** (port 9876) | Agent ping via `python Tools/blender_mcp_client.py get_scene_info` |
| LiveLink stub | Melodia Studio → Live Bridge → Refresh Status | Optional scratch only — not the agent path |
| VOICEVOX | `curl http://127.0.0.1:50021/version` | `"0.25.2"` |

---

### Step 2 — Connect BlenderMCP (not Live Bridge)

```
Blender N-panel → BlenderMCP → Connect to MCP server (9876)
```

Do **not** use Melodia Studio → Live Bridge → Start Server for agent control. That button is LiveLink, a stub, and shares the port.

---

### Step 3 — Generate & send your first asset

```
┌─ Blender ─────────────────────────────────────────┐
│                                                    │
│  1. Melodia Studio → GN Stack → apply a builder    │
│  2. Material Bridge → [Scan Slots] → [Auto-Match]  │
│  3. Export FBX / kitbash buses — not LiveLink SSOT │
│                                                    │
└────────────────────────────────────────────────────┘
```

Mocap clips retarget through `RTG_Mocap_to_Melusina` onto `SK_Melusina_Skeleton` (465 bones). They do not import directly onto the skeleton.

---

### Port Map

| Port | Service | Direction |
|------|---------|-----------|
| `9876` | **BlenderMCP** — live agent MCP | Cursor/agent ↔ open Blender 5.2 GUI |
| `9876` | LiveLink stub (same port; one bridge at a time) | Scratch `/Game/LiveLink/` only |
| `9316` | UE Monolith MCP | Any → UE |
| `9317` | Legacy adapter | Do not use |
| `50021` | VOICEVOX — TTS | Any → VOICEVOX |

Melodia Studio: **165 GN builders**, **12 GN Stack categories**, presets **33/165 (20%)**, 100 looks. Operators `surreal_arch.*` / `mel_gn.*`.

---

### Key Scripts

| Script | What It Does | Where |
|--------|-------------|--------|
| `Tools/generate_all_voices.py` | Generate 102 NPC voice WAVs | Terminal |
| `Content/Python/create_zunzun_bps.py` | Auto-create 7 NPC Blueprints + quests | UE |
| `deploy/sync_surreal_to_live.ps1` | Push SurrealArch to Blender addons | Terminal |
| `deploy/sync_site_to_github.ps1` | Sync my-site-clean → GitHub Pages | Terminal |

Full guide: [Docs/ONBOARDING_LIVE_COLLAB.md](https://github.com/fromage3900/BS_GodFile/blob/main/Docs/ONBOARDING_LIVE_COLLAB.md)

---

## Source-control status

- Local checkout tip: `3cfa5f0`.
- The configured `origin/main` has unrelated history, so this checkout is not
  currently synchronized with GitHub. Do not force-push or merge unrelated
  histories without an owner decision.
- Site facts and asset checks pass locally. The token linter still reports
  `99` hard errors and `1113` warnings.

## Wix CLI Info

This repository is intended to publish the Melodia Wix site at:
**https://fromage3900.github.io/my-site/wix/index.html**

Do not describe local commits as live on GitHub Pages until the remote
publication push is verified.