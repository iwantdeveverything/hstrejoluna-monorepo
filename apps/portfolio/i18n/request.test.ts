import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/server", () => ({
  getRequestConfig: (fn: Function) => fn,
}));

describe("i18n/request", () => {
  it("loads EN messages when locale resolves to en", async () => {
    const { default: getConfig } = await import("./request");

    const config = await getConfig({
      requestLocale: Promise.resolve("en"),
    });

    expect(config.locale).toBe("en");
    expect(config.messages).toBeDefined();
    expect(typeof config.messages).toBe("object");
  });

  it("loads ES messages when locale resolves to es", async () => {
    const { default: getConfig } = await import("./request");

    const config = await getConfig({
      requestLocale: Promise.resolve("es"),
    });

    expect(config.locale).toBe("es");
    expect(config.messages).toBeDefined();
    expect(typeof config.messages).toBe("object");
  });

  it("falls back to en when locale is undefined", async () => {
    const { default: getConfig } = await import("./request");

    const config = await getConfig({
      requestLocale: Promise.resolve(undefined),
    });

    expect(config.locale).toBe("en");
  });
});
