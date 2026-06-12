import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Hero design tokens (spec: Z-Stack and Design Tokens / "no undefined tokens").
 *
 * `--color-accent` (molten copper) and `--color-glitch-cyan` (cold focus
 * counterpoint) are consumed by the hero (e.g. `from-accent/8` gradient,
 * focus rings) but were previously undefined, so `var(--color-accent)`
 * resolved to nothing. They MUST be declared in the `@theme` block of
 * `app/globals.css` so the custom properties resolve to defined values
 * (design §1 palette). Source-read assertion mirrors the established
 * packages/ui tokens test.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const globalsPath = path.resolve(here, "globals.css");
const globalsSource = readFileSync(globalsPath, "utf8");

/** Isolate the first `@theme { … }` block so we assert tokens live inside it. */
const themeBlock = (() => {
  const start = globalsSource.indexOf("@theme");
  if (start === -1) return "";
  const open = globalsSource.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < globalsSource.length; i += 1) {
    if (globalsSource[i] === "{") depth += 1;
    else if (globalsSource[i] === "}") {
      depth -= 1;
      if (depth === 0) return globalsSource.slice(open + 1, i);
    }
  }
  return "";
})();

const expectedTokens: ReadonlyArray<[string, string]> = [
  ["--color-accent", "#e2725b"],
  ["--color-glitch-cyan", "#6ee7ff"],
];

describe("hero design tokens (app/globals.css @theme)", () => {
  it.each(expectedTokens)(
    "declares %s with value %s inside @theme",
    (token, value) => {
      const declaration = new RegExp(
        `${token.replace(/-/g, "\\-")}\\s*:\\s*${value.replace(/[#]/g, "\\$&")}\\s*;`,
        "i",
      );
      expect(themeBlock).toMatch(declaration);
    },
  );

  it("resolves both tokens to a defined value (no empty declaration)", () => {
    for (const [token] of expectedTokens) {
      const declaration = new RegExp(
        `${token.replace(/-/g, "\\-")}\\s*:\\s*[^;\\s][^;]*;`,
      );
      expect(globalsSource).toMatch(declaration);
    }
  });
});
