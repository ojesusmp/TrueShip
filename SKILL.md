---
name: trueship
description: "End-to-end ship pipeline for a code repository: audits the working directory for missing standard documentation (README, LICENSE, CHANGELOG, CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, .github/ templates, .claude-plugin/marketplace.json for Claude Code skills), runs pre-tag privacy and identity audits (name leaks, absolute paths, maintainer tokens) and — when the maintainer confirms the product is finished — scrubs local paths, third-party names, addresses, and identity tokens while keeping the credit and optionally the email, enforces installer-location and CommonJS conventions, patches credit attribution, simplifies install instructions to three discrete paths (marketplace + git clone + npm) each with a Verify step, then commits via -F file flag, tags, pushes, and publishes to npm. Knows the real-world traps: auto-mode classifier blocking direct pushes to main, npm OTP requiring browser, content-filter trips on long inline prose, CRLF noise on Windows, PowerShell here-string mangling git/gh argv, postinstall MODULE_NOT_FOUND cosmetic exit-1 on Windows + Node 24 + npm 11, postinstall recursion when the package contains a .git directory. Trigger phrases - 'trueship', '/trueship', 'ship this repo', 'prepare repo for release', 'publish skill to github and npm'."
license: MIT
argument-hint: "[--version <semver>] [--credit-name <name>] [--credit-brand <brand>] [--release-type code|docs|metadata] [--no-publish] [--no-push]"
---

# TrueShip

Take any working repository — from a fresh skill folder to an existing project — and put it on GitHub + npm + the Claude Code plugin marketplace in one assistant turn. Standardized docs, scrubbed credits, three simple install paths each verified by SHA, real-world failure modes pre-handled.

## Mantra

> **Ship the deploy. Document the quirk. Verify the hash. Scrub the names. Use the file flag.**

Each clause is enforced by a stage below.

## When to invoke

Auto-fires on: `trueship`, `/trueship`, `ship this repo`, `prepare repo for release`, `publish skill to github and npm`.

Soft-prompts on: `release time`, `ready to ship`, `is this ready to publish` — proposes "Want me to run `trueship`?" and waits for confirmation.

## Inputs

Order of precedence:

1. **CLI flags** — `--version 1.2.3`, `--credit-name "Jane Doe"`, `--credit-brand "Acme Co"`, `--release-type code|docs|metadata`, `--no-publish`, `--no-push`.
2. **Conversation context** — recent turns.
3. **Files** — `package.json` `version`, `CHANGELOG.md` `## [Unreleased]`, `.omc/state/`, `.journal/STATE.md`.
4. **Defaults** — credit name `Orlando Molina`, credit brand `TruePointAgents`, version bump = patch, release-type = code.

If a required value is missing, ask ONE consolidated question with sensible defaults.

---

## Pipeline

### Stage 0 — Pre-tag audits & finalization scrub (BLOCKING)

Run three audits, then the 0d finalization decision. Every hit surfaces exact `file:line:matched-text`. A hit either scrubs (finished product) or is kept with a warning (draft) — see 0d.

**0a. Name audit** — uses `.namecheck.txt` at repo root (case-insensitive extended regex, one pattern per line):

```bash
git grep -iEf .namecheck.txt -- ':!.namecheck.txt'
```

```powershell
git grep -iEf .namecheck.txt -- ':!.namecheck.txt'
```

The `':!.namecheck.txt'` exclusion is required so the pattern file does not match itself. If `.namecheck.txt` is missing, TrueShip creates one with default placeholder patterns (`[fullname]`, `[year]`, `your name`, `john doe`, `jane doe`).

**0b. Absolute-path audit** — grep tracked files for OS-style absolute paths:

```bash
git grep -nE '^[A-Z]:\\|/Users/|/home/' -- ':!LICENSE' ':!.git*'
```

Whitelist: `LICENSE`. Any other match is a 0d hit.

**0c. Identity audit** — grep for maintainer-specific tokens outside the whitelist:

```bash
git grep -nE 'ojesusmp@gmail\.com|<your-internal-id>' -- ':!LICENSE' ':!CODE_OF_CONDUCT.md' ':!SECURITY.md'
```

Whitelist: `LICENSE` author line, `CODE_OF_CONDUCT.md` enforcement contact, `SECURITY.md` security contact.

