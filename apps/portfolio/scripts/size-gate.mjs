import { execFile } from "node:child_process";
import { globSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Bundle-budget gate wrapper around size-limit.
 *
 * Why not call size-limit directly? Its JSON report marks an entry
 * passed=true with size 0 when a configured path glob matches no files,
 * so a renamed/moved chunk silently loses budget coverage (vacuous pass).
 *
 * This wrapper (spec: Size-Limit Glob Integrity, hero-video-liquid-glass):
 *   1. Verifies every .size-limit.json glob matches >= 1 file BEFORE
 *      running size-limit — an unmatched glob fails the gate.
 *   2. Parses the JSON report and fails on any real budget violation
 *      (passed === false) or a broken config / unparsable report.
 */

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── 1. Glob integrity guard (no vacuous pass) ──────────────────────────
let entries;
try {
  entries = JSON.parse(readFileSync(path.join(appRoot, ".size-limit.json"), "utf8"));
} catch {
  console.error("size-gate: could not read/parse .size-limit.json");
  process.exit(1);
}

if (!Array.isArray(entries) || entries.length === 0) {
  console.error("size-gate: .size-limit.json declares no entries");
  process.exit(1);
}

const staleGlobs = entries.filter(
  (entry) => globSync(entry.path, { cwd: appRoot }).length === 0,
);

if (staleGlobs.length > 0) {
  for (const entry of staleGlobs) {
    console.error(
      `size-gate: [STALE GLOB] "${entry.name}" — glob "${entry.path}" matches no files (vacuous pass blocked)`,
    );
  }
  process.exit(1);
}

// ── 2. Budget check via size-limit JSON report ─────────────────────────
function runSizeLimit() {
  return new Promise((resolve) => {
    execFile(
      "pnpm",
      ["exec", "size-limit", "--json"],
      { cwd: appRoot, encoding: "utf8" },
      (_error, stdout, stderr) => resolve({ stdout, stderr }),
    );
  });
}

const { stdout, stderr } = await runSizeLimit();

let report;
try {
  report = JSON.parse(stdout);
} catch {
  console.error("size-gate: size-limit did not produce a JSON report");
  if (stderr) console.error(stderr);
  process.exit(1);
}

if (!Array.isArray(report) || report.length === 0) {
  console.error("size-gate: empty size-limit report — check .size-limit.json");
  process.exit(1);
}

const failures = report.filter((entry) => entry.passed === false);

for (const entry of report) {
  const status = entry.passed === false ? "FAIL" : "ok";
  console.log(`size-gate: [${status}] ${entry.name} — ${entry.size} bytes`);
}

if (failures.length > 0) {
  console.error(
    `size-gate: ${failures.length} bundle budget violation(s) — see report above`,
  );
  process.exit(1);
}
