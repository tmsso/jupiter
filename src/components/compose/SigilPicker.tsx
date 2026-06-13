"use client";

import type { SigilName } from "@/lib/types";
import { SIGIL_COLORS } from "@/lib/sigils";
import { Sigil } from "@/components/icons/Sigil";
import { Eyebrow } from "@/components/primitives/Eyebrow";

// Optional "a small sign" picker: 46px swatches, one per glyph. Selected =
// glyph + border in the sigil's color; click again to deselect (README
// "Sigil picker"). The set is passed in from app_settings.
export function SigilPicker({
  options,
  value,
  onChange,
}: {
  options: SigilName[];
  value: SigilName | null;
  onChange: (next: SigilName | null) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div style={{ marginTop: 34 }}>
      <Eyebrow alpha={0.38}>A small sign, if it wants one — optional</Eyebrow>
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
        {options.map((name) => {
          const selected = value === name;
          const color = SIGIL_COLORS[name];
          return (
            <button
              key={name}
              type="button"
              title={name}
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : name)}
              style={{
                width: 46,
                height: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: `1px solid ${selected ? color : "rgb(var(--ink-rgb) / 0.14)"}`,
                borderRadius: 3,
                padding: 0,
                cursor: "pointer",
                transition: "border-color 0.4s ease",
              }}
            >
              <Sigil name={name} size={26} color={selected ? color : "rgb(var(--ink-rgb) / 0.55)"} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
