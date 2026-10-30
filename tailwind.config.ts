import type { Config } from "tailwindcss";

function withOpacity(variableName: string): any {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}-rgb), ${opacityValue})`;
    }
    return `var(${variableName})`;
  };
}

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SBS CaseLab Brand Tokens
        primary: {
          DEFAULT: withOpacity("--primary"),
          hover: withOpacity("--primary-hover"),
          soft: withOpacity("--primary-soft"),
        },
        "primary-hover": withOpacity("--primary-hover"),
        "primary-soft": withOpacity("--primary-soft"),

        accent: {
          DEFAULT: withOpacity("--accent"),
          hover: withOpacity("--accent-hover"),
          text: withOpacity("--on-accent"),
        },
        "accent-hover": withOpacity("--accent-hover"),
        "on-primary": withOpacity("--on-primary"),
        "on-primary-muted": withOpacity("--on-primary-muted"),
        "on-accent": withOpacity("--on-accent"),

        background: {
          DEFAULT: withOpacity("--background"),
          elevated: withOpacity("--background-elevated"),
        },
        "background-elevated": withOpacity("--background-elevated"),

        surface: {
          DEFAULT: withOpacity("--surface"),
          raised: withOpacity("--surface-raised"),
          subtle: withOpacity("--surface-subtle"),
          hover: withOpacity("--surface-hover"),
        },
        "surface-raised": withOpacity("--surface-raised"),
        "surface-subtle": withOpacity("--surface-subtle"),
        "surface-hover": withOpacity("--surface-hover"),
        card: withOpacity("--surface"),
        popover: withOpacity("--surface-raised"),

        border: {
          DEFAULT: withOpacity("--border"),
          strong: withOpacity("--border-strong"),
          subtle: withOpacity("--border-subtle"),
        },
        "border-strong": withOpacity("--border-strong"),
        "border-subtle": withOpacity("--border-subtle"),

        text: {
          DEFAULT: withOpacity("--text"),
          muted: withOpacity("--text-muted"),
          subtle: withOpacity("--text-subtle"),
        },
        muted: withOpacity("--text-muted"),
        "text-muted": withOpacity("--text-muted"),
        "text-subtle": withOpacity("--text-subtle"),

        success: withOpacity("--success"),
        warning: withOpacity("--warning"),
        danger: withOpacity("--danger"),
        info: withOpacity("--info"),

        // Soft tints for case card headers and chips
        tint: {
          blue: withOpacity("--tint-blue"),
          red: withOpacity("--tint-red"),
          green: withOpacity("--tint-green"),
          amber: withOpacity("--tint-amber"),
          cyan: withOpacity("--tint-cyan"),
          purple: withOpacity("--tint-purple"),
        },

        // Legacy compatibility mappings so that existing components resolve cleanly
        navy: {
          950: withOpacity("--primary"),
          900: withOpacity("--primary"),
          850: withOpacity("--primary-soft"),
          800: withOpacity("--border"),
          750: withOpacity("--border"),
          700: withOpacity("--border"),
          600: withOpacity("--primary"),
        },
        gold: {
          50: withOpacity("--primary-soft"),
          100: withOpacity("--primary-soft"),
          200: withOpacity("--accent"),
          300: withOpacity("--accent"),
          400: withOpacity("--accent"),
          500: withOpacity("--accent"),
          600: withOpacity("--accent-hover"),
          700: withOpacity("--accent-hover"),
          800: withOpacity("--accent-hover"),
          900: withOpacity("--on-accent"),
        },
        canvas: {
          light: withOpacity("--background"),
          "light-card": withOpacity("--surface"),
          "light-subtle": withOpacity("--primary-soft"),
          "light-border": withOpacity("--border"),
          dark: withOpacity("--background"),
          "dark-card": withOpacity("--surface"),
          "dark-subtle": withOpacity("--surface"),
          "dark-border": withOpacity("--border"),
        },
      },
      zIndex: {
        base: "0",
        sticky: "30",
        overlay: "40",
        dropdown: "50",
        modal: "60",
        toast: "70",
      },
      boxShadow: {
        "2xs": "0 1px 2px rgba(15, 40, 80, 0.04)",
        xs: "0 1px 2px rgba(15, 40, 80, 0.05)",
        sm: "0 1px 2px rgba(15, 40, 80, 0.06), 0 6px 18px rgba(15, 40, 80, 0.06)",
        md: "0 4px 6px -1px rgba(15, 40, 80, 0.07), 0 10px 20px -2px rgba(15, 40, 80, 0.07)",
        lg: "0 10px 15px -3px rgba(15, 40, 80, 0.08), 0 16px 28px -4px rgba(15, 40, 80, 0.08)",
        xl: "0 20px 25px -5px rgba(15, 40, 80, 0.10), 0 25px 35px -5px rgba(15, 40, 80, 0.08)",
      },
      fontFamily: {
        serif: [
          "var(--font-serif)",
          "var(--font-devanagari)",
          "var(--font-gujarati)",
          "Cinzel",
          "Playfair Display",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        sans: [
          "var(--font-sans)",
          "var(--font-devanagari)",
          "var(--font-gujarati)",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
