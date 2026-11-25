# Object Atelier — curated collection (2026-11-25)

## Featured collection
Resonance Violin, Pelagic Vault Lute, Cathedral Harp, Atlantis Fountain, Triton Trident, Astral Star Token, Treble Clef, Harmonic Torus Knot, Draped Swatch. Existing model files and authored render archive are retained. This is an editorial shortlist, not a claim that live rendering has been visually verified.

## Drive intake — pending material and provenance QA
Both Drive hero ZIPs contain the same five GLB 2.0 exports. The actual GLB JSON has no embedded materials or images; these should be presented as geometry studies until original maps are correctly bound. Do not describe them as finished production assets. No private Drive links or binary data are committed in this change.

| Candidate | Bytes | Triangles | SHA-256 |
|---|---:|---:|---|
| Melusina_Hero_Bust_ARKit.glb | 1398996 | 15468 | 1931155e0a9e1d18c6910a2e6dece3d11e81aae031420021d4f3e10155b31be2 |
| Melusina_Couture_Wardrobe.glb | 673740 | 8200 | 18d7ecf037b7cf87f897948067ce880cbd45ca48ee1a43825794c2a96fa4f61e |
| Companions_SirMelodious_and_Slime.glb | 111808 | 3164 | 8ea4d94fbdc2f30e8f2a37d5a01eaf8eae67a1c2a29a73f6c19aaf72e4aaf7db |
| Sanctuary_Environment_Props.glb | 836616 | 8000 | ec21984d13c2bf8a20b7bddbc1691c17790dea5a55102e710fba2ffad27ae117 |
| Melodia_TrimSculpt_Base.glb | 423620 | 3200 | fcb5c4517253716d17ddf8e84db858cc92ff3dde771ac81ed4612efe9846c0c9 |

Prioritize sanctuary architecture/Floraison, couture, and the trimsculpt. Compare geometry against original source and renders, split multi-object assemblies where needed, validate UVs, bake and bind actual PBR maps, and test on iPhone before promotion. The original head sculpt, treasure chest, Castle Frankenmelody, Fallen Moon and Heart Gate are high-value source candidates but require separate optimization. Keep eyewear in its dedicated optical shader experience until its original materials can be preserved in the consolidated viewer. No synthetic replacement renders.

## Release gate
Verify a real model load (not fallback), orbit, material switching, small-screen layout, and actual deployed endpoints. Existing GitHub Pages publication is blocked by artifact lookup even after the previous unique-name fix; do not claim public changes until deployment succeeds.