**0d. Finalization decision.**

If 0a–0c return ZERO hits: proceed to Stage 1, ask nothing.

If any audit hit, ask ONE question:

> This repo has `<N>` personal/local references (names, paths, identity tokens). Is this product **finished** and ready for public download?

- **Not finished (draft):** keep everything. Print the hits as an advisory list (`file:line:matched-text`) so the maintainer knows what is there, then proceed to Stage 1. Drafts may legitimately carry local paths and personal notes — a downloader is not expected yet.
- **Finished:** scrub. Ask one follow-up — *keep your email in the LICENSE author line, SECURITY contact, and CoC enforcement contact?* (yes/no). Then build a scrub plan.

**Scrub plan.** For every hit, propose a replacement:

| Hit type | Replacement |
|---|---|
| Absolute path in a doc / markdown file | generic form — `~/.claude/skills/<name>`, `<repo-root>`, or the relative path |
| Absolute path in code | portable equivalent — `path.join(os.homedir(), ...)`; if the rewrite is non-trivial, flag the line instead of guessing |
| Credit name (the `--credit-name`) outside `LICENSE` / `package.json` author / `marketplace.json` author | generic descriptor — "the operator", "the maintainer" |
| Third-party personal name | generic descriptor |
| Physical address | removed |
| Email — "keep email" = no | removed everywhere |
| Email — "keep email" = yes | kept ONLY in `LICENSE` author, SECURITY contact, CoC contact; removed elsewhere |
| Tool / AI-assistant name, session ID, ticket ID, chat-history reference | removed |
| Copyrighted third-party text | cannot auto-rewrite — flag the line; maintainer rewrites or removes it |

**Always kept:** the credit (`LICENSE` author, `package.json` author/contributors, `marketplace.json` author) and — if the maintainer answered yes — the email in the three whitelisted contact slots. Credits are intended attribution, not a leak.

Show the full plan as a `file:line:matched-text → replacement` list. Ask for ONE confirmation. On confirm, apply every replacement so the downloader gets no errors and nothing tied to the maintainer's machine or person, then **re-run 0a–0c**. Any remaining hit (e.g. a flagged copyrighted line) BLOCKS the commit until the maintainer resolves it.

If the maintainer declines the scrub confirmation: stop. Do not commit, do not auto-edit.

### Stage 1 — Audit standard docs

Flag missing or default-templated:

- `README.md` — missing, smaller than 1 KB, OR install section contains `cp -r`/`Copy-Item`/`manually copy`/`mkdir -p ~/.claude/skills` OUTSIDE the documented git-clone path (paths 1 and 3 must have zero manual-copy commands; path 2 must have it).
- `LICENSE` — missing or contains `[Year]`/`[fullname]`/`Your Name`.
- `CHANGELOG.md` — missing or empty.
- `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md` — missing.
- `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md`, `.github/PULL_REQUEST_TEMPLATE.md` — missing.
- `.claude-plugin/marketplace.json` — missing AND a `SKILL.md` exists at repo root.
- `package.json` — `author` is `""`/`"Your Name"`/missing; `files` array missing template dirs.
- `.namecheck.txt` — missing (auto-create with defaults).
- `.gitignore` — missing or lacks release-prep temp patterns (see Stage 9).

### Stage 1.5 — Installer-location & convention check (BLOCKING)

If the repo contains a postinstall script (`install.cjs`, `install.js`, `install.mjs`):

| Check | Required | Why |
|---|---|---|
| Location | repo root (NOT `bin/`) | Lessons §2.2 — nested paths increase npm install-pipeline failure surface. |
| Extension | `.cjs` (CommonJS) | Lessons §2.3 — `.mjs` postinstall misreports on some platforms. |
| `package.json` `postinstall` | bare filename: `node install.cjs` | No subdirectory. |
| `package.json` `type` | NOT `"module"` if installer is CJS | Avoids module-system mismatch. |
| `package.json` `bin` field | absent (unless explicitly requested) | Lessons §2.4 — bin wrapper overlaps postinstall lifecycle on Windows. |
| Deploy target | `path.join(os.homedir(), '.claude', 'skills', '<name>')` | Cross-OS. |
| `.git` guard | present, `--force` bypass | Lessons §2.19 — protects dev checkouts. |
| Post-copy SHA-256 | present, exit non-zero on mismatch | Lessons §2.20 — catches AV/partial-copy. |

