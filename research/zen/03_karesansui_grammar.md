# Study: Karesansui grammar (枯山水)

**Style:** zen  
**Version:** 1.0  
**Sources:** Dry landscape garden typology; `GB_ZEN_KARESANSUI` kit

## Motifs

- Flat gravel field (sand_bed) with ishigumi border collar
- Parallel rake grooves as recess trim panels
- Viewing axis from machiai or engawa across field

## Proportions

- Field 6×8 m default module; border stone ~1.4× wall thick
- Groove spacing ~1.1 m pitch along depth axis
- View snaps on path_ny / path_py at field edge

## Rhythms

- Border stones on four sides (corner overlap acceptable in greybox)
- 4–7 rake grooves scaled to `gb_depth`
- Often paired with machiai waiting pavilion on viewing edge

## Structural rules

- Kit `GB_ZEN_KARESANSUI` emits floor + view snaps
- TRIM_SHEET UV on stone trim zones
- Graph slot between roji and machiai in `ZEN_KARESANSHUI_WALK`

## Ornament systems

- `trim:sand_bed`, `trim:border_stone`, `trim:rake_groove`
- UE slots: TRIM_FLOOR, TRIM_EDGE, TRIM_PANEL_RECESS

## Extracted atoms

| Atom ID | Kit | Notes |
|---------|-----|-------|
| `karesansui_field` | GB_ZEN_KARESANSUI | sacred ground |
| `machiai_wait` | GB_ZEN_MACHIAI | viewing pavilion |

## OS hooks

- Genome: high `structural_logic`, moderate `symmetry`
- Atom proportions feed `apply_genome` trim recess defaults
- Compose `sacred` role → karesansui library bake
