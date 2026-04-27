import { describe, expect, it } from "vitest";
import { routing } from "./routing";

describe("i18n/routing", () => {
  it("exports en and es as supported locales", () => {
    expect(routing.locales).toEqual(["en", "es"]);
  });

  it("uses en as the default locale", () => {
    expect(routing.defaultLocale).toBe("en");
  });

  it("uses always-prefixed locale strategy", () => {
    expect(routing.localePrefix).toBe("always");
  });
});
