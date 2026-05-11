# Security policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `1.0.x` | Yes |
| `< 1.0` | No (pre-release) |

Security fixes are backported only to the most recent minor version line.

## Reporting a vulnerability

If you discover a security issue in `trueship` — for example a way to make the skill write outside the working directory, leak secrets in a commit, run an undocumented network call, or escalate privileges via the postinstall script — please report it privately.

### How to report

1. Do **not** open a public GitHub issue for security reports. Public issues are visible immediately.
2. Use GitHub's private vulnerability reporting feature on this repository: open the "Security" tab and follow the prompts under "Report a vulnerability." That submission is visible only to maintainers.

### What to include

Please include enough detail for a maintainer to reproduce and assess the issue:

- A clear description of the issue and its impact.
- Steps to reproduce, or a minimal proof of concept.
- The affected version(s) of `trueship` (run `npm view @ojesusmp/trueship version` if unsure).
- Any mitigating factors or workarounds you have identified.

### What to expect

- Acknowledgment within 7 days.
- An initial assessment and proposed remediation timeline within 14 days.
- A fix released as a patch version, with a corresponding CHANGELOG entry crediting the reporter (if they wish to be credited).

## Threat model

`trueship` is a release-automation skill. Its security surface includes:

- **In scope:** The skill must not write outside the working directory, must not commit secrets-like patterns (`.env`, credential files), must not push to repositories the user did not authorize, must not exfiltrate data via network calls. The postinstall script must not write outside the user's Claude Code skills directory.
- **Out of scope:** Issues with the Claude Code platform itself, the user's terminal, git, npm, or third-party skills are not handled here — please report those to their respective maintainers.

## Past advisories

None at this time.
