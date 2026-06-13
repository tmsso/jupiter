// Jupiter wordmark glyph: a turquoise disc with three punch-out bands and an
// optional deep-teal moon (README sign-in spec). Ported from Jupiter.dc.html.

export function Wordmark({
  size = 58,
  withMoon = true,
}: {
  size?: number;
  withMoon?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 58 58"
      style={{ display: "block" }}
      aria-hidden="true"
    >
      <circle cx="29" cy="29" r="25" fill="#74B2BC" />
      <path d="M 6.5 20.5 L 51.5 20.5" stroke="#101B24" strokeWidth="3.2" opacity="0.55" />
      <path d="M 4.5 33 L 53.5 33" stroke="#101B24" strokeWidth="4.6" opacity="0.55" />
      <path d="M 10 43.5 L 48 43.5" stroke="#101B24" strokeWidth="2.8" opacity="0.45" />
      {withMoon && <circle cx="38" cy="37.5" r="3.4" fill="#44808C" opacity="0.8" />}
    </svg>
  );
}
