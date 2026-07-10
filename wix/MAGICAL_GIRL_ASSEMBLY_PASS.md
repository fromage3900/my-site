# Magical Girl Assembly Pass — Plan

Clean, intentional magical-girl chrome across Melodia — not more overlays.

## Current state (audit)

| Layer | Status | Notes |
|-------|--------|-------|
| `melodia-magical-girl.css` | Live | Pink/rose/gold/cyan tokens; ambient on `fashion-mode` / cosmic |
| `melodia-magical-girl.js` | Live | Mounts `.mg-layer`, bow wish-toggle; ambient auto-on for fashion/cosmic |
| `data-effects*=magical` | Most pages | Booted via `melodia-editorial.js` + script include |
| Type SSOT | Live | Syne / Instrument Serif / Bricolage / Azeret — **Figma page 02 synced 2026-07-10** |
| Shop CTAs | Wired | Home `#shop`, one-sheet, hub, commissions, kitbash |

**Problem:** MG is ambient + optional wish-mode, but not *assembled* — accents fight starfield/orrery/holo, type in Figma ≠ live CSS, and product pages inherit fashion chrome that should stay quieter.

## Figma integration (what exists)

| Piece | Location | Role |
|-------|----------|------|
| Grandmaster file | [Yx8ud7n39NdWZvnNvo4Xlf](https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf/Untitled) | Tokens → Game UI (pages 00–12) |
| Doc | `BS_GodFile/FIGMA_GRANDMASTER.md` | Page map + sync commands |
| Live link | `wix/melodia-melusina.html`, `design-specs.html#game-ui` | Opens Figma + UX docs |
| Sync | `pipeline/figma/`, `Tools/sync_figma_design_doc.ps1` | Tokens + upload manifest |
| Code Connect | `pipeline/figma/code_connect_map.json` | Figma ↔ Wix CSS/HTML |
| Gaps | `FIGMA_LAYOUT_GAPS.md` | Known layout debt |

**Figma MG (2026-07-10):** page **13 Magical Girl Chrome** board built (tiers + accents + motion budget). Page **09** website frames still wait on store screenshots.

## Assembly goals

1. **One composition per viewport** — MG accents support brand/type/hero; never compete with orrery or product CTAs.
2. **Tiered intensity** — cosmic home = ambient MG; recruiter one-sheet = soft; kitbash/shop = minimal (no wish overlay by default).
3. **Type lock** — live CSS is SSOT; Figma page 02 updated to match in the same pass.
4. **Motion budget** — 2–3 intentional motions site-wide (bow pulse, ribbon shimmer, crystal tick) — kill stacked glow/halftone noise.
5. **Shop-safe** — product pages keep luxury type + clear buy path; MG stays in nav accent only.

## Pass phases

### Phase A — Inventory & kill list (½ day)

- List every page with `data-effects` including `magical` vs missing script.
- Screenshot home, one-sheet, hub, kitbash, Melusina at 1440 / 390.
- Kill list: duplicate pink borders, heavy halftone on paper bands, wish-stage visible without toggle, glow stacks on CTAs.

### Phase B — Token & tier contract (½ day)

Define in CSS + short comment in `melodia-magical-girl.css`:

| Tier | Attribute | Ambient | Bow toggle | Use on |
|------|-----------|---------|------------|--------|
| `mg-full` | cosmic + magical | on | yes | index |
| `mg-soft` | editorial + magical | subtle | yes | hub, one-sheet, case studies |
| `mg-chrome` | magical only | nav/kicker only | no default | resume, technical pages |
| `mg-off` | omit magical | none | none | ornament-kitbash, pure embeds |

Wire tiers via `data-mg="full|soft|chrome|off"` (or map from existing `data-hero`) so assembly is declarative.

### Phase C — Chrome assembly (1 day)

- Nav: single rose hairline + brand mark sparkle — no second border systems.
- Kickers / eyebrows: optional ribbon underline (one motif).
- Cards: MG only on interactive hover (path-row, portal) — not every premium-card.
- Wish-mode: full contract ring + shards **only** when bow pressed; respect `prefers-reduced-motion`.
- Align accent hexes with `melodia-tokens.css` / luxury type — no orphan pinks.

### Phase D — Figma sync (½–1 day)

1. Update page **02 Typography** → Syne, Instrument Serif, Bricolage, Azeret.
2. Add page **13 Magical Girl Chrome** (or section under 03 Atoms): bow, ribbon, shard, ambient vs wish.
3. Re-capture page **09** frames for index + shop band + one-sheet nav.
4. Run `.\Tools\sync_figma_design_doc.ps1` (token bridge); Code Connect map for MG classes if components exist.
5. Keep Melusina (page 12) as game UI — do not bleed MG ambient into battle chrome.

### Phase E — QA & ship

- [ ] Home: brand-first, shop CTA clear, MG ambient not muddy
- [ ] One-sheet / hub: Shop in nav, soft MG
- [ ] Kitbash: buy path first, `mg-off` or chrome-only
- [ ] Melusina: Figma link + game UI intact
- [ ] Fonts live: Syne / Instrument / Bricolage / Azeret (no Fraunces/Plex/Inter)
- [ ] Reduced-motion: no wish animation spam
- [ ] Push `main` + `gh-pages`

## Out of scope this pass

- New UE captures / ornament FBX
- Rewriting Melusina game UI
- Purple-glow / pill-cluster redesigns (explicitly avoid)

## Success criteria

A stranger lands on the home page and feels **one** enchanted editorial world — magical-girl accents readable as craft, shop path obvious, Figma grandmaster matches live type and MG tiers.
