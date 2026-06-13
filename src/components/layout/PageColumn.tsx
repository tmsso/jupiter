// Centered single column: max-width 680px, 28px horizontal padding (README
// "Spacing / layout"). `top` lets the post page use its tighter 72px padding.

export function PageColumn({
  children,
  top = 92,
}: {
  children: React.ReactNode;
  top?: number;
}) {
  return (
    <main
      className="jfade"
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 680,
        margin: "0 auto",
        padding: `${top}px 28px 80px 28px`,
      }}
    >
      {children}
    </main>
  );
}
