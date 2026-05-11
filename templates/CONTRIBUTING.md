# Contributing to {{REPO_NAME}}

Thanks for your interest in improving `{{REPO_NAME}}`. This document explains how to propose changes, what the project's design constraints are, and how the maintainer reviews contributions.

## Ways to contribute

- **Bug reports** — open an issue using the bug template.
- **Feature requests** — open an issue using the feature template. Describe the user problem first, then propose a solution.
- **Pull requests** — small, focused, with tests or a manual verification plan.
- **Documentation** — README, CHANGELOG, glossary improvements are always welcome.

## Pull request workflow

1. Fork the repo and create a feature branch from `main`.
2. Make your change. Keep diffs small and focused — one logical change per pull request.
3. Update `CHANGELOG.md` under an `## [Unreleased]` heading describing what you changed.
4. Run any verification steps relevant to the file you edited.
5. Open a pull request against `main` using the provided template.
6. Be patient — review may take a few days.

## Coding conventions

- Match the existing code style. If you would do it differently personally, match the file you are editing.
- Use plain ASCII characters in source unless the file requires Unicode for content reasons.
- Do not add new top-level dependencies without a clear justification in the PR description.
- Do not add new top-level files unless you are also updating documentation that references them.

## Reporting security issues

Do **not** open a public issue for security-related reports. Follow the process in [SECURITY.md](./SECURITY.md).

## Code of conduct

By participating in this project, you agree to abide by the [Contributor Covenant](./CODE_OF_CONDUCT.md).
