import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00685f",
        "primary-container": "#008378",
        "on-primary": "#ffffff",
        "on-primary-container": "#f4fffc",
        "primary-fixed": "#89f5e7",
        "primary-fixed-dim": "#6bd8cb",
        "on-primary-fixed": "#00201d",
        "on-primary-fixed-variant": "#005049",

        secondary: "#006398",
        "secondary-container": "#5bb8fe",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#00476e",
        "secondary-fixed": "#cce5ff",
        "secondary-fixed-dim": "#93ccff",
        "on-secondary-fixed": "#001d31",
        "on-secondary-fixed-variant": "#004b73",

        tertiary: "#00685d",
        "tertiary-container": "#008376",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#f4fffb",
        "tertiary-fixed": "#71f8e4",
        "tertiary-fixed-dim": "#4fdbc8",
        "on-tertiary-fixed": "#00201c",
        "on-tertiary-fixed-variant": "#005048",

        surface: "#faf8ff",
        "surface-bright": "#faf8ff",
        "surface-dim": "#d2d9f4",
        "surface-variant": "#dae2fd",
        "surface-tint": "#006a61",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f3ff",
        "surface-container": "#eaedff",
        "surface-container-high": "#e2e7ff",
        "surface-container-highest": "#dae2fd",

        "on-surface": "#131b2e",
        "on-surface-variant": "#3d4947",
        outline: "#6d7a77",
        "outline-variant": "#bcc9c6",

        "inverse-surface": "#283044",
        "inverse-on-surface": "#eef0ff",
        "inverse-primary": "#6bd8cb",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "0.75rem",
        "space-lg": "1rem",
        "space-xl": "1.5rem",
        "space-2xl": "2rem",
        margin: "1rem",
        "margin-md": "1.5rem",
        "margin-lg": "2rem",
        gutter: "1rem",
        "gutter-lg": "1.5rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        headline: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        display: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-inter)", "Inter", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
