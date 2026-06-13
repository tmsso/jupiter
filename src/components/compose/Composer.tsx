"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SigilName, Visibility } from "@/lib/types";
import { createPostAction } from "@/lib/actions";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { JournalClosed, JournalOpen } from "@/components/icons/Journal";
import { SigilPicker } from "./SigilPicker";
import { VisibilityToggle } from "./VisibilityToggle";

interface ComposerProps {
  pseudonym: string;
  sigilOptions: SigilName[];
  todayUsed: number;
  todayCap: number;
  maxBody: number;
  maxContext: number;
  counterThreshold?: number; // show counter when this many chars or fewer remain
}

function todayLine(): string {
  const d = new Date();
  const month = d.toLocaleString("en-US", { month: "short" });
  return `Write · ${month} ${d.getDate()}`;
}

export function Composer({
  pseudonym,
  sigilOptions,
  todayUsed,
  todayCap,
  maxBody,
  maxContext,
  counterThreshold = 80,
}: ComposerProps) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [context, setContext] = useState("");
  const [sigil, setSigil] = useState<SigilName | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Visibility | null>(null);

  const remaining = Math.max(0, todayCap - todayUsed);
  const capReached = remaining <= 0;
  const charsLeft = maxBody - draft.length;
  const canSave = draft.trim().length > 0 && !capReached && !saving;

  const capLine = capReached
    ? "today's pages are full — they reopen at midnight"
    : `${remaining} of ${todayCap} ${remaining === 1 ? "entry remains" : "entries remain"} today`;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const result = await createPostAction({
      body: draft,
      context: context || null,
      sigil,
      visibility,
      inspiredById: null,
    });
    setSaving(false);
    if (result.ok) {
      setSaved(visibility);
      router.refresh();
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  function writeAnother() {
    setDraft("");
    setContext("");
    setSigil(null);
    setVisibility("private");
    setSaved(null);
    setError(null);
  }

  if (saved) {
    const isPublic = saved === "public";
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 80 }}>
        {isPublic ? (
          <JournalOpen size={34} color="rgb(var(--accent-rgb) / 0.85)" />
        ) : (
          <JournalClosed size={34} color="rgb(var(--ink-rgb) / 0.5)" />
        )}
        <h2 style={{ margin: "28px 0 0 0", fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: 28, color: "var(--color-ink)" }}>
          {isPublic ? "Placed in the Commons." : "Kept in your diary."}
        </h2>
        <p style={{ margin: "16px 0 0 0", maxWidth: "42ch", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, fontSize: 16.5, lineHeight: 1.7, color: "rgb(var(--ink-rgb) / 0.55)" }}>
          {isPublic
            ? "It will find its readers in their own time."
            : "Only you will ever see this page."}
        </p>
        <div style={{ marginTop: 48, display: "flex", alignItems: "baseline", gap: 30 }}>
          <LinkButton onClick={() => router.push("/feed")} accent>the Commons</LinkButton>
          <LinkButton onClick={() => router.push("/me")}>my diary</LinkButton>
          <LinkButton onClick={writeAnother}>write another</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Eyebrow>{todayLine()}</Eyebrow>
      <h1 style={{ margin: "16px 0 0 0", fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: 30, color: "var(--color-ink)" }}>
        A new page
      </h1>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={maxBody}
        rows={7}
        placeholder="What, today, made the whole thing worth it?"
        style={{
          marginTop: 48,
          width: "100%",
          boxSizing: "border-box",
          background: "none",
          border: "none",
          borderBottom: "1px solid rgb(var(--ink-rgb) / 0.14)",
          padding: "0 0 24px 0",
          resize: "none",
          fontFamily: "var(--font-serif)",
          fontSize: 21,
          fontWeight: 400,
          lineHeight: 1.8,
          color: "var(--color-ink)",
          caretColor: "var(--color-accent)",
        }}
      />
      <p style={{ margin: "10px 0 0 0", alignSelf: "flex-end", height: 16, fontSize: 11.5, letterSpacing: "0.1em", color: "rgb(var(--ink-rgb) / 0.35)" }}>
        {charsLeft <= counterThreshold ? `${charsLeft} left` : ""}
      </p>

      <input
        value={context}
        onChange={(e) => setContext(e.target.value)}
        maxLength={maxContext}
        placeholder="context — where you were, or what prompted this (optional)"
        style={{
          marginTop: 22,
          width: "100%",
          boxSizing: "border-box",
          background: "none",
          border: "none",
          borderBottom: "1px solid rgb(var(--ink-rgb) / 0.09)",
          padding: "0 0 12px 0",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 15,
          color: "rgb(var(--ink-rgb) / 0.7)",
          caretColor: "var(--color-accent)",
        }}
      />

      <SigilPicker options={sigilOptions} value={sigil} onChange={setSigil} />

      <VisibilityToggle value={visibility} onChange={setVisibility} pseudonym={pseudonym} />

      <div style={{ marginTop: 52, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 22, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          style={{
            background: "none",
            border: "1px solid rgba(116,178,188,0.55)",
            borderRadius: 2,
            padding: "12px 26px",
            cursor: canSave ? "pointer" : "default",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            opacity: canSave ? 1 : 0.35,
            transition: "opacity 0.4s ease, border-color 0.4s ease, color 0.4s ease",
          }}
        >
          {saving ? "Saving…" : visibility === "public" ? "Place it in the Commons" : "Keep this page"}
        </button>
        <span style={{ fontSize: 12, letterSpacing: "0.08em", color: "rgb(var(--ink-rgb) / 0.38)" }}>{capLine}</span>
      </div>

      {error && <p style={{ margin: "18px 0 0 0", fontSize: 12.5, color: "var(--color-rose)" }}>{error}</p>}
    </div>
  );
}

function LinkButton({
  children,
  onClick,
  accent = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: 13,
        letterSpacing: "0.08em",
        color: accent ? "rgb(var(--accent-rgb) / 0.85)" : "rgb(var(--ink-rgb) / 0.45)",
        transition: "color 0.4s ease",
      }}
    >
      {children}
    </button>
  );
}
