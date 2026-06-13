import type { Ring, Standing } from "./types";

// Orbit tiers. Thresholds + caps are tunable in app_settings.tiers; these are
// the reconciled defaults (ARCHITECTURE.md "Changes from v0.2" #5) used as a
// fallback and shape reference. Always prefer values fetched from the DB.
export const DEFAULT_RINGS: Ring[] = [
  { name: "io", minPoints: 0, cap: 3 },
  { name: "europa", minPoints: 50, cap: 4 },
  { name: "ganymede", minPoints: 140, cap: 5 },
  { name: "callisto", minPoints: 300, cap: 6 },
];

const RING_DESC: Record<string, string> = {
  io: "the innermost orbit",
  europa: "the second orbit",
  ganymede: "the third orbit",
  callisto: "the outermost orbit",
};

export function ringDescription(name: string): string {
  return RING_DESC[name] ?? "";
}

// Title-case a ring name for display ("europa" -> "Europa").
export function ringLabel(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// The current ring for a given point total (highest threshold not exceeding it).
export function ringForPoints(points: number, rings: Ring[] = DEFAULT_RINGS): Ring {
  let current = rings[0];
  for (const r of rings) if (points >= r.minPoints) current = r;
  return current;
}

// The next ring up, or null at the outermost orbit.
export function nextRing(points: number, rings: Ring[] = DEFAULT_RINGS): Ring | null {
  for (const r of rings) if (r.minPoints > points) return r;
  return null;
}

export function standingFor(points: number, rings: Ring[] = DEFAULT_RINGS): Standing {
  const ring = ringForPoints(points, rings);
  return { points, ring, next: nextRing(points, rings), cap: ring.cap };
}

// Italic next-step line on the orbit panel, e.g.
// "at 50 points your orbit reaches Europa and your daily limit becomes 4".
export function orbitNextLine(standing: Standing): string {
  if (!standing.next) return "you have reached the outermost orbit.";
  return `at ${standing.next.minPoints} points your orbit reaches ${ringLabel(
    standing.next.name,
  )} and your daily limit becomes ${standing.next.cap}.`;
}
