# Changelog

All notable changes to the `trueship` skill are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-17

### Changed

- Installer relocated from `bin/install.mjs` to root `install.cjs` (CommonJS, lessons §2.2/§2.3).
- Installer now SHA-256-verifies every copied file and exits non-zero on mismatch; adds `--force` bypass for the `.git/` source-checkout guard.
- `package.json`: removed `"type": "module"` and the `bin` field; `postinstall` and `test` scripts now reference `install.cjs` at the repo root.
- `SKILL.md`: full restructure to encode the v1.0→v1.3.2 session lessons. Added Stage 0 (pre-tag name/path/identity audits, BLOCKING), Stage 1.5 (installer-location & CJS convention check, BLOCKING), Stage 4.5 (README install-section enforcement: 3 paths + Verify each, BLOCKING), Stage 5.5 (message-passing discipline via `-F`/`--notes-file`, BLOCKING), Stage 6 (version-semantics + `### Fixed` → `### Changed` rule for unverified symptom fixes), Stage 7 (Windows + Node 24 + npm 11 `MODULE_NOT_FOUND` documentation requirement), Stage 8 (privacy hygiene cross-reference), Stage 9 (.gitignore minimums), Stage 10 (final SHA-match verification). Added the §5 anti-patterns refuse-to-ship list and the "Ship the deploy / Document the quirk / Verify the hash / Scrub the names / Use the file flag" mantra.
- `SKILL.md`: Stage 0 upgraded from refuse-only to a finalization scrub. On any name/path/identity hit, step 0d asks whether the product is finished — a draft keeps everything with an advisory list; a finished product scrubs local paths, third-party names, addresses, and identity tokens (one consolidated confirmation), keeps the credit, and asks per-run whether to keep the email. Stage 8, the anti-patterns list, and the validation checklist updated to reference the 0d decision.
- `templates/install-section.md`: rewritten to the three-discrete-paths shape (marketplace → git clone manual → npm) with a `**Verify:**` block per path and the Windows quirk note attached to the npm path.
- `README.md`: install section rewritten to match Stage 4.5; traps table updated to reference `install.cjs` and to document the Windows `MODULE_NOT_FOUND` cosmetic exit-1.
- `.gitignore`: added release-prep scratch patterns (`.commit-msg-*.tmp`, `.release-notes-*.tmp.md`), secrets defense-in-depth globs (`*credentials*`, `*secret*`), and editor/OS noise (`Thumbs.db`, `*.swp`, `.vscode/`, `.idea/`).
- Added `.namecheck.txt` at repo root (inert sentinel pattern; TrueShip's own docs would otherwise self-match the canonical defaults).
- Added `templates/.namecheck.txt` containing the canonical placeholder patterns (`[fullname]`, `[year]`, `your name`, `john doe`, `jane doe`) that get seeded into target repos during ship.
- Added `templates/.gitignore` mirroring the Stage 9 minimums for seeding target repos.

### Removed

- `bin/install.mjs` and the empty `bin/` directory.

## [1.0.0] - 2026-05-10

### Added

- Initial release of the `trueship` Claude Code skill.
- Seven-stage ship pipeline: audit, patch docs, scrub credits, simplify install, commit, tag + push, publish + verify.
- Standard documentation templates for any target repo: `README.md`, `LICENSE`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, GitHub issue + pull-request templates, `.claude-plugin/marketplace.json` for Claude Code skill repos.
- Five auto-fire trigger phrases: `trueship`, `/trueship`, `ship this repo`, `prepare repo for release`, `publish skill to github and npm`.
- Three soft-suggestion phrases: `release time`, `ready to ship`, `is this ready to publish`.
- Token substitution during template copy: `{{REPO_NAME}}`, `{{REPO_SLUG}}`, `{{OWNER}}`, `{{CREDIT_NAME}}`, `{{CREDIT_BRAND}}`, `{{CREDIT_EMAIL}}`, `{{YEAR}}`, `{{VERSION}}`, `{{NPM_NAME}}`.
- Encoded workarounds for the auto-mode classifier blocking direct pushes to `main`, npm OTP browser flow, content-filter trips on long inline prose, Windows CRLF noise, and postinstall recursion when running from a source repo.
- npm install via `npm install -g @ojesusmp/trueship` with a cross-platform postinstall script that copies the skill into the user's Claude Code skills directory.
- MIT licensed.

### Known limitations

- Does not create the GitHub repository itself; run `gh repo create` first.
- Does not handle monorepos with multiple packages.
- Does not run the test suite before publishing — use `prepublishOnly` in `package.json` if you want a test gate.

### Planned for v1.1

- Optional pre-publish test gate that runs `npm test` and aborts on failure.
- Monorepo support: detect `workspaces` in `package.json` and ship each member package in order.
- `--dry-run` flag that reports every action without writing or pushing anything.

[1.1.0]: https://github.com/ojesusmp/TrueShip/releases/tag/v1.1.0
[1.0.0]: https://github.com/ojesusmp/TrueShip/releases/tag/v1.0.0
