"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "rgb(var(--ink-rgb) / 0.25)",
        transition: "color 0.4s ease",
      }}
    >
      sign out
    </button>
  );
}
