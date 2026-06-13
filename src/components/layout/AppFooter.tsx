import { SignOutButton } from "./SignOutButton";

// Italic tagline + sign-out, at the foot of the signed-in views.
export function AppFooter() {
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 680,
        margin: "0 auto",
        padding: "0 28px 56px 28px",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: 13,
          color: "rgb(var(--ink-rgb) / 0.32)",
        }}
      >
        Jupiter — a quiet place to keep what makes life worth living, together with strangers.
      </p>
      <SignOutButton />
    </footer>
  );
}
