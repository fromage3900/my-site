# Resonant Wilds — GLB art playground

Resonant Wilds is a browser-only copy of the canonical prototype in `fromage3900/MelodiaMelusinaV2/Prototypes/Web/MelodiaResonantWilds/`. Do not migrate UE state or gameplay authority into the site. The original 22 files have been copied intact.

## First Tripo batch

- `choral-sheep.glb`: fluffy ivory/pearl Choral Sheep with a tiny bell, soft readable proportions.
- `resonance-shrine.glb`: ivory-and-champagne-gold stone shrine with glowing blue-lavender center, small prop silhouette.
- `petal-slime.glb`: rounded translucent-looking blush-pink/lavender petal slime, clear expressive silhouette.

Use one clean view or a consistent multiview sheet per subject; export .glb with textures after checking geometry and licensing.

## Asset intake

Save reviewed, optimized GLBs in `assets/models/` only. Do not commit Tripo API keys, time-limited download links, raw reference art, or unapproved generated variants. Keep .blend sources and heavier high-resolution models outside the published portfolio repository.

Start with static meshes. Optimize for phones: roughly 1–5 MB GLB per prop (smaller is better), ~1K textures for repeating objects, and under ~5–15k triangles per hero prop if feasible. Verify triangle count and material count; keep pivot at the feet/base, orient upright Y+, scale consistently and check texture colors in a web renderer. These are art budgets, not hard technical limits.

## Next code pass: safe GLB visual adapter

Once the first actual GLB is accepted, add a **Three.js r170-compatible GLTFLoader add-on** (the game includes core r170 but not the loader). Load the GLB as a child of the existing enemy/prop/companion transform. Preserve procedural fallback visuals when loading fails; don't touch beat timing, collision, movement, combat or save-state ownership. Instance repeated assets where practical. Avoid hotlinking expiring Tripo links.

## QA

Serve the site repo root with `python -m http.server 8080`, then open `http://localhost:8080/resonant-wilds/`. Test desktop controls, tap-to-unlock audio and landscape iPhone Safari. After review and merge the live Pages URL should be `https://fromage3900.github.io/my-site/resonant-wilds/`. The Wix custom-domain alias requires its own routing/redirect configuration.
