#!/usr/bin/env node
// Postinstall: copy trueship skill files into the user's Claude Code skills dir.
// Cross-platform (Windows / macOS / Linux). Idempotent. Safe to re-run.
// CommonJS by design — see TRUESHIP_LESSONS §2.3.

const { existsSync, mkdirSync, copyFileSync, readdirSync, statSync, readFileSync } = require("node:fs");
const { homedir, platform } = require("node:os");
const { join, dirname, resolve } = require("node:path");
const { createHash } = require("node:crypto");

const pkgRoot = __dirname;
const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

function log(msg) { process.stdout.write(`[trueship install] ${msg}\n`); }
function warn(msg) { process.stderr.write(`[trueship install] WARN: ${msg}\n`); }

if (process.env.CI === "true" || process.env.TRUESHIP_SKIP_POSTINSTALL === "1") {
  log("CI or TRUESHIP_SKIP_POSTINSTALL set — skipping install copy.");
  process.exit(0);
}

// .git guard — avoid copying source checkout into user's deployed skills dir.
// Bypass with --force.
if (existsSync(join(pkgRoot, ".git")) && !FORCE) {
  log("Running inside source repo (.git present) — skipping. Use --force to override.");
  process.exit(0);
}

const targetRoot = join(homedir(), ".claude", "skills", "trueship");

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function copyAndVerify(src, dst) {
  if (DRY_RUN) { log(`would copy: ${src} -> ${dst}`); return; }
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
  const a = sha256(src);
  const b = sha256(dst);
  if (a !== b) {
    warn(`SHA mismatch after copy: ${dst}`);
    warn(`  src=${a}`);
    warn(`  dst=${b}`);
    process.exit(1);
  }
  log(`copied (sha256=${a.slice(0, 12)}…): ${dst}`);
}

function copyDirRecursive(src, dest) {
  if (!existsSync(dest) && !DRY_RUN) mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) copyDirRecursive(s, d);
    else copyAndVerify(s, d);
  }
}

function copyFileIfExists(srcRel, destDir) {
  const s = join(pkgRoot, srcRel);
  if (!existsSync(s)) { warn(`source missing: ${srcRel}`); return; }
  copyAndVerify(s, join(destDir, srcRel));
}

try {
  log(`platform: ${platform()}`);
  log(`source:   ${pkgRoot}`);
  log(`target:   ${targetRoot}`);
  if (DRY_RUN) log("DRY RUN — no files will be written");

  if (!DRY_RUN && !existsSync(targetRoot)) mkdirSync(targetRoot, { recursive: true });

  copyFileIfExists("SKILL.md", targetRoot);
  copyFileIfExists("README.md", targetRoot);
  copyFileIfExists("LICENSE", targetRoot);
  copyFileIfExists("CHANGELOG.md", targetRoot);

  const tplSrc = join(pkgRoot, "templates");
  if (existsSync(tplSrc)) copyDirRecursive(tplSrc, join(targetRoot, "templates"));
  else warn("templates/ directory missing in package");

  log("done. Skill installed at: " + targetRoot);
  log("In Claude Code, trigger with: trueship");
  log("Windows + npm install -g github:… may print MODULE_NOT_FOUND and exit 1 even on success.");
  log("Verify the SHA above matches the source; or use `npm pack` + local tarball for a clean exit.");
} catch (err) {
  warn("install failed: " + (err && err.message ? err.message : String(err)));
  warn("You can manually copy files from " + pkgRoot + " to " + targetRoot);
  process.exit(0);
}
