// Entry meta date, e.g. "JUN 10" (README "Meta / date": uppercase, 0.14em).
// Rendered from the UTC timestamp.
export function formatEntryDate(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = d.getUTCDate();
  return `${month} ${day}`.toUpperCase();
}

// A stable moon phase in [0,1) for an entry's byline glyph, derived from the
// post id so it's deterministic (real posts carry no phase of their own).
export function moonPhaseFor(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return (Math.abs(h) % 1000) / 1000;
}
