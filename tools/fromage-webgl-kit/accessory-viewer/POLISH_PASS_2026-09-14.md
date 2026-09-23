# Atelier Floral-Study — Graphic Polish Pass — 2026-09-14
Source: https://fromage3900.github.io/my-site/tools/fromage-webgl-kit/accessory-viewer/floral-study.html (113 lines, phi system, 13 swatches)
Status: already editorial-strong; polish is tightening, not reinventing

## What’s singing
- Phi grid (13 columns, fib spacing 14/21/34/55) + Rochegrosse image as texture source — rare, luxury-editorial, not a template
- Palettes (plum/wine/sky/stone etc.) map directly to finishes — flowers become finish is real, not metaphor
- Micro typography (10px/0.12em) + serif display gives quiet luxury, not tech-demo

## Tighten for “premium ecom” read (the job we’re pitching)
1. **Hierarchy — one more whisper of price**
   - Hero “Frame, finish, light.” is gorgeous but competes with nav. Drop `font-weight 400 → 300` at >1200px, add `letter-spacing -0.07em` — lets the eyewear own the stage, not the headline.
   - Add a 1-line sub-dek under ATELIER panel: “Web-optimized GLB · Shopify-ready · PBR ACES” — client skim test: they see “web” in 3 seconds.

2. **Controls — make luxury feel tactile**
   - `.choice[aria-pressed=true]` is plum on white — beautiful but flat. Add `box-shadow: inset 0 0 0 1px rgba(104,64,87,.22), 0 2px 6px rgba(104,64,87,.12)` and `transition: all .18s ease` for a soft press.
   - Dots (obsidian/tea/sea/pearl) — add a thin `border:1px solid rgba(255,255,255,.6)` on dark dots so Tea doesn’t muddy on beige.

3. **Stage — sell the object, not the void**
   - `stage-shell` gradient is gentle but a touch milky. Lift to `linear-gradient(145deg,#ece7e0 0%, #e8e2da 45%, #ede9e8 100%)` + add `::after` vignette `radial-gradient(ellipse at 50% 50%, transparent 62%, rgba(104,64,87,.07) 100%)` — focuses eye on lenses without darkening PBR.
   - Floor shadow opacity 0.12 → 0.09 at hero view, 0.14 at hinge — subtle cue that object is grounded, not floating.

4. **Archive — one stronger “source → finish” bridge**
   - The phi-board artifacts are lovely but the “Fig.01 / rose+skin” labels sit low at 8px. Bump to 9px at desktop, add `background: rgba(245,240,232,.72); backdrop-filter: blur(2px); padding:2px 6px` on hover so they’re readable over busy foliage.
   - Swatch field: `outline` swatches get lost. Give `.swatch.outline { background: rgba(255,255,255,.4) }` so the ring reads even on paper.

5. **Accessibility + mobile — keep luxury inclusive**
   - Contrast: `--muted #766d68 on #f5f0e8` is 4.2:1 — just passes. Keep it, but for `.micro.quiet` on small screens, bump to `#6b605c` (4.6:1).
   - At 620px breakpoint, `.panel` stacks late — add `gap:16px` and make `#heroSelector` `min-height:44px` for thumb.

6. **Proof — make tech whisper, not shout**
   - `#diagnostics` is 9px mono — perfect. Add `max-height:120px; overflow:auto` so long mesh counts don’t push the panel on small GLBs.
   - Add a tiny “Copied” toast when clicking `stageStatus` to copy diagnostics — clients love to paste specs into Slack.

## Quick implement (if you want me to patch)
I can apply 1–3 in one commit to `C:/Users/froma/my-site/tools/fromage-webgl-kit/accessory-viewer/`:
- patch `app.js` is already done (face forward)
- next patch `floral-study.html` <style> with the 6 tweaks above (no layout change, only shadows, vignette, dot borders, swatch readability)

Say “polish it” and I’ll push the HTML tweak alongside the JS fix — both go live on the same Pages deploy.

## Pitch link
This polish is exactly the story for the Upwork proposal: “flowers become finish” + web-optimized GLB + tactile viewer = luxury ecom, not just a render. The live proof is already there; the polish makes the first 5 seconds feel like a boutique, not a lab.
