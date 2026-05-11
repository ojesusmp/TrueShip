---
name: trueship
description: "End-to-end ship pipeline for a code repository: audits the working directory for missing standard documentation (README, LICENSE, CHANGELOG, CODE_OF_CONDUCT, CONTRIBUTING, SECURITY, .github/ templates, .claude-plugin/marketplace.json for Claude Code skills), patches credit attribution, simplifies install instructions to npm + git + Claude marketplace, then commits, tags, pushes, and publishes to npm. Knows the real-world traps: auto-mode classifier blocking direct pushes to main, npm OTP requiring browser, content-filter trips on long inline prose, CRLF noise on Windows, postinstall recursion when the package contains a .git directory. Trigger phrases - 'trueship', '/trueship', 'ship this repo', 'prepare repo for release', 'publish skill to github and npm'."
license: MIT
argument-hint: "[--version <semver>] [--credit-name <name>] [--credit-brand <brand>] [--no-publish] [--no-push]"
---

# TrueShip

Take any working repository — from a fresh skill folder to an existing project — and put it on GitHub + npm + the Claude Code plugin marketplace in one assistant turn. Standardized docs, scrubbed credits, simple install instructions, real-world failure modes pre-handled.

## When to invoke

TrueShip auto-fires when the user types any of:

- `trueship`
- `/trueship`
- `ship this repo`
- `prepare repo for release`
- `publish skill to github and npm`

## Claude may also suggest invoking when user says...

These phrases prompt Claude to offer TrueShip but not auto-fire:

- `release time`
- `ready to ship`
- `is this ready to publish`

On those, Claude proposes: "Want me to run `trueship` to prepare and publish this repo?" and waits for confirmation.

## What it does

TrueShip runs a seven-stage pipeline against the current working directory:

1. **Audit** — inspect the repo for missing standard documentation, default credit strings, and install instructions that contain manual copy-paste steps.
2. **Patch docs** — write or update `README.md`, `LICENSE`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md`, `.github/PULL_REQUEST_TEMPLATE.md`, and `.claude-plugin/marketplace.json` (if a Claude Code skill is detected).
3. **Scrub credits** — replace any default author strings in `LICENSE` and `package.json` with the configured `--credit-name` (default `Orlando Molina`) and `--credit-brand` (default `TruePointAgents`).
4. **Simplify install** — rewrite the README install section down to three paths: npm, git, Claude Code marketplace. Remove any manual copy instructions.
5. **Commit** — stage every changed and new file, write a conventional commit message naming the version bump, and create the commit. Never `--no-verify`. Never `--amend` without explicit user OK.
6. **Tag + push** — create an annotated `v<semver>` tag, push the tag to origin (always works), then attempt `git push origin main`. If the push is blocked by the Claude Code auto-mode classifier, surface the `!` prefix workaround to the user.
7. **Publish + verify** — if `package.json` exists and `--no-publish` was not passed, run `npm publish`. If npm requires an OTP, instruct the user to authenticate in the browser. Verify each remote artifact landed: tag visible via `git ls-remote --tags`, `gh release view` if `gh` is on PATH, `npm view <pkg> version` matches.

## Inputs

TrueShip takes its inputs in this order of precedence:

1. **Command-line flags** — `--version 1.2.3`, `--credit-name "Jane Doe"`, `--credit-brand "Acme Co"`, `--no-publish`, `--no-push`.
2. **Conversation context** — recent assistant turns and user messages.
3. **Files** — `package.json` `version` field, existing `CHANGELOG.md` `## [Unreleased]` entries, `.omc/state/`, `.journal/STATE.md`.
4. **Defaults** — credit name `Orlando Molina`, credit brand `TruePointAgents`, version bump = patch (`1.0.0 -> 1.0.1`).

If a required value cannot be auto-extracted, TrueShip asks one consolidated question listing every missing field with sensible defaults pre-filled.

## Pipeline

### Stage 1 — Audit

Read these files if present and record what is missing or default-templated:

