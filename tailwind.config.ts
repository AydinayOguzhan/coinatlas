import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1C1C",
        paper: "#F8F3E8",
        accent: "#B6682D",
        moss: "#44624A",
        line: "#DCCFB4"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 40px rgba(15, 28, 28, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
