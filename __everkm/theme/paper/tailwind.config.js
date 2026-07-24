import typography from "@tailwindcss/typography";

/**
 * Theme colors as CSS variables, with slash-opacity via color-mix.
 * Bare utilities (bg-background) must stay `var(--*)` — Tailwind may pass a
 * non-numeric opacityValue for the --tw-*-opacity pipeline; treating that as
 * a number produced `NaN%` and broke all theme colors.
 */
function colorVar(name) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `var(${name})`;
    }
    const n =
      typeof opacityValue === "number" ? opacityValue : Number(opacityValue);
    if (Number.isFinite(n)) {
      return `color-mix(in srgb, var(${name}) ${n * 100}%, transparent)`;
    }
    return `var(${name})`;
  };
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"] &'],
  theme: {
    extend: {
      colors: {
        background: colorVar("--background"),
        foreground: colorVar("--foreground"),
        accent: {
          DEFAULT: colorVar("--accent"),
          foreground: colorVar("--accent-foreground"),
        },
        muted: {
          DEFAULT: colorVar("--muted"),
          foreground: colorVar("--muted-foreground"),
        },
        border: colorVar("--border"),
        // FloatSearch / in-search tokens
        surface: {
          DEFAULT: colorVar("--background"),
          muted: colorVar("--muted"),
        },
        "text-primary": colorVar("--foreground"),
        "text-secondary": colorVar("--muted-foreground"),
        "text-tertiary": colorVar("--muted-foreground"),
        "state-hover":
          "color-mix(in srgb, var(--accent) 12%, transparent)",
        "state-active":
          "color-mix(in srgb, var(--accent) 20%, transparent)",
        "background-dark": colorVar("--background"),
      },
      // Preflight defaults to gray-200; keep theme border token as DEFAULT.
      borderColor: {
        DEFAULT: colorVar("--border"),
      },
      fontFamily: {
        app: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
      },
      maxWidth: {
        app: "48rem", // max-w-3xl
      },
    },
  },
  plugins: [typography],
};
