import { describe, expect, it, vi } from "vitest";

// Mock createNextIntlPlugin to verify it's called correctly
const mockWithNextIntl = vi.fn((config: unknown) => config);
const mockCreatePlugin = vi.fn(() => mockWithNextIntl);

vi.mock("next-intl/plugin", () => ({
  default: mockCreatePlugin,
}));

describe("next.config.ts", () => {
  it("calls createNextIntlPlugin with the request config path", async () => {
    await import("./next.config");
    expect(mockCreatePlugin).toHaveBeenCalledWith("./i18n/request.ts");
  });

  it("wraps the config object through the plugin", async () => {
    await import("./next.config");
    expect(mockWithNextIntl).toHaveBeenCalledTimes(1);
    const wrappedConfig = mockWithNextIntl.mock.calls[0][0];
    expect(wrappedConfig).toHaveProperty("transpilePackages");
    expect(wrappedConfig).toHaveProperty("images");
    expect(wrappedConfig).toHaveProperty("rewrites");
  });
});
