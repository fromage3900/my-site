# Fabric Material Lab — Evidence

**Status:** BUILT AND RUNTIME-VERIFIED IN A REAL BROWSER
**Date:** 2026-09-11
**Path:** `tools/fromage-webgl-kit/prototypes/fabric-material-lab/`
**Authority:** `../../KIMI_PROTOTYPE_BATCH_2026-09-10.md` — Prototype B

A clean-room Three.js study of tileable PBR textile response. Six neutral-named presets, direct
material controls, two inspection lighting rigs, an exportable material state, and a live
diagnostics readout.

**This prototype was necessary**, because the deployed portfolio viewer cannot be used as a
commercial sample: it is built largely from third-party and project-specific assets (see
Appendices). This lab carries none of that.

---

## 1. What the deployed fabric system already had — inventory

Audited before writing any replacement code, as the brief requires.

| Capability | Where | Reused? |
|---|---|---|
| Fabric preset switching | `wix/melodia-3d-viewport.js` (`FABRIC_SETS`) | Concept reused; code **not** copied |
| BC / Normal / packed-ORM map usage | `wix/textures/pbr/` | **Textures reused** — they are owner-authored |
| Roughness / metalness / AO from one ORM | same | **Reused as the convention** |
| Turntable + orbit inspection | `wix/realtime-3d-viewer.html` | Reimplemented minimally |
| Channel-isolation shading modes | `wix/melodia-3d-viewport.js` | Not needed here |
| Turntable atelier surface | `wix/melodia-atelier-lab.*` | Not needed here |
| Material atlas presentation | `wix/sdf-material-gallery.html` | Not needed here |

**The reusable primitive extracted:** the packed-ORM fabric convention
(`_BC` sRGB / `_N` tangent / `_ORM` = R-AO, G-roughness, B-metalness, linear), now driven by
neutral preset identities instead of project-specific ones.

---

## 2. Provenance — every texture, classified

Full record: `../../fabric/MATERIAL_PROVENANCE_MANIFEST.json`

All six presets trace to **one generator** in the owner's own repository:

```
BS_GodFile/Content/Python/author_fantasy_fabrics.py
  "Procedural synthesis and zero-loss packing of tileable 4K / 2K PBR texture sets"
  dependencies: numpy + PIL only — no texture library import, no downloaded source
  preset -> file map: lines 610-615
```

| Preset (neutral) | Source texture | Classification |
|---|---|---|
| Velvet-like | `T_Fabric_RoyalVelvet_*` | **OWNER_AUTHORED** |
| Satin-like | `T_Fabric_SheerSilk_*` | **OWNER_AUTHORED** |
| Brocade-like | `T_Fabric_GildedBrocade_*` | **OWNER_AUTHORED** |
| Lace-like | `T_Fabric_BaroqueLace_*` | **OWNER_AUTHORED** |
| Embroidered-like | `T_Fabric_GoldEmbroidery_*` | **OWNER_AUTHORED** |
| Iridescent-like | `T_Fabric_CelestialWeave_*` | **OWNER_AUTHORED** |

**30 texture files, 9.59 MB, all cleared for commercial reuse.** The manifest's previous
revision left every preset `UNKNOWN`; that is now resolved *with evidence* rather than
assumption — the generating script is in the same repository and names these exact files.

Preset **identities were deliberately neutralised** ("velvet-like", not a product name) as the
brief requires, even though the underlying textures are owned.

---

## 3. What was measured — real browser run

Chrome, `localhost`, 1440×900 then 390×844. Script: `C:/EnvironmentPortfolio/browser-test/verify_fabric_lab.js`.

```text
FPS ~60 · DPR 1.00 · draw calls 1 · triangles 39,000 · textures 8.08 MB (all six sets warm)
```

| Check | Result |
|---|---|
| Page initialises, WebGL context starts | PASS |
| Preset switching (6 presets) | PASS — all six, verified by active label |
| Tint control changes material | PASS |
| Roughness / normal / sheen sliders change state | PASS (`1.8 / 2.1 / 0.4` reflected in export) |
| Grazing-angle rig engaged | PASS — label reads `lighting: grazing` |
| Wireframe toggle | PASS |
| Turntable | PASS (disabled under `prefers-reduced-motion`) |
| Exported state is valid JSON | PASS |
| Phone width 390 px | PASS — no horizontal overflow (`scrollWidth == innerWidth`) |
| Console errors | **1** — `favicon.ico` only |
| Graceful fallback when WebGL unavailable | implemented (`#fallback`), not exercised on this machine |

