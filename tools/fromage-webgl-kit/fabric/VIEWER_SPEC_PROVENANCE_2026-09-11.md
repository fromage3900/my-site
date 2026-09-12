# Fabric Viewer — Runtime QA Result, Fixes, and Spec Provenance

**Date:** 2026-09-11 · **Subject:** `wix/realtime-3d-viewer.html` + `wix/melodia-3d-viewport.js`
**Freeze status:** both paths are in `content/showcase-freeze.json → allowed_exact`. This work is
*proof correction*, which the freeze purpose explicitly permits.

Replaces the 16-row checklist's prior state, which was **16/16 unverified**. Every row below was
executed against a real browser, not inferred from source.

---

## 1. QA result — 16 rows

**10 PASS · 3 FAIL (now fixed, see §2) · 2 not verifiable headlessly · 0 not-required**

Smoke (7/7 PASS): boots from HTTP · no blocking console errors · default fabric resolves ·
8 shading modes + 7 fabrics switch without error · orbit/turntable usable · resize safe · phone-width
layout usable.

Material inspection: PBR PASS · Normal PASS · Clay PASS · Wireframe PASS · **Roughness, Metallic, AO
FAIL** — see §2.

**Not verifiable headlessly** (require a human eye, and are left explicitly unclaimed):
- grazing-angle roughness/normal response
- exposure/lighting neutrality across modes

---

## 2. The three defects — cause and fix

The old implementation rendered the **whole packed ORM texture** through `MeshBasicMaterial` and
called it channel isolation. It isolated nothing. `metallic` was worse — a flat grey material with
**no texture bound at all**.

```js
// before
case 'roughness': return new THREE.MeshBasicMaterial({
  map: ormTex, color: new THREE.Color(f.roughnessMult, ...) });   // full ORM, not the G channel
case 'metallic':  return new THREE.MeshBasicMaterial({
  color: new THREE.Color(f.metalMult, ...) });                    // no texture at all
case 'ao':        return new THREE.MeshBasicMaterial({
  map: ormTex || bcTex, color: 0xcccccc });                       // full ORM/BC, not the R channel
```

Packed ORM is **R = occlusion, G = roughness, B = metalness**. The fix samples exactly one channel and
writes it out as greyscale (`createChannelMaterial`), so each mode shows what its label claims. When a
fabric has no ORM map the mode now falls back to a flat neutral — never another channel's data, which
is what the old `ao` case did by falling back to the base-colour map.

**Verified after the fix** — six modes, six distinct renders, **zero shader compile errors**:

| mode | sha256[:12] |
|---|---|
| pbr | `29dae79c606e` |
| roughness | `e85722f9b348` |
| metallic | `6839f5b1d51f` |
| ao | `8470d9ec3c24` |
| normal | `d60af8141297` |
| clay | `0b07da76ac77` |

---

## 3. The 404 defect

`models/UpdatedShirt.fbx` was referenced but **did not exist** — the only one of 19 catalog paths
missing. Clicking the asset produced a live 404 and the fallback quietly swapped the intended hero
garment for a `CylinderGeometry`.

Repointed to `models/SK_Melusina_Clothes_Production.fbx`, which exists. A sweep of **all 19
referenced paths** now finds **zero missing**.

Separately confirmed: `/favicon.ico` returns 404 site-wide. That was the unexplained bare 404 seen on
both this viewer and the industrial-loop page. Hamless, but it is a real 404 and it is the *only* one.

---

## 4. Spec provenance — every polyCount is now measured

The catalog's triangle counts were **not measured**. They are now, by importing each model into
Blender 5.2 headless and summing `loop_triangles` across all meshes. Script:
`C:/EnvironmentPortfolio/browser-test/measure_all_models.py`.

| asset | claimed | **measured** | error |
|---|---|---|---|
| melody-token-water | 90.4k | **5,015,040** | 55.5× |
| melody-token-star | 80.6k | **4,278,450** | 53.1× |
| sir-melodious | 24.2k | **374,656** | 15.5× |
| melusina (clothes) | 14.2k | **334,712** | 23.6× |
| melusina-hero | 79.3k | **95,388** | 1.2× |
| prop-harp | 24.5k | **76,228** | 3.1× |
| zundamon | 12.4k | **34,820** | 2.8× |
| prop-fountain | 14.8k | **31,332** | 2.1× |
| grand-piano | 48.2k | **21,558** | 0.4× |
| prop-trident | 6.2k | **14,448** | 2.3× |
| torus-knot | 7.6k | **7,680** | 1.0× |
| melody-token-water (fbx) | 90.4k | **5,015,040** | — |
| fabric-sphere | 4.6k | **4,608** | 1.0× |
| fabric-drape | 3.2k | **3,200** | 1.0× |
| treble-clef | 2.5k | **2,528** | 1.0× |
| fountain | 4.8k | **1,002** | 0.2× |
| stone-pillar | 850 | **124** | 0.1× |
| melody-token | 384 | **192** | 0.5× |
| violin | 1.2k | **8** | 0.007× |
| cello | 1.2k | **8** | 0.007× |

All 19 entries now carry their measured value. Method note: counts are **file totals across every
mesh**, which may include LODs or hidden geometry not all rendered at once — that is why they are
stated as exact integers rather than a "k" figure that implies a render budget.

### Two defects this surfaced, not yet fixed

1. **`violin.obj` and `cello.obj` are 8-triangle stubs** (663 B and 673 B files). They are presented
   as production instruments. They are placeholders and should be replaced or withdrawn.
2. **`SM_MelodyToken_Water.fbx` / `SM_MelodyToken_Star.fbx` are ~5M and ~4.3M triangles.** Loading
   either in a browser is a genuine performance hazard, well outside a sane web budget. Needs
   decimation before it is shown again.

### Also found

`treble-clef` and `violin` exist in the catalog but have **no corresponding button** in
`realtime-3d-viewer.html`, so they cannot be reached through the UI at all.

---

## 5. Reproduce

```bash
# measure every model's true triangle count (~2.5 min)
BLENDER_USER_CONFIG="$LOCALAPPDATA/Temp/bl_cfg" \
  "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" \
  --background --factory-startup --python C:/EnvironmentPortfolio/browser-test/measure_all_models.py

# channel-isolation proof (serve the repo root on :8123 first)
node C:/EnvironmentPortfolio/browser-test/verify_viewer_modes.js
```

## 6. Not claimed

- That the three fixed modes are *artistically* correct — only that each isolates its labelled channel.
- FPS of the viewer (no instrumentation).
- That the two 5M-triangle assets render acceptably — they very likely do not.
