# Website Dream Shader Review (2026-07-09)

**Goal:** Make the portfolio site itself feel **iridescent and dreamy** — mirroring the Unreal Nikki material stack in CSS + light JS.

---

## Stack (web "shaders")

| Layer | File | Effect |
|-------|------|--------|
| **Dream aurora** | `melodia-dream-shaders.css` | Full-page soft-light wash; cyan → gold → purple; mouse-parallax |
| **Thin-film bands** | `melodia-dream-shaders.js` | Canvas interference stripes (2nd cos theta) biased to Devin cyan-gold-purple ramp |
| **Holo plates** | `melodia-dream-shaders.css` | Trading-card sweep on render cards; gacha scroll reveal |
| **Pillar OKLCH** | same | Per-world iridescence ramps on tagged cards and shell |
| **Sparkle field** | same | Voronoi-like twinkle dots (CSS radial gradients) |
| **Hero fresnel** | same + JS | Rim glow follows cursor via `--dream-mouse-x/y`, `--dream-fresnel` |
| **Dream bloom type** | same | `h1` em/strong = animated iridescent gradient text |
| **Glass nav** | same | Iridescent border-image + pearl backdrop |
| **Card ridge sheen** | same | Hover iridescent border (impasto ridge metaphor) |
| **Band nebula** | same | Astral/night/deep sections pulse aurora |
| **Jewel buttons** | same | Primary CTA = Nikki ramp cycle |
| **Cosmic hero boost** | same | Stronger parallax nebula on `index.html` |

**JS:** `melodia-dream-shaders.js` — mounts aurora/sparkle layers, drives fresnel vars.

**Nikki color map:**

```
cyan   #66d9ff  (0, 0.8, 1)
gold   #ffe666  (1, 0.9, 0.3)
purple #cc99ff  (0.8, 0.4, 1)
```

---

## Before → after (review pass)

| Area | Before | After |
|------|--------|-------|
| Global mood | Ivory editorial, gold accents | + ambient aurora + sparkle on all `melodia-shell` pages |
| Heroes | Dark gradient + stars | + fresnel rim, iridescent media tint, bloom typography |
| Cards | Static gold border | + animated iridescent edge on hover |
| Nav | Frosted cream bar | + pearl glass + tri-tone border |
| Buttons | Gold gradient | + full Nikki ramp cycle + colored glow |
| Dark bands | Flat astral | + nebula pulse overlays |
| Mobile | Motion stripped broadly | Aurora/sparkle reduced opacity; fresnel still works |
| a11y | — | `prefers-reduced-motion` disables animations, keeps static sheen |

---

## Pages covered

All pages using `melodia-editorial.css` or `portfolio-luxury-bridge.css` (imports dream shaders).

**Tier A/B cosmic:** `index`, `application-hub`, `shader-breakdowns`, `hero-renders`, `sakura-case-study`  
**Tier C/D:** All `melodia-shell fashion-mode` portfolio routes

**Not covered:** `render-constellation.html` (inline legacy CSS — candidate for next pass)

---

## Parity with Unreal plan

| Unreal | Website equivalent |
|--------|-------------------|
| Fresnel iridescence ramp | `--dream-iri-ramp`, hero `::before`, card hover border |
| Sparkle Voronoi | `.dream-sparkle-layer` twinkle |
| MagicalIntensity ≤ 0.5 | Opacity caps 0.14–0.42 on overlays; thin-film band alpha × 0.5 |
| Thin-film interference | Canvas `drawThinFilmBands` — spectral sample + Devin ramp bias |
| Dream Bloom | `h1` text-shadow + gradient `em` |
| MF_SpaceParallax | Parallax layers on index + aurora mouse drift |
| ML_Jewel refraction | Glass nav + button inset highlight |

---

## Tuning knobs (CSS vars)

```css
--dream-fresnel     /* 0–1, hero rim strength */
--dream-mouse-x/y   /* 0–1, aurora focal point */
--iri-cyan/gold/purple  /* ramp anchors */
```

---

## Next captures (optional)

1. Screen recording of hub hero with cursor fresnel for `shader-breakdowns` "web shader" slot
2. Migrate `render-constellation.html` to melodia shell + dream stack
3. `data-dream-intensity="low|high"` on `<html>` for A/B