Any failure: surface `file:line` and exact remediation. Do not auto-fix without confirmation.

### Stage 2 — Patch docs

For each missing file, copy `templates/<file>` (relative to TrueShip install root). Token substitutions:

| Token | Value |
|---|---|
| `{{REPO_NAME}}` | `basename` of working dir |
| `{{REPO_SLUG}}` | name lowercased, non-alphanumerics → `-` |
| `{{OWNER}}` | github owner from `git remote get-url origin` (fallback `ojesusmp`) |
| `{{CREDIT_NAME}}` | `--credit-name` (default `Orlando Molina`) |
| `{{CREDIT_BRAND}}` | `--credit-brand` (default `TruePointAgents`) |
| `{{CREDIT_EMAIL}}` | `git config user.email` |
| `{{YEAR}}` | current year |
| `{{DATE}}` | `YYYY-MM-DD` |
| `{{VERSION}}` | target version (Stage 6) |
| `{{NPM_NAME}}` | `package.json` `name` |

Existing files are preserved. TrueShip only patches specific lines (e.g. credit substitution in `LICENSE`); it does NOT overwrite hand-written content.

**Seed-only templates (not token-substituted, copied as-is if missing):**

- `templates/.namecheck.txt` → `<repo-root>/.namecheck.txt` (canonical placeholder patterns for Stage 0a).
- `templates/.gitignore` → merged into `<repo-root>/.gitignore` (Stage 9 patches missing lines; never removes existing entries).

### Stage 3 — Scrub credits

`LICENSE` — replace `[Year]`/`[fullname]`/`Your Name`/`John Doe`/`Jane Doe` placeholders with `{{YEAR}} {{CREDIT_NAME}} ({{CREDIT_BRAND}})`.

`package.json` — if `author` is missing/templated:

```json
{
  "author": { "name": "{{CREDIT_NAME}}", "url": "https://github.com/{{OWNER}}" },
  "contributors": [ { "name": "{{CREDIT_BRAND}}", "url": "https://github.com/{{OWNER}}" } ]
}
```

### Stage 4 — Simplify install

Locate the README install section (`## Install`/`## Installation`). Replace body with `templates/install-section.md`. See Stage 4.5 for shape enforcement.

### Stage 4.5 — README install-section enforcement (BLOCKING)

The README install section must contain EXACTLY three numbered paths, in this order:

1. **Claude Code plugin marketplace** — auto-install. ZERO `cp`/`Copy-Item`/`mkdir` commands in body.
2. **Git clone** — manual. Must include the copy step explicitly labeled *"Git does not run install scripts — this step is manual."*
3. **npm** — postinstall auto-copies. ZERO manual-copy commands in body.

Each path must end with a `**Verify:**` block. Path 3 must include the documented Windows quirk note (Stage 7).

If the install section deviates, BLOCK and surface diff.

### Stage 5 — Resolve version & release-type

Priority:

1. `--version` flag.
2. `package.json` `version` if it does not match latest git tag.
3. Else bump patch on `git describe --tags --abbrev=0`.

Classify the release (`--release-type` or infer):

- **code** → bump `package.json` + `marketplace.json` + tag.
- **docs** → keep `package.json`; optionally bump `marketplace.json`; bump tag + CHANGELOG.
- **metadata** → bump only the affected metadata file + tag.

CHANGELOG wording rule: a `### Fixed` heading is only allowed when an end-to-end test confirms the symptom is gone. For symptom-relief-only changes use `### Changed` and describe the action as an *attempt*. TrueShip rewrites any `### Fixed` entry to `### Changed` if the corresponding test evidence is not present in the conversation or `.omc/state/`.

### Stage 5.5 — Message-passing discipline (BLOCKING)

Multi-line commit messages and release notes are NEVER inlined as CLI arguments. Always:

1. Write the message to a temp file (`.commit-msg-<version>.tmp` or `.release-notes-<version>.tmp.md`).
2. Pass via `-F <file>` (git) or `--notes-file <file>` (gh).
3. Delete the temp file after success.

