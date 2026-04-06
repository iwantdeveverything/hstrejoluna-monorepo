import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          salmon: "#FF7E67",
          salmonDark: "#E5624D",
          marine: "#0A192F",
          marineLight: "#112240",
          sand: "#F9F6F0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
