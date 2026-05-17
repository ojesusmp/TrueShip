## Install

Three discrete paths. Pick one.

### 1. Claude Code plugin marketplace

Inside Claude Code:

```
/plugin marketplace add {{OWNER}}/{{REPO_NAME}}
/plugin install {{REPO_SLUG}}@{{REPO_SLUG}}
```

**Verify:** open a fresh Claude Code conversation, trigger the skill name, and confirm it responds.

### 2. Git clone (manual)

> Git does not run install scripts — the copy step is manual.

```bash
git clone https://github.com/{{OWNER}}/{{REPO_NAME}}.git
```

POSIX:

```bash
mkdir -p ~/.claude/skills/{{REPO_SLUG}}
cp {{REPO_NAME}}/SKILL.md ~/.claude/skills/{{REPO_SLUG}}/SKILL.md
```

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills\{{REPO_SLUG}}" | Out-Null
Copy-Item "{{REPO_NAME}}\SKILL.md" "$env:USERPROFILE\.claude\skills\{{REPO_SLUG}}\SKILL.md"
```

**Verify:**

```bash
sha256sum ~/.claude/skills/{{REPO_SLUG}}/SKILL.md
```

```powershell
(Get-FileHash "$env:USERPROFILE\.claude\skills\{{REPO_SLUG}}\SKILL.md" -Algorithm SHA256).Hash
```

### 3. npm (postinstall auto-copies SKILL.md)

```bash
npm install -g {{NPM_NAME}}
```

**Verify:** the postinstall log prints `[install] copied (sha256=…)`. To re-check independently:

```bash
sha256sum ~/.claude/skills/{{REPO_SLUG}}/SKILL.md
```

```powershell
(Get-FileHash "$env:USERPROFILE\.claude\skills\{{REPO_SLUG}}\SKILL.md" -Algorithm SHA256).Hash
```

> **Windows quirk:** `npm install -g github:{{OWNER}}/{{REPO_NAME}}` on Windows + Node 24 + npm 11 may print `MODULE_NOT_FOUND` and exit 1 even though the postinstall copied SKILL.md successfully. Verify with the SHA above. For a clean exit, use `npm pack github:{{OWNER}}/{{REPO_NAME}}` then `npm install -g <generated>.tgz`.