Refuse the inline form even for short messages — the discipline matters more than the convenience. Temp file patterns are pre-listed in `.gitignore` (Stage 9).

### Stage 6 — Commit, tag, push

Stage every modified or new file in the repo root and tracked subdirs. Skip secrets-like patterns: `.env`, `.env.*`, `*credentials*`, `*secret*`.

Commit message format (Conventional Commits) — written to `.commit-msg-<version>.tmp`:

```
release: v<version> - <short summary>

<bullet list of files changed and what they cover>
- README install: 3 paths each with Verify
- Added <list of new standard docs>
- Author attribution: <name> / <brand>
- No functional change to <skill name> if applicable
```

Then:

```bash
git commit -F .commit-msg-<version>.tmp
git tag -a v<version> -F .commit-msg-<version>.tmp
git push origin v<version>
git push origin main
rm -f .commit-msg-<version>.tmp
```

PowerShell equivalent uses the same `-F` form — never an inline `-m "$msg"` here-string (lessons §2.8).

**TRAP — auto-mode classifier:** Bash error containing `Permission for this action was denied by the Claude Code auto mode classifier` triggers this surface (no silent retry):

```
The auto-mode classifier blocked pushing to main. Run this yourself in the prompt:

! git push origin <branch>
```

### Stage 7 — Windows npm install warning (CONDITIONAL)

If `package.json` defines a `postinstall` script AND the README documents a `github:` npm install, the README install section's npm path MUST contain a documented note:

> Windows + Node 24 + npm 11 may print `MODULE_NOT_FOUND` and exit 1 even though the postinstall copy succeeded. Verify with the printed SHA-256 or use `npm pack` + local tarball for a clean exit.

If the note is missing, TrueShip injects it. This is cosmetic upstream behaviour, not a bug to fix — lessons §2.1.

### Stage 8 — Privacy hygiene (BLOCKING REVIEW)

