/**
 * Viridian Design System - Colors
 * Based on the design system in Figma
 */

export const colors = {
  // Neutrals
  black: "#000000",
  white: "#FFFFFF",
  bg: "#F8F8F8",
  surface: "#FFFFFF",
  border: "#E5E5E5",
  text: "#1A1A1A",
  text2: "#666666",
  text3: "#999999",

  // Mastery Levels
  approaching: {
    bg: "#FEF3E2",
    border: "#FED7AA",
    text: "#92400E",
    accent: "#EA580C",
  },
  developing: {
    bg: "#FEF9E7",
    border: "#FDE047",
    text: "#713F12",
    accent: "#EAB308",
  },
  proficient: {
    bg: "#DCFCE7",
    border: "#86EFAC",
    text: "#166534",
    accent: "#22C55E",
  },

  // UI Accents
  amber: {
    bg: "#FEF9E7",
    border: "#FDE047",
    text: "#92400E",
    accent: "#EAB308",
    light: "#FFFACD",
  },
  teal: {
    bg: "#CCFBF1",
    border: "#5EEAD4",
    text: "#134E4A",
    accent: "#14B8A6",
  },
  green: {
    bg: "#DCFCE7",
    border: "#86EFAC",
    text: "#166534",
    accent: "#22C55E",
  },
  orange: {
    bg: "#FFEDD5",
    border: "#FDBA74",
    text: "#92400E",
    accent: "#F97316",
  },
  red: {
    bg: "#FEE2E2",
    border: "#FECACA",
    text: "#991B1B",
    accent: "#EF4444",
  },
};

export type Color = keyof typeof colors;
