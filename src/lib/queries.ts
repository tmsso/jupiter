import { createClient } from "./supabase/server";
import { isSigilName, SIGIL_ORDER } from "./sigils";
import { standingFor } from "./orbit";
import type { Post, Ring, SigilName, Standing } from "./types";

// The allowed sigil set, sourced from app_settings.sigils (kept flexible),
// intersected with the glyphs the UI can actually draw. Order follows the DB.
export async function getSigilSet(): Promise<SigilName[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "sigils")
    .single();
  const ids = (data?.value as string[] | undefined) ?? SIGIL_ORDER;
  return ids.filter(isSigilName);
}

// Shape of a posts row as selected below (snake_case from Postgres).
interface PostRow {
  id: string;
  author_id: string;
  body: string;
  context_note: string | null;
  sigil: string | null;
  visibility: string;
  inspired_by_id: string | null;
  created_at: string;
  deleted_at: string | null;
}

function mapPost(
  row: PostRow,
  pseudonym: string,
  currentUserId: string | null,
  hasDescendants: boolean,
): Post {
  return {
    id: row.id,
    authorId: row.author_id,
    pseudonym,
    isOwn: row.author_id === currentUserId,
    body: row.body,
    context: row.context_note,
    sigil: isSigilName(row.sigil) ? row.sigil : null,
    visibility: row.visibility === "public" ? "public" : "private",
    inspiredById: row.inspired_by_id,
    hasDescendants,
    withdrawn: row.deleted_at != null,
    createdAt: row.created_at,
  };
}

// Which of the given post ids have at least one non-deleted child (descendant).
async function descendantSet(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: string[],
): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const { data } = await supabase
    .from("posts")
    .select("inspired_by_id")
    .in("inspired_by_id", ids)
    .is("deleted_at", null);
  return new Set((data ?? []).map((r) => r.inspired_by_id as string));
}

// The signed-in author's own posts (private + public), newest first.
export async function getOwnPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: rows } = await supabase
    .from("posts")
    .select("id, author_id, body, context_note, sigil, visibility, inspired_by_id, created_at, deleted_at")
    .eq("author_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!rows || rows.length === 0) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("pseudonym")
    .eq("id", user.id)
    .single();

  const descendants = await descendantSet(supabase, rows.map((r) => r.id));

  return rows.map((r) =>
    mapPost(r as PostRow, profile?.pseudonym ?? "", user.id, descendants.has(r.id)),
  );
}

interface PostRowWithProfile extends PostRow {
  profiles: { pseudonym: string } | { pseudonym: string }[] | null;
}

function pseudonymOf(row: PostRowWithProfile): string {
  const p = row.profiles;
  if (!p) return "";
  return Array.isArray(p) ? (p[0]?.pseudonym ?? "") : p.pseudonym;
}

const FEED_PAGE_SIZE = 20;

// The Commons: public, non-deleted posts, newest first, paginated.
export async function getFeed(page = 0): Promise<Post[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const from = page * FEED_PAGE_SIZE;
  const { data: rows } = await supabase
    .from("posts")
    .select(
      "id, author_id, body, context_note, sigil, visibility, inspired_by_id, created_at, deleted_at, profiles(pseudonym)",
    )
    .eq("visibility", "public")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, from + FEED_PAGE_SIZE - 1);

  if (!rows || rows.length === 0) return [];
  const descendants = await descendantSet(supabase, rows.map((r) => r.id));

  return (rows as PostRowWithProfile[]).map((r) =>
    mapPost(r, pseudonymOf(r), user?.id ?? null, descendants.has(r.id)),
  );
}

// A single post (for the post page). Returns null if not visible to the caller
// (RLS) or not found.
export async function getPost(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: row } = await supabase
    .from("posts")
    .select(
      "id, author_id, body, context_note, sigil, visibility, inspired_by_id, created_at, deleted_at, profiles(pseudonym)",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!row) return null;
  const typed = row as PostRowWithProfile;
  const descendants = await descendantSet(supabase, [typed.id]);
  return mapPost(typed, pseudonymOf(typed), user?.id ?? null, descendants.has(typed.id));
}

// Character limits from app_settings (DB is the home for tunables). Falls back
// to the documented defaults (body 480, context 120).
export async function getCharLimits(): Promise<{ maxBody: number; maxContext: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["max_post_chars", "max_context_chars"]);
  const lookup = new Map((data ?? []).map((r) => [r.key, Number(r.value)]));
  return {
    maxBody: lookup.get("max_post_chars") ?? 480,
    maxContext: lookup.get("max_context_chars") ?? 120,
  };
}

// Tier definitions from app_settings (DB is the home for tunables).
async function getRings(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Ring[] | undefined> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "tiers")
    .single();
  const tiers = data?.value as
    | { name: string; min_points: number; cap_bonus: number }[]
    | undefined;
  if (!tiers) return undefined;

  const { data: baseRow } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "base_daily_cap")
    .single();
  const base = Number(baseRow?.value ?? 3);

  return tiers.map((t) => ({ name: t.name, minPoints: t.min_points, cap: base + t.cap_bonus }));
}

// The author's standing: points, current orbit, next orbit, and daily cap.
export async function getStanding(): Promise<Standing | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: points } = await supabase.rpc("user_points", { p_user: user.id });
  const rings = await getRings(supabase);
  return standingFor(Number(points ?? 0), rings);
}

// How many posts the author has used today vs. their cap (UX mirror; the DB
// trigger is authoritative).
export async function getTodayCount(): Promise<{ used: number; cap: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { used: 0, cap: 0 };

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [{ count }, { data: cap }] = await Promise.all([
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user.id)
      .is("deleted_at", null)
      .gte("created_at", startOfDay.toISOString()),
    supabase.rpc("user_daily_cap", { p_user: user.id }),
  ]);

  return { used: count ?? 0, cap: Number(cap ?? 0) };
}
