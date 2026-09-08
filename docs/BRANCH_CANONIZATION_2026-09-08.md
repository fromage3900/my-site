# Website Branch Canonization — 2026-09-08

Canonical repository: `fromage3900/my-site`  
Pre-canonization `main`: `d76aa9e3c4d675686d5ca54772f00c6f07aad18d`

## Reviewed branch tips

| Branch | Pre-cleanup tip | Result |
|---|---|---|
| `docs/repo-authority-cleanup-2026-09-08` | `77e6095b5497b01d3075cec0d2203ae26a5b5034` | authority work already represented on main |
| `feat/2026-09-02-melodia-atmosphere` | `38d410b087b52347471f8576ce57facd7fa82129` | fully behind main |
| `feat/2026-09-02-melodia-browser-constellation` | `e6604a2f5b75754a7d96cebd022dfe3fa922bf83` | fully behind main |
| `feature/melodia-atmosphere-root` | `741b7c4153c915a589710c01c4b956575540a9ec` | older atmosphere implementation; current main contains newer canonical files |
| `feature/melodia-living-worlds-threejs` | `f99a596773bdf815d8f44087fd1dd0d2428ee051` | older Living Worlds implementation; current main contains newer canonical files |
| `fix/pages-validate-missing-refs` | `e66a19e40a5a3f13919c0af464997bb0f8da7376` | fully behind main |
| `fix/repo-authority-workspace-vs-repo-2026-09-08` | `77d7327e24dbe8c7128418828f387193c8ceee29` | final authority wording already on main |
| `portfolio-sendoff-20260813` | `0fd0307c9ca6094da9124a8729e65d6a6d1e0759` | fully behind current recruiter/sendoff state |

## Decision

All non-main website branches above are superseded by current `main` and may be normalized to the post-canonization main tip.

No unique current website implementation needs to be merged from those refs.

## Current rule

Future website work:
- branch from current `main`;
- stay inside the sendoff freeze unless explicitly authorized;
- validate before merge;
- merge back to `main`;
- do not leave a feature branch as a second source of site truth.
