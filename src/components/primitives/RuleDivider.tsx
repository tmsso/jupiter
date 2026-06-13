// Rule divider under an entry's byline: 76x2px, radius 2px, gradient from the
// entry's sigil/rule color to transparent. Centered variant on the post page
// (README "Spacing / layout").

export function RuleDivider({
  color,
  centered = false,
}: {
  color: string;
  centered?: boolean;
}) {
  return (
    <div
      style={{
        width: 76,
        height: 2,
        borderRadius: 2,
        opacity: 0.9,
        margin: centered ? "0 auto" : undefined,
        background: centered
          ? `linear-gradient(to right, transparent, ${color}, transparent)`
          : `linear-gradient(to right, ${color}, transparent)`,
      }}
    />
  );
}
