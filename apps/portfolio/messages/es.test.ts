import { describe, expect, it } from "vitest";
import en from "./en.json";
import es from "./es.json";

type MessageObject = Record<string, unknown>;

/** Recursively collect all leaf-key paths from a nested object */
function collectKeys(obj: MessageObject, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...collectKeys(value as MessageObject, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

describe("messages/es.json", () => {
  describe("structural parity with EN", () => {
    it("has every key that EN has", () => {
      const enKeys = collectKeys(en as MessageObject);
      const esKeys = collectKeys(es as MessageObject);
      expect(enKeys.length).toBeGreaterThan(0);
      for (const key of enKeys) {
        expect(esKeys, `missing key: ${key}`).toContain(key);
      }
    });

    it("has no extra keys beyond EN plus allowed _meta keys", () => {
      const enKeys = collectKeys(en as MessageObject);
      const esKeys = collectKeys(es as MessageObject);
      const extraKeys = esKeys.filter(
        (k) => !enKeys.includes(k) && !k.includes("_meta"),
      );
      expect(extraKeys).toEqual([]);
    });
  });

  describe("brand namespace invariance", () => {
    it("has brand values identical to EN", () => {
      const enBrand = (en as MessageObject).brand as MessageObject;
      const esBrand = (es as MessageObject).brand as MessageObject;
      expect(esBrand).toBeDefined();
      for (const [key, value] of Object.entries(enBrand)) {
        expect(esBrand[key], `brand.${key} should match EN`).toBe(value);
      }
    });
  });

  describe("legal namespace review flags removed", () => {
    it("does not contain _meta markers in legal.privacyPolicy", () => {
      const legal = (es as MessageObject).legal as MessageObject;
      const privacy = legal.privacyPolicy as MessageObject;
      expect(privacy._meta).toBeUndefined();
    });

    it("does not contain _meta markers in legal.cookiePolicy", () => {
      const legal = (es as MessageObject).legal as MessageObject;
      const cookie = legal.cookiePolicy as MessageObject;
      expect(cookie._meta).toBeUndefined();
    });

    it("does not contain _meta markers in legal.legalNotice", () => {
      const legal = (es as MessageObject).legal as MessageObject;
      const notice = legal.legalNotice as MessageObject;
      expect(notice._meta).toBeUndefined();
    });
  });

  describe("hero namespace — Spanish translations present", () => {
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

    it("has all new hero keys with non-empty Spanish translations", () => {
      const hero = es.hero as Record<string, string>;
      for (const key of NEW_HERO_KEYS) {
        const value = hero[key];
        expect(typeof value, `hero.${key} must be a string`).toBe("string");
        expect(value.trim(), `hero.${key} must not be empty`).not.toBe("");
      }
    });
  });

  describe("translation quality", () => {
    it("has Spanish content in non-brand translatable namespaces", () => {
      const esNav = (es as MessageObject).nav as MessageObject;
      // Spanish nav terms should differ from English
      expect(esNav.projects).not.toBe(
        (en as MessageObject).nav as MessageObject,
      );
      // Verify actual Spanish text
      expect(esNav.projects).toBe("Proyectos");
      expect(esNav.experience).toBe("Experiencia");
    });
  });
});
