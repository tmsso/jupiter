// 11px / 0.22em uppercase muted label (README "Eyebrow label").

export function Eyebrow({
  children,
  alpha = 0.42,
}: {
  children: React.ReactNode;
  alpha?: number;
}) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        fontWeight: 400,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: `rgb(var(--ink-rgb) / ${alpha})`,
      }}
    >
      {children}
    </p>
  );
}
