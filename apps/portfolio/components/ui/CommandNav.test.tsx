import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as navigation from "@/lib/navigation";
import { CommandNav } from "./CommandNav";

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => false,
}));

describe("CommandNav", () => {
  it("renders semantic navigation and marks active section with aria-current", () => {
    render(
      <CommandNav
        activeId="projects"
        counts={{ projects: 4, experience: 2, certificates: 3 }}
        socials={[{ platform: "github", url: "https://github.com/example" }]}
      />
    );

    expect(
      screen.getByRole("navigation", { name: /primary section navigation/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /projects/i })[0]).toHaveAttribute(
      "aria-current",
      "location"
    );
  });

  it("shows fallback text in mobile menu when socials are missing", () => {
    render(
      <CommandNav
        activeId="experience"
        counts={{ projects: 4, experience: 2, certificates: 3 }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));
    expect(screen.getByText(/no social links configured/i)).toBeInTheDocument();
  });

  it("normalizes plaintext email social links and uses smooth section navigation", () => {
    const scrollSpy = vi
      .spyOn(navigation, "scrollToSection")
      .mockReturnValue(true);

    render(
      <CommandNav
        activeId="skills"
        counts={{ projects: 4, experience: 2, certificates: 3 }}
        socials={[
          { platform: "email", email: "dev@example.com", label: "Contact Email" },
        ]}
      />
    );

    expect(screen.getAllByRole("link", { name: /contact email/i })[0]).toHaveAttribute(
      "href",
      "mailto:dev@example.com"
    );

    fireEvent.click(screen.getAllByRole("link", { name: /skills/i })[0]);
    expect(scrollSpy).toHaveBeenCalledWith({
      id: "skills",
      reducedMotion: false,
    });
  });

  it("renders all supported social links with safe external semantics", () => {
    render(
      <CommandNav
        activeId="projects"
        counts={{ projects: 4, experience: 2, certificates: 3 }}
        socials={[
          { platform: "github", url: "https://github.com/example", label: "GitHub" },
          { platform: "linkedin", url: "https://linkedin.com/in/example", label: "LinkedIn" },
          { platform: "email", email: "dev@example.com", label: "Email" },
        ]}
      />
    );

    const githubLink = screen.getAllByRole("link", { name: /github/i })[0];
    const linkedinLink = screen.getAllByRole("link", { name: /linkedin/i })[0];
    const emailLink = screen.getAllByRole("link", { name: /email/i })[0];

    expect(githubLink).toHaveAttribute("href", "https://github.com/example");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer external");
    expect(linkedinLink).toHaveAttribute("href", "https://linkedin.com/in/example");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer external");
    expect(emailLink).toHaveAttribute("href", "mailto:dev@example.com");
    expect(emailLink).not.toHaveAttribute("rel");
  });

  it("hides the command nav when hideOnScroll is enabled", () => {
    render(
      <CommandNav
        activeId="projects"
        counts={{ projects: 4, experience: 2, certificates: 3 }}
        hideOnScroll
      />
    );

    expect(screen.getByTestId("command-nav")).toHaveAttribute("data-hidden", "true");
  });
});
