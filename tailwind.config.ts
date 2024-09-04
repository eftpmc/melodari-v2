import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        modelica: ['Bw Modelica', 'sans-serif'],
        helvetica: ['Helvetica', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#E97FAF",
          secondary: "#3F01E7",
        },
      },
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#E97FAF",
          secondary: "#3F01E7",
        },
      }
    ], // Ensure that both light and dark themes are enabled
  },
};
export default config;
