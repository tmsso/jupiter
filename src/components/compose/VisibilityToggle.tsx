"use client";

import type { Visibility } from "@/lib/types";
import { JournalClosed, JournalOpen } from "@/components/icons/Journal";

// Private (closed book) / Public (open book), stacked. Default Private
// (README "Visibility"). New posts only.
export function VisibilityToggle({
  value,
  onChange,
  pseudonym,
}: {
  value: Visibility;
  onChange: (next: Visibility) => void;
  pseudonym: string;
}) {
  return (
    <div style={{ marginTop: 42, display: "flex", flexDirection: "column", gap: 18 }}>
      <Option
        active={value === "private"}
        onClick={() => onChange("private")}
        glyph={<JournalClosed size={26} color={value === "private" ? "var(--color-accent)" : "rgb(var(--ink-rgb) / 0.45)"} />}
        label="Private"
        hint="kept in your diary, only for you"
      />
      <Option
        active={value === "public"}
        onClick={() => onChange("public")}
        glyph={<JournalOpen size={26} color={value === "public" ? "var(--color-accent)" : "rgb(var(--ink-rgb) / 0.45)"} />}
        label="Public"
        hint={`placed in the Commons, as ${pseudonym}`}
      />
    </div>
  );
}

function Option({
  active,
  onClick,
  glyph,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  glyph: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {glyph}
      <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          style={{
            fontSize: 14,
            color: active ? "var(--color-ink)" : "rgb(var(--ink-rgb) / 0.45)",
            transition: "color 0.4s ease",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 12.5, color: "rgb(var(--ink-rgb) / 0.38)" }}>{hint}</span>
      </span>
    </button>
  );
}