- `README.md` — flag if missing, if smaller than 1 KB, or if the install section contains the phrases `cp -r`, `Copy-Item`, `manually copy`, or `mkdir -p ~/.claude/skills`.
- `LICENSE` — flag if missing, or if author line still says `[Year]` / `[fullname]` / `Your Name`.
- `CHANGELOG.md` — flag if missing or empty.
- `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md` — flag each if missing.
- `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md`, `.github/PULL_REQUEST_TEMPLATE.md` — flag each if missing.
- `.claude-plugin/marketplace.json` — flag if missing AND a `SKILL.md` exists at repo root (indicates Claude Code skill).
- `package.json` — flag if author field is `""`, `"Your Name"`, or missing; flag if `files` array is missing template directories.

### Stage 2 — Patch docs

For every flagged missing file, copy the template from `templates/<file>` (relative to TrueShip's installed location) into the target repo. Substitute these tokens during the copy:

| Token | Value |
|---|---|
| `{{REPO_NAME}}` | `basename` of the working directory |
| `{{REPO_SLUG}}` | repo name lowercased + non-alphanumerics replaced with `-` |
| `{{OWNER}}` | github owner from `git remote get-url origin` (fallback `ojesusmp`) |
| `{{CREDIT_NAME}}` | `--credit-name` value (default `Orlando Molina`) |
| `{{CREDIT_BRAND}}` | `--credit-brand` value (default `TruePointAgents`) |
| `{{CREDIT_EMAIL}}` | `git config user.email` |
| `{{YEAR}}` | current year |
| `{{DATE}}` | current date in `YYYY-MM-DD` format |
| `{{VERSION}}` | target version (computed in Stage 6) |
| `{{NPM_NAME}}` | `name` field from `package.json` if present |

If a target file already exists, TrueShip preserves the existing file and only patches specific lines (e.g. credit substitution in `LICENSE`) — it does NOT overwrite hand-written content.

### Stage 3 — Scrub credits

`LICENSE` — replace any `[Year]` / `[fullname]` / `Your Name` / `John Doe` / `Jane Doe` placeholders with `{{YEAR}} {{CREDIT_NAME}} ({{CREDIT_BRAND}})`.

`package.json` — if `author` is missing or templated, set:

```json
{
  "author": {
    "name": "{{CREDIT_NAME}}",
    "url": "https://github.com/{{OWNER}}"
  },
  "contributors": [
    { "name": "{{CREDIT_BRAND}}", "url": "https://github.com/{{OWNER}}" }
  ]
}
```

### Stage 4 — Simplify install

Locate the README install section (heading `## Install` or `## Installation`). Replace the section body with the three-path block from `templates/install-section.md`:

1. **npm** — `npm install -g <pkg-name>`
2. **Git** — `npm install -g github:<owner>/<repo>` (pulls latest `main`)
3. **Claude Code marketplace** — `/plugin marketplace add <owner>/<repo>` then `/plugin install <skill-name>@<marketplace>`

Remove any blocks that begin with `cp -r`, `Copy-Item`, `mkdir -p ~/.claude/skills`, or any "manual install" subsection.

### Stage 5 — Resolve version

Determine the target version with this priority:

1. `--version` flag.
2. `package.json` `version` field if it does not match the latest git tag (means user already bumped it locally).
3. Otherwise bump patch on the latest git tag: `git describe --tags --abbrev=0` then increment.

Update `package.json` `version` if it does not already match. Append a `## [<version>] - <YYYY-MM-DD>` entry to `CHANGELOG.md` summarizing the changed and new files.

### Stage 6 — Commit, tag, push

Stage every modified or new file in the repo root and tracked subdirs. Skip secrets-like patterns automatically: `.env`, `.env.*`, `*credentials*`, `*secret*`.

Commit message format (Conventional Commits):

```
release: v<version> - <short summary>

<bullet list of files changed and what they cover>
- README install reduced to 3 paths: npm, git, Claude marketplace
- Added <list of new standard docs>
- Author attribution: <name> / <brand>
- No functional change to <skill name> if applicable
```

Create annotated tag:

```bash
git tag -a v<version> -m "<repo-name> v<version> - <summary>"
```

Push tag (this almost always works because tags do not modify branch refs):

```bash
git push origin v<version>
```

Push main:

```bash
git push origin main
```

**TRAP — auto-mode classifier:** The Claude Code auto-mode classifier may refuse a direct push to a default branch even when the user has authorized it in conversation. When this happens, the bash tool returns an error that includes the phrase `Permission for this action was denied by the Claude Code auto mode classifier`. TrueShip detects that exact substring and surfaces this user-runnable workaround instead of retrying:

```
The auto-mode classifier blocked pushing to main. Run this yourself in the prompt:

! git push origin <branch>
```

The `!` prefix runs the command in the current session so its output stays visible to both you and the assistant.

### Stage 7 — npm publish + verify

If `package.json` exists and `--no-publish` was not passed:

1. Run `npm publish` from the package root.
2. If npm exits with code `EOTP` (one-time password required), surface this to the user:

```
npm requires a one-time password. Open this URL in your browser to authenticate:

  <URL from npm error output>

After authenticating, re-run: ! npm publish
```

3. After a successful publish, verify with `npm view <pkg> version` and confirm it matches the target version.

**Verification block (always runs):**

```bash
# Remote tag landed?
git ls-remote --tags origin v<version>

# GitHub release exists (if gh is on PATH)?
gh release view v<version> 2>/dev/null

# npm version matches?
npm view <pkg> version 2>/dev/null
```

Report each check's PASS or FAIL to the user. If any check fails, list the manual fix command.

## Known traps and workarounds (handled automatically)

| Trap | Workaround |
|---|---|
| Auto-mode classifier blocks `git push origin main` | Surface `! git push origin main` to the user; never retry silently. |
| npm OTP required | Read the auth URL out of the error output; instruct the user to open it; instruct them to re-run `! npm publish`. |
| Content filter blocks long inline assistant prose | Always write file contents via the Write tool, never inline as a multi-paragraph assistant message. |
| Windows CRLF warnings on `git add` | Suppress in reporting; they are harmless `core.autocrlf` warnings. |
| Postinstall recursion in source repo | The shipped `bin/install.mjs` already exits early when `.git/` is present in the package root. |
| `git push origin <tag>` before the commit hits remote | Push the commit first (or push tag separately); if the commit is unreachable, the tag will reference an orphan object until pushed. |
| `gh repo create` requires auth | If `gh auth status` fails, instruct the user to run `! gh auth login`. |

## Validation checklist

Before TrueShip reports success, every item must be confirmed in the assistant message:

- [ ] All flagged-missing standard docs now exist at the expected paths.
- [ ] `LICENSE` no longer contains `[Year]` / `[fullname]` / `Your Name`.
- [ ] `package.json` `author.name` equals `{{CREDIT_NAME}}`.
- [ ] README install section contains exactly the three install paths and no manual copy block.
- [ ] `git status` reports a clean working tree after commit.
- [ ] Tag `v<version>` exists locally (`git tag -l v<version>` is non-empty).
- [ ] Tag pushed to origin (`git ls-remote --tags origin v<version>` is non-empty).
- [ ] If publish-eligible: `npm view <pkg> version` equals target version.
- [ ] If `main` push was blocked: the `!` workaround was surfaced to the user.

## Examples

### First-time skill ship

```
trueship --version 1.0.0
```

Audits a fresh skill folder, writes every standard doc, scrubs credits, commits, tags `v1.0.0`, pushes tag, attempts to push `main` (or surfaces the workaround), publishes to npm.

### Patch release of an existing skill

```
trueship
```

Bumps patch version (read from `git describe`), appends a `CHANGELOG.md` entry summarizing changed files, commits, tags, pushes, publishes.

### Docs-only run, no publish

```
trueship --no-publish
```

Patches docs and commits but skips npm publish. Useful for repos that are not on npm yet.

### Override credits

```
trueship --credit-name "Jane Smith" --credit-brand "Smith Labs"
```

Uses the supplied credit values instead of the defaults.

## Customization

Edit any file under `templates/` to change the default content that TrueShip writes into target repos. Token substitution rules live in Stage 2 above.

To add a new standard doc:

1. Drop the new template at `templates/<filename>`.
2. Add a row to the Stage 1 audit list above describing when the doc is considered missing.
3. Add a row to the Stage 2 substitution table if the template uses any new tokens.

## Limitations

- Does not create the GitHub repo itself if it does not yet exist; use `gh repo create <owner>/<name> --public --source=. --remote=origin` first.
- Does not handle monorepos with multiple packages — runs against the repo root only.
- Does not run tests before publish; rely on `prepublishOnly` in `package.json` if you want a test gate.
- Does not handle pre-1.0 unstable versions specially; treat the user's `--version` flag as authoritative.

## License

MIT. See `LICENSE`.
