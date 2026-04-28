import { describe, it, expect } from "vitest";
import { safeJsonLd } from "@/lib/safe-json-ld";

describe("safeJsonLd", () => {
  it("returns valid JSON for a standard object", () => {
    const data = { "@type": "Person", name: "Test" };
    const result = safeJsonLd(data);
    expect(JSON.parse(result)).toEqual(data);
  });

  it("escapes </script> sequences", () => {
    const data = { name: '</script><script>alert("xss")</script>' };
    const result = safeJsonLd(data);
    expect(result).not.toContain("</script>");
    expect(result).not.toContain("</");
    expect(JSON.parse(result)).toEqual(data);
  });

  it("escapes </style> and </SCRIPT> variations", () => {
    const data = { a: "</style>", b: "</SCRIPT>" };
    const result = safeJsonLd(data);
    expect(result).not.toContain("</");
    expect(JSON.parse(result)).toEqual(data);
  });

  it("escapes <!-- HTML comment sequences", () => {
    const data = { comment: "<!-- injected -->" };
    const result = safeJsonLd(data);
    expect(result).not.toContain("<");
    expect(JSON.parse(result)).toEqual(data);
  });

  it("handles empty object", () => {
    expect(safeJsonLd({})).toBe("{}");
  });

  it("handles null values in fields", () => {
    const data = { name: null };
    const result = safeJsonLd(data);
    expect(JSON.parse(result)).toEqual(data);
  });

  it("falls back to empty object for non-serializable values", () => {
    expect(safeJsonLd(undefined)).toBe("{}");
    expect(safeJsonLd(() => {})).toBe("{}");
  });
});
