# Portfolio Sendoff Freeze — 2026-09-07

**State:** SOFT FREEZE ACTIVE  
**Started:** 2026-09-07 19:10 America/Toronto  
**Authority:** `content/showcase-freeze.json`

The recruiter-facing portfolio is now in a **soft freeze**. The public surface is considered compositionally and structurally finished. From this point until hard freeze, changes are limited to:

- approved render promotion and responsive derivatives;
- render-passport / plate metadata required by those images;
- factual corrections;
- broken-link / contact / accessibility fixes;
- social-preview correctness;
- critical deployment fixes;
- the exact case-study pages receiving the final approved renders.

## Explicitly frozen

Do not add or redesign:

- homepage/navigation structure;
- global typography or color systems;
- new WebGL / Three.js effects;
- new interactive labs or public dashboards;
- new public routes;
- broad copy rewrites;
- new shader/material demos for the recruiter path;
- speculative systems descriptions;
- alternate portfolio architectures.

The point of the freeze is to stop polishing the *container* and finish the *proof*.

## Remaining visual promotion queue

1. Melusina UE5.8 B2 full-body hero.
2. Melusina UE5.8 portrait.
3. Melusina compact material / topology / silhouette proof.
4. Sakura Dream canonical world beauty.
5. Kaleido Nave canonical world beauty.
6. Fallen Moon canonical world beauty.

Every image still passes the existing render-passport acceptance rules before it can be promoted.

## Final QA before hard freeze

The hard freeze may begin only after:

- 1440px desktop review;
- 390px iPhone/mobile review;
- tablet-width sanity check;
- keyboard/focus navigation review;
- reduced-motion review;
- contact links verified;
- social/OG preview crop verified;
- direct GitHub Pages routes verified;
- fromageart.xyz/Wix embed route verified;
- latest Pages CI/deploy green.

## Hard-freeze action

After the render queue and QA clear:

1. update `content/showcase-freeze.json` from `soft_freeze` to `hard_freeze`;
2. set its new `base_sha` to the accepted sendoff commit;
3. cut the stable showcase tag/release;
4. stop all public-site changes except critical break/factual/contact fixes.

Game and semester production may continue. The **public showcase** is what freezes.
