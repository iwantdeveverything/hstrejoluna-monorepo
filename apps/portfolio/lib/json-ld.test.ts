import { describe, expect, it } from "vitest";
import { buildPersonJsonLd } from "./json-ld";

const DEFAULT_PROFILE = {
  name: "Héctor Trejo Luna",
  headline: "Senior Software Architect",
  bio: "Building digital experiences",
  image: {
    asset: {
      _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
      _type: "reference" as const,
    },
    alt: "Héctor Trejo Luna portrait",
  },
  socials: [
    { platform: "github", url: "https://github.com/htrejoluna" },
    { platform: "linkedin", url: "https://linkedin.com/in/htrejoluna" },
  ],
};

const DEFAULT_SKILLS = [
  { name: "React", _id: "s1" },
  { name: "TypeScript", _id: "s2" },
];

describe("buildPersonJsonLd", () => {
  describe("existing Person fields preserved", () => {
    it("includes @context and @type", () => {
      const result = buildPersonJsonLd({
        profile: DEFAULT_PROFILE,
        skills: DEFAULT_SKILLS,
        locale: "en",
      });

      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("Person");
    });

    it("includes name and jobTitle from profile", () => {
      const result = buildPersonJsonLd({
        profile: DEFAULT_PROFILE,
        skills: DEFAULT_SKILLS,
        locale: "en",
      });

      expect(result.name).toBe("Héctor Trejo Luna");
      expect(result.jobTitle).toBe("Senior Software Architect");
    });

    it("includes description from profile.bio", () => {
      const result = buildPersonJsonLd({
        profile: DEFAULT_PROFILE,
        skills: DEFAULT_SKILLS,
        locale: "en",
      });

      expect(result.description).toBe("Building digital experiences");
    });

    it("includes url set to https://hstrejoluna.com", () => {
      const result = buildPersonJsonLd({
        profile: DEFAULT_PROFILE,
        skills: DEFAULT_SKILLS,
        locale: "en",
      });

      expect(result.url).toBe("https://hstrejoluna.com");
    });

    it("includes sameAs from normalized social links", () => {
      const result = buildPersonJsonLd({
        profile: DEFAULT_PROFILE,
        skills: DEFAULT_SKILLS,
        locale: "en",
      });

      expect(result.sameAs).toContain("https://github.com/htrejoluna");
      expect(result.sameAs).toContain("https://linkedin.com/in/htrejoluna");
    });

    it("includes knowsAbout from skills", () => {
      const result = buildPersonJsonLd({
        profile: DEFAULT_PROFILE,
        skills: DEFAULT_SKILLS,
        locale: "en",
      });

      expect(result.knowsAbout).toContain("React");
      expect(result.knowsAbout).toContain("TypeScript");
    });
  });

  describe("new fields: image", () => {
    it("includes image field from Sanity profile image via urlFor", () => {
      const result = buildPersonJsonLd({
        profile: DEFAULT_PROFILE,
        skills: DEFAULT_SKILLS,
        locale: "en",
      });

      expect(result).toHaveProperty("image");
      const image = result.image as string;
      // urlFor generates a Sanity CDN URL containing the image ref
      expect(image).toContain("cdn.sanity.io");
      expect(image).toContain("2000x3000");
    });

    it("falls back to /og-image.png when profile has no image", () => {
      const result = buildPersonJsonLd({
        profile: { ...DEFAULT_PROFILE, image: undefined },
        skills: DEFAULT_SKILLS,
        locale: "en",
      });

      const image = result.image as string;
      expect(image).toBe("/og-image.png");
    });

    it("falls back when profile is null", () => {
      const result = buildPersonJsonLd({
        profile: null,
        skills: DEFAULT_SKILLS,
        locale: "en",
      });

      const image = result.image as string;
      expect(image).toBe("/og-image.png");
    });
  });

  describe("new fields: mainEntityOfPage", () => {
    it("includes mainEntityOfPage with locale-aware @id", () => {
      const result = buildPersonJsonLd({
        profile: DEFAULT_PROFILE,
        skills: DEFAULT_SKILLS,
        locale: "en",
      });

      expect(result).toHaveProperty("mainEntityOfPage");
      expect(result.mainEntityOfPage).toEqual({
        "@type": "WebPage",
        "@id": "https://hstrejoluna.com/en",
      });
    });

    it("uses es in @id when locale is es", () => {
      const result = buildPersonJsonLd({
        profile: DEFAULT_PROFILE,
        skills: DEFAULT_SKILLS,
        locale: "es",
      });

      expect(result.mainEntityOfPage).toEqual({
        "@type": "WebPage",
        "@id": "https://hstrejoluna.com/es",
      });
    });
  });

  describe("edge cases", () => {
    it("handles empty skills array", () => {
      const result = buildPersonJsonLd({
        profile: DEFAULT_PROFILE,
        skills: [],
        locale: "en",
      });

      expect(result.knowsAbout).toEqual([]);
    });

    it("handles profile with null bio", () => {
      const result = buildPersonJsonLd({
        profile: {
          name: "Test",
          headline: "Dev",
          bio: null as unknown as undefined,
          socials: [],
        },
        skills: [],
        locale: "en",
      });

      expect(result.description).toBeNull();
    });
  });
});
