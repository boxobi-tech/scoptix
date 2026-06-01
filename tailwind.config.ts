import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        void: "var(--color-void)",
        ink: "var(--color-ink)",
        lift: "var(--color-lift)",
        panel: "var(--color-panel)",
        line: "var(--color-line)",
        muted: "var(--color-muted)",
        cream: "var(--color-cream)",
        accent: "var(--color-accent)",
        "accent-dim": "var(--color-accent-dim)",
        warn: "var(--color-warn)",
        background: "var(--color-void)",
        foreground: "var(--color-cream)",
        border: "var(--color-line)",
      },
      boxShadow: {
        glass: "var(--shadow-glass)",
        lift: "var(--shadow-lift)",
        clay: "var(--shadow-clay)",
      },
      backgroundImage: {
        ambient: "var(--bg-ambient)",
      },
    },
  },
  plugins: [],
};

export default config;
