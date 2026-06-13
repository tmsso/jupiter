import { createElement } from "react";
import type { SigilName } from "@/lib/types";
import { SIGIL_COLORS } from "@/lib/sigils";

// Line-art sigil glyphs. Exact paths ported from Jupiter.dc.html `SIGILS`
// (48x48 viewBox, 1.5 stroke, round caps/joins). Each part is an SVG element.

type SvgTag = "path" | "circle" | "ellipse" | "rect";
type Part = { t: SvgTag } & Record<string, string | number>;

const SIGIL_PARTS: Record<SigilName, Part[]> = {
  moon: [
    { t: "path", d: "M 30 8 A 16 16 0 1 0 30 40 A 12.5 12.5 0 1 1 30 8 Z" },
    { t: "path", d: "M 35 13 L 35 19 M 32 16 L 38 16" },
  ],
  citrus: [
    { t: "circle", cx: 24, cy: 24, r: 15 },
    { t: "circle", cx: 24, cy: 24, r: 11 },
    { t: "path", d: "M 24 13 L 24 35 M 13 24 L 35 24 M 16.2 16.2 L 31.8 31.8 M 31.8 16.2 L 16.2 31.8" },
  ],
  music: [
    { t: "ellipse", cx: 20, cy: 34, rx: 4.6, ry: 3.6, transform: "rotate(-15 20 34)" },
    { t: "path", d: "M 24.4 32.8 L 24.4 10" },
    { t: "path", d: "M 24.4 10 C 31 12 33 17 30.5 23" },
  ],
  cup: [
    { t: "path", d: "M 13 21 L 15.5 39 L 30.5 39 L 33 21 Z" },
    { t: "path", d: "M 33 24 C 39 24 39 32 32 32" },
    { t: "path", d: "M 19 9 C 17.5 11.5 20.5 13 19 15.5" },
    { t: "path", d: "M 26 7 C 24.5 9.5 27.5 11 26 13.5" },
  ],
  book: [
    { t: "path", d: "M 24 13 C 19.5 10 13 10 9 12 L 9 36 C 13 34 19.5 34 24 37 C 28.5 34 35 34 39 36 L 39 12 C 35 10 28.5 10 24 13 Z" },
    { t: "path", d: "M 24 13 L 24 37" },
  ],
  candle: [
    { t: "path", d: "M 18.5 23 L 18.5 39 Q 18.5 40 19.5 40 L 28.5 40 Q 29.5 40 29.5 39 L 29.5 23 Z" },
    { t: "path", d: "M 24 19 L 24 23" },
    { t: "path", d: "M 24 7.5 C 21.2 11 21.4 14.6 24 16.5 C 26.6 14.6 26.8 11 24 7.5 Z" },
  ],
  leaf: [
    { t: "path", d: "M 24 40 C 11 31 12.5 14 24 8 C 35.5 14 37 31 24 40 Z" },
    { t: "path", d: "M 24 12 L 24 38" },
    { t: "path", d: "M 24 20 C 20 19 17.5 16.5 17 14 M 24 27 C 19 26 16 23 15.2 20 M 24 20 C 28 19 30.5 16.5 31 14 M 24 27 C 29 26 32 23 32.8 20" },
  ],
  wave: [
    { t: "path", d: "M 8 19 C 13 14.5 19 14.5 24 19 C 29 23.5 35 23.5 40 19" },
    { t: "path", d: "M 8 27 C 13 22.5 19 22.5 24 27 C 29 31.5 35 31.5 40 27" },
    { t: "path", d: "M 8 35 C 13 30.5 19 30.5 24 35 C 29 39.5 35 39.5 40 35" },
  ],
  paw: [
    { t: "ellipse", cx: 24, cy: 31, rx: 7.5, ry: 6 },
    { t: "ellipse", cx: 13.5, cy: 22, rx: 3.2, ry: 4.2, transform: "rotate(-18 13.5 22)" },
    { t: "ellipse", cx: 20.5, cy: 15.5, rx: 3.2, ry: 4.4 },
    { t: "ellipse", cx: 28.5, cy: 15.5, rx: 3.2, ry: 4.4 },
    { t: "ellipse", cx: 35, cy: 22, rx: 3.2, ry: 4.2, transform: "rotate(18 35 22)" },
  ],
  window: [
    { t: "rect", x: 13, y: 10, width: 22, height: 28, rx: 1.5 },
    { t: "path", d: "M 24 10 L 24 38 M 13 24 L 35 24" },
  ],
};

export function Sigil({
  name,
  size = 26,
  color,
}: {
  name: SigilName;
  size?: number;
  color?: string;
}) {
  const parts = SIGIL_PARTS[name];
  if (!parts) return null;
  const stroke = color ?? SIGIL_COLORS[name] ?? "currentColor";

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "block" }} aria-hidden="true">
      {parts.map((part, i) => {
        const { t, ...attrs } = part;
        return createElement(t, {
          key: i,
          ...attrs,
          fill: "none",
          stroke,
          strokeWidth: 1.5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        });
      })}
    </svg>
  );
}
