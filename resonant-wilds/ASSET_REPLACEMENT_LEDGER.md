# Resonant Wilds — Asset & Presentation Convergence Ledger

**Authoritative gameplay source:** `fromage3900/MelodiaMelusinaV2/Prototypes/Web/MelodiaResonantWilds/`.
**Published web mirror:** `fromage3900/my-site/resonant-wilds/`.
**Current review:** PR #89, `feat/resonant-wilds-complete-convergence-20261028`, restoring #83, #84, #88 on the deployed 100-GLB main. The public site remains on the previous release until approval.

## Implemented and integrated

| Feature | Current implementation | Validation / remaining QA |
| --- | --- | --- |
| 100 authored flora and environment prefabs | `harmonic-grove-37.glb` (37) + 63 individual GLBs (Kits 02/03) | Full binary/root/mesh checks; browser boot previously confirmed |
| Trees, flowers, rock, bell, reeds, mushrooms, crystals, lily, spire, pine | `js/harmonic-grove.js` maps all 15 existing chunk-prop categories, with compatibility fallback | Instancing and category masks remain gameplay-owned |
| Shorewake village scenic assets | Authored fountain, lyre gate and signs placed via `world._dressHubWithGrove` | Preserve scene landmark and POI coordinates |
| Music-Key Shrine | Original four-column gameplay POI plus a separate Higgsfield Resonance Shrine GLB | New GLB is default on PR #89, `?shrine=procedural` restores legacy; touch/performance QA required |
| Pylons and chests | Authored tuning plinth and lyre-lock dressing; existing animated crystal/lid remains authoritative | Idempotence regression and visual size QA |
| Melusina | Code-built animated chibi in `js/chibi.js`, with visual pose adapter in `player.js` | Default on PR #89; `?avatar=original` restores procedural comparison; not an externally sourced GLB |
| Hard RGB cel shading | `js/cel.js`: three color bands, configurable shadow cutoff/hardness/depth, selective ink | Default on PR #89; `?npr=v1` or `?render=legacy` for comparison; **no Kuwahara filter** |
| Cymatics and caustics | Existing world uniforms, GLSL Chladni and caustic masks | `?chladni=0&caustics=0` for baseline |
| Website design heritage | Four original SVGs plus a single-scene deterministic shrine timeline | No duplicate renderer or audio loop; respects reduced motion |
| PWA | Network-first core JS/CSS/HTML, 100-GLB precache base, 63 optional models cached on demand, icons and heritage | Cache v9; offline install and real mobile QA pending |

## Not yet a finished gameplay replacement

- `PICK_*` pickups and `INT_*` switches/locks are **visual prefabs only** unless explicitly wired to a canonical interaction; model availability is not new game functionality.
- Choral Sheep, Melody Slime, bosses and enemy hitboxes retain their existing runtime representations.
- Procedural world terrain, combat, save data, beats and Rift behavior remain authoritative.
- Some large bridges, gates, landmarks and 100-kit props are available in `kit.spawn(name)` and the standalone asset gallery, but **are not automatically placed in the world**.
- The 100-GLB pack's high-level art assets do not replace the ongoing UE capstone work.

## Source provenance

Higgsfield 3D Jutsu:
- Original Grove Kit 01: https://higgsfield.ai/3d-jutsu/3456ae12-564a-4a28-9b31-a209f6c3075f
- Grove Kit 02: https://higgsfield.ai/3d-jutsu/68b5c901-a530-4e1a-9a5d-e650e1af9b54
- Grove Kit 03: https://higgsfield.ai/3d-jutsu/fb5bc68e-3e7f-42c4-b54e-d5e98aeb4d45
- Resonance Shrine P0: https://higgsfield.ai/3d-jutsu/001768a3-4235-49d3-af86-8cb33dfe16e1

Four SVGs and the deterministic timeline are sourced from the project's owned website code; full provenance in `HERITAGE_INTAKE.md`.

## Release gate

1. GLB 100 + separate shrine verifier: green.
2. No-dependency source/GLB/PWA checks: green.
3. Headless WebGL gameplay, chibi, NPR modes, GLB shrine, mobile viewport and tuner: verify green on current commit.
4. Desktop and iPhone art review: scale, shadow density, draw calls, touch and thermal/memory pressure.
5. Merge only after tests and explicit production approval; static GH Pages has no multiplayer leaderboard backend.
