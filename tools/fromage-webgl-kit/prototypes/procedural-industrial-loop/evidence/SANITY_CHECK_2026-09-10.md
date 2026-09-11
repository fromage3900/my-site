# Industrial Loop — Normal-Browser Sanity Check + Submission Attachments

**Date:** 2026-09-10 · **Status:** SANITY CHECK PASSED / ATTACHMENTS PRODUCED
**Build under test:** `my-site/main`, deployed `https://fromage3900.github.io/my-site/tools/fromage-webgl-kit/prototypes/procedural-industrial-loop/`
**Method:** puppeteer-core driving non-headless Chrome 128 at 1920×1080 (attachments) and 1280×800 (sanity check). Not headless SwiftShader — a real GPU-backed browser session.

This closes the gate EVIDENCE.md described as *"one normal-browser sanity check before send"*. The
build under test is **current `main`**, not the preserved Cursor build.

---

## 1. Sanity check — observed results

| Check | Result | Observed |
|---|---|---|
| Page loads, WebGL canvas initialises | **PASS** | Full UI renders; no blank canvas |
| No blocking console errors | **PASS** | Zero `console.error`, zero `pageerror`. One un-resolved 404, almost certainly `favicon.ico` — the failing URL was **not** captured, so this is inference, not proof |
| Three.js shader warnings | benign | 4× `X4122 … double precision` GLSL precision warnings |
| Three.js deprecation | benign | `PCFSoftShadowMap has been removed. Using PCFShadowMap instead.` |
| `loopDelta` at rest | **0** | `getState().loopDelta === 0` |
| `loopDelta` at capture URL | **0** | `?capture=1&seed=1&mode=base&t=4` → `loopDelta: 0` |
| Canonical seed | **PASS** | `canonicalSeed: 1`; dropdown reads `Seed 01 — Canonical` |
| Capture mode is chrome-free | **PASS** | `<html class="capture">`; intro/panel/note/badge hidden via CSS |
| BASE mode is greyscale | **PASS** | Independently verified by image inspection — no chromatic pixels |
| Loop boundary t=0 vs t=16 | **PASS** | Geometry identical in both frames. `loopDelta: 0` at both. **Frames are not byte-identical** — the only difference is the on-screen timeline readout (`0.0s` vs `16.0s`) and slider position |

### Current measured values — use these, not the receipt's

```text
mode base · seed 1 · time 0 / 4 / 16
loopDelta 0 · draws 110 · tris 74,030 · geometries 54
```

**These differ substantially from the preserved receipt** (81 draws / 16,948 triangles).
`EVIDENCE.md` predicted exactly this and forbade assuming equality:

> *"These numbers describe Cursor's captured final build. … Run one normal-browser sanity check
> before treating the `my-site/main` runtime numbers as identical to the preserved receipt."*

**Do not quote 81 draws / 16,948 triangles as current.** They belong to a build this repo is not
shipping. The measured values above are the ones to use.

---

## 2. Submission attachments — the five files, produced

| File | Bytes | SHA-256 (first 12) |
|---|---|---|
| `industrial_loop_base_16s.mp4` | 452,179 | `3e7ec1d2d197` |
| `industrial_base_hero.png` | 190,022 | `05fdab3df834` |
| `industrial_structural.png` | 196,736 | `9900c436ccd9` |
| `industrial_flow.png` | 199,523 | `d0042d340856` |
| `industrial_thermal.png` | 197,987 | `e5d425d5ab93` |

All four stills have distinct hashes. Capture conditions are recorded verbatim in
`attachment_capture_log.json` (mode, seed, time, and the full `getState()` for each).

**Video:** 1920×1080, H.264 High, **duration exactly 00:00:16.00**, 64.38 fps source, encoded from
1,030 real-time CDP screencast frames captured at 59.9 fps. The loop was driven by
`window.__industrialLoop.setTime/play`, not by wall-clock animation, so the capture is deterministic.

To the best of our knowledge these binaries **did not previously exist anywhere** — the earlier
submission package named all five but no copy was found in `my-site`, and none were in Melodia PR #176.

---

## 3. FINDING — the "field" modes are not fields

While verifying the stills, the STRUCTURAL / FLOW / THERMAL renders were inspected independently.

**What the copy implies:** `index.html` footer says *"information-only Structural / Flow / Thermal
visualization"*; EVIDENCE.md says *"color is reserved for information-bearing visualization modes"*
and refers to *"Structural / Flow / Thermal fields"*.

**What the source does** (`app.js:141`, `256–258`):

```js
function field(structural, flow, thermal) { return { structural, flow, thermal }; }

structural: [0x31547c, 0x6485a7, 0xc8cfd5, 0xc48758, 0x7d3d34],
flow:       [0x24465e, 0x3b7f9e, 0x82b6bd, 0xd6cf9b, 0xb96649],
thermal:    [0x2e4b72, 0x6e72a2, 0xb4a4a4, 0xcf845e, 0x853c31],
```

Each mode is a **five-colour palette applied per component**. Every part is one flat colour per mode.
Independent image inspection of all three stills found **no gradient, no spatial data field, no
thermal or flow overlay** — only component recolouring. The three renders are genuinely distinct
(different hashes, different palette assignments), but they are *material variants*, not
*information fields*.

**Why this matters:** the modes are presented as the loop's sophistication. A technical buyer who
opens FLOW expecting flow paths, or THERMAL expecting a heat gradient, sees recoloured parts. That is
a credibility risk on a $10,000 fixed-price listing.

**Recommendation before send** — either:
1. **Relabel.** Call them "illustrative mode-based component coding", remove the word *field*, and
   keep the existing honest hedge (*"not FEA/CFD/thermal simulation"*). Cheap, truthful, no code risk.
2. **Downgrade the attachments.** Send BASE + one coded mode rather than implying three analyses.
3. **Implement real fields.** Out of scope before 09:00.

Option 1 is the honest minimum. **Nothing in this repo has been changed to soften the finding** — this
file records it plainly so the claim decision is the owner's.

---

## 4. Reproduce

```bash
# stills + video (writes to browser-test/attachments, ~40 s)
node C:/EnvironmentPortfolio/browser-test/capture_attachments.js

# encode (note: the playwright ffmpeg is stripped — image2pipe only, no libx264)
"C:/Users/froma/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_*.…/bin/ffmpeg.exe" \
  -y -framerate 64.375 -i "_frames/f%05d.jpg" -c:v libx264 -pix_fmt yuv420p \
  -crf 21 -movflags +faststart industrial_loop_base_16s.mp4
```

---

## 5. Explicitly NOT claimed

- FPS as a buyer-facing performance figure (never promoted; not measured here).
- Draco / meshopt / KTX2 compression.
- Client CAD import, ProRes delivery, AV1/VP9 size targets.
- That the runtime numbers match the preserved receipt — they demonstrably do not.
- That the 404 is `favicon.ico` — inferred, not proven.
