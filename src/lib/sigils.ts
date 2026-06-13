import type { SigilName } from "./types";

// Each glyph's signature color (README "Sigil colors"). This color also
// becomes the entry's rule-divider color. The authoritative *set* of allowed
// sigils lives in app_settings.sigils (DB-tunable); this map only supplies the
// colors the UI needs, keyed by id. Unknown ids fall back to the hashed palette.
export const SIGIL_COLORS: Record<SigilName, string> = {
  moon: "#A9B8D8",
  citrus: "#B9BC83",
  music: "#ABA0CE",
  cup: "#B3A795",
  book: "#9DB89A",
  candle: "#C5BD8E",
  leaf: "#8FBCA4",
  wave: "#8FB0BD",
  paw: "#ADA398",
  window: "#B0A4CC",
};

// Default display order for the picker (mirrors app_settings.sigils). When the
// DB set diverges, prefer the server list and intersect with what we can draw.
export const SIGIL_ORDER: SigilName[] = [
  "moon",
  "citrus",
  "music",
  "cup",
  "book",
  "candle",
  "leaf",
  "wave",
  "paw",
  "window",
];

// Rule-divider palette for entries with no sigil (README "Sigil colors").
const RULE_FALLBACK = [
  "#74B2BC",
  "#9FA3CF",
  "#9DB89A",
  "#A9B8D8",
  "#7FB3A6",
];

export function isSigilName(value: string | null | undefined): value is SigilName {
  return value != null && value in SIGIL_COLORS;
}

// The color of an entry's rule divider: its sigil's color, or a stable hashed
// pick from the fallback palette keyed by the post id.
export function ruleColor(sigil: SigilName | null, seed: string): string {
  if (sigil && SIGIL_COLORS[sigil]) return SIGIL_COLORS[sigil];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return RULE_FALLBACK[Math.abs(h) % RULE_FALLBACK.length];
}
