import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { CommandNav } from "./CommandNav";

const meta = {
  title: "UI/CommandNav",
  component: CommandNav,
  args: {
    activeId: "projects",
    counts: {
      projects: 4,
      experience: 2,
      certificates: 3,
    },
    socials: [
      { platform: "github", url: "https://github.com/example", label: "GitHub" },
      { platform: "linkedin", url: "https://linkedin.com/in/example", label: "LinkedIn" },
      { platform: "email", email: "dev@example.com", label: "Email" },
    ],
  },
} satisfies Meta<typeof CommandNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutSocials: Story = {
  args: {
    socials: [],
  },
};

export const MenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open navigation menu/i }));
  },
};
