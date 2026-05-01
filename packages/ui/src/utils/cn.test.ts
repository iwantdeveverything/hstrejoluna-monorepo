import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class strings with a single space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values (undefined, null, false, '')", () => {
    expect(cn("a", undefined, "b", null, false, "", "c")).toBe("a b c");
  });

  it("preserves caller classes alongside internal classes (no replacement)", () => {
    const internal = "lg-base lg-data";
    const custom = "custom-x";
    const result = cn(internal, custom);
    expect(result.split(" ")).toEqual(["lg-base", "lg-data", "custom-x"]);
  });

  it("deduplicates exact whitespace-separated tokens to satisfy 'no duplication'", () => {
    expect(cn("a b", "b c")).toBe("a b c");
  });

  it("returns empty string when all inputs are falsy", () => {
    expect(cn(undefined, null, false, "")).toBe("");
  });
});
