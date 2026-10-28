# Resonant Wilds — Harmonic Grove GLB library

This folder contains a **100-prefab** environment and gameplay-visual library made from the three editable Higgsfield 3D Jutsu source projects:

- Kit 01: 37 original prefabs inside `harmonic-grove-37.glb` (one master GLB).
- Kit 02: 32 individual `ARC_`, `BUSH_`, `CAN_`, `POND_`, and `PRP_` prefabs.
- Kit 03: 31 individual `INT_`, `ORN_`, `PICK_`, `SCAT_`, and `WAY_` prefabs.

**64 GLB files total.** Every standalone file retains its named `ASSET_<NAME>` root, centered on the asset's intended local-space pivot. Materials are glTF-compatible. No generated image texture dependencies or paid inference are required to load these GLBs.

## Runtime

`js/harmonic-grove.js` loads the 37 base prefabs before the game becomes playable, then streams the other 63 using three concurrent workers. The world refreshes static visual chunks when streaming completes.

- `kit.spawn(name)`: a reusable Three.js group for any loaded named prefab.
- `kit.variants(type)`: shape-preserving procedural replacement variants.
- `kit.decorative(biome)`: safe, deterministic visual scatter only.

Large gates, bridges, pickups, switches, and wayfinding structures **must not be randomly scattered**: place them deliberately and keep gameplay ownership in `activities.js`, `loot.js`, and the canonical game state.

## Asset gallery

Open `resonant-wilds/asset-gallery.html` through a local HTTP server to inspect the entire collection in Three.js. Filter by family or name, drag to rotate, zoom, and compare the rendered silhouettes and material palette. The gallery loads Kit 01 first, then requests the remaining 63 GLBs asynchronously.

Shorewake Village has a curated fountain, lyre gateway, and musical wayfinding props. Existing shrines, pylons and treasure chests gain visual attachments when their models are ready. These placements do not create new gameplay interactions; the original animated elements remain authoritative.

The PWA cache version is `resonant-wilds-v3-glb100`. Optional standalone GLBs cache lazily as they are requested, rather than blocking offline-app installation.

## QA and deployment

Pull-request CI validates all 100 prefab roots, GLB magic and declared byte lengths, non-empty mesh content, and JS module syntax. Browser QA is still required for materials, draw-call density, geometry clipping, audio gesture start, and landscape iPhone Safari.

No asset here changes collision, combat, rhythm, procedural fallback logic, or persisted gameplay data. For earlier Tripo research, see `../../TRIPO_ASSET_PIPELINE.md` — that document predates this authored collection.

Editable Higgsfield sources:
- Kit 01: https://higgsfield.ai/3d-jutsu/3456ae12-564a-4a28-9b31-a209f6c3075f
- Kit 02: https://higgsfield.ai/3d-jutsu/68b5c901-a530-4e1a-9a5d-e650e1af9b54
- Kit 03: https://higgsfield.ai/3d-jutsu/fb5bc68e-3e7f-42c4-b54e-d5e98aeb4d45