User-facing tracked files (`README.md`, `SKILL.md`, `CHANGELOG.md`, `EXAMPLES.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `package.json`, `marketplace.json`, `.github/**`) must NOT contain:

- Personal names of third parties (use generic descriptors).
- Absolute filesystem paths.
- Maintainer's filesystem layout (drive letters, project folders).
- Names of tools, agents, or AI assistants used to author the skill.
- Internal session IDs, ticket IDs, chat-history references.
- Email addresses outside the LICENSE author line, CoC enforcement contact, and SECURITY contact.

This stage cross-references Stage 0 audits and re-runs them after Stage 2 patches (because token substitution can re-introduce leaks). If Stage 0d classified the repo as a draft, this re-run is advisory only — it warns but does not block.

### Stage 9 — `.gitignore` minimums

The `.gitignore` must include (TrueShip adds any missing lines, never removes existing entries):

```
# Release-prep scratch files
.commit-msg-*.tmp
.release-notes-*.tmp.md

# Local harness / state
.omc/
.journal/
.claude/

# Operator feedback
.usage.log

# Secrets — defense in depth
.env
.env.*
*credentials*
*secret*

# Node
node_modules/
npm-debug.log*

# Logs
*.log

# Editor / OS
.DS_Store
Thumbs.db
*.swp
*.swo
.vscode/
.idea/
```

### Stage 10 — Final verification

Run AFTER commit + tag + push:

```bash
# Remote tag landed?
git ls-remote --tags origin v<version>

# GitHub release exists?
gh release view v<version>

# npm version matches (publish-eligible only)?
npm view <pkg> version
```

For npm-publish path, before publish: optionally `npm pack` and dry-install locally to confirm the tarball deploys cleanly. After publish, fetch the deployed `SKILL.md` SHA-256 and compare to the source SHA — they must match.

Each check reports PASS / FAIL with exact remediation command. CRLF warnings during `git add` are suppressed in the report (harmless `core.autocrlf`).

---

## Anti-patterns (TrueShip REFUSES to ship if detected)

1. **Inlining multi-line text as a CLI argument** to `git`/`gh`. Always `-F`/`--notes-file`.
2. **Personal-name attributions** in user-facing docs (even in "Credits" sections) — for a finished product; scrubbed or kept per the Stage 0d finalization decision.
3. **Absolute paths** in tracked files outside whitelist — for a finished product; scrubbed or kept per the Stage 0d finalization decision.
4. **`### Fixed` claims without an end-to-end test confirming the symptom is gone.** Use `### Changed` (attempt) instead.
5. **Postinstall scripts at non-root paths** when the repo will be `npm install -g github:` installed.
6. **ESM (`.mjs`) postinstall scripts.** Use `.cjs`.
7. **`bin` field** for the installer unless the maintainer explicitly requests it with documented rationale.
8. **Sequential failed re-attempts at the same fix.** After 2 attempts targeting the same root cause, accept the cause is upstream and document the quirk.
9. **README install sections with more than 3 numbered paths.** Three is the cognitive ceiling.
10. **Marketplace install instructions without shipping `.claude-plugin/marketplace.json`.**

## Known traps and workarounds (handled automatically)

| Trap | Workaround |
|---|---|
| Auto-mode classifier blocks `git push origin main` | Surface `! git push origin main`; never retry silently. |
| npm OTP required | Read auth URL from error; instruct user to open it; re-run via `! npm publish`. |
| Content filter blocks long inline assistant prose | Always Write to file; never inline multi-paragraph assistant messages. |
| Windows CRLF warnings | Suppressed; harmless. |
| Windows + Node 24 + npm 11 `MODULE_NOT_FOUND` exit-1 | Document; verify SHA; recommend `npm pack` + local tarball. |
| Postinstall recursion in source repo | `.git/` guard in `install.cjs`; `--force` bypass. |
| `gh release` glob-trap on inline `--notes` | Use `--notes-file`. |
| PowerShell here-string mangling argv to `git`/`gh` | Use `-F` / `--notes-file`. |
| Tag pushed before commit hits remote | Push commit first; or push tag separately after commit lands. |
| `gh repo create` requires auth | Instruct `! gh auth login`. |

## Validation checklist

Before TrueShip reports success, every box must be ticked in the assistant message:

- [ ] Stage 0 audits returned zero hits — OR the repo was classified a draft (0d) and the advisory hit list was shown — OR the finalization scrub was applied and 0a–0c re-ran clean.
- [ ] Stage 1.5 installer-convention checks all passed (root location, `.cjs`, no `bin`, `.git` guard, SHA verify).
- [ ] All flagged-missing standard docs now exist at expected paths.
- [ ] `LICENSE` no longer contains `[Year]`/`[fullname]`/`Your Name`.
- [ ] `package.json` `author.name` equals `{{CREDIT_NAME}}`.
- [ ] README install section: exactly 3 paths, each with a `**Verify:**` block; paths 1 & 3 contain ZERO manual-copy commands; path 3 contains the Windows-quirk note.
- [ ] CHANGELOG `### Fixed` entries are backed by an end-to-end test, else rewritten to `### Changed`.
- [ ] Commit + tag created via `-F .commit-msg-<version>.tmp`; temp file deleted after.
- [ ] `git status` clean post-commit.
- [ ] `git ls-remote --tags origin v<version>` non-empty.
- [ ] If publish-eligible: `npm view <pkg> version` equals target version AND deployed SKILL.md SHA-256 matches source.
- [ ] If `main` push was blocked: the `!` workaround was surfaced.

## Examples

### First-time skill ship

```
trueship --version 1.0.0
```

### Patch release

```
trueship
```

### Docs-only run, no publish

```
trueship --release-type docs --no-publish
```

### Override credits

```
trueship --credit-name "Jane Smith" --credit-brand "Smith Labs"
```

## Customization

Edit any file under `templates/` to change the default content TrueShip writes. Token rules: Stage 2. Disallowed names: edit `.namecheck.txt`.

To add a new standard doc:

1. Drop the template at `templates/<filename>`.
2. Add a row to Stage 1.
3. Add any new tokens to Stage 2.

## Limitations

- Does not create the GitHub repo; use `gh repo create <owner>/<name> --public --source=. --remote=origin` first.
- Does not handle monorepos with multiple packages — repo root only.
- Does not run tests before publish; rely on `prepublishOnly` in `package.json`.
- Does not handle pre-1.0 unstable versions specially; treat `--version` as authoritative.

## License

MIT. See `LICENSE`.
