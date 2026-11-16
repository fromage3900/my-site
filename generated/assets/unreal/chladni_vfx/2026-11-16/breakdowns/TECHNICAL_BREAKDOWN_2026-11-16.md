# Portfolio Render Pipeline - Technical Breakdown (2026-11-16)

## Scope
- UE project: `X:\EnvironmentPortfolio\BS_GodFile\BS_GodFile.uproject` (UE 5.8), editor PID 14276.
- TD: `C:\MelodiaTouchDesigner\grandmaster_melodia7.toe` (TD 2025.32460), PID 24572, Envoy MCP `127.0.0.1:9870`.
- Confirmed level set (7): `L_CelestialPond`, `L_EscherAscent`, `L_FallenMoon`, `L_InfiniteScore`, `L_KaleidoNave`, `L_VinylGalaxy` (`Content/EnvSandbox/Environments/`), `L_MelusinaMorning` (`Content/Melodia/Levels/Opening/`).

## UE MRQ capture (status)
- **Intent:** MRQ render per level with cinematic preset/sequence, output to `Saved/Portfolio/MRQ/<level>/` or staged copy in `docs/renders/portfolio_2026-11-16/mrq_levels/<level>/`.
- **Available assets:** MRQ presets `MRQ_Preset_Cinematic`, `MRQ_Preset_MI_Loop_1080`; scripts `setup_mrq_presets.py`, `run_mrq_capture_v2.py`, `Imports/Portfolio/lookdev/run_mrq_capture_v2.py`, `Tools/Poitou/ue/p_mrq.py`. No per-level sequences found for target set.
- **Control probes:** UnrealMCP TCP listeners 55557/55558 present but command requests (ping/get_actors) did not return actionable responses in-session; no Python-exec command found in plugin dispatch. `UnrealEditor-Cmd` headless render not executed while editor holds project lock (risk of contention/corruption) and would require temp sequence/config authoring.
- **Result:** MRQ per-level capture **blocked/unverified** in current session state. No BS_GodFile git mutations performed. Outputs directory prepared for any externally produced MRQ plates.

## UE → TD Spout
- TD receiver path: `/project1/concert_stage/spout_ue_live` (syphonspoutinTOP, `sendername=UE_Beauty`, 128x128) → `/project1/lookdev_comp/sel_ue_live`.
- UE logs show TD audio bridge traffic but no confirmed Spout2_DX12 sender activation; live texture feed unverified.
- **Result:** Live Spout routing **not confirmed**; TD variations use available TD Chladni/VFX compositions and can ingest any later-provided plates via `plate_in`/spout if signal appears.

## TD Chladni-loop VFX (128-frame seamless)
- Sources inspected live via Envoy:
  - `/project1/cymatics_aaa_showcase/glsl_cymatics_hero` (1920x1080): Chladni (3,5)+(4,6) eigenmodes, Airy thin-film iridescence. Uniforms: `uModes(3,5,0.25,3900)`, `uMotion(x=absTime.seconds*0.15 expr, y=0.75+0.25*sin(seconds*3), z=seconds*0.08 expr, w=1)`, `uAudioParams(0.95,0.12,1,0.9)`, `uCameraFrame(1.77778,1,1,absTime.seconds expr)`.
  - `/project1/performance/scenes/chladni_fleece/chladni_field` (1920x1080): 2D plate eigenmode (2,3), beat/rhythm driven by `canonical_rhythm` + `state_fixture`.
  - `/project1/hero_studio/chop_loop_clock`: 128-frame loop clock.
- Seamless strategy (reversible): override time/phase expressions to frame-derived periodic values over 128 frames (e.g. `phase = (frame % 128)/128 * 2*pi*k`) for `uMotion.x/.z/.w` and any time-dependent inputs, render frames 0..127, then restore original expressions/values. No `.toe` save.

