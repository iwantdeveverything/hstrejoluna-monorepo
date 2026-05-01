import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";

const here = path.dirname(fileURLToPath(import.meta.url));
const tokensPath = path.resolve(here, "..", "..", "styles", "tokens.css");

const tokensSource = readFileSync(tokensPath, "utf8");

const expectedBaseTokens = [
  "--lg-tint",
  "--lg-blur",
  "--lg-saturation",
  "--lg-refraction-scale",
  "--lg-specular-opacity",
  "--lg-fallback-bg",
  "--lg-radius-panel",
  "--lg-radius-pill",
  "--lg-radius-dock",
  "--lg-radius-circle",
  "--lg-radius-dialog",
];

describe("liquid-glass tokens (packages/ui/src/styles/tokens.css)", () => {
  it.each(expectedBaseTokens)("declares base token %s in :root", (token) => {
    // Each token must appear as a declaration with a value (token: value;)
    // The regex tolerates whitespace and any value but requires a colon.
    const declaration = new RegExp(
      `${token.replace(/-/g, "\\-")}\\s*:\\s*[^;]+;`
    );
    expect(tokensSource).toMatch(declaration);
  });

  it("scales --lg-refraction-scale across intensity tiers (low < med < high)", () => {
    expect(tokensSource).toMatch(
      /\[data-lg-intensity="low"\][\s\S]*--lg-refraction-scale\s*:\s*4px/
    );
    expect(tokensSource).toMatch(
      /\[data-lg-intensity="med"\][\s\S]*--lg-refraction-scale\s*:\s*9px/
    );
    expect(tokensSource).toMatch(
      /\[data-lg-intensity="high"\][\s\S]*--lg-refraction-scale\s*:\s*16px/
    );
  });

  it("scales --lg-specular-opacity across intensity tiers (low < med < high)", () => {
    expect(tokensSource).toMatch(
      /\[data-lg-intensity="low"\][\s\S]*--lg-specular-opacity\s*:\s*\.?0?\.10/
    );
    expect(tokensSource).toMatch(
      /\[data-lg-intensity="med"\][\s\S]*--lg-specular-opacity\s*:\s*\.?0?\.18/
    );
    expect(tokensSource).toMatch(
      /\[data-lg-intensity="high"\][\s\S]*--lg-specular-opacity\s*:\s*\.?0?\.28/
    );
  });
});
