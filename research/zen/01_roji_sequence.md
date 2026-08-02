# Study: Roji sequence (露地)

**Style:** zen  
**Version:** 1.0  
**Sources:** JAANUS roji/chashitsu; `ZEN_ARCHITECTURE_GLOSSARY` in deploy monolith

## Motifs

- Sequential purification spaces before tea or worship
- Torii threshold, dew path, tsukubai hand-wash, crawl/nijiriguchi threshold
- Bamboo screen and stone edge as boundary rhythm

## Proportions

- Roji path width ~1.6–2.2 m (human-scale, single file)
- Torii span 3.2–4.2 m; post radius ~6% of span
- Tsukubai pad ~1.6 m square; basin recess ~55% of pad

## Rhythms

- Torii → stepping stones or roji slab → tsukubai → engawa/teahouse
- Lantern placement every ~6 m on longer approaches
- MUST_CONNECT snaps on path axis (path_ny / path_py)

## Structural rules

- Each segment is a tileable `GB_ZEN_*` kit with floor + path snaps
- Graph `ZEN_ROJI_PATH` chains modules via `best_snap_pair` WALL alignment
- Trim RECESS on stone modules for TRIM_SHEET UE export

## Ornament systems

- Hashira / nuki / kasagi trim zones on torii (`trim:hashira`, `trim:nuki`, `trim:kasagi`)
- Edge stones on roji slab (`trim:edge_stone`)
- Basin + flagstone on tsukubai (`trim:basin`, `trim:flagstone`)

## Extracted atoms

| Atom ID | Kit | Notes |
|---------|-----|-------|
| `torii_frame` | GB_ZEN_TORII_GATE | gateway |
| `roji_path_segment` | GB_ZEN_ROJI_STEP | circulation |
| `tobiishi_scatter` | GB_ZEN_TOBIISHI | informal approach |
| `tsukubai_station` | GB_ZEN_TSUKUBAI | ritual wash |
| `engawa_threshold` | GB_ZEN_ENGAWA | interior buffer |

## OS hooks

- Genome: `zen_shrine_v1.sacred_sequence` includes roji segments
- Grammar: `ZEN_ROJI_PATH`, `zen_shrine_axis.yaml` (approach spine)
- Compose: `ZEN_SHRINE` gate role → torii library piece
