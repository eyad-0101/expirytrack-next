import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans Arabic", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        brand: {
          50:  "#f0faf8",
          100: "#d1f0ea",
          200: "#a4e1d6",
          300: "#6ccabd",
          400: "#39aca0",
          500: "#1e9285",
          600: "#146257",
          700: "#115249",
          800: "#0f4340",
          900: "#0d3834",
        },
        ink: {
          50:  "#f4f7f6",
          100: "#e5eceb",
          200: "#c4d0ce",
          300: "#9db0ad",
          400: "#718f8b",
          500: "#5a6f6c",
          600: "#4a5c5a",
          700: "#3b4b4a",
          800: "#2d3c3a",
          900: "#1a1f1e",
          950: "#13171a",
        },
        sidebar: "#f4f7f6",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;