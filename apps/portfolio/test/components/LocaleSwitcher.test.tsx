/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LocaleSwitcher } from "../../components/ui/LocaleSwitcher";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/",
}));

describe("<LocaleSwitcher /> — Liquid Glass migration (REQ-7)", () => {
  it("renders its container via <LiquidGlass variant='pill'> (S7.2)", () => {
    const { container } = render(<LocaleSwitcher />);
    const glass = container.querySelector("[data-lg-variant]");
    expect(glass).not.toBeNull();
    expect(glass?.getAttribute("data-lg-variant")).toBe("pill");
  });

  it("does not use raw `backdrop-blur` Tailwind utilities (S7.1)", () => {
    const { container } = render(<LocaleSwitcher />);
    const offenders = container.querySelectorAll("[class*='backdrop-blur']");
    expect(offenders.length).toBe(0);
  });

  it("preserves the locale toggle buttons with aria-pressed semantics", () => {
    const { container } = render(<LocaleSwitcher />);
    const buttons = container.querySelectorAll("button[aria-pressed]");
    expect(buttons.length).toBe(2);
  });

  it("inactive locale button renders visible text for WCAG AA contrast", () => {
    render(<LocaleSwitcher />);
    // Locale is "en", so "es" button should be the inactive one
    const esButton = screen.getByRole("button", { name: /Switch to Spanish/ });
    expect(esButton).toBeInTheDocument();
    // Button must render its visible text label
    expect(esButton).toHaveTextContent("es");
    // Button must NOT be aria-pressed (it's the inactive locale)
    expect(esButton).not.toHaveAttribute("aria-pressed", "true");
  });
});
