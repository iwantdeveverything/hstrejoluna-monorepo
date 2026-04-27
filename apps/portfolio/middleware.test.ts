import { describe, expect, it, vi } from "vitest";

// Mock createMiddleware to capture the routing config it receives
const mockMiddlewareHandler = vi.fn();
const mockCreateMiddleware = vi.fn(() => mockMiddlewareHandler);

vi.mock("next-intl/middleware", () => ({
  default: mockCreateMiddleware,
}));

describe("middleware.ts", () => {
  describe("createMiddleware configuration", () => {
    it("passes the routing config to createMiddleware", async () => {
      await import("./middleware");
      const calls = (mockCreateMiddleware as any).mock.calls;
      const config = calls[0][0];
      expect(config).toHaveProperty("locales", ["en", "es"]);
      expect(config).toHaveProperty("defaultLocale", "en");
      expect(config).toHaveProperty("localePrefix", "always");
    });

    it("exports the middleware handler as default", async () => {
      const mod = await import("./middleware");
      expect(mod.default).toBe(mockMiddlewareHandler);
    });
  });

  describe("matcher config", () => {
    it("exports a config object with a matcher pattern", async () => {
      const mod = await import("./middleware");
      expect(mod.config).toBeDefined();
      expect(mod.config.matcher).toBeDefined();
      expect(Array.isArray(mod.config.matcher)).toBe(true);
      expect(mod.config.matcher.length).toBeGreaterThan(0);
    });

    it("matcher pattern excludes api paths via negative lookahead", async () => {
      const mod = await import("./middleware");
      const pattern = mod.config.matcher[0] as string;
      expect(pattern).toContain("api");
      // Verify it's in a negative lookahead group
      expect(pattern).toMatch(/\(\?!.*api/);
    });

    it("matcher pattern excludes _next paths via negative lookahead", async () => {
      const mod = await import("./middleware");
      const pattern = mod.config.matcher[0] as string;
      expect(pattern).toContain("_next");
      expect(pattern).toMatch(/\(\?!.*_next/);
    });

    it("matcher pattern excludes maestros-del-salmon paths via negative lookahead", async () => {
      const mod = await import("./middleware");
      const pattern = mod.config.matcher[0] as string;
      expect(pattern).toContain("maestros-del-salmon");
      expect(pattern).toMatch(/\(\?!.*maestros-del-salmon/);
    });

    it("matcher pattern excludes static files with extensions via negative lookahead", async () => {
      const mod = await import("./middleware");
      const pattern = mod.config.matcher[0] as string;
      // The .*\\.* segment matches files with extensions (e.g., favicon.ico, image.png)
      expect(pattern).toMatch(/\\\./);
    });

    it("matcher pattern wraps exclusions in Next.js path-to-regexp format", async () => {
      const mod = await import("./middleware");
      const pattern = mod.config.matcher[0] as string;
      // Standard next-intl matcher: /((?!excluded1|excluded2|...).*)
      expect(pattern).toMatch(/^\/\(\(\?!/);
      expect(pattern).toMatch(/\.\*\)$/);
    });
  });
});