## Nikki stack color stories (4 variations/level)
- Nodes: `/project1/lookdev_comp/GRADE_NIKKI_PASTEL` (glslTOP, `uParams` from project Pastellift/Exposure/Contrast, `uFilm` Pastelaura; shader `shd_nikki_pastel_grade`), `/project1/lookdev_comp/GRADE_10_NIKKI_ATLUS_LUT` (levelTOP contrast/high rgb/brightness), `sw_nikki_couture`, `MERGE_10_NIKKI_MAGIC`, nikki_film_comp passes.
- Planned stories (applied reversibly per render batch, restored after): e.g. **Sakura Pearl** (soft lift/aura, warm pearl), **Amethyst Electric** (cool violet/cyan bias, higher contrast), **Golden Hour Silk** (warm gold highs, gentle exposure), **Moonlit Teal** (teal/cyan shadows, crisp contrast). Exact tuned values recorded in per-variation manifests.
- Per level: 4 variations × 128 frames = 512 frames; 7 levels = 3584 frames total target (subject to runtime feasibility).

## Outputs
- TD frames/loops: `docs/renders/portfolio_2026-11-16/td_variations/<level>/<variation>/` (PNG sequence + manifest).
- Breakdowns: `docs/renders/portfolio_2026-11-16/breakdowns/` (this doc, per-level manifests, best-candidate list).
- Site candidates: selective copy/commit/push to `C:\Users\froma\my-site` (dirty repo; stage only intended additions).

## Safety
- No `.toe` save, no BS_GodFile git mutations, no destructive UE edits; all TD parameter changes recorded and restored.

## Execution progress (2026-11-16T03:26Z)
- **TD Chladni 128-frame seamless loops (cymatics hero /project1/cymatics_aaa_showcase/glsl_cymatics_hero, 1920x1080, periodic phase cycles over 128 frames)**:
  - L_CelestialPond: **complete** — 4/4 stories × 128 frames (512 PNGs) + manifests.
    - Stories: sakura_pearl, methyst_electric, golden_hour_silk, moonlit_teal (hero + Nikki-grade parameter sets recorded in per-story manifests).
  - L_EscherAscent: **in progress** — sakura_pearl rendering (~119/128 frames observed), remaining stories pending.
  - L_FallenMoon, L_InfiniteScore, L_KaleidoNave, L_VinylGalaxy, L_MelusinaMorning: pending (sequential).
- **Best candidates staged to site (selective):** C:\Users\froma\my-site\generated\assets\unreal\chladni_vfx\2026-11-16\L_CelestialPond\ (4 stories × 4 representative frames + manifests) and ...\breakdowns\ copies. Site repo origin https://github.com/fromage3900/my-site.git (main, dirty with unrelated changes) — only intended new paths staged/committed.
- **MRQ per level:** blocked/unverified — running UE editor (PID 14276) not programmatically controllable for MRQ in-session (UnrealMCP ping only; no Python-exec/command path confirmed), and UnrealEditor-Cmd not run against locked project to avoid contention/corruption. No per-level sequences for target set; no BS_GodFile mutations.
- **UE→TD Spout:** not confirmed live (TD receiver UE_Beauty 128x128 path exists; no verified sender feed). TD variations rendered from live TD Chladni/Nikki composition.
- **Constraints:** no .toe save; all TD overrides restored per batch/script design; C: free space ~16.7 GB during run (full 7×4×128 PNG target is large/time-intensive).

- 03:26Z update: L_EscherAscent sakura_pearl+amethyst_electric complete (128), golden_hour_silk in progress; refreshed best_candidates.json. Best-candidate PNGs force-staged in site due to generated/assets numeric PNG ignore rule.

- 03:31Z update: L_EscherAscent complete (4/4 stories x 128). Best candidates staged/pushed for L_EscherAscent. Starting next level render sequentially (disk/time permitting). MRQ per-level and live UE Spout remain blocked/unverified in running editor.

- 03:35Z: L_EscherAscent complete (4/4 stories x 128). Best candidates (all 4 stories, picks+manifests) staged/pushed to my-site. L_FallenMoon render in progress. Remaining levels queued sequentially as disk/time permit. UE MRQ per-level and live Spout feed remain blocked/unverified (no controllable Python-exec/sequence automation in running editor; UE_Beauty Spout black).
