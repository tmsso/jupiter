import Link from "next/link";
import { PageColumn } from "@/components/layout/PageColumn";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { RuleDivider } from "@/components/primitives/RuleDivider";
import { PrimaryButton } from "@/components/primitives/PrimaryButton";
import { JournalClosed, JournalOpen } from "@/components/icons/Journal";
import { getSessionUser } from "@/lib/auth";
import { getOwnPosts } from "@/lib/queries";
import { ruleColor } from "@/lib/sigils";
import { formatEntryDate } from "@/lib/format";

export default async function MePage() {
  const [user, posts] = await Promise.all([getSessionUser(), getOwnPosts()]);

  return (
    <PageColumn>
      <Eyebrow>A private record</Eyebrow>
      <h1 style={{ margin: "16px 0 0 0", fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: 36, color: "var(--color-ink)" }}>
        My diary
      </h1>

      {/* pseudonym block (inline editor arrives in a later milestone) */}
      <div style={{ marginTop: 30 }}>
        <Eyebrow alpha={0.38}>You appear as</Eyebrow>
        <p style={{ margin: "8px 0 0 0", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 21, color: "var(--color-accent)" }}>
          {user?.pseudonym}
        </p>
      </div>

      {/* own entries */}
      <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 64 }}>
        {posts.length === 0 ? (
          <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, fontSize: 17, lineHeight: 1.7, color: "rgb(var(--ink-rgb) / 0.55)" }}>
            Your diary is empty. The first page is always the quietest to write.
          </p>
        ) : (
          posts.map((post) => {
            const isPublic = post.visibility === "public";
            const color = ruleColor(post.sigil, post.id);
            return (
              <article key={post.id} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {isPublic ? (
                    <JournalOpen size={18} color="var(--color-accent)" />
                  ) : (
                    <JournalClosed size={18} color="rgb(var(--ink-rgb) / 0.45)" />
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 12,
                      letterSpacing: "0.14em",
                      color: isPublic ? "var(--color-accent)" : "rgb(var(--ink-rgb) / 0.45)",
                    }}
                  >
                    {isPublic ? "in the Commons" : "private"}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: "0.14em", color: "rgb(var(--ink-rgb) / 0.35)" }}>
                    · {formatEntryDate(post.createdAt)}
                  </span>
                </div>
                <RuleDivider color={color} />
                <Link
                  href={`/post/${post.id}`}
                  style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 19, fontWeight: 400, lineHeight: 1.8, color: "var(--color-ink-body)" }}
                >
                  {post.body}
                </Link>
                {post.context && (
                  <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, fontSize: 14.5, lineHeight: 1.7, color: "rgb(var(--ink-rgb) / 0.45)" }}>
                    {post.context}
                  </p>
                )}
              </article>
            );
          })
        )}
      </div>

      <div style={{ marginTop: 56 }}>
        <PrimaryButton href="/compose">Begin a new page</PrimaryButton>
      </div>
    </PageColumn>
  );
}
