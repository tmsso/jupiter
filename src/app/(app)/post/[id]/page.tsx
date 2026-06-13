import Link from "next/link";
import { notFound } from "next/navigation";
import { PageColumn } from "@/components/layout/PageColumn";
import { RuleDivider } from "@/components/primitives/RuleDivider";
import { MoonPhase } from "@/components/icons/MoonPhase";
import { getPost } from "@/lib/queries";
import { ruleColor } from "@/lib/sigils";
import { formatEntryDate, moonPhaseFor } from "@/lib/format";

// Minimal focal entry for milestone 1. Resonance + lineage arrive in
// milestones 3–4.
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <PageColumn top={72}>
      <Link href="/feed" style={{ fontFamily: "var(--font-sans)", fontSize: 12, letterSpacing: "0.08em", color: "rgb(var(--ink-rgb) / 0.45)" }}>
        ← back
      </Link>

      <div style={{ marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MoonPhase phase={moonPhaseFor(post.id)} size={13} />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, letterSpacing: "0.14em", color: "var(--color-accent)" }}>
            {post.pseudonym}
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: "0.14em", color: "rgb(var(--ink-rgb) / 0.35)" }}>
            · {formatEntryDate(post.createdAt)}
          </span>
        </div>
        <RuleDivider color={ruleColor(post.sigil, post.id)} centered />
        <p style={{ margin: "6px 0 0 0", maxWidth: "50ch", fontFamily: "var(--font-serif)", fontSize: 25, fontWeight: 400, lineHeight: 1.8, color: "var(--color-ink-body-lg)" }}>
          {post.body}
        </p>
        {post.context && (
          <p style={{ margin: 0, maxWidth: "46ch", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, fontSize: 15.5, lineHeight: 1.7, color: "rgb(var(--ink-rgb) / 0.5)" }}>
            {post.context}
          </p>
        )}
      </div>
    </PageColumn>
  );
}
