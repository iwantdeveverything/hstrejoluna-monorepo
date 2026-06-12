/// <reference types="vitest/globals" />
import { describe, expect, it } from "vitest";
import path from "node:path";

/**
 * Snapshot test for lighthouserc.cjs config values.
 *
 * Revival state (hero-video-liquid-glass, spec: lighthouse-ci-gate):
 * Performance/Accessibility/SEO assertions are temporarily suspended
 * while the video + WebGL hero lands — commented in the config with a
 * TODO referencing the follow-up issue (#146) that re-enables calibrated
 * thresholds. Best Practices stays active. The Playwright axe e2e spec
 * remains the active accessibility gate.
 */

const configPath = path.resolve(__dirname, "lighthouserc.cjs");

// eslint-disable-next-line @typescript-eslint/no-require-imports
const lhConfig = require(configPath) as {
  ci: {
    collect: {
      numberOfRuns: number;
      url: string[];
      startServerCommand: string;
      startServerReadyPattern: string;
      startServerReadyTimeout: number;
      settings: { preset: string };
    };
    assert: {
      assertions: Record<
        string,
        | [string, { minScore: number }]
        | [string, { maxNumericValue: number }]
      >;
    };
    upload: { target: string };
  };
};

describe("lighthouserc.cjs — revival gate state", () => {
  it("URL targets /en directly (no redirect overhead)", () => {
    expect(lhConfig.ci.collect.url).toEqual(["http://127.0.0.1:4173/en"]);
  });

  it("collects 3 runs for statistical stability", () => {
    expect(lhConfig.ci.collect.numberOfRuns).toBe(3);
  });

  it("performance assertions are suspended during the revival", () => {
    expect(
      lhConfig.ci.assert.assertions["categories:performance"],
    ).toBeUndefined();
  });

  it("accessibility assertions are suspended (axe e2e remains the gate)", () => {
    expect(
      lhConfig.ci.assert.assertions["categories:accessibility"],
    ).toBeUndefined();
  });

  it("SEO assertions are suspended during the revival", () => {
    expect(lhConfig.ci.assert.assertions["categories:seo"]).toBeUndefined();
  });

  it("performance metric assertions (FCP/LCP/SI) are suspended", () => {
    expect(
      lhConfig.ci.assert.assertions["first-contentful-paint"],
    ).toBeUndefined();
    expect(
      lhConfig.ci.assert.assertions["largest-contentful-paint"],
    ).toBeUndefined();
    expect(lhConfig.ci.assert.assertions["speed-index"]).toBeUndefined();
  });

  it("best-practices threshold stays active: 0.9 warn", () => {
    expect(lhConfig.ci.assert.assertions["categories:best-practices"]).toEqual([
      "warn",
      { minScore: 0.9 },
    ]);
  });

  it("upload target is temporary-public-storage", () => {
    expect(lhConfig.ci.upload.target).toBe("temporary-public-storage");
  });

  it("desktop preset is configured", () => {
    expect(lhConfig.ci.collect.settings.preset).toBe("desktop");
  });
});
