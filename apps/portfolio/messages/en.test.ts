import { describe, expect, it } from "vitest";
import en from "./en.json";

const REQUIRED_NAMESPACES = [
  "common",
  "hero",
  "nav",
  "footer",
  "cookie",
  "seo",
  "brand",
  "legal",
  "fragments",
] as const;

describe("messages/en.json", () => {
  it("is a valid parseable JSON object", () => {
    expect(en).toBeDefined();
    expect(typeof en).toBe("object");
    expect(en).not.toBeNull();
    expect(Array.isArray(en)).toBe(false);
  });

  it("contains all required namespaces", () => {
    const keys = Object.keys(en);
    for (const ns of REQUIRED_NAMESPACES) {
      expect(keys).toContain(ns);
    }
  });

  it("has no extra top-level keys beyond required namespaces", () => {
    const keys = Object.keys(en);
    for (const key of keys) {
      expect(REQUIRED_NAMESPACES as readonly string[]).toContain(key);
    }
  });

  it("has non-empty objects for each namespace", () => {
    for (const ns of REQUIRED_NAMESPACES) {
      const namespace = (en as Record<string, Record<string, unknown>>)[ns];
      expect(Object.keys(namespace).length).toBeGreaterThan(0);
    }
  });

  describe("hero namespace — new keys parity", () => {
    const NEW_HERO_KEYS = [
      "eyebrow",
      "h1Name",
      "h1Role",
      "lead",
      "cta",
      "ctaAriaLabel",
      "secondaryLabel",
      "secondaryHref",
    ] as const;

    const DEPRECATED_HERO_KEYS = [
      "titleLine1",
      "titleLine2",
      "headline",
      "subheadline",
      "telemetryLatency",
      "telemetryFramework",
      "coords",
      "os",
    ] as const;

    it("has all new hero keys as non-empty strings", () => {
      const hero = en.hero as Record<string, string>;
      for (const key of NEW_HERO_KEYS) {
        const value = hero[key];
        expect(typeof value, `hero.${key} must be a string`).toBe("string");
        expect(value.trim(), `hero.${key} must not be empty`).not.toBe("");
      }
    });

    it("retains all deprecated hero keys", () => {
      const hero = en.hero as Record<string, string>;
      for (const key of DEPRECATED_HERO_KEYS) {
        expect(hero, `hero.${key} must exist`).toHaveProperty(key);
        expect(typeof hero[key], `hero.${key} must be a string`).toBe("string");
      }
    });

    it("retains all deprecated hero keys", () => {
      const hero = (en as Record<string, Record<string, string>>).hero;
      for (const key of DEPRECATED_HERO_KEYS) {
        expect(hero, `hero.${key} must exist`).toHaveProperty(key);
        expect(typeof hero[key], `hero.${key} must be a string`).toBe("string");
      }
    });
  });

  describe("brand namespace invariance", () => {
    it("contains HUD/cyberpunk terms as English-only values", () => {
      const brand = (en as Record<string, Record<string, unknown>>).brand;
      expect(brand.systemOverride).toBe("SYSTEM_OVERRIDE");
      expect(brand.systemReady).toBe(
        "[SYSTEM_READY]: INITIALIZING_NEURAL_UPLINK",
      );
      expect(brand.uplink).toBe("UPLINK_STATUS: OPTIMAL");
      expect(brand.descent).toBe("DESCENT");
    });

    it("has all brand values as uppercase English strings", () => {
      const brand = (en as Record<string, Record<string, unknown>>).brand;
      for (const [key, value] of Object.entries(brand)) {
        expect(typeof value).toBe("string");
        // Brand terms use only ASCII and allowed punctuation
        expect(value).toMatch(/^[A-Z0-9_\[\]:.\s]+$/);
      }
    });
  });
});
