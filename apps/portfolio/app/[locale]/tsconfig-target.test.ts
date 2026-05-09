/// <reference types="vitest/globals" />
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("tsconfig.json — Modern JavaScript Target", () => {
  it("has target set to ES2020 (not ES2017)", () => {
    const raw = readFileSync(
      resolve(__dirname, "../../tsconfig.json"),
      "utf-8",
    );
    const config = JSON.parse(raw) as { compilerOptions: { target: string } };

    expect(config.compilerOptions.target).toBe("ES2020");
    expect(config.compilerOptions.target).not.toBe("ES2017");
  });
});
