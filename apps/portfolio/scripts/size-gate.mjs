import { execFile } from "node:child_process";

/**
 * Bundle-budget gate wrapper around size-limit (liquid-glass-revival Phase 0.4).
 *
 * Why not call size-limit directly? Its raw exit code is non-zero whenever a
 * configured path glob matches no files ("can't find files"), even though the
 * JSON report marks that entry passed=true with size 0. Declared-but-not-yet-
 * shipped chunks (e.g. the lazy WebGL chunk that lands in slice 5) must stay
 * vacuous instead of failing qa:gate, so this wrapper parses the JSON report
 * and fails only on:
 *   - a real budget violation (passed === false), or
 *   - a broken config / unparsable report.
 */
function runSizeLimit() {
  return new Promise((resolve) => {
    execFile(
      "pnpm",
      ["exec", "size-limit", "--json"],
      { cwd: process.cwd(), encoding: "utf8" },
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
