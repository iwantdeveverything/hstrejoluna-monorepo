import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Bundle-budget gate contract (hero-video-liquid-glass, spec:
 * Size-Limit Glob Integrity).
 *
 * The gate config must exist, be wired into qa:gate, and actually run.
 * Vacuous passes are forbidden: scripts/size-gate.mjs fails when any
 * configured glob matches zero files (see scripts/size-limit-globs.test.ts
 * for the per-entry glob assertions), so every declared entry is binding.
 *
 * Budgets are informational ceilings during the revival; slice 5 adds a
 * dedicated hero WebGL chunk entry (three/R3F lazy boundary, design §7) so the
 * heaviest chunk is independently bounded and the glob-guard confirms its
 * coverage.
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

const hasBuild = existsSync(path.join(portfolioRoot, ".next", "static"));

describe("bundle-budget size gate config", () => {
  it("declares a .size-limit.json config at the portfolio root", () => {
    expect(existsSync(configPath)).toBe(true);
  });

  it("declares the total client JS ceiling (binding, revival-informational)", () => {
    const config = readConfig();
    const total = config.find((entry) => entry.name === "client-js-total");
    expect(total).toBeDefined();
    expect(total?.limit).toBe("600 KB");
  });

  it("declares the dedicated hero WebGL chunk ceiling (three/R3F boundary)", () => {
    const config = readConfig();
    const heroChunk = config.find((entry) => entry.name === "hero-webgl-chunk");
    expect(heroChunk).toBeDefined();
    expect(heroChunk?.limit).toBe("300 KB");
  });

  it("wires the size gate into the qa:gate script so it fails the build", () => {
    const pkg = readPackageJson();
    expect(pkg.scripts["size"]).toBe("node ./scripts/size-gate.mjs");
    expect(pkg.scripts["qa:gate"]).toContain("pnpm run size");
  });

  it.skipIf(!hasBuild)(
    "runs the size gate against the config without a config error",
    () => {
      // Smoke: the gate must actually EXECUTE against a production build.
      // The wrapper exits non-zero on a stale glob (vacuous-pass guard) or
      // a real budget violation; on success it reports each entry on stdout.
      const stdout = execFileSync("pnpm", ["run", "size"], {
        cwd: portfolioRoot,
        encoding: "utf8",
      });
      expect(stdout).toContain("client-js-total");
      expect(stdout).not.toContain("[FAIL]");
      expect(stdout).not.toContain("[STALE GLOB]");
    },
    // Spawns `pnpm run size` (size-limit over the production build); the
    // child-process duration is load-dependent under the parallel suite,
    // so the default 5s timeout flakes. Generous explicit budget instead.
    60_000,
  );
});
