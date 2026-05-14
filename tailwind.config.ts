import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0c2143",
          dark: "#081530",
          deep: "#050d20",
        },
        royal: "#0046B6",
        royalLight: "#1B5BC9",
        vasasRed: "#E11D2E",
        vasasRedDark: "#B0121F",
        gold: {
          DEFAULT: "#B8985C",
          light: "#D4B97A",
          dark: "#8C6F3D",
        },
        cream: "#F7F3EC",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, rgba(8,21,48,0.95) 0%, rgba(0,70,182,0.85) 50%, rgba(225,29,46,0.75) 100%)",
        "navy-gradient": "linear-gradient(180deg, #0c2143 0%, #050d20 100%)",
        "gold-gradient": "linear-gradient(90deg, #8C6F3D 0%, #D4B97A 50%, #8C6F3D 100%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(0, 70, 182, 0.35)",
        goldGlow: "0 0 30px rgba(184, 152, 92, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
