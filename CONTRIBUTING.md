# Contributing to TrueShip

Thanks for your interest in improving `trueship`. This document explains how to propose changes, what the project's design constraints are, and how the maintainer reviews contributions.

## Project goals

Before contributing, make sure your change aligns with these non-negotiable goals. Anything that violates them is out of scope regardless of how well-written the patch is.

1. **One-turn ship.** From trigger to verified remote artifacts, the pipeline must complete inside a single assistant turn whenever the user-in-the-loop steps (OTP, classifier workaround) are not required. Adding interactive prompts or multi-turn flows is a regression.
2. **Encode known traps.** Every real-world failure mode encountered in production should be encoded in the skill once and never surprise a user again. New traps land as rows in the SKILL.md "Known traps" table, not as silent retries.
3. **Idempotent.** Re-running TrueShip on a repo that is already shipped must not corrupt state, duplicate commits, or push broken refs.
4. **Template-first.** Every standard doc TrueShip writes lives under `templates/` and is editable without touching SKILL.md logic.
5. **Token substitution stays small.** Tokens are listed in SKILL.md Stage 2. Adding a new token requires a documented source and a default fallback.

## Ways to contribute

- **Bug reports** — open an issue using the bug template. Include the exact assistant turn that misbehaved and the resulting `git status` / `npm publish` output.
- **Feature requests** — open an issue using the feature template. Describe the user problem first, then propose a solution.
- **Pull requests** — small, focused, with a manual verification plan included in the description.
- **Template improvements** — edits to files under `templates/` are always welcome.
- **Trap encoding** — discovered a new ship-time failure? Add a row to the "Known traps" table in SKILL.md and a matching handler in the skill flow.

## Pull request workflow

1. Fork the repo and create a feature branch from `main`.
2. Make your change. Keep diffs small and focused — one logical change per pull request.
3. Update `CHANGELOG.md` under an `## [Unreleased]` heading describing what you changed.
4. Run the verification steps below.
5. Open a pull request against `main` using the provided template.
6. Be patient — review may take a few days.

## Verification before opening a pull request

For changes that touch `SKILL.md`:

- Confirm the file is under ~400 lines.
- Confirm the YAML frontmatter has no tabs and the `description` field still contains exactly the five auto-fire trigger phrases verbatim.
- Confirm the seven pipeline stages are still numbered consecutively and each stage has a name + body.

For changes that touch `templates/`:

- Open each modified template and confirm any new tokens use the `{{TOKEN_NAME}}` syntax.
- Confirm any new template files are listed in the README "What TrueShip writes" table.

For changes that touch `bin/install.mjs`:

- Run `node bin/install.mjs --dry-run` from the package root and confirm it lists every file in the `files` array from `package.json`.
- Run `npm pack --dry-run` and confirm the tarball contents match expectations.

## Coding conventions

- Use 2-space indentation in JavaScript, JSON, and HTML.
- Prefer plain ASCII characters in source. Templates may contain Unicode where needed.
- Match the existing code style. If you would do it differently personally, match the file you are editing.
- Do not add new top-level dependencies to `package.json`. The package is intentionally zero-dependency.
- Do not add new top-level files unless you are also updating `package.json` `files` and the README.

## Reporting security issues

Do **not** open a public issue for security-related reports. Follow the process in [SECURITY.md](./SECURITY.md).

## Code of conduct

By participating in this project, you agree to abide by the [Contributor Covenant](./CODE_OF_CONDUCT.md).
