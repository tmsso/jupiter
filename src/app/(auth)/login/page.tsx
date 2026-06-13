"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/icons/Wordmark";

export default function LoginPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("Sign-in could not start. Please try again.");
      setPending(false);
    }
  }

  return (
    <main
      className="jfade"
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        maxWidth: 680,
        margin: "0 auto",
        padding: "0 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Wordmark size={58} />
      <h1
        style={{
          margin: "30px 0 0 0",
          fontFamily: "var(--font-serif)",
          fontWeight: 300,
          fontSize: 46,
          letterSpacing: "0.05em",
          color: "var(--color-ink)",
        }}
      >
        Jupiter
      </h1>
      <p
        style={{
          margin: "16px 0 0 0",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: 17.5,
          lineHeight: 1.6,
          color: "rgb(var(--ink-rgb) / 0.55)",
        }}
      >
        a quiet place for the things that make life worth living
      </p>

      <button
        onClick={signIn}
        disabled={pending}
        className="jsignin"
        style={{
          marginTop: 60,
          display: "flex",
          alignItems: "center",
          gap: 13,
          background: "none",
          border: "1px solid rgb(var(--ink-rgb) / 0.28)",
          borderRadius: 2,
          padding: "13px 28px",
          cursor: pending ? "default" : "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: 13.5,
          fontWeight: 400,
          letterSpacing: "0.04em",
          color: "var(--color-ink)",
          opacity: pending ? 0.6 : 1,
          transition: "border-color 0.4s ease",
        }}
      >
        <span
          style={{
            width: 21,
            height: 21,
            flex: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgb(var(--ink-rgb) / 0.5)",
            borderRadius: "50%",
            fontFamily: "var(--font-serif)",
            fontSize: 12,
            fontWeight: 500,
            color: "rgb(var(--ink-rgb) / 0.8)",
          }}
        >
          G
        </span>
        {pending ? "Opening Google…" : "Continue with Google"}
      </button>

      {error && (
        <p style={{ margin: "16px 0 0 0", fontSize: 12.5, color: "var(--color-rose)" }}>{error}</p>
      )}

      <p
        style={{
          margin: "24px 0 0 0",
          maxWidth: "38ch",
          fontSize: 12.5,
          lineHeight: 1.6,
          letterSpacing: "0.02em",
          color: "rgb(var(--ink-rgb) / 0.40)",
        }}
      >
        you&rsquo;ll appear under a pseudonym; your identity is never shown.
      </p>
    </main>
  );
}