### Captures

| File | Shows |
|---|---|
| `01_desktop_default.png` | Velvet-like under studio rig |
| `02_satin_like.png` | Satin-like — identical lighting, for comparison |
| `03_grazing_angle.png` | **Grazing-angle inspection** (iridescent-like) |
| `04_controls_changed.png` | Sliders moved (rough 1.8 / normal 2.1 / sheen 0.4) |
| `05_wireframe.png` | Wireframe mode |
| `06_phone_390.png` | 390 px layout |

### The grazing-angle claim, checked rather than asserted

Independent visual inspection of `03_grazing_angle.png`:

> *"the weave texture is clearly visible as a fine diagonal grid… the illumination is skimming
> across the fabric surface, making the micro-weave and subtle surface relief visible through
> small highlights and shadows."*

That is the capability the listing asks to see, and it is demonstrated rather than claimed.

**Honest note:** under the *studio* rig the same material reads as smooth and matte — the
low-frequency fold shading dominates and the micro-weave is not visually resolved. The detail is
present in the shader and appears the moment the light goes grazing. This is expected behaviour,
not a defect, but it means a reviewer looking only at a frontal studio capture would not see the
normal response.

---

## 4. Reused vs newly added

**Reused:** the texture library itself (owner-authored), and the packed-ORM convention.
**Newly added in this prototype:**

1. neutral preset identities decoupled from project naming;
2. direct tint / roughness / normal-strength / sheen controls;
3. two inspection lighting rigs (studio, grazing);
4. lightweight JSON material-state export;
5. live diagnostics (FPS, DPR, draw calls, triangles, texture MB);
6. a procedural draped-cloth panel (150×130 grid) — owned geometry, no imported mesh;
7. graceful WebGL failure path and `prefers-reduced-motion` handling.

**No duplicate fabric-lab architecture was created** — nothing under `wix/` was modified by this
pass, and the deployed portfolio pages are unchanged.

---

## 5. Remains unverified / not claimed

- **No physical colorimetry and no measured BRDF.** This is Three.js `MeshPhysicalMaterial`, not
  a fibre renderer. The presets are artist-authored approximations.
- **No automatic swatch capture and no production digitization.** Nothing here photographs or
  scans real fabric.
- **Sheen is approximate.** `sheenColorMap` is fed from an auxiliary grayscale pass; it is not a
  fitted sheen lobe.
- **Not tested on a physical phone**, a low-end GPU, or Safari/iOS. The 390 px check is a
  viewport emulation, not a device.
- **No performance measurement under load** — a single 39 k-triangle mesh in one draw call is not
  a stress test.
- The grazing-angle rig is a two-light approximation, not a gonioreflectometer.

---

## 6. Proposed client questions (per the brief)

1. **What is the delivery target** — a configurator that must run on mid-range phones, or a
   desktop lookdev review tool? The material budget differs by roughly an order of magnitude and
   it changes what we author first.
2. **Which fabrics need to be physically faithful, and which only need to read correctly on
   screen?** Full measured BRDF capture is expensive; most projects only need two or three
   hero textiles measured and the rest authored to match.
3. **Who owns the source texture pipeline** — do you already have swatch photography and a
   tiling convention, or does the engagement need to establish one before any 3D work starts?

---

## Appendix A — assets deliberately NOT used

| Asset | Class | Why excluded |
|---|---|---|
| KitBash3D Atlantis props + ~47 `KB3D_ATL_*` textures | THIRD_PARTY_RESTRICTED | Licensed third-party pack. Not for redistribution as an original sample. |
| Zundamon | THIRD_PARTY_RESTRICTED | Third-party character IP. |
| Melusina, Sir Melodious, Melody Tokens | MELODIA_SPECIFIC | Project characters. Portfolio-only. |
| `T_Melusina_Shirt_*` | MELODIA_SPECIFIC | Character wardrobe material, not part of the generated fabric library. |

## Appendix B — reproduce

```bash
# serve the repo root, then open the prototype
python -m http.server 8126 --bind 127.0.0.1
# http://localhost:8126/tools/fromage-webgl-kit/prototypes/fabric-material-lab/

# the verification run that produced section 3
node C:/EnvironmentPortfolio/browser-test/verify_fabric_lab.js
```
