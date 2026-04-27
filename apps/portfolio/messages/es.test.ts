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

  describe("legal namespace review flags", () => {
    it("includes _meta.needsReview: true in legal.privacyPolicy", () => {
      const legal = (es as MessageObject).legal as MessageObject;
      const privacy = legal.privacyPolicy as MessageObject;
      const meta = privacy._meta as MessageObject;
      expect(meta).toBeDefined();
      expect(meta.needsReview).toBe(true);
    });

    it("includes _meta.needsReview: true in legal.cookiePolicy", () => {
      const legal = (es as MessageObject).legal as MessageObject;
      const cookie = legal.cookiePolicy as MessageObject;
      const meta = cookie._meta as MessageObject;
      expect(meta).toBeDefined();
      expect(meta.needsReview).toBe(true);
    });

    it("includes _meta.needsReview: true in legal.legalNotice", () => {
      const legal = (es as MessageObject).legal as MessageObject;
      const notice = legal.legalNotice as MessageObject;
      const meta = notice._meta as MessageObject;
      expect(meta).toBeDefined();
      expect(meta.needsReview).toBe(true);
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
