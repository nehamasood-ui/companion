import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: "#FAFAFB",
        surface: "#FFFFFF",
        line: "#ECECF0",
        // Ink
        ink: "#17171F",
        "ink-soft": "#4A4A57",
        muted: "#8A8A97",
        // Brand — calm indigo-violet
        primary: {
          DEFAULT: "#5B57D6",
          soft: "#EEEDFB",
          ink: "#3F3BB0",
        },
        // Warm sunset accent (used sparingly for "golden" moments)
        sunset: {
          DEFAULT: "#F2784B",
          soft: "#FDEDE5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Generous, premium type scale
        display: ["clamp(2.4rem, 5vw, 3.75rem)", { lineHeight: "1.04", letterSpacing: "-0.03em" }],
        title: ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        // Soft, layered depth — never harsh
        card: "0 1px 2px rgba(23,23,31,0.04), 0 8px 24px -12px rgba(23,23,31,0.14)",
        lift: "0 2px 4px rgba(23,23,31,0.05), 0 18px 40px -16px rgba(23,23,31,0.22)",
        glow: "0 0 0 1px rgba(91,87,214,0.12), 0 12px 32px -8px rgba(91,87,214,0.30)",
      },
      keyframes: {
        "gradient-drift": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(-3%, 2%) scale(1.08)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "gradient-drift": "gradient-drift 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
