/**
 * Design System Configuration
 * Centralized color, typography, spacing, and animation tokens
 */

export const DESIGN_TOKENS = {
  // ─── COLOR SYSTEM ───
  colors: {
    light: {
      bg: {
        primary: "#F9FAFB",
        secondary: "#F3F4F6",
        tertiary: "#E5E7EB",
        surface: "#FFFFFF",
      },
      text: {
        primary: "#0F172A",
        secondary: "#475569",
        tertiary: "#64748B",
        muted: "#94A3B8",
      },
      border: "#E2E8F0",
      accent: {
        primary: "#6366F1",
        secondary: "#818CF8",
        danger: "#EF4444",
        success: "#22C55E",
        warning: "#F59E0B",
      },
    },
    dark: {
      bg: {
        primary: "#0F172A",
        secondary: "#1E293B",
        tertiary: "#334155",
        surface: "#1A2841",
      },
      text: {
        primary: "#F1F5F9",
        secondary: "#CBD5E1",
        tertiary: "#94A3B8",
        muted: "#64748B",
      },
      border: "#334155",
      accent: {
        primary: "#818CF8",
        secondary: "#A5B4FC",
        danger: "#F87171",
        success: "#4ADE80",
        warning: "#FBBF24",
      },
    },
  },

  // ─── STATUS COLORS ───
  statusColors: {
    PROSPECT: {
      light: { bg: "#EEF2FF", text: "#4338CA", dot: "#6366F1" },
      dark: { bg: "#312E81", text: "#A5B4FC", dot: "#818CF8" },
    },
    QUALIFIED: {
      light: { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
      dark: { bg: "#7C2D12", text: "#FDBA74", dot: "#FB923C" },
    },
    PROPOSAL: {
      light: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
      dark: { bg: "#1E3A8A", text: "#93C5FD", dot: "#60A5FA" },
    },
    "CLOSED WON": {
      light: { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
      dark: { bg: "#064E3B", text: "#86EFAC", dot: "#4ADE80" },
    },
    "CLOSED LOST": {
      light: { bg: "#FFF1F2", text: "#BE123C", dot: "#F43F5E" },
      dark: { bg: "#7F1D1D", text: "#FB7185", dot: "#F87171" },
    },
  },

  // ─── TYPOGRAPHY ───
  typography: {
    fontFamily: {
      display: "'DM Serif Display', serif",
      body: "'DM Sans', sans-serif",
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "15px",
      lg: "16px",
      xl: "18px",
      "2xl": "20px",
      "3xl": "24px",
      "4xl": "32px",
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // ─── SPACING (8px grid) ───
  spacing: {
    px: "1px",
    0.5: "4px",
    1: "8px",
    1.5: "12px",
    2: "16px",
    2.5: "20px",
    3: "24px",
    3.5: "28px",
    4: "32px",
    5: "40px",
    6: "48px",
    7: "56px",
    8: "64px",
  },

  // ─── BORDER RADIUS ───
  borderRadius: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
    full: "9999px",
  },

  // ─── SHADOWS ───
  shadows: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.08)",
    md: "0 4px 12px rgba(0, 0, 0, 0.12)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.15)",
    xl: "0 16px 40px rgba(0, 0, 0, 0.18)",
    "2xl": "0 20px 60px rgba(0, 0, 0, 0.2)",
  },

  // ─── ANIMATIONS ───
  animations: {
    duration: {
      fast: 150,
      base: 250,
      slow: 400,
      slower: 600,
    },
    easing: {
      easeOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.6, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      smooth: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },

  // ─── BREAKPOINTS ───
  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
};

export const getStatusColor = (status, theme = "light") => {
  return DESIGN_TOKENS.statusColors[status]?.[theme] || 
    DESIGN_TOKENS.statusColors["PROSPECT"][theme];
};

export const getThemeColor = (path, theme = "light") => {
  const keys = path.split(".");
  let value = DESIGN_TOKENS.colors[theme];
  for (const key of keys) {
    value = value[key];
    if (!value) return null;
  }
  return value;
};