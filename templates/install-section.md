## Install

Pick one. All three install the skill into your Claude Code skills directory automatically — no file copying, no path tweaking.

### 1. npm (recommended)

```bash
npm install -g {{NPM_NAME}}
```

Update later with the same command.

### 2. Git (latest unreleased code)

```bash
npm install -g github:{{OWNER}}/{{REPO_NAME}}
```

Same postinstall, but pulls straight from the repo's `main` branch.

### 3. Claude Code plugin marketplace

Inside Claude Code:

```
/plugin marketplace add {{OWNER}}/{{REPO_NAME}}
/plugin install {{REPO_SLUG}}@{{REPO_SLUG}}
```

### Verify

In a fresh Claude Code conversation, trigger the skill and confirm it responds.
