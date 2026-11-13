# Melodia Figma ornament source map — 12 November 2026

## Source authority
Source design file: [Melodia UI Master / Storybook Kit](https://www.figma.com/design/ewS0yt17hiWq2KXPa5RfCX?node-id=177-30), accessible in the Humber Figma account. All exports below were made from their **actual native Figma components** as SVG and checked into Git; do not point the live site to expiring Figma asset URLs.

| Original component | Source node | Committed file | Live-page placement |
|---|---|---|---|
| MDL Divider, Ribbon/Light | [178:91](https://www.figma.com/design/ewS0yt17hiWq2KXPa5RfCX?node-id=178-91) | `wix/assets/figma/mdl-ribbon-light.svg` | Overlaid across the lower edge of the hero plate |
| MDL Medallion, Heart/Night | [178:37](https://www.figma.com/design/ewS0yt17hiWq2KXPa5RfCX?node-id=178-37) | `wix/assets/figma/mdl-heart-medallion-night.svg` | Upper-right flourish on featured Faraway Mother block |
| MDL Sparkle, Cluster | [178:162](https://www.figma.com/design/ewS0yt17hiWq2KXPa5RfCX?node-id=178-162) | `wix/assets/figma/mdl-sparkle-cluster.svg` | Upper-right interior of featured Unreal plate |
| MDL Divider, Crest/Night | [178:111](https://www.figma.com/design/ewS0yt17hiWq2KXPa5RfCX?node-id=178-111) | `wix/assets/figma/mdl-crest-divider-night.svg` | Transition between the hero and portfolio chapters |

## Other verified candidates, not imported
- [MDL Page Frame / Light](https://www.figma.com/design/ewS0yt17hiWq2KXPa5RfCX?node-id=178-120) and [Night](https://www.figma.com/design/ewS0yt17hiWq2KXPa5RfCX?node-id=178-130): chapter folio / world-study plates, 520×700. Do **not** put this panel behind homepage typography; the Night variant includes a navy interior.
- [MDL Portrait Frame](https://www.figma.com/design/ewS0yt17hiWq2KXPa5RfCX?node-id=178-157): optional sculpt/character portraits.
- [Celestial Divider](https://www.figma.com/design/eCk5sxgtryGhQAcxDkpT8E?node-id=3-97): alternative 650×72 divider, currently too naval/dark blue for the revised palette.
- [Baroque Filigree Batch](https://www.figma.com/design/Yx8ud7n39NdWZvnNvo4Xlf?node-id=58-716): HUD source, simpler geometric style; don't use deprecated Batch O variants.
- [Celestial UI Atlas](https://www.figma.com/design/eCk5sxgtryGhQAcxDkpT8E?node-id=2-2): shell, heart, treble clef, astrolabe, crescent-like celestial symbols and controls.

## Visual constraints
- Source images and technical proof remain the real Unreal work, not generative substitutes.
- Decorations are always `aria-hidden`, transparent to pointer interactions, and placed outside text/CTA paths.
- Soft rosé/plum palette is the authority; a decorative source's original gold/cyan/pink accents may be kept where they read as small glints.
- The four SVGs are tracked assets and need no JavaScript.
- Site remains an unmerged draft PR until the visual desktop/mobile artifacts are approved.
