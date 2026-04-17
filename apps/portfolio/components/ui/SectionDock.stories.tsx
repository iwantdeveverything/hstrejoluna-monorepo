import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionDock } from "./SectionDock";

const sections = [
  { id: "projects", label: "Projects", shortLabel: "Projects" },
  { id: "experience", label: "Experience", shortLabel: "Experience" },
  { id: "skills", label: "Skills", shortLabel: "Skills" },
  { id: "certificates", label: "Certificates", shortLabel: "Certificates" },
] as const;

const meta = {
  title: "UI/SectionDock",
  component: SectionDock,
  args: {
    sections,
    activeId: "projects",
    hideOnScroll: false,
  },
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SectionDock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ActiveProjects: Story = {};

export const HiddenOnScroll: Story = {
  args: {
    hideOnScroll: true,
  },
};

export const ActiveSkills: Story = {
  args: {
    activeId: "skills",
  },
};
