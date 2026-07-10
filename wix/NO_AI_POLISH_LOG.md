# No-AI polish log

Cadence: weekly — screenshot home / one-sheet / kitbash at 1440 + 390 → pick 5 kills → ship → note next 5.

Forward roadmap: `Docs/MELODIA_SITE_FORWARD_ROADMAP.md`

## Pass 1 — 2026-07-10 (shipped `39148d0`)

Done:
1. Kill Inter hardcodes in embed widgets → `var(--font-body)`
2. Cap planetarium / premium / escher glow stacks → hairlines
3. Tighten shop / kitbash / commissions copy
4. Magical-girl `data-mg` tiers (full/soft/chrome/off)
5. Hover-only ribbon accents; wish-stage only on bow

## Pass 2 — 2026-07-10 (shipped `2e37a5c`)

Done:
1. Hub hero — passport moved below fold; compact Target + Pipeline only
2. Soft tier — hide cosmic parallax layers 3–4 via CSS
3. Pretty-print design-specs + dossier HTML; Shop on design-specs nav
4. Cap editorial orrery / brand-mark / cosmic-instruments drop-shadows
5. Live QA — fonts + MG tiers OK

## Pass 3 + 4 — 2026-07-10 (this ship)

Done:
1. Hub fully pretty-printed; shortened nav (Shop / Resume / Worlds / Review / Intake)
2. Soft pages — removed parallax layer 3/4 DOM (commissions, sakura, hero-renders, one-sheet, shaders)
3. Residual glow kill (hub spark, fashion diamond/orrery, passport/hero embeds)
4. `#studio` trimmed to two cards; cut Wonder-forward filler
5. Pass 4: planetarium behind `<details>`; atelier/passports/review CTA trim; appendix holds extras

Monetization: still blocked on in-editor FBX (15 uassets present, 0 FBX). See `EXPORT_STATUS.md`.

## Pass 5 — next kill list

1. Chrome pages: drop redundant `magical` from `data-effects` where `data-mg=chrome`
2. Cap pink glow in `enhanced-cosmic-hero-premium.css` for soft/chrome
3. Document motion budget in this log after Pass 5
4. Kitbash Buy flips when Gumroad ZIP live
5. Figma page 09 pixel re-capture when store screenshots exist

## How to run a pass

1. Open live site + local `wix/` side by side
2. Note AI tells (generic copy, glow, Inter, purple, pill clusters)
3. Fix ≤5 items in one commit
4. Push `main` + `gh-pages`
5. Append results here
