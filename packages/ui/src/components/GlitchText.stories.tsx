import type { Meta, StoryObj } from "@storybook/react";
import { GlitchText } from "./GlitchText";

const meta = {
  title: "UI/GlitchText",
  component: GlitchText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    active: { control: "boolean" },
  },
} satisfies Meta<typeof GlitchText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "SYSTEM_ONLINE",
  },
  render: (args) => (
    <div className="bg-void p-12 flex justify-center text-4xl font-black text-white italic">
      <GlitchText {...args} />
    </div>
  ),
};

export const ActiveGlitch: Story = {
  args: {
    text: "CRITICAL_ERROR",
    active: true,
  },
  render: (args) => (
    <div className="bg-void p-12 flex justify-center text-4xl font-black text-error italic">
      <GlitchText {...args} />
    </div>
  ),
};