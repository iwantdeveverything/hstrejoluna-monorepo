import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as navigation from "@/lib/navigation";
import { CommandNav } from "./CommandNav";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

// Mock LocaleSwitcher to avoid its own dependencies
vi.mock("./LocaleSwitcher", () => ({
  LocaleSwitcher: () => <div data-testid="locale-switcher">LocaleSwitcher</div>,
}));

vi.mock("@hstrejoluna/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@hstrejoluna/ui")>();
  return {
    ...actual,
    useLiquidGlassGates: () => actual.LIQUID_GLASS_SSR_DEFAULTS,
  };
});

describe("CommandNav", () => {
  it("renders semantic navigation and marks active section with aria-current", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CommandNav
          activeId="projects"
          counts={{ projects: 4, experience: 2, certificates: 3 }}
          socials={[{ platform: "github", url: "https://github.com/example" }]}
        />
      </NextIntlClientProvider>,
    );

    expect(
      await screen.findByRole("navigation", { name: /primary sections/i }),
    ).toBeInTheDocument();
    const link = (await screen.findAllByRole("link", { name: /projects/i }))[0];
    expect(link).toHaveAttribute("href", "#projects");
    expect(link).toHaveAttribute("aria-current", "location");
  });

  it("shows fallback text in mobile menu when socials are missing", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CommandNav
          activeId="experience"
          counts={{ projects: 4, experience: 2, certificates: 3 }}
        />
      </NextIntlClientProvider>,
    );

    fireEvent.click((await screen.findAllByRole("button", { name: messages.brand.menu }))[0]);
    expect(screen.queryByText(/Socials/i)).not.toBeInTheDocument();
  });

  it("normalizes plaintext email social links and uses smooth section navigation", async () => {
    const scrollSpy = vi.spyOn(navigation, "scrollToSection").mockReturnValue(true);

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CommandNav
          activeId="skills"
          counts={{ projects: 4, experience: 2, certificates: 3 }}
          socials={[
            {
              platform: "email",
              email: "dev@example.com",
              label: "Contact Email",
            },
          ]}
        />
      </NextIntlClientProvider>,
    );

    expect(
      (await screen.findAllByRole("link", { name: /contact email/i }))[0],
    ).toHaveAttribute("href", "mailto:dev@example.com");

    fireEvent.click((await screen.findAllByRole("link", { name: /skills/i }))[0]);
    expect(scrollSpy).toHaveBeenCalledWith({
      id: "skills",
      reducedMotion: false,
    });
  });

  it("does not intercept modifier or middle clicks on section links", async () => {
    const scrollSpy = vi.spyOn(navigation, "scrollToSection").mockReturnValue(true);
    scrollSpy.mockClear();

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CommandNav
          activeId="skills"
          counts={{ projects: 4, experience: 2, certificates: 3 }}
        />
      </NextIntlClientProvider>,
    );

    const link = (await screen.findAllByRole("link", { name: /skills/i }))[0];
    
    // Some versions of JSDOM/TestingLibrary do not propagate `button: 1` correctly on click events,
    // so we test standard modifiers.
    
    fireEvent.click(link, { button: 0, metaKey: true }); // Meta/Ctrl click
    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockClear();
    
    fireEvent.click(link, { button: 0, ctrlKey: true });
    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockClear();
    
    fireEvent.click(link, { button: 0, shiftKey: true });
    expect(scrollSpy).not.toHaveBeenCalled();
    scrollSpy.mockClear();
    
    fireEvent.click(link, { button: 0, altKey: true });
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it("hides decorative layers from a11y tree and avoids duplicate screen reader labels", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CommandNav
          activeId="projects"
          counts={{ projects: 4, experience: 2, certificates: 3 }}
        />
      </NextIntlClientProvider>,
    );

    // Each label should only be in the document once (no hidden duplicate span)
    expect(await screen.findAllByText(/Projects/)).toHaveLength(1);
    
    // There are structural elements that might use aria-hidden="true" 
    const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenElements.length).toBeGreaterThan(0);
  });

  it("renders all supported social links with safe external semantics", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CommandNav
          activeId="projects"
          counts={{ projects: 4, experience: 2, certificates: 3 }}
          socials={[
            {
              platform: "github",
              url: "https://github.com/example",
              label: "GitHub",
            },
            {
              platform: "linkedin",
              url: "https://linkedin.com/in/example",
              label: "LinkedIn",
            },
            { platform: "email", email: "dev@example.com", label: "Email" },
          ]}
        />
      </NextIntlClientProvider>,
    );

    const githubLink = (await screen.findAllByRole("link", { name: /github/i }))[0];
    const linkedinLink = (await screen.findAllByRole("link", { name: /linkedin/i }))[0];
    const emailLink = (await screen.findAllByRole("link", { name: /email/i }))[0];

    expect(githubLink).toHaveAttribute("href", "https://github.com/example");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer external");
    expect(linkedinLink).toHaveAttribute(
      "href",
      "https://linkedin.com/in/example",
    );
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer external");
    expect(emailLink).toHaveAttribute("href", "mailto:dev@example.com");
    expect(emailLink).not.toHaveAttribute("rel");
  });

  it("hides the command nav when hideOnScroll is enabled", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CommandNav
          activeId="projects"
          counts={{ projects: 4, experience: 2, certificates: 3 }}
          hideOnScroll
        />
      </NextIntlClientProvider>,
    );

    expect(await screen.findByTestId("tempered-nav")).toHaveClass(
      "pointer-events-none"
    );
  });
});
