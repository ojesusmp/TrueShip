---
name: Feature request
about: Suggest a new feature or improvement.
title: "[Feature] "
labels: enhancement
assignees: ojesusmp
---

## Problem

Describe the user problem this feature would solve. Start with the user, not the solution.

Example: "When TrueShip detects a missing CHANGELOG it writes the whole file from scratch, overwriting the previous Unreleased section I had typed by hand."

## Proposed solution

Describe what you would like to happen. Be as specific as you can.

## Alternatives considered

Other approaches you thought about and why you did not choose them.

## Compatibility with project goals

Confirm that the proposed feature does not violate any of these non-negotiable goals (see `CONTRIBUTING.md`):

- [ ] One-turn ship — the pipeline completes inside a single assistant turn whenever user-in-the-loop steps are not required.
- [ ] Encode known traps — new failure modes land in the SKILL.md traps table, not as silent retries.
- [ ] Idempotent — re-running on an already-shipped repo must not corrupt state or duplicate commits.
- [ ] Template-first — standard docs live under `templates/` and are editable without touching SKILL.md logic.
- [ ] Token substitution stays small — new tokens require a documented source and a default fallback.

If your proposal does conflict with one of these goals, explain why the conflict is worth it.

## Additional context

Screenshots, related issues, or links to similar features elsewhere.
