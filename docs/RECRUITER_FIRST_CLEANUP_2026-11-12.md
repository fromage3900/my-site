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

## Rendered screenshot review correction
Initial Chrome screenshots showed that `faraway_plate_08_capstone_master_showcase_1920.webp` is a multi-panel infographic, not a clean beauty. It was removed from every hero/social slot (but retained in the Faraway dossier where that board is relevant). The art-first entrance now uses the individually reviewed Sakura Dream ink-shrine beauty as an **earlier** environment study, while the Faraway feature and World Bible use the actual Faraway Heart Gate environment render. A direct CSS image background avoids the old parallax layers occluding the visual. The homepage claims no fresh playable Faraway capture from the older beauty image.

## Screenshot QA round two
The branch-only GitHub Actions screenshot job completed successfully and the updated desktop and 390px mobile captures confirmed real imagery now appears across Home, Selected Art, World Bible, and the recruiter one-sheet. Final adjustments shorten the mobile homepage brand to avoid clipping, restore ivory heading contrast on Selected Art, and improve the recruiter resume-link contrast. These checks are *local Chrome renders*, not a verification of the external Wix wrapper or all browsers.

## Concurrent main change reconciled
Main acquired a new standalone pearl-editorial résumé on November 12, 2026 (`b5250d0dfd70`). The merge commit incorporates that exact current résumé instead of overwriting its latest work. Its public link and search indexing remain intact, but it is moved out of the old shared-build `canonical` contract because the self-contained design correctly does not load those legacy scripts. All other main files remain in the branch merge. Review and re-run branch validators following this resolution.

## November 12 evening — Bryce meeting editorial convergence
- A new scoped `wix/melodia-lilac-editorial.css` translates the artist's earlier gouache/digital palette to a pearl/lilac/rose/clear-blue editorial UI. Dark navy is no longer the homepage ground.
- The first fold is reduced to one statement, 30 words of supporting copy, two CTAs, a technical proofline, and an actual Unreal environment image. No WebGL preloader.
- Selected Art inherits the bright editorial treatment and the River Sanctuary panoramic feature from the unmerged studio-curation PR #93, while the Times New Roman hierarchy and restrained captions converge the intent of typography PR #92.
- The genuine source artwork in the user's archive includes IMG_5721 (ocean gouache), IMG_3981 (cats gouache), IMG_5476 (blue-haired portrait), and IMG_5370 (Haru Urara). Their palettes informed the styling; no private Library images were falsely published as GitHub assets.
- The older Works on Paper draft stays unpublished until the original nine image assets can be verified/ingested. Do not substitute AI-generated copies.
- PR #92 and PR #93 stay open as reference until final render/CI review and supersession decision. Preserve their non-overlapping work.
