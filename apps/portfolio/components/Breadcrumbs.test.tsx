import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs";
import { NextIntlClientProvider } from "next-intl";
import messages from "../messages/en.json";

// Mock i18n/navigation LocalizedLink
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("Breadcrumbs", () => {
  const items = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/#projects" },
    { label: "Project Alpha", isCurrent: true },
  ];

  it("renders semantic breadcrumb navigation", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Breadcrumbs items={items} />
      </NextIntlClientProvider>,
    );

    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);

    // Verify Home link
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("href", "/");

    // Verify current page (no link)
    const currentPage = screen.getByText("Project Alpha");
    expect(currentPage).toHaveAttribute("aria-current", "page");
    expect(currentPage.tagName).toBe("SPAN");
  });

  it("includes correct JSON-LD for search engine visibility", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Breadcrumbs items={items} />
      </NextIntlClientProvider>,
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    
    const jsonLd = JSON.parse(script?.innerHTML || "{}");
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[0].name).toBe("Home");
    expect(jsonLd.itemListElement[2].name).toBe("Project Alpha");
  });
});
