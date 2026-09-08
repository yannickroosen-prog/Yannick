import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#b41411",
          "red-dark": "#8f100e",
          orange: "#e74c0a",
          "orange-dark": "#c53f06",
          "orange-soft": "#fde9dd",
          beige: "#f1f0ea",
          cream: "#fbf9f4",
          sand: "#e9e4d8",
          ink: "#2b2523",
          "ink-soft": "#5c534f",
          "ink-muted": "#8a807a",
          sage: "#3f7a5b",
          "sage-soft": "#e3efe7",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "ui-rounded", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43,37,35,0.06), 0 6px 20px -8px rgba(43,37,35,0.18)",
        bubble: "0 1px 1px rgba(43,37,35,0.05)",
      },
      borderRadius: {
        bubble: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 220ms ease-out both",
      },
    },
  },
  plugins: [forms({ strategy: "class" }), typography],
};

export default config;
