import Link from "next/link";
import { PageColumn } from "@/components/layout/PageColumn";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { RuleDivider } from "@/components/primitives/RuleDivider";
import { PrimaryButton } from "@/components/primitives/PrimaryButton";
import { MoonPhase } from "@/components/icons/MoonPhase";
import { getFeed } from "@/lib/queries";
import { ruleColor } from "@/lib/sigils";
import { formatEntryDate, moonPhaseFor } from "@/lib/format";

function todayLine(): string {
  const d = new Date();
  const weekday = d.toLocaleString("en-US", { weekday: "long" });
  const month = d.toLocaleString("en-US", { month: "long" });
  return `${weekday} · ${month} ${d.getDate()}`;
}

export default async function FeedPage() {
  const posts = await getFeed();

  return (
    <PageColumn>
      <Eyebrow>{todayLine()}</Eyebrow>
      <h1 style={{ margin: "16px 0 0 0", fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: 36, letterSpacing: "0.01em", color: "var(--color-ink)" }}>
        The Commons
      </h1>
      <p style={{ margin: "14px 0 0 0", maxWidth: "52ch", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, fontSize: 17, lineHeight: 1.65, color: "rgb(var(--ink-rgb) / 0.55)" }}>
        Pages from strangers under the same sky, newest first. Read slowly — no one is counting anything here.
      </p>

      <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 72 }}>
        {posts.length === 0 ? (
          <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, fontSize: 17, lineHeight: 1.7, color: "rgb(var(--ink-rgb) / 0.55)" }}>
            The Commons is quiet for now. Be the first to leave a page.
          </p>
        ) : (
          posts.map((post) => (
            <article key={post.id} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MoonPhase phase={moonPhaseFor(post.id)} size={13} />
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, letterSpacing: "0.14em", color: "var(--color-accent)" }}>
                  {post.pseudonym}
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: "0.14em", color: "rgb(var(--ink-rgb) / 0.35)" }}>
                  · {formatEntryDate(post.createdAt)}
                </span>
              </div>
              <RuleDivider color={ruleColor(post.sigil, post.id)} />
              <Link href={`/post/${post.id}`} style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 400, lineHeight: 1.8, color: "var(--color-ink-body)" }}>
                {post.body}
              </Link>
              {post.context && (
                <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, fontSize: 14.5, lineHeight: 1.7, color: "rgb(var(--ink-rgb) / 0.45)" }}>
                  {post.context}
                </p>
              )}
            </article>
          ))
        )}
      </div>

      <div style={{ marginTop: 80, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
        <p style={{ margin: 0, maxWidth: "42ch", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, fontSize: 17, lineHeight: 1.7, color: "rgb(var(--ink-rgb) / 0.55)" }}>
          That is the whole Commons for tonight. Somewhere, someone is already writing tomorrow&rsquo;s.
        </p>
        <PrimaryButton href="/compose">Write your own</PrimaryButton>
      </div>
    </PageColumn>
  );
}
