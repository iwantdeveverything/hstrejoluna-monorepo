import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          salmon: "#FF7E67", // Tono principal vibrante de salmón
          salmonDark: "#E5624D", // Tono oscuro para hover en botones
          marine: "#0A192F", // Azul marino oscuro para contrastes y texto principal
          marineLight: "#112240", // Azul marino secundario
          sand: "#F9F6F0", // Color arena claro para fondos
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
