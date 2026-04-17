import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("storybook contracts", () => {
  it(
    "fails static build deterministically when a story import is broken",
    { timeout: 240000 },
    () => {
      const scriptPath = path.join(
        appRoot,
        "scripts",
        "verify-storybook-build-failure.mjs"
      );
      const result = spawnSync(process.execPath, [scriptPath], {
        cwd: appRoot,
        encoding: "utf8",
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toContain(
        "Verified: Storybook build fails deterministically for broken story imports."
      );
    }
  );

  it("allows package-root resolution from @hstrejoluna/ui", () => {
    const command = "require.resolve('@hstrejoluna/ui');";
    const result = spawnSync(process.execPath, ["-e", command], {
      cwd: appRoot,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
  });

  it("rejects deep resolution of non-exported @hstrejoluna/ui internals", () => {
    const command = `
      try {
        require.resolve('@hstrejoluna/ui/src/components/CommandSurface');
        process.exit(1);
      } catch (error) {
        process.exit(error && error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED' ? 0 : 1);
      }
    `;
    const result = spawnSync(process.execPath, ["-e", command], {
      cwd: appRoot,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
  });
});
