/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Color tokens resolve through CSS variables (see src/index.css) so the
      // whole app repaints when the `theme-lakmee` class is toggled on <html>
      // — no per-component theme conditionals needed. Format required by
      // Tailwind for opacity-modifier support (e.g. bg-primary/40):
      // 'rgb(var(--x) / <alpha-value>)'.
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-bright": "rgb(var(--color-surface-bright) / <alpha-value>)",
        "surface-variant": "rgb(var(--color-surface-variant) / <alpha-value>)",
        "surface-container": "rgb(var(--color-surface-container) / <alpha-value>)",
        "surface-container-low": "rgb(var(--color-surface-container-low) / <alpha-value>)",
        "surface-container-high": "rgb(var(--color-surface-container-high) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--color-surface-container-highest) / <alpha-value>)",
        "on-surface": "rgb(var(--color-on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        "outline-variant": "rgb(var(--color-outline-variant) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--color-primary-container) / <alpha-value>)",
        "on-primary-container": "rgb(var(--color-on-primary-container) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        "error-container": "rgb(var(--color-error-container) / <alpha-value>)",
        // Status chip colors (not part of the theme system on purpose — asset
        // status must stay identically readable regardless of organization)
        "status-active-bg": "#0f5223",
        "status-active-fg": "#4ade80",
        "status-repair-bg": "#7c2d12",
        "status-repair-fg": "#fb923c",
        "status-retired-bg": "#353438",
        "status-retired-fg": "#a78a8a",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      spacing: {
        margin: "24px",
        gutter: "16px",
        "container-max": "1440px",
        unit: "4px",
      },
      fontFamily: {
        // Also resolve through CSS variables, so Palladion (IBM Plex Sans /
        // Inter / JetBrains Mono) and Lakmee Holdings (Manrope / Work Sans /
        // IBM Plex Sans) get correct typography, not just correct colors.
        "data-label": ["var(--font-data-label)", "sans-serif"],
        "headline-md": ["var(--font-headline)", "sans-serif"],
        "headline-lg": ["var(--font-headline)", "sans-serif"],
        "body-lg": ["var(--font-body)", "sans-serif"],
        "body-sm": ["var(--font-body)", "sans-serif"],
        "asset-id": ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "data-label": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg": ["30px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "asset-id": ["14px", { lineHeight: "18px", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
