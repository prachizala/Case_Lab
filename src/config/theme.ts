// ==============================================================================
// SBS CaseLab: Institutional Theme Design Tokens
// Single source of truth for programmatic styling (PDF, DOCX, Canvas, Charts)
// Based on official Shanti Business School brand colors: https://shantibschool.edu.in/
// ==============================================================================

export const THEME_TOKENS = {
  light: {
    primary: "#003C64",
    primaryHover: "#002B48",
    primarySoft: "#E6F0F7",
    accent: "#D1130D",
    accentHover: "#A80E0A",
    accentText: "#FFFFFF",
    onPrimary: "#FFFFFF",
    onPrimaryMuted: "rgba(255, 255, 255, 0.8)",
    onAccent: "#FFFFFF",
    background: "#FAFAF8",
    backgroundElevated: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceRaised: "#FFFFFF",
    surfaceHover: "#F3F4F6",
    border: "#E5E7EB",
    borderStrong: "#D1D5DB",
    text: "#1B222B",
    textMuted: "#526071",
    textSubtle: "#788698",
    success: "#0D8D2D",
    warning: "#B7791F",
    danger: "#C62828",
    info: "#003C64",
  },
  dark: {
    primary: "#184D7A",
    primaryHover: "#205F94",
    primarySoft: "#132B45",
    accent: "#E0281F",
    accentHover: "#F23D33",
    accentText: "#FFFFFF",
    onPrimary: "#FFFFFF",
    onPrimaryMuted: "rgba(255, 255, 255, 0.8)",
    onAccent: "#FFFFFF",
    background: "#07131F",
    backgroundElevated: "#0C1D2E",
    surface: "#112338",
    surfaceRaised: "#182F49",
    surfaceHover: "#1F3B5C",
    border: "#223E60",
    borderStrong: "#335580",
    text: "#F0F4F8",
    textMuted: "#9DB2C7",
    textSubtle: "#7289A3",
    success: "#4ADE80",
    warning: "#FBBF24",
    danger: "#F87171",
    info: "#38BDF8",
  },
  charts: [
    "#003C64", // SBS Corporate Deep Navy Blue
    "#D1130D", // SBS Signature Crimson Red
    "#0D8D2D", // SBS Emerald Green
    "#B7791F", // Warm Amber
    "#075597", // SBS Royal Blue Emblem
    "#6A4C93", // Royal Violet
  ] as const,
  industryTints: {
    technology: {
      lightBg: "#E6F0F7",
      darkBg: "#132B45",
      name: "Technology & AI",
    },
    finance: {
      lightBg: "#E6F5EB",
      darkBg: "#122B1C",
      name: "FinTech & Banking",
    },
    healthcare: {
      lightBg: "#E1F0FA",
      darkBg: "#10293B",
      name: "Healthcare & Pharma",
    },
    energy: {
      lightBg: "#FEF3E2",
      darkBg: "#2E2211",
      name: "Renewable Energy & CleanTech",
    },
    consumer: {
      lightBg: "#FDE8E7",
      darkBg: "#331518",
      name: "Retail & Consumer Goods",
    },
    manufacturing: {
      lightBg: "#F2EDF8",
      darkBg: "#251833",
      name: "Manufacturing & Supply Chain",
    },
    default: {
      lightBg: "#E6F0F7",
      darkBg: "#132B45",
      name: "General Management",
    },
  },
} as const;

export type ThemeTokens = typeof THEME_TOKENS;

/**
 * Converts a hex string (#RRGGBB or RRGGBB) to an RGB tuple [r, g, b].
 */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

/**
 * Returns the corresponding industry tint palette based on industry name.
 */
export function getIndustryTint(industryName?: string) {
  if (!industryName) return THEME_TOKENS.industryTints.default;
  const lower = industryName.toLowerCase();
  if (lower.includes("tech") || lower.includes("software") || lower.includes("ai")) {
    return THEME_TOKENS.industryTints.technology;
  }
  if (lower.includes("fin") || lower.includes("bank") || lower.includes("invest")) {
    return THEME_TOKENS.industryTints.finance;
  }
  if (lower.includes("health") || lower.includes("pharma") || lower.includes("bio")) {
    return THEME_TOKENS.industryTints.healthcare;
  }
  if (lower.includes("energ") || lower.includes("clean") || lower.includes("solar") || lower.includes("oil")) {
    return THEME_TOKENS.industryTints.energy;
  }
  if (lower.includes("retail") || lower.includes("consumer") || lower.includes("commerce")) {
    return THEME_TOKENS.industryTints.consumer;
  }
  if (lower.includes("manufactur") || lower.includes("supply") || lower.includes("logistics")) {
    return THEME_TOKENS.industryTints.manufacturing;
  }
  return THEME_TOKENS.industryTints.default;
}

/**
 * Returns Tailwind class names for case card header tints (soft background, border, dark text).
 */
export function getIndustryTintClass(industryName?: string): string {
  if (!industryName) return "bg-tint-blue border-border text-text";
  const lower = industryName.toLowerCase();
  if (lower.includes("tech") || lower.includes("software") || lower.includes("ai")) {
    return "bg-tint-blue border-border text-text";
  }
  if (lower.includes("fin") || lower.includes("bank") || lower.includes("invest")) {
    return "bg-tint-green border-border text-text";
  }
  if (lower.includes("health") || lower.includes("pharma") || lower.includes("bio")) {
    return "bg-tint-cyan border-border text-text";
  }
  if (lower.includes("energ") || lower.includes("clean") || lower.includes("solar") || lower.includes("oil")) {
    return "bg-tint-amber border-border text-text";
  }
  if (lower.includes("retail") || lower.includes("consumer") || lower.includes("commerce")) {
    return "bg-tint-red border-border text-text";
  }
  if (lower.includes("manufactur") || lower.includes("supply") || lower.includes("logistics")) {
    return "bg-tint-purple border-border text-text";
  }
  return "bg-tint-blue border-border text-text";
}
