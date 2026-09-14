# Website Dream Shader Review (2026-07-09)

**Goal:** Make the portfolio site feel **iridescent and dreamy** with one cohesive atmospheric stack.

---

## Unified background architecture

| Z-order | Layer | File | Role |
|---------|-------|------|------|
| 0 | Void gradient | `melodia-editorial.css` | Base shell background |
| 0 | **MelodiaStarfield** | `melodia-starfield.js` + `.css` | **Single canvas sky** — depth parallax, watercolor nebula, thin-film bands, magenta-biased IQ palette |
| 0 | Dream aurora | `melodia-dream-shaders.css` | Soft-light wash (low opacity) |
| 0 | Dream sparkle | same | Micro-texture only (~3% opacity; not a starfield) |
| 1+ | Content / heroes | page HTML | Editorial or cosmic hero variants |
| 5 | Orrery / planetarium | `melodia-orrery-system.js`, `melodia-planetarium.js` | Hero celestial accents (faint orrery + interactive planetarium on index/hub) |
| UI | Holo / nav / cards | `melodia-dream-shaders.js` | Fresnel vars, holo plates, pillar ramps |

**Boot path:** `melodia-editorial.js` → `bootEffects()` reads `data-effects` on `.melodia-shell`.

**Retired as sky layers:** shell `::before` pattern-stars, hero `star-layer` / `texture-layer`, `parallax-layer-2` CSS dot grid.

---

## Page tiers (`data-hero` / `data-effects`)

| Tier | `data-hero` | Typical `data-effects` | Pages |
|------|-------------|----------------------|-------|
| Cosmic showcase | `cosmic` | `starfield,orrery,holo,instruments,magical` | index, recruiter-one-sheet, hero-renders, shader-breakdowns, commissions, sakura-case-study |
| Hub | `editorial` | `starfield,planetarium,holo,magical` | application-hub |
| Proof / doc | `editorial` | `starfield,holo,magical` | resume, capture-brief, world-bible, etc. |

Index adds `planetarium` to effects; wish-mode bow boosts starfield to `cosmic` intensity.

---

## Stack detail

| Layer | File | Effect |
|-------|------|--------|
| **Starfield canvas** | `melodia-starfield.js` | far/mid/near strata, scroll+mouse parallax, cluster bias, streak highlights |
| **Thin-film bands** | same (in starfield module) | Spectral interference + Devin ramp bias |
| **Dream aurora** | `melodia-dream-shaders.css` | Mouse-parallax magenta/cyan/gold wash |
| **Holo plates** | `melodia-dream-shaders.js` | Trading-card sweep; gacha scroll reveal |
| **Pillar OKLCH** | `melodia-dream-shaders.css` | Per-world ramps on tagged cards |
| **Hero fresnel** | dream-shaders + editorial | `--dream-mouse-x/y`, `--dream-fresnel` |
| **Orrery** | `melodia-orrery-system.js` only | Tilt+spin rings, axis gimbal, multi-node markers |
| **Premium parallax** | `premium-cosmic-hero.js` | Mouse depth on `[class*="parallax-layer-"]` (cosmic heroes only) |

**Design tokens:** `melodia-tokens.css` — void depths, Nikki ramp, z-index scale.

---

## Tuning knobs

```css
--dream-fresnel
--dream-mouse-x / --dream-mouse-y
--iri-cyan / --iri-gold / --iri-purple / --iri-magenta
```

```html
<div class="melodia-shell" data-hero="cosmic" data-effects="starfield,orrery,planetarium,holo,instruments,magical">
```

`MelodiaStarfield.init({ intensity: 'standard' | 'cosmic' | 'subtle' })`

---

## Parity with Unreal plan

| Unreal | Website equivalent |
|--------|-------------------|
| Fresnel iridescence ramp | `--dream-iri-ramp`, hero rim, card hover |
| Sparkle Voronoi | Subtle sparkle layer only (not primary stars) |
| MagicalIntensity ≤ 0.5 | Overlay opacity caps; thin-film alpha × 0.5 |
| Thin-film interference | Canvas bands in MelodiaStarfield |
| MF_SpaceParallax | Starfield scroll parallax + cosmic hero layer parallax |
| ML_Jewel refraction | Glass nav + button sheen |

---

## Motif layer (editorial ornaments)

**File:** `melodia-editorial-ornaments.css` + `--motif-accent` in `melodia-tokens.css`

| Tier | Shape | Pseudo / class | Where |
|------|-------|----------------|-------|
| A | `✦` filled | `::after` on `.magazine-kicker`, `.portal-card` | Portals, kickers, named steps in `site-copy.json` |
| A2 | `✧` hollow | `::after` / list rhythm | Even-index path rows, guide-card Open labels |
| B | 8-point clip | `::before` on hub cards, `.spark` | alignment / stack / path rows (`application-hub.css`) |
| C | gold rule | `.gold-rule`, `.passport-rule` | Passport panels, section breaks |
| D | frame PNG | `.hero.has-editorial-frame::after` | One per hero |
| E | quatrefoil SVG | `.node.quatrefoil` | Atelier / fashion bands only |
| F | `01 /` mono | `<span>` step prefix | Guide cards, roadmap rows |

**Pseudo-element contract**

| Slot | Owner |
|------|--------|
| `::before` | Clip-star (tier B) or optional `.meta-label.motif-star-clip` |
| `::after` | Text glyph ✦ / ✧ (tier A) or portal corner |

**Pillar tints:** `data-pillar` / `.accent-*` → `--motif-accent` (sakura pink, cosmic cyan, grotto gold, orrery purple).

**Hydration:** `melodia-editorial.js` → `motifStepPrefix()` alternates ✦/✧ on `path-row` steps from `site-copy.json` and `recruiter_review_path.json`.

**Do not:** hide `::before` on `.alignment-card`; stack glyph + clip on the same corner; use motif CSS as a full-page sky (canvas starfield owns depth).

**Page tier emphasis**

| Tier | Motif emphasis |
|------|----------------|
| Cosmic | Portal ✦, kicker suffix, holo plates above starfield (`z-index: 1` on cards) |
| Hub | Clip-stars on alignment/stack/path; passport ✦ headers; reviewer path rhythm |
| Doc | Magazine-kicker ✦, guide-list ✦/✧ on Open, mono step prefixes |

Wish-mode bow brightens glyph opacity (+0.15); does not restore fullscreen soul-gems.

---

## Mobile / a11y

- Star count reduced ~40% under 680px; watercolor blur disabled on mobile
- `prefers-reduced-motion`: static starfield snapshot, no RAF
- Orrery tilt clamped on mobile
