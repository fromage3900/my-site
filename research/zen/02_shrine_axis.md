# Study: Shrine axis (参道 → 拝殿)

**Style:** zen  
**Version:** 1.0  
**Sources:** Shinto shrine typology; sando/kairo/haiden sequence

## Motifs

- Formal sacred axis: outer torii → sando paving → covered kairo → worship hall (haiden)
- Stone lantern (tōrō) rhythm along sando
- Cloister column row facing inner court

## Proportions

- Sando width ~2.2 m; module length 6–8 m
- Kairo ken ~1.82 m column rhythm; height ~2.8 m eave
- Haiden platform rise ~0.45 m (genkan steps)

## Rhythms

- Double sando modules before kairo turn
- Lantern posts at module midpoints (`trim:toro_post`)
- Kairo walkway connects court_px to garden_nx snaps

## Structural rules

- `GB_ZEN_SANDO` + `GB_ZEN_KAIRO` kits tile on path snaps
- Graph `ZEN_SHRINE_AXIS` (YAML) replaces hardcoded Python list
- Compose `corner_tower` / `monument` roles map to pagoda/haiden library (tier B)

## Ornament systems

- Sando: paving, edge_stone, toro_post, toro_base trim groups
- Kairo: floor, column, beam, noki_eave, wall_panel
- Haiden (tier B): haijo_floor, genkan_step, ranma, noki

## Extracted atoms

| Atom ID | Kit | Notes |
|---------|-----|-------|
| `sando_approach` | GB_ZEN_SANDO | formal paving |
| `kairo_cloister` | GB_ZEN_KAIRO | covered walk |
| `haiden_platform` | GB_ZEN_HAIDEN | worship hall (backlog) |

## OS hooks

- Genome: `zen_shrine_v1.default_graph` = `ZEN_SHRINE_AXIS`
- Grammar: `deploy/surreal_os/grammar/zen_shrine_axis.yaml`
- Compose: genome-driven `ZEN_SHRINE` role map
