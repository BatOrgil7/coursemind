import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f0ff",
          100: "#e8ddff",
          200: "#d3bfff",
          300: "#b794ff",
          400: "#9a61ff",
          500: "#7c3aed",
          600: "#6925d5",
          700: "#541daf",
          800: "#401982",
          900: "#2c135d",
          950: "#160927",
        },
        aqua: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        lime: {
          100: "#ecfccb",
          300: "#bef264",
          400: "#a3e635",
          500: "#84cc16",
        },
        coral: {
          50: "#fff1f2",
          100: "#ffe4e6",
          400: "#fb7185",
          500: "#f43f5e",
        },
        ember: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        paper: "#f7f8fc",
        ink: "#12111f",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 55px -42px rgba(18, 17, 31, 0.58), 0 1px 0 rgba(255,255,255,0.72) inset",
        lift: "0 24px 70px -34px rgba(124, 58, 237, 0.55)",
      },
    },
  },
  plugins: [],
} satisfies Config;
