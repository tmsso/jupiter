// Moon-phase byline glyph. `phase` in [0,1) controls the terminator, exactly
// as the prototype computes it (Jupiter.dc.html `moon(phase, size)`).

export function MoonPhase({ phase, size = 13 }: { phase: number; size?: number }) {
  const c = size / 2;
  const r = size / 2 - 1.2;
  const k = Math.cos(2 * Math.PI * phase);
  const d =
    `M ${c} ${c - r}` +
    ` A ${r} ${r} 0 1 1 ${c} ${c + r}` +
    ` A ${(Math.abs(k) * r).toFixed(2)} ${r} 0 1 ${k > 0 ? 0 : 1} ${c} ${c - r} Z`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", flex: "none" }}
      aria-hidden="true"
    >
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(223,232,230,0.28)" strokeWidth={1} />
      <path d={d} fill="rgba(223,232,230,0.50)" />
    </svg>
  );
}
