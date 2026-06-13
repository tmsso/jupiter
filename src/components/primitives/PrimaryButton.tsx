"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// Outline uppercase accent button (README "Button (primary)"): 1px accent
// border, radius 2px, 0.18em tracking. Renders as a link or a button.

const baseStyle: CSSProperties = {
  display: "inline-block",
  background: "none",
  border: "1px solid rgba(116,178,188,0.45)",
  borderRadius: 2,
  padding: "11px 24px",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--color-accent)",
  transition: "border-color 0.4s ease, color 0.4s ease, opacity 0.4s ease",
};

interface CommonProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function PrimaryButton({
  href,
  onClick,
  disabled,
  type = "button",
  children,
  style,
  className,
}: CommonProps & {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const merged = { ...baseStyle, ...style };

  if (href) {
    return (
      <Link href={href} className={className} style={merged}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...merged, opacity: disabled ? 0.35 : merged.opacity }}
    >
      {children}
    </button>
  );
}
