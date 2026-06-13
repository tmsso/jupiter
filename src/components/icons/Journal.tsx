// Journal privacy glyphs: closed book (private) and open book (public).
// Ported from Jupiter.dc.html (48x48 viewBox, 1.5 stroke, round caps/joins).

interface JournalProps {
  size?: number;
  color?: string;
}

export function JournalClosed({ size = 22, color = "currentColor" }: JournalProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "block", flex: "none" }} aria-hidden="true">
      <rect x="13" y="8" width="22" height="32" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M 17.5 8 L 17.5 40" fill="none" stroke={color} strokeWidth="1.5" />
      <path
        d="M 35 19 L 39 19 L 39 25 L 35 25"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function JournalOpen({ size = 22, color = "currentColor" }: JournalProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "block", flex: "none" }} aria-hidden="true">
      <path
        d="M 24 13 C 19.5 10 13 10 9 12 L 9 36 C 13 34 19.5 34 24 37 C 28.5 34 35 34 39 36 L 39 12 C 35 10 28.5 10 24 13 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M 24 13 L 24 37" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
