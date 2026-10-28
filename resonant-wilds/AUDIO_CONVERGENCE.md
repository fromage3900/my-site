# Resonant Wilds audio convergence — 2026-10-28

The browser game preserves the **five-biome** world, the 100-prefab Harmonic Grove assets, chibi Melusina and NPR visuals. This is a bounded mirror of the MelodiaMelusinaV2 canonical ethereal audio module.

## Implemented
- Each dry/wet effect signal passes through its category volume bus. Setting **SFX** to zero also mutes its reverb and all loot/Encore pad rewards; setting **music** to zero also mutes its ambience and score reverb.
- The soft/pad-led ethereal score, region ambience and canonical WebAudio rhythm scheduler are reused.
- Existing browser biomes receive petal, nave, grotto, crystal and glacier ambience; Shorewake receives hub ambience.
- WebAudio resumes during the user play action and remains on the existing audio clock; the work does not alter save format, game objects, or add media dependencies.

## Not included
The larger eight-biome source game, newer named destination/photo/Recital gameplay, and its experimental renderer do not become live merely through this audio sync. Source PR #568 currently conflicts with canonical main, where sixteen newer destinations already exist; it must not be merged wholesale.

## Verification
`node resonant-wilds/tools/test_audio_routing.mjs` checks the audio graph, separate faders and region ambience. CI also checks the 100-asset game browser boot. Real Safari/physical-device listening, output latency and cache reload remain QA gates.
