// CourseMind design tokens — mirrors the web palette
// (apps/web/tailwind.config.ts) so both platforms feel like one product.
// TODO: migrate styling to NativeWind for full Tailwind parity.
export const colors = {
  brand950: "#1e1b4b",
  brand900: "#312e81",
  brand700: "#4338ca",
  brand600: "#4f46e5",
  brand500: "#6366f1",
  brand300: "#a5b4fc",
  brand100: "#e0e7ff",
  brand50: "#eef2ff",
  ember500: "#f59e0b",
  ember400: "#fbbf24",
  paper: "#faf9f6",
  ink: "#0f172a",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate200: "#e2e8f0",
  white: "#ffffff",
  rose50: "#fff1f2",
  rose700: "#be123c",
  emerald100: "#d1fae5",
  emerald800: "#065f46",
  amber50: "#fffbeb",
  amber800: "#92400e",
};

export const radius = { md: 12, lg: 16, xl: 20 };

export const TIER_LABELS: Record<number, string> = {
  0: "Full explanation",
  1: "Nudge",
  2: "Guiding question",
  3: "Concept + example",
  4: "Walkthrough",
};
