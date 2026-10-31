# Website typography and editorial voice

Scope: the public environment-art portfolio under `wix/`, including the homepage, project case studies and embedded Wix portfolio components. This is not a directive to redesign the playable game HUDs.

## Type system

- **Primary typeface: Times New Roman.** Use `var(--font-display)` for headings, `var(--font-body)` for paragraphs and navigation, and `var(--font-brand)` for branding. Each resolves to `"Times New Roman", Times, Georgia, serif`.
- **Technical exception:** `var(--font-mono)` is allowed for file paths, keyboard shortcuts, numerical tables, telemetry, and code. It should not be the default for narrative captions.
- **Script exception:** use appropriate CJK font fallbacks for Japanese text.
- **No competing type palettes:** do not reintroduce Space Grotesk, Crimson Text, Jost, Fraunces, or Cinzel as primary portfolio fonts. Avoid custom `font-family` declarations where a token works.
- Use a restrained size hierarchy and readable line lengths: roughly 60–70 characters for body copy, 1.55–1.75 line height for paragraphs, and headline wrapping that avoids isolated words.
- Keep metadata concise and legible. Do not set entire descriptive paragraphs in tiny uppercase monospace.
- Times New Roman is a system font, **not hosted with this project**. On machines that do not have it installed, the CSS fallback is Times then Georgia. Do not distribute proprietary font binaries.

## Writing principles

Speak as an artist and technical artist, not as a release-note generator.

1. Lead with **the work**: what the image shows, the design decision, and how the space feels or functions.
2. Then explain **your contribution**: what you sculpted, built, painted, authored, or programmed. Use first person where appropriate.
3. Show **the process**: actual tools, constraints, iterations, comparisons, and trade-offs.
4. Close with **verifiable evidence**: engine screenshots, Houdini networks, performance figures, gameplay captures, or the live prototype. Label WIP, concept, render, and runtime proof distinctly.
5. Keep game lore and poetic titles when they convey genuine authorship. Avoid generic superlatives such as "next-generation," "groundbreaking," "ultra-premium," "state-of-the-art," "AAA-grade," or "immersive experience."
6. Do not invent evidence or treat pipeline telemetry as the emotional premise of a project. Keep figures only when accurate, dated if necessary, and contextualized.
7. Use accessible alt text describing visible content; don't stuff it with marketing copy. Keep metadata honest, concise, and search-friendly.

## Approved homepage direction

**Headline:** "I build worlds that feel like songs."

**Supporting copy:** "I'm an environment and technical artist working in Unreal Engine. I sculpt the landmarks, build the materials, and make the procedural tools that turn them into places you can explore. Melodia Melusina is the game bringing that work together."

## Faraway Mother voice

The central hook is the hand-sculpted Heart Gate: it reads as landscape-scale sculpture from far away and becomes enterable architecture up close. Explain the 8 km textile-inspired world and the design decisions behind its procedural systems **before** leading with counts of instances, polygons or material instances. The numbers belong in a technical evidence section.

## Editorial checklist for future updates

- [ ] Display, body, brand, and navigation text use Times New Roman tokens
- [ ] No local typography override silently reintroduces a competing font
- [ ] Mobile headings wrap without covering artwork or controls
- [ ] Body text remains legible against both video and still-image backdrops
- [ ] Intro paragraph answers what it is, what I made, and why it matters
- [ ] Portfolio copy distinguishes gameplay capture, render, concept and procedural study
- [ ] No mojibake or broken Unicode characters (`â€”`, `Â·`, etc.)
- [ ] Genuine texture, material and pipeline details preserved; no invented figures
- [ ] Review a real desktop and mobile render before merging to production

This guide complements the existing token linter. It does not replace visual QA or verify live Wix deployment.
