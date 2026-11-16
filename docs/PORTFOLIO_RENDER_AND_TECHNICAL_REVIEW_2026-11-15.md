# Portfolio render and technical-evidence review — November 15, 2026

**Purpose:** restore the already-authored celestial cursor and curate genuinely supported image/process proof. This is *not* a redesign and not a mass deletion. The public strict release is separately compiled by `tools/build_recruiter_release.py` and must be tested independently of the editable Wix source.

## Restore
- Original source: `wix/constellation-brush.html`, a genuine Three.js gesture-reading star brush with comets, crystalline junctions, orbit recognition, audio opt-in and its own dedicated full-screen experience.
- New optional `?overlay=1` uses that same engine transparently with same-origin pointer relays; it omits the solid shader background, idling star seed and audio initiation. Site pages receive `wix/celestial-brush-sitewide.js` lazily on desktop fine-pointer movement, without hijacking clicks.
- Main shared-nav pages, recovered standalone moodboard and Photo Studio, and the **actual generated public pages** now wire the new bridge. Touch devices retain the fully interactive standalone brush; the sitewide cursor is suppressed for touch and reduced-motion users and while separate WebGL workbenches are active.
- The preserved `wix/melodia-starfield.js` and `wix/pigment-memory.js` are separate effects; do not silently replace them with this brush. The code should not generate fake artwork or interfere with recruiter link hit-testing.

## Artwork candidates — verified source and decisions

| Candidate | Actual source inspected | Strength / limitation | Decision |
|---|---|---|---|
| River Sanctuary — Graphic Cel / Sakura Dawn | `wix/assets/touchdesigner/variant_4_atlus_graphic_cel.webp`, `variant_2_sakura_dawn.webp` | Actual authored Blender/TouchDesigner screenshot variants of one scene. Strong comparative style evidence, not AAA final environment or Unreal shipped gameplay. | **Keep** as paired shader lookdev examples; existing front-facing public images. |
| Houdini COP — Faraway Mother procedural texture foundry | `generated/assets/unreal/contact-sheets/Faraway_COP_Foundry_Breakdown.webp` | Actual 1920-wide six-panel contact sheet: fields, packed masks, vectors, fabric normals, ORM, stylized band ramp. Text is tiny and first displacement preview appears blank/light; sheet claims UE integration but is not independent runtime proof. | **Promote to Technical Art process section only**, with full-size link and explicit status; never to hero image. |
| Melusina ground contact / skirt and boots | `MelodiaMelusinaV2/Docs/Evidence/MelusinaLegSkirt_20261023/Sheets/Melusina_TechnicalBreakdown.md` | Substantial measurement-based Oct 23–24 report: knee targets, compression control, weight round-trips, simulated layer ownership. Staged idle evidence passed, gait/performance/production acceptance remain open. | **Promote as a technical writing/case-study link**, status preserved, not as beauty shot. Some local `C:/` image references in original markdown are not portable web links. |
| Melusina V2 cloth capture | `generated/assets/character/hero_sim/melusina_fv2_cloth_beauty.png` | Real source image inspected; clearly a simulation/FX staging frame with clutter, particle/cloth overlap and incomplete hero presentation. | **Withhold** from opening gallery; possible later process plate if specifically contextualized. |
| Original Melusina EEVEE beauties | `generated/optimized/curated-art/melusina_beauty_eevee_20260715c_01-1280.webp` and macro postcards in recovered moodboard | Worth preserving, but old July 2026 capture. It cannot be labelled the latest November Melusina V2 without a new source render. | **Retain historical moodboard**. Do not promote to freshly updated hero until verified. |
| Sakura Dream and Faraway Mother hero exports | Previous visual audit `docs/SELECTED_WORK_IMAGE_AUDIT_2026-11-13.md`; stale render manifest `content/stale-render-archive-20261115.json` | The prior audit flags unfinished geometry, lighting and editor artefacts. User explicitly rejected Sakura Dream as home hero. | **Do not restore archived or rejected hero files**. Keep existing editorial cover. |
| New game GitHub content (November) | `MelodiaMelusinaV2` Git tree and docs, including November 15 `LES_EMMAILLOTES_UE58_SOURCE_TO_IMPORT_AUDIT` | Strong project-side planning/evidence documents. Most matching screenshot paths surfaced as placeholder/zero-byte entries via connector and could not be visually authenticated in this review. | **No new image promotion**; request a real current capture and portable proof before publishing. |

## Authorship and curation standards
- Prefer a genuine render / real output and honest tool attribution. Never fabricate scene captures, swap to image search results, or pass off a design sheet as an in-engine verification screenshot.
- The existing home/gallery composition stays Night Velvet; improve captions, evidence hierarchy and source images, not the entire layout.
- Preserve the photo-card studio, 13-column Fibonacci moodboard, source archives and Three.js eyewear experiment. A curation change must never silently remove their routes.
- Do not make claims such as *shipped*, *production-ready* or *AAA-verified* based on an annotated contact sheet; the source evidence explicitly separates tests from acceptance.
- To promote a fresh hero, capture an approved 1920+ Unreal/Blender beauty shot with clean composition, materials and lighting; include DCC/engine, shot date, and a source/author verification path.

## Verification / publication boundary
- New regression: `python tools/verify_sitewide_celestial_and_technical.py` checks the original Three.js gesture logic and that every strict generated page references the brush, with no broken release assets.
- PR branch requires code, link, asset and screenshot QA before merge. WebGL cursor gesture on Safari/iOS and third-party script loading require physical-device proof; no auto-merge.

## Follow-on paired case studies — render + method, November 15

**Review branch:** `portfolio/render-process-pairings-20261115`. The strict public release is built from `tools/build_recruiter_release.py`; the source Wix moodboard, photo studio, constellation brush, Night Velvet palette, public allowlist and existing render bytes are not altered in this pass.

1. **River Sanctuary:** the existing verified Graphic Cel and Sakura Dawn captures appear side-by-side on Technical Art, with full-size original links. Short adjacent method notes distinguish *held scene/camera* from *changed graphic treatment*. The Selected Work page links directly to this comparison. We claim no reconstructed shader node graph or benchmark.
2. **Faraway Mother:** keep the authentic COP six-panel contact sheet full-width and clickable, followed by short explanations of relief, directional flow and surface response. **Do not pair it with the older unfinished Heart Gate or Sakura Dream screenshots** and do not claim the contact sheet demonstrates a verified Unreal material cook. A source render with matched camera, date and tool provenance is still required for a genuine render↔process pairing.
3. **Melusina:** excerpt actual October 23–24 rigging receipts: 18.841 / 21.509 cm initial foot-target lifts, 843 of 5,540 boot vertices adjusted, 12 of 12 KineFX round-trip gates passed. Keep the original engineering document as a link, but do not embed its nonportable `C:/` references or conflate the earlier July EEVEE beauty with the later rigging candidate. Moving gait and production wardrobe performance remain open.

### Promotion boundary and verification

- This is a **presentation upgrade of genuine assets**, not a new Blender, Houdini, TouchDesigner or UE render. No image is generated or silently replaced.
- Existing `tools/verify_sitewide_celestial_and_technical.py` now checks the generated side-by-side River evidence, Selected Work deep link, real image paths, COP status disclaimer and measurable Melusina receipts.
- Review the generated `_recruiter_release/wix/technical-art.html` at desktop and mobile widths, plus `curated-art.html` and the Night Velvet homepage, before any publish or merge. Physical iPhone Safari brush behaviour is still a separate device test.
