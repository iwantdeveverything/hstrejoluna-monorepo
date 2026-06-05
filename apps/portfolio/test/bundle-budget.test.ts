import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Bundle-budget gate contract (liquid-glass-revival, slice 1 / Phase 0.4).
 *
 * This suite is the strict-TDD deliverable for the size gate: it proves the
 * gate CONFIG exists, declares the agreed thresholds, is wired into qa:gate,
 * and that the size-limit binary actually RUNS against the config.
 *
 * NOTE: the <=200KB gz lazy-chunk rule is declared-but-not-yet-binding. The
 * lazy WebGL chunk it targets does not exist until slice 5. size-limit
 * reports a missing path glob as size 0 with passed=true BUT exits non-zero
 * ("can't find files"), so the raw binary cannot back qa:gate until every
 * glob resolves. The `size` script therefore goes through scripts/size-gate.mjs,
 * which parses the JSON report and fails only on a real budget violation
 * (passed=false) or a broken config — missing globs stay vacuous until their
 * chunks ship. The +5KB gz initial delta rule is binding now.
 */

const portfolioRoot = path.resolve(__dirname, "..");
const configPath = path.join(portfolioRoot, ".size-limit.json");
const packageJsonPath = path.join(portfolioRoot, "package.json");

type SizeLimitEntry = {
  name?: string;
  path: string | string[];
  limit: string;
};

function readConfig(): SizeLimitEntry[] {
  const raw = readFileSync(configPath, "utf8");
  return JSON.parse(raw) as SizeLimitEntry[];
}

function readPackageJson(): { scripts: Record<string, string> } {
  return JSON.parse(readFileSync(packageJsonPath, "utf8"));
}

describe("bundle-budget size gate config", () => {
  it("declares a .size-limit.json config at the portfolio root", () => {
    expect(existsSync(configPath)).toBe(true);
  });

  it("declares the +5KB gz initial JS delta threshold (binding now)", () => {
    const config = readConfig();
    const initial = config.find((entry) => entry.name === "initial-js-delta");
    expect(initial).toBeDefined();
    expect(initial?.limit).toBe("5 KB");
  });

  it("declares the <=200KB gz lazy WebGL chunk threshold (declared, not yet binding)", () => {
    const config = readConfig();
    const lazy = config.find((entry) => entry.name === "hero-webgl-lazy-chunk");
    expect(lazy).toBeDefined();
    expect(lazy?.limit).toBe("200 KB");
  });

  it("wires the size gate into the qa:gate script so it fails the build", () => {
    const pkg = readPackageJson();
    expect(pkg.scripts["size"]).toBe("node ./scripts/size-gate.mjs");
    expect(pkg.scripts["qa:gate"]).toContain("pnpm run size");
  });

  it("runs the size gate against the config without a config error", () => {
    // Smoke: the gate must actually EXECUTE. The gate wrapper exits zero when
    // every declared budget passes (missing globs stay vacuous) and reports
    // each entry on stdout. We assert on the report lines, not on byte counts
    // (those bind in later slices).
    const stdout = execFileSync(
      "pnpm",
      ["run", "size"],
      { cwd: portfolioRoot, encoding: "utf8" },
    );
    expect(stdout).toContain("initial-js-delta");
    expect(stdout).toContain("hero-webgl-lazy-chunk");
    expect(stdout).not.toContain("[FAIL]");
  });
});
