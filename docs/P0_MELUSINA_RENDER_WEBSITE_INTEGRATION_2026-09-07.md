# P0 Melusina Render → Website Integration — 2026-09-07

**Status:** ACTIVE downstream website contract  
**Source plan:** `fromage3900/MelodiaMelusinaV2/Docs/Production/P0_MELUSINA_RENDER_AND_WEBSITE_BREAKDOWN_PLAN_2026-09-07.md`  
**Branch rule:** work directly on `main`; do not create a render-hotfix branch.

---

## Current public state

- `melusina_cam_beauty_nikki_2026-08-13.png` is **rejected for public hero use** because the hair cache sits below the scalp and the frame reads bald.
- Recruiter-facing surfaces temporarily use `melusina_beauty_eevee_20260715c_01.png`.
- `content/render-passports.json` and `content/site-plates.json` must keep the rejected frame as history/diagnostic only.
- The EEVEE fallback is not the pending Unreal B2 proof.

---

## P0 incoming asset set

Preferred approved filenames:

- `generated/assets/character/melusina_ue58_b2_beauty_34_20260907_01.png`
- `generated/assets/character/melusina_ue58_b2_portrait_20260907_01.png`
- `generated/assets/character/melusina_ue58_b2_material_macro_20260907_01.png`
- `generated/assets/character/melusina_ue58_b2_context_20260907_01.png`
- `generated/assets/character/melusina_ue58_b2_back_20260907_01.png`
- `generated/assets/character/melusina_ue58_b2_wireframe_20260907_01.png`

Do not promote a file merely because its filename matches this pattern. Pixel review authorizes the public role.

---

## Promotion order

### 1. Pixel review first

Reject if any of these are visible:
- bald/hairline failure;
- broken hair silhouette;
- clothing/body clipping;
- bad hands;
- accidental hat/hand/hem crop;
- blown jewelry or white cloth;
- translucent sorting artifacts;
- temporal edge crawl;
- debug actors/UI.

### 2. Render passport

Create a new accepted entry in `content/render-passports.json` for the reviewed Unreal hero.

Required truth:
- engine = Unreal Engine 5.8;
- public role = accepted character hero;
- exact hair solution named correctly;
- exact material claims only where verified;
- no claim that a studio/cine solution is the gameplay solution unless proven.

Keep the 2026-08-13 entry rejected.

### 3. Named plates

Promote the accepted UE hero into the appropriate Melusina recruiter slots in `content/site-plates.json`.

Do not repoint rejected-history slots unless their semantics change explicitly.

### 4. Public HTML

Audit and update:
- `wix/index.html`
- `wix/curated-art.html`
- `wix/hiring-dossier.html`
- `wix/recruiter-one-sheet.html`
- `wix/resume.html`
- any recruiter/technical page whose OG image still uses the temporary EEVEE fallback

### 5. Responsive picture sources

For every changed `<picture>`:
- update `<img src>`;
- update every `<source srcset>`;
- verify optimized WebPs actually exist before referencing them.

This is P0. The prior bald image survived an `<img>` swap because browsers preferred stale WebP sources.

### 6. OG / social

Produce and verify:
- 1200×630 OG crop;
- square crop where used;
- mobile portrait crop if the page design needs one.

The face, hair and hat must survive all crops.

---

## Recommended Melusina project-page order

1. Unreal B2 hero.
2. One-sentence role / contribution statement.
3. Portrait.
4. Material macro + restrained material legend.
5. Beauty ↔ wireframe comparison.
6. Back / silhouette.
7. In-world Unreal context.
8. Verified pipeline strip.
9. Optional short motion loop only if hair/cloth are stable.

Do not make the page an asset browser.

---

## P0 environment queue after Melusina

Once the Unreal B2 character hero is accepted:

1. `L_SakuraDream` canonical world beauty.
2. `L_KaleidoNave` canonical world beauty.
3. `L_FallenMoon` canonical world beauty.

Until then, keep public captions honest: supporting study / material study / terrain study where that is all the pixels prove.

---

## Website acceptance gate

The P0 web integration is complete when:

- [ ] Unreal B2 hero is marked accepted in render-passports
- [ ] rejected bald frame stays rejected
- [ ] temporary EEVEE fallback no longer appears on recruiter-facing hero/OG paths
- [ ] all `src` / `srcset` families agree
- [ ] Selected Art opens on the new hero
- [ ] Hiring Dossier uses the new hero
- [ ] Recruiter One-Sheet preview uses the new hero
- [ ] desktop 1440 review passes
- [ ] mobile 390 review passes
- [ ] 1200×630 OG preview passes
- [ ] GitHub Pages deploy is green

---

## Source-of-truth note

The **art/capture plan** belongs to the game repository:

`MelodiaMelusinaV2/Docs/Production/P0_MELUSINA_RENDER_AND_WEBSITE_BREAKDOWN_PLAN_2026-09-07.md`

This file only owns **website promotion and QA**. Do not fork the capture art direction here.
