import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0d021a",
        "purple-glow": "#a855f7",
        "fuchsia-glow": "#d946ef",
        "pink-glow": "#ec4899",
        glass: "rgba(28, 10, 48, 0.25)",
      },
      backdropBlur: {
        glass: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(13, 2, 26, 0.6)",
        neon: "0 0 25px rgba(168, 85, 247, 0.25)",
        "neon-fuchsia": "0 0 30px rgba(217, 70, 239, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
