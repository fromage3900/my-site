# Contributing to Melodia

```
✧ ┊ ⋆ ┊ . ┊ ┊┊ ┊⋆ ┊ .┊ ┊ ⋆˚  ✧
```

Welcome! This guide covers how to contribute to Melodia -- whether you're an environment artist, technical designer, or programmer.

---

## Quick Start

1. Read [README.md](README.md) -- choose your onboarding path
2. For level designers: use [sparse checkout](Docs/SETUP_COLLAB.md) (50 MB, not 300 GB)
3. For programmers: clone the full repo with `git lfs pull`
4. Run `.\deploy\validate_setup.ps1` to check your environment

---

## Branch Naming

```
feature/<what-youre-building>    -- new functionality
fix/<what-youre-fixing>          -- bug fixes
docs/<what-youre-documenting>    -- documentation only
cleanup/<what-youre-cleaning>    -- repo hygiene
```

Examples: `feature/zundamon-npc`, `fix/modifier-stacking`, `docs/collab-guide`

---

## Commit Conventions

```
<type>: <short description>

Examples:
  feat: add Zundamon NPC Blueprint with quest giver interface
  fix: correct multiplicative modifier stacking in GS-001
  docs: add live collab onboarding guide
  chore: expand .gitignore for UE artifacts
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`

---

## Pull Request Process

1. **Create a branch** from `main` using the naming convention above
2. **Make your changes** -- keep commits focused and descriptive
3. **Push** your branch to GitHub
4. **Open a PR** against `main`
5. **Describe what you changed and why** in the PR description
6. Wait for review before merging

For large changes (new systems, plugin modifications), open an issue first to discuss the approach.

---

## File Ownership

| Area | Owner | Review Required? |
|------|-------|-----------------|
| `deploy/surreal_arch/` | Procedural Geometry Agent | Yes |
| `Content/Python/gmm/` | GMM Game Systems | Yes |
| `Plugins/MelodiaCore/` | MelodiaCore C++ | Yes |
| `Content/Python/setup_material_*.py` | Material Pipeline Agent | Yes |
| `Docs/` | Anyone | No |
| `Tools/` | Anyone | No |

---

## What NOT to commit

Do NOT commit:
- `.blend1` or `.blend2` files (Blender crash recovery -- auto-ignored)
- `Intermediate/`, `Saved/`, `Binaries/` (UE build artifacts -- auto-ignored)
- Temporary scripts (`Content/Python/_tmp_*`, `probe_*`, `query_*`)
- ZIP archives or `.7z` files
- Personal config files or local paths

---

## Getting Help

- [DOC_INDEX.md](DOC_INDEX.md) -- full documentation map (68 docs)
- [Docs/ONBOARDING_LIVE_COLLAB.md](Docs/ONBOARDING_LIVE_COLLAB.md) -- step-by-step bridge setup
- [Docs/SETUP_COLLAB.md](Docs/SETUP_COLLAB.md) -- lightweight clone guide
- File an issue on GitHub for bugs or feature requests
