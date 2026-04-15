import { beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeSocialLinks, scrollToSection } from "./navigation";

describe("normalizeSocialLinks", () => {
  it("normalizes and orders supported social links", () => {
    const links = normalizeSocialLinks([
      { platform: "linkedin", url: "https://linkedin.com/in/example", order: 2 },
      { platform: "github", url: "https://github.com/example", order: 1 },
      { platform: "email", email: "hello@example.com", order: 3 },
    ]);

    expect(links).toEqual([
      {
        kind: "github",
        href: "https://github.com/example",
        label: "GitHub",
        external: true,
      },
      {
        kind: "linkedin",
        href: "https://linkedin.com/in/example",
        label: "LinkedIn",
        external: true,
      },
      {
        kind: "email",
        href: "mailto:hello@example.com",
        label: "Email",
        external: false,
      },
    ]);
  });

  it("converts email values to mailto and filters invalid records", () => {
    const links = normalizeSocialLinks([
      { platform: "email", url: "dev@example.com" },
      { platform: "email", email: "invalid-email" },
      { platform: "x", url: "https://x.com/example" },
    ]);

    expect(links).toEqual([
      {
        kind: "email",
        href: "mailto:dev@example.com",
        label: "Email",
        external: false,
      },
    ]);
  });
});

describe("scrollToSection", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("scrolls smoothly when reduced motion is disabled", () => {
    const section = document.createElement("section");
    section.id = "projects";
    const scrollIntoView = vi.fn();

    Object.defineProperty(section, "scrollIntoView", {
      value: scrollIntoView,
      configurable: true,
    });
    document.body.appendChild(section);

    const replaceState = vi
      .spyOn(window.history, "replaceState")
      .mockImplementation(() => {});

    const didScroll = scrollToSection({ id: "projects", reducedMotion: false });

    expect(didScroll).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(replaceState).toHaveBeenCalledWith(null, "", "#projects");
  });

  it("uses instant scrolling when reduced motion is enabled", () => {
    const section = document.createElement("section");
    section.id = "skills";
    const scrollIntoView = vi.fn();

    Object.defineProperty(section, "scrollIntoView", {
      value: scrollIntoView,
      configurable: true,
    });
    document.body.appendChild(section);

    const didScroll = scrollToSection({ id: "skills", reducedMotion: true });

    expect(didScroll).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
  });
});
