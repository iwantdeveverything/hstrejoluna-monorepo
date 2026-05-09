/// <reference types="vitest/globals" />
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe(".browserslistrc — Root Browser Targeting", () => {
  it("exists at repo root with correct contents", () => {
    // Resolve from apps/portfolio/app/[locale] up to repo root (4 levels up)
    const rootPath = resolve(__dirname, "../../../../.browserslistrc");
    expect(existsSync(rootPath)).toBe(true);

    const content = readFileSync(rootPath, "utf-8");
    const lines = content.trim().split("\n");

    expect(lines).toContain("defaults");
    expect(lines).toContain("Chrome >= 90");
    expect(lines).toContain("Firefox >= 90");
    expect(lines).toContain("Safari >= 15");
  });
});
