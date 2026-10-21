import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#13233F", 800: "#1B3158", 600: "#35507F", 100: "#DDE4F0" },
        sand: { DEFAULT: "#EFE6D4", 200: "#F6F0E3", 400: "#DCCDAE", 600: "#A8935F" },
      },
      fontFamily: { display: ["var(--font-display)", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
