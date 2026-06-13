"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/icons/Wordmark";

const NAV = [
  { href: "/feed", label: "commons" },
  { href: "/compose", label: "write" },
  { href: "/me", label: "my diary" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 680,
        margin: "0 auto",
        padding: "38px 28px 0 28px",
      }}
    >
      <Link
        href="/feed"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-serif)",
          fontSize: 19,
          fontWeight: 500,
          letterSpacing: "0.05em",
          color: "var(--color-ink)",
        }}
      >
        <Wordmark size={14} withMoon={false} />
        Jupiter
      </Link>

      <nav style={{ display: "flex", gap: 22 }}>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="jnav"
              style={{
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: "0.08em",
                color: active ? "var(--color-ink)" : "rgb(var(--ink-rgb) / 0.45)",
                transition: "color 0.4s ease",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
