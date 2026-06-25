import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
    dedupe: ["react", "react-dom"],
  },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "../../packages/ui/src/**/*.test.ts",
      "../../packages/ui/src/**/*.test.tsx",
    ],
    server: {
      deps: {
        inline: ["next-intl"],
      },
    },
  },
});
