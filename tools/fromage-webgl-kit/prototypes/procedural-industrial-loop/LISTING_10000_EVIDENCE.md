# $10,000 Procedural Industrial Homepage Listing — Proof Mapping

**Listing:** https://www.upwork.com/freelance-jobs/apply/artist-animate-and-build-the-the-loop-animation-the-company-homepage_~022096976272432704858/  
**Checked:** 2026-09-10  
**Prototype:** `tools/fromage-webgl-kit/prototypes/procedural-industrial-loop/`

## Why this prototype exists

The listing asks for production-quality execution of an already-defined industrial animation system: supplied CAD, strict mechanical motion laws, solver-inspired information visualization, staged approvals, and a 16-second seamless web hero loop.

This prototype demonstrates the relevant **system thinking** without copying their prototype, CAD, brand specification, colors, or proprietary scene.

## Requirement mapping

| Listing requirement | Generic proof in this prototype | Status |
|---|---|---|
| Procedural/system-driven motion | Absolute-time procedural choreography | SOURCE PRESENT |
| One axis at a time | Timeline assigns one primary motion per active segment | SOURCE PRESENT |
| Constant speed | Piecewise-linear interpolation only | SOURCE PRESENT |
| Dead stops / no easing | Explicit linear segments plus hard holds | SOURCE PRESENT |
| Seamless ~16s loop | 16s mirrored return schedule | SOURCE PRESENT / VERIFY CAPTURE |
| Machined/systemic geometry | Modular box/cylinder industrial station grammar | SOURCE PRESENT |
| Monochrome base | Neutral grey base mode | SOURCE PRESENT |
| Color only for information | Structural/flow/thermal illustrative modes | SOURCE PRESENT |
| Scientific/technical visual sensibility | Discrete field-value color bands | SOURCE PRESENT / ART QA NEEDED |
| CAD import | Not part of browser clean-room prototype | NOT PROVEN |
| DCC scene/outliner delivery | Browser hierarchy is named; Blender/Houdini production scene not yet built | PARTIAL |
| 2560x1080 master render | Not rendered yet | NOT PROVEN |
| ProRes/equivalent master | Not rendered yet | NOT PROVEN |
| <5 MB web video | Not encoded yet | NOT PROVEN |
| AV1/VP9 delivery | Not encoded yet | NOT PROVEN |
| Staged approval artifacts | Prototype can supply geometry/base/visual-mode screenshots after runtime QA | READY TO PROVE |

## Honest proposal angle after runtime proof

The useful claim is not “I already recreated your project.” It is:

> I built a small procedural mechanical proof specifically around the motion law in your brief: absolute-time, piecewise-linear transforms, one active axis at a time, hard stops, no easing, and discrete solver-inspired visualization states. My production approach would preserve those constraints while moving the supplied CAD through a controlled DCC/render pipeline.

Do not use that language until the prototype has been runtime-checked.

## DCC production path if shortlisted

```text
CLIENT CAD + NAMING SPEC
→ Blender or Houdini import / cleanup
→ preserve supplied object naming
→ validate scale, normals, topology and material grouping
→ procedural hierarchy / motion controller
→ geometry approval turntable
→ neutral light-on-light single-station lookdev
→ structural / flow / thermal visualization materials
→ full assembly
→ 16s deterministic master animation
→ high-quality master render
→ AV1 / VP9 web encode tests
→ <5 MB target validation
→ source scene + staged evidence package
```

## What to build only if application advances

Do not spend time today implementing these unless the buyer responds or the proof itself needs them:

- real CAD import;
- production Blender/Houdini scene;
- 2560x1080 offline master;
- ProRes master;
- AV1/VP9 compression ladder;
- exact client-specified solver palettes;
- their supplied code prototype integration.

## Proposal questions worth answering

1. **Software / procedural approach:** Blender or Houdini for CAD cleanup and procedural hierarchy; deterministic transform logic rather than animation curves with easing.
2. **Constant-speed/dead-stop method:** linear interpolation or stepped/linear animation curves only; disable Bezier easing, overshoot, spring behavior, secondary settle, camera drift, and organic procedural noise.
3. **Staged approval comfort:** geometry/outliner first, one-station material/lighting proof second, full population only after approval.
4. **Web delivery:** render master first, then test VP9/AV1 encodes against the actual <5 MB visual-quality threshold rather than assuming a bitrate will survive.

## Current decision

**BUILD PROOF / DO NOT APPLY YET.**

Application gate opens after:

- runtime-clean browser proof;
- one full 16s capture;
- three seed stills;
- BASE + STRUCTURAL + FLOW + THERMAL stills;
- recorded diagnostics;
- honest portfolio links chosen for spec-following / technical-art execution.
