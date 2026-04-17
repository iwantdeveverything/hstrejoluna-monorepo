import type { Preview } from "@storybook/nextjs-vite";
import "../app/globals.css";
import { setupStorybookNextMocks } from "./mocks/next";

setupStorybookNextMocks();

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
