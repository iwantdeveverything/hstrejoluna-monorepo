import type { Meta, StoryObj } from "@storybook/react";
import { TelemetryHUD } from "./TelemetryHUD";

const meta = {
  title: "UI/TelemetryHUD",
  component: TelemetryHUD,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    identifier: { control: "text" },
    status: { control: "text" },
    dateRange: { control: "text" },
  },
} satisfies Meta<typeof TelemetryHUD>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectContext: Story = {
  args: {
    identifier: "maestros-del-salmon",
    status: "PROD_LIVE",
    techStack: ["Next.js", "TailwindCSS", "Framer Motion"],
  },
  render: (args) => (
    <div className="bg-void p-12 w-[400px]">
      <TelemetryHUD {...args} />
    </div>
  ),
};

export const ExperienceContext: Story = {
  args: {
    identifier: "TechCorp Inc.",
    status: "ACTIVE_OPS",
    dateRange: "2024.01 // PRESENT",
  },
  render: (args) => (
    <div className="bg-void p-12 w-[400px]">
      <TelemetryHUD {...args} />
    </div>
  ),
};