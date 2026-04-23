import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExperienceOverview } from "./ExperienceOverview";

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: unknown }) => <div>{JSON.stringify(value)}</div>,
}));

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
      ),
      button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
      ),
    },
  };
});

vi.mock("lucide-react", () => ({
  Calendar: () => <span data-testid="icon-calendar" />,
  Building: () => <span data-testid="icon-building" />,
  ChevronRight: () => <span data-testid="icon-chevron" />,
}));

const mockExperiences = [
  {
    _id: "exp-1",
    _type: "experience" as const,
    role: "Senior Engineer",
    company: "TechCorp",
    startDate: "2022-03-15",
    endDate: "2023-11-20",
    isCurrent: false,
    description: "Built systems",
  },
  {
    _id: "exp-2",
    _type: "experience" as const,
    role: "Lead Developer",
    company: "StartupInc",
    startDate: "2024-01-01",
    endDate: null,
    isCurrent: true,
    description: "Leading team",
  },
];

describe("ExperienceOverview — Semantic Time Markup", () => {
  it("wraps start and end dates in <time> elements with datetime attributes", () => {
    render(<ExperienceOverview experiences={mockExperiences} />);

    const timeElements = document.querySelectorAll("time");
    expect(timeElements.length).toBeGreaterThanOrEqual(2);

    // Find the time element for 2022 start date
    const startTime = Array.from(timeElements).find(el =>
      el.getAttribute("datetime")?.includes("2022")
    );
    expect(startTime).toBeInTheDocument();
    expect(startTime).toHaveAttribute("datetime", "2022-03-15");
  });

  it("does not wrap localized 'present' key in a <time> element for current jobs", () => {
    render(<ExperienceOverview experiences={mockExperiences} />);

    const presentText = screen.getByText("experience.present");
    expect(presentText).toBeInTheDocument();
    expect(presentText.tagName).not.toBe("TIME");
  });

  it("uses <time> for the start date of current jobs", () => {
    render(<ExperienceOverview experiences={mockExperiences} />);

    const timeElements = document.querySelectorAll("time");
    const currentJobStart = Array.from(timeElements).find(el =>
      el.getAttribute("datetime")?.includes("2024")
    );
    expect(currentJobStart).toBeInTheDocument();
    expect(currentJobStart).toHaveAttribute("datetime", "2024-01-01");
  });
});
