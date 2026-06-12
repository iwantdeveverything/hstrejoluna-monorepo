/// <reference types="vitest/globals" />
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Vacuous-pass guard for .size-limit.json (spec: Size-Limit Glob Integrity).
 *
 * size-limit reports passed=true with size 0 when a configured path glob
 * matches no files, so a renamed/moved chunk silently loses its budget
 * coverage. This suite asserts every configured glob matches at least one
 * file in the build output, failing CI on stale globs.
 *
 * Requires a production build (.next). CI runs Build before Test (ci.yml),
 * so the guard is always effective there; locally it skips when no build
 * output exists.
 */

const appRoot = path.resolve(__dirname, "..");
const buildDir = path.join(appRoot, ".next");
const hasBuild = fs.existsSync(path.join(buildDir, "static"));

const configPath = path.join(appRoot, ".size-limit.json");
const entries = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Array<{
  name: string;
  path: string;
}>;

describe.skipIf(!hasBuild)(
  ".size-limit.json — every glob matches at least one file",
  () => {
    it("declares at least one budget entry", () => {
      expect(entries.length).toBeGreaterThan(0);
    });

    it.each(entries)("$name: glob '$path' matches ≥ 1 file", (entry) => {
      const matches = fs.globSync(entry.path, { cwd: appRoot });
      expect(
        matches.length,
        `size-limit entry "${entry.name}" glob "${entry.path}" matches no files — stale glob would pass vacuously`,
      ).toBeGreaterThan(0);
    });
  },
);
