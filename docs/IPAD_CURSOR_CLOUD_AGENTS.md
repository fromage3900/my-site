# iPad + Cursor: edit my-site for recruiter sendoff

**Canonical local clone:** `C:\Users\froma\my-site`  
**GitHub (Cloud Agents):** https://github.com/fromage3900/my-site  
**Live site:** https://fromage3900.github.io/my-site/  
**Cursor desktop:** 3.21.18+ (Remote Control needs ≥ 3.9.8)

Showcase soft freeze still applies — prefer `content/site-copy.json`, `content/site-plates.json`, approved render promotion, and critical correctness. See `EDITING.md` and `docs/PORTFOLIO_SENDOFF_FREEZE_2026-09-07.md`.

---

## A. Cloud Agents from iPad (no PC required)

1. Install [Cursor for iPad](https://apps.apple.com/app/cursor/id6767085653) (iPadOS 26+).
2. Sign in with the same Cursor account (paid plan with Cloud Agents).
3. On desktop/web once: [Cursor Dashboard → Integrations](https://cursor.com/dashboard?tab=integrations) — connect **GitHub** and grant access to `fromage3900/my-site`.
4. Privacy: if prompted, switch from Privacy Mode (Legacy) to Privacy Mode so Cloud Agents can run.
5. In the iPad app: choose repo **`fromage3900/my-site`**, branch **`main`** (or a short-lived `sendoff/…` branch).
6. **Design Mode on iPad:** attach a screenshot of the live page (or Safari screenshot), tap points / draw with Apple Pencil, then prompt the change.
7. Review the PR/diff in-app; merge when ready. GitHub Pages publishes from the `gh-pages` branch — confirm deploy after merge if your pipeline is separate from `main`.

Useful first prompts:

- Polish `wix/recruiter-one-sheet.html` / hiring dossier spacing for mobile.
- Fix copy via `content/site-copy.json` keys only.
- Check OG/social preview and contact links.

---

## B. Remote Control (PC stays on — local files + live Design Mode chain)

Use when you want the agent on the **local** clone (uncommitted work, local preview, no cloud clone wait).

1. On PC: **File → Open Folder** → `C:\Users\froma\my-site` (not `EnvironmentPortfolio\my-site`).
2. Open the **Agents Window** (not only the classic editor chat).
3. **Settings → Agents → Remote Control** → enable. Optionally enable **Keep this computer awake**.
4. Start a local preview if you need live pages (`npm run dev` / static serve as you usually do).
5. For full live Design Mode on the PC: Agents Window → Browser → load the preview URL → **Ctrl+Shift+D**.
6. In the agent input run: `/remote-control` then send your next message.
7. On iPad: open the session from the inbox; continue with screenshots, Pencil markup, or voice.
8. Leave the PC awake and online — tool calls (edit/test/git) run on the machine.

---

## C. What not to open

| Path | Role |
|------|------|
| `C:\Users\froma\my-site` | **Canonical** website repo |
| `C:\EnvironmentPortfolio\my-site` | Stub / status drop only — not the portfolio |
| `C:\EnvironmentPortfolio\my-site-kit` | Secondary clone — avoid dual-editing |

---

## Quick verify

```powershell
cd C:\Users\froma\my-site
git status -sb
git remote -v
# expect: origin https://github.com/fromage3900/my-site.git , main tracking origin/main
```
