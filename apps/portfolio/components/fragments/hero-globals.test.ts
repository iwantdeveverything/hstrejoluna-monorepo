/// <reference types="vitest/globals" />
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 6.1 — CSS utility rules in globals.css
 *
 * These tests verify that the hero's required CSS utility rules,
 * keyframe animations, and CSS custom property defaults exist
 * in globals.css. The component code references these rules by
 * name — they MUST be defined here.
 *
 * Design contract: spec § "Liquid glass CSS layer", design §2.
 */

// Read the CSS as a raw text blob so we can pattern-match
const cssPath = path.resolve(__dirname, "../../app/globals.css");
let css: string;

function loadCss(): string {
  if (!css) {
    css = fs.readFileSync(cssPath, "utf-8");
  }
  return css;
}

describe("globals.css — Hero keyframe animations", () => {
  it("defines @keyframes hero-blob-drift-1 (primary blob, 8s ease-in-out alternate)", () => {
    const content = loadCss();
    expect(content).toMatch(/@keyframes\s+hero-blob-drift-1\b/);
  });

  it("defines @keyframes hero-blob-drift-2 (secondary blob, 10s ease-in-out alternate)", () => {
    const content = loadCss();
    expect(content).toMatch(/@keyframes\s+hero-blob-drift-2\b/);
  });

  it("defines @keyframes hero-blob-drift-3 (accent blob, 12s ease-in-out alternate)", () => {
    const content = loadCss();
    expect(content).toMatch(/@keyframes\s+hero-blob-drift-3\b/);
  });

  it("pauses hero-blob-drift animations under prefers-reduced-motion", () => {
    const content = loadCss();
    // Must contain a reduced-motion media query that pauses/freezes blobs
    expect(content).toMatch(
      /@media\s+\(prefers-reduced-motion:\s*reduce\)[\s\S]*hero-blob/,
    );
  });
});

describe("globals.css — Hero utility classes", () => {
  it("defines .hero-blob utility class for blob styling", () => {
    const content = loadCss();
    expect(content).toMatch(/\.hero-blob\s*\{/);
  });

  it("defines .hero-card-tint utility class as backdrop-tinted layer", () => {
    const content = loadCss();
    expect(content).toMatch(/\.hero-card-tint\s*\{/);
  });

  it(".hero-card-tint includes backdrop-filter for behind-h1 contrast", () => {
    const content = loadCss();
    // Find the .hero-card-tint rule block and verify it uses backdrop-filter
    const match = content.match(/\.hero-card-tint\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match![1]).toMatch(/backdrop-filter/);
  });
});

describe("globals.css — CSS custom property defaults", () => {
  it("defines default --mx CSS custom property (initial value before pointer moves)", () => {
    const content = loadCss();
    expect(content).toMatch(/--mx\s*:\s*0\.5/);
  });

  it("defines default --my CSS custom property", () => {
    const content = loadCss();
    expect(content).toMatch(/--my\s*:\s*0\.5/);
  });

  it("--mx/--my defaults are scoped to the hero section", () => {
    const content = loadCss();
    const hasHeroScope =
      content.includes("hero-title") || content.includes(".hero-section");
    expect(hasHeroScope).toBe(true);
  });

  it("--mx/--my defaults use 0.5 so blobs center before any pointermove fires", () => {
    const content = loadCss();
    // Extract the exact rule that sets both --mx and --my
    const ruleMatch = content.match(
      /section\[aria-labelledby="hero-title"\]\s*\{([^}]+)\}/,
    );
    expect(ruleMatch).not.toBeNull();
    const ruleBody = ruleMatch![1];
    expect(ruleBody).toContain("--mx: 0.5");
    expect(ruleBody).toContain("--my: 0.5");
  });
});

describe("globals.css — Keyframe body verification (triangulation)", () => {
  it("hero-blob-drift-1 uses translate, rotate, and scale for organic motion", () => {
    const content = loadCss();
    // Extract the keyframe block
    const match = content.match(/@keyframes\s+hero-blob-drift-1\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    const body = match![1];
    expect(body).toMatch(/translate\(/);
    expect(body).toMatch(/rotate\(/);
    expect(body).toMatch(/scale\(/);
  });

  it("hero-blob-drift-2 uses translate, rotate, and scale for organic motion", () => {
    const content = loadCss();
    const match = content.match(/@keyframes\s+hero-blob-drift-2\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    const body = match![1];
    expect(body).toMatch(/translate\(/);
    expect(body).toMatch(/rotate\(/);
    expect(body).toMatch(/scale\(/);
  });

  it("hero-blob-drift-3 uses translate, rotate, and scale for organic motion", () => {
    const content = loadCss();
    const match = content.match(/@keyframes\s+hero-blob-drift-3\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    const body = match![1];
    expect(body).toMatch(/translate\(/);
    expect(body).toMatch(/rotate\(/);
    expect(body).toMatch(/scale\(/);
  });
});

describe("globals.css — .hero-card-tint detail verification (triangulation)", () => {
  it(".hero-card-tint applies backdrop-filter with blur, saturate, and brightness", () => {
    const content = loadCss();
    const match = content.match(/\.hero-card-tint\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    const body = match![1];
    expect(body).toContain("blur(");
    expect(body).toContain("saturate(");
    expect(body).toContain("brightness(");
  });

  it(".hero-card-tint uses a dark background tint for contrast over blobs", () => {
    const content = loadCss();
    const match = content.match(/\.hero-card-tint\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    const body = match![1];
    // Uses rgba with low alpha OR a dark color
    expect(body).toMatch(
      /rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*0\.\d+\s*\)/,
    );
  });

  it(".hero-card-tint includes -webkit-backdrop-filter for Safari compat", () => {
    const content = loadCss();
    const match = content.match(/\.hero-card-tint\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    const body = match![1];
    expect(body).toContain("-webkit-backdrop-filter");
  });
});

describe("globals.css — .hero-blob detail verification (triangulation)", () => {
  it(".hero-blob sets pointer-events: none to prevent interaction blocking", () => {
    const content = loadCss();
    const match = content.match(/\.hero-blob\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    const body = match![1];
    expect(body).toContain("pointer-events: none");
  });

  it(".hero-blob uses will-change for GPU-accelerated animation", () => {
    const content = loadCss();
    const match = content.match(/\.hero-blob\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    const body = match![1];
    expect(body).toContain("will-change:");
  });

  it(".hero-blob sets transform-origin for consistent rotation center", () => {
    const content = loadCss();
    const match = content.match(/\.hero-blob\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    const body = match![1];
    expect(body).toContain("transform-origin:");
  });
});
