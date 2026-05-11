## Summary

A one or two sentence description of what this pull request changes and why.

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Documentation update
- [ ] Template change (`templates/`)
- [ ] Skill behavior change (`SKILL.md`)
- [ ] Install script change (`bin/install.mjs`)
- [ ] Trap encoding (new known failure handled)
- [ ] Other (please describe)

## Linked issue

Closes #(issue number) — or "N/A" if no issue was filed.

## Verification

Confirm that the relevant checks from `CONTRIBUTING.md` were run. Tick all that apply:

- [ ] `SKILL.md` changes: file under ~400 lines, YAML frontmatter has no tabs, description contains all five auto-fire trigger phrases verbatim, seven pipeline stages still numbered consecutively.
- [ ] `templates/` changes: any new tokens use `{{TOKEN_NAME}}` syntax, any new template files listed in the README.
- [ ] `bin/install.mjs` changes: ran `node bin/install.mjs --dry-run` and `npm pack --dry-run`; both produced expected output.
- [ ] Updated `CHANGELOG.md` under `## [Unreleased]` describing the change.

## Compatibility with project goals

- [ ] One-turn ship maintained.
- [ ] New trap (if any) encoded as a row in the SKILL.md "Known traps" table.
- [ ] Idempotent — re-running on an already-shipped repo still works.
- [ ] Template-first — no business logic moved out of `templates/` into `SKILL.md`.

## Manual verification plan

How did you confirm the change works end-to-end? List the commands run and the observed result.

## Additional notes

Anything reviewers should know — tradeoffs, follow-up work, related discussion, etc.
