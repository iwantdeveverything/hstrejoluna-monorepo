/// <reference types="vitest/globals" />
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/sanity", () => ({
  client: {
    fetch: vi.fn(),
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  setRequestLocale: vi.fn(),
}));

vi.mock("@/lib/safe-json-ld", () => ({
  safeJsonLd: vi.fn().mockReturnValue("{}"),
}));

vi.mock("@/lib/json-ld", () => ({
  buildPersonJsonLd: vi.fn().mockReturnValue({}),
  buildProjectListJsonLd: vi.fn().mockReturnValue({}),
}));

vi.mock("@/components/ObsidianStreamLoader", () => ({
  ObsidianStreamLoader: () => null,
}));

vi.mock("@/components/ProjectsGrid", () => ({
  ProjectsGrid: () => null,
}));

describe("page.tsx — ISR Revalidation", () => {
  it("exports revalidate = 60 instead of force-dynamic", async () => {
    const mod = await import("./page");

    // Must export revalidate (ISR), not dynamic = "force-dynamic"
    expect(mod).toHaveProperty("revalidate");
    expect(mod.revalidate).toBe(60);

    // dynamic must NOT be "force-dynamic"
    expect(mod).not.toHaveProperty("dynamic");
  });
});
