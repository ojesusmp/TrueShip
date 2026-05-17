# TrueShip

> Audit, standardize, commit, tag, push, and publish a repository in one assistant turn.

[![npm version](https://img.shields.io/npm/v/@ojesusmp/trueship.svg)](https://www.npmjs.com/package/@ojesusmp/trueship)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blueviolet)](https://docs.anthropic.com/en/docs/claude-code)

**TrueShip** is a Claude Code skill that takes a working repository — fresh skill folder or established project — and ships it to GitHub + npm + the Claude Code plugin marketplace in a single assistant turn. It writes missing standard documentation, scrubs default credit strings, simplifies install instructions, commits, tags, pushes, publishes, and verifies that every artifact landed on the remote.

TrueShip knows the real-world traps that broke previous releases — the Claude Code auto-mode classifier blocking `git push origin main`, npm requiring a browser-based one-time password, content-filter trips on long inline assistant prose, Windows CRLF noise — and surfaces clean workarounds instead of looping silently on errors.

---

## Why TrueShip

Shipping a small repo properly takes ten different commands and four pieces of tribal knowledge. Forget one and the release sits in an inconsistent state — committed but not pushed, tagged but not released, published but with `[fullname]` still in the LICENSE.

TrueShip rolls the whole release dance into one trigger phrase. It also encodes the failure modes that show up during real ship-it sessions, so you do not have to remember them again next quarter.

---

## Install

Three discrete paths. Pick one.

### 1. Claude Code plugin marketplace

Inside Claude Code:

```
/plugin marketplace add ojesusmp/TrueShip
/plugin install trueship@trueship
```

**Verify:** open a fresh Claude Code conversation and type `trueship`. The skill audits the current working directory and reports what it would change.

### 2. Git clone (manual)

> Git does not run install scripts — the copy step is manual.

```bash
git clone https://github.com/ojesusmp/TrueShip.git
```

POSIX:

```bash
mkdir -p ~/.claude/skills/trueship
cp TrueShip/SKILL.md ~/.claude/skills/trueship/SKILL.md
```

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills\trueship" | Out-Null
Copy-Item "TrueShip\SKILL.md" "$env:USERPROFILE\.claude\skills\trueship\SKILL.md"
```

**Verify:**

```bash
sha256sum ~/.claude/skills/trueship/SKILL.md
```

```powershell
(Get-FileHash "$env:USERPROFILE\.claude\skills\trueship\SKILL.md" -Algorithm SHA256).Hash
```

### 3. npm (postinstall auto-copies SKILL.md)

```bash
npm install -g @ojesusmp/trueship
```

Latest unreleased from GitHub:

```bash
npm install -g github:ojesusmp/TrueShip
```

**Verify:** the postinstall log prints `[trueship install] copied (sha256=…)`. Re-check independently:

```bash
sha256sum ~/.claude/skills/trueship/SKILL.md
```

```powershell
(Get-FileHash "$env:USERPROFILE\.claude\skills\trueship\SKILL.md" -Algorithm SHA256).Hash
```

> **Windows quirk:** `npm install -g github:ojesusmp/TrueShip` on Windows + Node 24 + npm 11 may print `MODULE_NOT_FOUND` and exit 1 even though the postinstall copied SKILL.md successfully. Verify with the SHA above. For a clean exit, use `npm pack github:ojesusmp/TrueShip` then `npm install -g <generated>.tgz`.

---

## Trigger words

These phrases tell Claude to run TrueShip automatically:

- `trueship`
- `/trueship`
- `ship this repo`
- `prepare repo for release`
- `publish skill to github and npm`

These phrases make Claude offer TrueShip (it will ask first, not run automatically):

- `release time`
- `ready to ship`
- `is this ready to publish`

---

## Usage examples

### First-time skill release

```
trueship --version 1.0.0
```

Audits a fresh skill folder, writes every standard doc, scrubs credits, commits, tags `v1.0.0`, pushes the tag, attempts to push `main` (or surfaces the workaround if the auto-mode classifier blocks it), and publishes to npm.

### Patch release of an existing skill

```
trueship
```

Bumps the patch version (read from `git describe --tags`), appends a `CHANGELOG.md` entry summarizing the changed files, commits, tags, pushes, and publishes.

### Docs-only run, skip npm

```
trueship --no-publish
```

Writes the standard docs and commits, but skips `npm publish`. Useful for repos that are not on npm.

### Override credits

```
trueship --credit-name "Jane Smith" --credit-brand "Smith Labs"
```

Uses the supplied credit values instead of the defaults (`Orlando Molina` / `TruePointAgents`).

---

## What TrueShip writes

If any of these files are missing from the working directory, TrueShip writes them using the templates under `templates/`:

| File | Source template |
|------|-----------------|
| `README.md` | `templates/README.md` (only if README is missing or smaller than 1 KB) |
| `LICENSE` | `templates/LICENSE.template` (MIT, with credit substitution) |
| `CHANGELOG.md` | `templates/CHANGELOG.md` |
| `CODE_OF_CONDUCT.md` | `templates/CODE_OF_CONDUCT.md` |
| `CONTRIBUTING.md` | `templates/CONTRIBUTING.md` |
| `SECURITY.md` | `templates/SECURITY.md` |
| `.github/ISSUE_TEMPLATE/bug_report.md` | `templates/.github/ISSUE_TEMPLATE/bug_report.md` |
| `.github/ISSUE_TEMPLATE/feature_request.md` | `templates/.github/ISSUE_TEMPLATE/feature_request.md` |
| `.github/PULL_REQUEST_TEMPLATE.md` | `templates/.github/PULL_REQUEST_TEMPLATE.md` |
| `.claude-plugin/marketplace.json` | `templates/.claude-plugin/marketplace.json` (only if a `SKILL.md` exists at repo root) |
| `.namecheck.txt` | `templates/.namecheck.txt` (seed-only — canonical placeholder patterns for the Stage 0 name audit) |
| `.gitignore` | `templates/.gitignore` (seed-only — Stage 9 minimum patterns; merged in-place, never removes existing entries) |

If a target file already exists, TrueShip preserves the existing content and only patches specific lines — credit strings in `LICENSE`, author fields in `package.json`, and the install section of `README.md`.

---

## Known traps TrueShip handles

| Trap | TrueShip's response |
|------|---------------------|
| Auto-mode classifier blocks `git push origin main` | Surfaces `! git push origin main` to the user so they can run it inline; never retries silently. |
| npm requires OTP | Reads the auth URL from npm's error output; tells the user to open it and re-run `! npm publish`. |
| Content filter blocks long inline assistant prose | Writes all file content via the Write tool, never as multi-paragraph assistant messages. |
| Windows CRLF warnings on `git add` | Suppresses them in reporting; they are harmless `core.autocrlf` warnings. |
| Postinstall recursion when running from source repo | The shipped `install.cjs` exits early when a `.git/` directory is present in the package root; bypass with `--force`. |
| Windows + Node 24 + npm 11 `MODULE_NOT_FOUND` exit 1 on `github:` install | Cosmetic — the postinstall completed. Verify with the printed SHA-256, or use `npm pack` + local tarball for a clean exit. |
| `gh repo create` requires auth | Surfaces `! gh auth login` if `gh auth status` fails. |

---

## Customization

Edit any file under `templates/` to change the default content TrueShip writes into target repos.

### Tokens substituted during copy

| Token | Source |
|-------|--------|
| `{{REPO_NAME}}` | working-directory basename |
| `{{REPO_SLUG}}` | repo name lowercased, non-alphanumerics replaced with `-` |
| `{{OWNER}}` | github owner from `git remote get-url origin` (fallback `ojesusmp`) |
| `{{CREDIT_NAME}}` | `--credit-name` value or default `Orlando Molina` |
| `{{CREDIT_BRAND}}` | `--credit-brand` value or default `TruePointAgents` |
| `{{CREDIT_EMAIL}}` | `git config user.email` |
| `{{YEAR}}` | current year |
| `{{VERSION}}` | target version (auto-computed or `--version` flag) |
| `{{NPM_NAME}}` | `name` field from `package.json` if present |

### Adding a new standard doc

1. Drop the new template at `templates/<filename>`.
2. Edit `SKILL.md` Stage 1 audit section to flag the doc when missing.
3. Edit the Stage 2 substitution table if the template uses any new tokens.

---

## Limitations

- TrueShip does not create the GitHub repository itself if it does not exist yet. Run `gh repo create <owner>/<name> --public --source=. --remote=origin` first.
- TrueShip runs against a single repo root — it does not yet handle monorepos with multiple packages.
- TrueShip does not run the test suite before publishing. Use `prepublishOnly` in `package.json` if you want a test gate.
- TrueShip treats the `--version` flag as authoritative for pre-1.0 unstable versions; no special handling for alpha or beta channels yet.

---

## Troubleshooting

### `trueship` does not fire after I type it

- Confirm the skill is in your Claude Code skills directory: `~/.claude/skills/trueship/SKILL.md` should exist.
- Restart Claude Code or refresh the skill registry.
- Check for collisions with other installed skills that claim similar trigger phrases.

### `npm install -g @ojesusmp/trueship` fails

- Ensure Node `>=18`.
- In CI, set `TRUESHIP_SKIP_POSTINSTALL=1` to bypass the postinstall copy.

### Push to main was blocked

- This is the auto-mode classifier protecting your default branch. Run the push yourself:
  ```
  ! git push origin main
  ```
- The `!` prefix runs the command in the current Claude Code session so the output stays visible.

### npm publish hangs on OTP

- npm 9+ requires a browser-based one-time password for publishing. Open the URL printed in the npm error message, authenticate, then re-run:
  ```
  ! npm publish
  ```

---

## Contributing

Pull requests and issues welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow and conventions.

---

## Security

If you discover a way TrueShip writes outside the working directory, leaks secrets in a commit, or runs a network call it should not, follow the disclosure process in [SECURITY.md](./SECURITY.md). Do not open a public issue for security reports.

---

## Credits

Built and maintained by **Orlando Molina** under **TruePointAgents**.

Companion skill to [explica](https://github.com/ojesusmp/TrueExplica) — same brand, same opinion on portable artifacts and honest provenance.

---

## License

Released under the [MIT License](./LICENSE).
