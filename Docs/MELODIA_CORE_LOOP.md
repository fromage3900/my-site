# Melodia Core Loop — BS_GodFile Bridge

BS_GodFile hosts a **thin demo stub**; the authoritative gameplay loop lives in `G:\Melodia`.

## What lives where

| Capability | G:\Melodia | BS_GodFile |
|------------|------------|------------|
| Battle session kernel | `UMelodiaBattleSession` | — |
| Dissonance / sound | `UMelodiaDissonanceSubsystem` | — |
| Phoenix UI bridge | `MelodiaPhoenixBattleBridgeLibrary` | JRPG template only |
| Quest on win | `AMelodiaQuestManagerBase` | `BP_QuestManager` (wire on victory) |
| Notation UI art | `Content/Melodia/UI/Notation/` | Copy textures/fonts for mock |

## BS_GodFile setup

1. Run `Content/Python/setup_melodia_core_loop_demo.py` in editor.
2. Place `BP_InteractionBattle` + `BP_BattleController` on a demo map under `Content/Melodia/Levels/`.
3. On `E_BattleResult::Victory`, call `BP_QuestManager` notify hook.
4. Optional: parent `WBP_NotationSkin_*` widgets using shared staff textures.

## Migrating full loop later

Copy `MelodiaMelusina_PROD` module + `Content/Melodia/` gameplay assets, or link Melodia as sibling project for environment + game split.

See `G:\Melodia\Docs\CORE_LOOP_STATUS.md` for acceptance criteria.
