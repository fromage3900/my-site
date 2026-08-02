# Melodia — Live Collaborative Environment Art Platform

UE 5.8 + Blender 5.1 production platform for stylized portfolio work: real-time Blender↔Unreal level design bridge, procedural geometry generation, automatic material crosswalk, voice-driven NPCs, rhythm combat, and autonomous agent loops.

---

## 🚀 Onboarding: Live Collaborative Level Designer

> **Two designers, one live session. Geometry in Blender streams to Unreal in real time. ~10 minutes to first sync.**

### Prerequisites

- [x] **Unreal Engine 5.8** — open `BS_GodFile.uproject`, wait for shader compile
- [x] **Blender 5.1** — N-panel → Melodia Studio tab (SurrealArch addon pre-loaded)
- [x] **VOICEVOX 0.25+** — [download](https://voicevox.hiroshiba.jp/) → install → launch
- [x] **One Blender instance only** — multiple instances conflict on port 9876

---

### Step 1 — Verify the bridge ports

| Service | Check | Expected |
|---------|-------|----------|
| UE MCP | `curl http://127.0.0.1:9316/health` | `{"status":"ok","tools_registered":1325}` |
| LiveLink | Blender N-panel → Melodia Studio → **Live Bridge** → **Refresh Status** | `[✓] LiveLink [✓] UE MCP` |
| VOICEVOX | `curl http://127.0.0.1:50021/version` | `"0.25.2"` |

---

### Step 2 — Start the LiveLink server

```
Blender N-panel → Melodia Studio → Live Bridge → LiveLink :9876 → [Start Server]
```

Status changes to **CONNECTED**. The server now accepts FBX streams from Blender and pushes to UE.

---

### Step 3 — Generate & send your first asset

```
┌─ Blender ─────────────────────────────────────────┐
│                                                    │
│  1. Genome Carousel → pick ZEN_SHRINE → [Apply]    │
│  2. Material Bridge → [Scan Slots] → [Auto-Match]  │
│  3. Live Bridge → [Send + Materials]               │
│                                                    │
│  (toggle Live Sync ON for continuous streaming)    │
└────────────────────────────────────────────────────┘
                           │
                           ▼  FBX + textures + material paths
┌─ Unreal ───────────────────────────────────────────┐
   Assets appear at  /Game/LiveLink/
   ── drag into viewport to see in-level
└────────────────────────────────────────────────────┘
```

---

### Step 4 — Collaborative Workflow

| Designer | Tool | What They Do |
|----------|------|-------------|
| **Geometry Designer** | Blender | Procedural gen, mesh editing, materials, live sync |
| **Level Scripter** | Unreal | Blueprints, encounters, lighting, PCG scatter, NPCs |

---

### Port Map

| Port | Service | Direction |
|------|---------|-----------|
| `9876` | LiveLink — FBX streaming | Blender → UE |
| `9316` | UE Monolith MCP — Python execution | Any → UE |
| `50021` | VOICEVOX — TTS | Any → VOICEVOX |

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

## Wix CLI Info

This repository is connected to the Melodia Wix site. Any commits to `main` appear at:
**https://fromage3900.github.io/my-site/wix/index.html**