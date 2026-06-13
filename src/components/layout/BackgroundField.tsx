"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Ambient sky behind everything: galaxies (parallax 0.13), stars (parallax
// 0.06, twinkling), horizon glow, and orbital arcs. Fixed + non-interactive.
// Honors prefers-reduced-motion: no twinkle, no parallax (README "Background").

interface Star {
  left: string;
  top: string;
  size: number;
  background: string;
  animation: string;
}

// Seeded PRNG matching the prototype (seed 7, 16807 LCG) so the field is stable.
function buildStars(reducedMotion: boolean): Star[] {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const stars: Star[] = [];
  for (let i = 0; i < 120; i++) {
    const r = rnd();
    const size = r < 0.7 ? 1 : r < 0.93 ? 1.6 : 2.4;
    const warm = rnd() < 0.3;
    const left = (rnd() * 100).toFixed(2) + "%";
    const top = (rnd() * 100).toFixed(2) + "%";
    const dur = (6 + rnd() * 10).toFixed(1);
    const delay = (rnd() * 10).toFixed(1);
    stars.push({
      left,
      top,
      size,
      background: warm ? "rgba(160,205,212,0.9)" : "rgba(228,224,238,0.85)",
      animation: reducedMotion ? "none" : `jtwinkle ${dur}s ease-in-out ${delay}s infinite`,
    });
  }
  return stars;
}

function blobStyle(
  x: number,
  y: number,
  w: number,
  h: number,
  rot: number,
  color: string,
  blur: number,
): React.CSSProperties {
  return {
    position: "absolute",
    left: x + "%",
    top: y + "%",
    width: w,
    height: h,
    borderRadius: "50%",
    background: `radial-gradient(ellipse at center, ${color}, transparent 70%)`,
    transform: `rotate(${rot}deg)`,
    filter: `blur(${blur}px)`,
  };
}

export function BackgroundField() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [y, setY] = useState(0);
  const galRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  const stars = useMemo(() => buildStars(reducedMotion), [reducedMotion]);
  const ty = (f: number) => (reducedMotion ? undefined : `translateY(${(-y * f).toFixed(1)}px)`);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      {/* galaxies — parallax 0.13 */}
      <div
        ref={galRef}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: "175vh", willChange: "transform", transform: ty(0.13) }}
      >
        <div style={blobStyle(58, 4, 480, 200, -18, "rgba(116,178,188,0.15)", 26)} />
        <div style={blobStyle(-10, 26, 520, 230, 14, "rgba(148,128,188,0.14)", 30)} />
        <div style={blobStyle(52, 52, 440, 190, -10, "rgba(122,152,186,0.12)", 26)} />
        <div style={blobStyle(6, 76, 470, 200, 8, "rgba(116,178,188,0.10)", 30)} />
        <div style={blobStyle(76, 34, 32, 9, -24, "rgba(236,231,221,0.6)", 1.5)} />
        <div style={blobStyle(16, 10, 26, 8, 30, "rgba(236,231,221,0.55)", 1.5)} />
        <div style={blobStyle(38, 66, 36, 10, -12, "rgba(160,205,212,0.55)", 1.5)} />
        <div style={blobStyle(88, 16, 24, 7, 18, "rgba(228,224,238,0.5)", 1.5)} />
        <svg
          width={90}
          height={90}
          viewBox="0 0 90 90"
          style={{ position: "absolute", left: "83%", top: "74%", opacity: 0.5, transform: "rotate(-20deg)" }}
        >
          <circle cx={45} cy={45} r={2.5} fill="none" stroke="rgba(228,224,238,0.6)" strokeWidth={1} />
          <path d="M 45 45 C 53 37 64 40 66 51 C 68 64 55 72 44 68" fill="none" stroke="rgba(228,224,238,0.55)" strokeWidth={1.4} strokeLinecap="round" strokeDasharray="0.5 5.5" />
          <path d="M 45 45 C 37 53 26 50 24 39 C 22 26 35 18 46 22" fill="none" stroke="rgba(160,205,212,0.5)" strokeWidth={1.4} strokeLinecap="round" strokeDasharray="0.5 5.5" />
        </svg>
      </div>

      {/* stars — parallax 0.06 */}
      <div
        ref={starRef}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: "145vh", willChange: "transform", transform: ty(0.06) }}
      >
        {stars.map((s, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: s.background,
              opacity: reducedMotion ? 0.4 : undefined,
              animation: s.animation === "none" ? undefined : s.animation,
            }}
          />
        ))}
      </div>

      {/* orbital arcs anchored above the header */}
      <svg
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMin slice"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 300 }}
      >
        <circle cx={600} cy={-540} r={700} fill="none" stroke="rgba(223,232,230,0.05)" strokeWidth={1} />
        <circle cx={600} cy={-540} r={775} fill="none" stroke="rgba(116,178,188,0.08)" strokeWidth={1} />
        <circle cx={600} cy={-540} r={860} fill="none" stroke="rgba(223,232,230,0.04)" strokeWidth={1} />
        <circle cx={855} cy={180} r={2} fill="rgba(116,178,188,0.5)" />
      </svg>

      {/* horizon glow */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "38vh",
          background: "linear-gradient(to top, rgba(116,178,188,0.11), rgba(150,120,150,0.05) 45%, transparent)",
        }}
      />
    </div>
  );
}
