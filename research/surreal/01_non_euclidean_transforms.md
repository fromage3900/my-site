# Study: Non-Euclidean transforms (surreal expansion)

**Style:** surreal  
**Version:** 1.0

## Motifs

- Axis compression along sacred approach (verticality genome)
- Recursive interior scaling (deferred)
- Impossible hallway wrap (deferred)

## Structural rules

- Transforms apply **after** graph spawn snap pairing
- Must preserve snap grid quantum (`unit_size`)
- One transform active per loop cycle (`surreal_transforms.yaml`)

## Extracted atoms

| Atom ID | Type | Notes |
|---------|------|-------|
| `axis_compression` | graph_wrap | scale Z by genome.verticality on chain |

## OS hooks

- `deploy/surreal_os/surreal_transforms.yaml`
- Applied in `greybox_graph.spawn_graph()` via `rules_engine.apply_surreal_transform`
