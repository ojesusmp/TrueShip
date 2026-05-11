#!/usr/bin/env node
// Postinstall: copy trueship skill files into the user's Claude Code skills dir.
// Cross-platform (Windows / macOS / Linux). Idempotent. Safe to re-run.
// Skip in CI and skip when running inside the source repo itself.

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, "..");

const DRY_RUN = process.argv.includes("--dry-run");

function log(msg) {
  process.stdout.write(`[trueship install] ${msg}\n`);
}
function warn(msg) {
  process.stderr.write(`[trueship install] WARN: ${msg}\n`);
}

if (process.env.CI === "true" || process.env.TRUESHIP_SKIP_POSTINSTALL === "1") {
  log("CI or TRUESHIP_SKIP_POSTINSTALL set — skipping install copy.");
  process.exit(0);
}

// Avoid copying the source repo into the user's skills dir during development.
if (existsSync(join(pkgRoot, ".git"))) {
  log("Running inside source repo — skipping install copy (use git clone for dev).");
  process.exit(0);
}

const targetRoot = join(homedir(), ".claude", "skills", "trueship");

function copyDirRecursive(src, dest) {
  if (!existsSync(dest)) {
    if (DRY_RUN) {
      log(`would create dir: ${dest}`);
    } else {
      mkdirSync(dest, { recursive: true });
    }
  }
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    const st = statSync(s);
    if (st.isDirectory()) {
      copyDirRecursive(s, d);
    } else {
      if (DRY_RUN) {
        log(`would copy: ${s} -> ${d}`);
      } else {
        copyFileSync(s, d);
      }
    }
  }
}

function copyFileIfExists(srcRel, destDir) {
  const s = join(pkgRoot, srcRel);
  if (!existsSync(s)) {
    warn(`source missing: ${srcRel}`);
    return;
  }
  const d = join(destDir, srcRel);
  if (DRY_RUN) {
    log(`would copy: ${s} -> ${d}`);
    return;
  }
  mkdirSync(dirname(d), { recursive: true });
  copyFileSync(s, d);
}

try {
  log(`platform: ${platform()}`);
  log(`source:   ${pkgRoot}`);
  log(`target:   ${targetRoot}`);
  if (DRY_RUN) log("DRY RUN — no files will be written");

  if (!DRY_RUN && !existsSync(targetRoot)) {
    mkdirSync(targetRoot, { recursive: true });
  }

  copyFileIfExists("SKILL.md", targetRoot);
  copyFileIfExists("README.md", targetRoot);
  copyFileIfExists("LICENSE", targetRoot);
  copyFileIfExists("CHANGELOG.md", targetRoot);

  const tplSrc = join(pkgRoot, "templates");
  if (existsSync(tplSrc)) {
    copyDirRecursive(tplSrc, join(targetRoot, "templates"));
  } else {
    warn("templates/ directory missing in package");
  }

  log("done. Skill installed at: " + targetRoot);
  log("In Claude Code, trigger with: trueship");
} catch (err) {
  warn("install failed: " + (err && err.message ? err.message : String(err)));
  warn("You can manually copy files from " + pkgRoot + " to " + targetRoot);
  process.exit(0);
}
