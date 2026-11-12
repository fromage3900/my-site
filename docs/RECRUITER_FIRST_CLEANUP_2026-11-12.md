# Recruiter-first portfolio cleanup — November 12, 2026

Branch: `portfolio/recruiter-first-cleanup-20261112` (base: Melodia Resonant Wilds v15 main). GitHub Pages and live Wix remain untouched until review/merge.

## Implemented
- Replaced root Three.js loading ritual with immediate accessible portfolio entry. Original source retained in Git history.
- Redesigned the homepage hero around an approved Faraway Mother environment image and two direct portfolio calls to action; removed the five-theme switcher, character-macro video, extra cutscene, and animated decorative JS dependencies.
- Four primary homepage destinations: Selected Work, Environment Art, Technical Art, About & Contact; one featured Faraway case study.
- Shared navigation mirrors those destinations; Living Worlds is the one optional browser study under More.
- Replaced the outdated four-world World Bible with current House → KaleidoNave → Poitou → Sea Above → Faraway Mother campaign. Older studies remain linked explicitly as historical supporting work.
- Promoted reviewed Faraway images in Selected Art, recruiter one-sheet and social metadata. Updated Faraway dossier with canonical/social metadata and a focused static navigation.
- Removed decorative script imports from selected art, render archive, résumé and recruiter one-sheet. `melodia-editorial.js` now honours `data-effects="none"` on quiet pages.
- Marked old demos and deep technical hubs noindex, removed them from the sitemap, preserved their direct links/source, and kept strong technical breakdown pages public.
- No intentional deletion of asset files, game code, the Wix shell, or Resonant Wilds content.

## Proof boundaries
Existing Unreal environment images remain the visual source of truth. Browser approximations and older studies are not presented as current packaged-game evidence. House, Poitou, and Sea Above still need individually reviewed gameplay-world images before being promoted as such.

## Acceptance checks (pending)
- [ ] Portfolio local-asset link validator, JS syntax and showcase-polish gates pass.
- [ ] Desktop 1440px, iPhone 390px and tablet screenshot inspection.
- [ ] Mobile Wix shell and direct GitHub Pages entry verified with no letterboxing.
- [ ] Hero legibility/crop, four navigation cards, contact links, metadata and keyboard focus verified.
- [ ] Reduced-motion and Living Worlds WebGL-fallback test verified.
- [ ] Review commit, then merge only after owner approval and QA; live deploy remains separate.
