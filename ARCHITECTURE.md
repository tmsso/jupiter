# JUPITER — Architecture Note (v0.2)

A contemplative micro-diary inspired by the closing monologue of *Manhattan*:
short entries about what makes life worth living. Private by default. No likes.
Inspiration lineage instead of replies. Soft semantic resonance instead of counts.

This document is the working brief for Claude Code. Keep it in the repo root
as `ARCHITECTURE.md` and update it as decisions change.

---

## Changes from v0.2 (design reconciliation)

Reconciled with the Europa-ice design bundle (`design_handoff_jupiter/`). Where
the design changed a product decision, the doc, DB, and UI were updated together
(schema: `supabase/migrations/002_design_reconciliation.sql`). The design bundle
prevails on product behaviour, UX, copy, and visuals; the database remains the
enforcement referee.

1. **Sigils replace image attachments.** Compose offers an optional line-art
   *sigil* (a fixed set of glyphs) instead of an image upload. Added
   `posts.sigil`; the allowed set lives in `app_settings.sigils` (kept flexible —
   initial state, not a hard enum). Image upload + the `post-images` Storage
   bucket move to the backlog (milestone retained, dropped from compose).
2. **Edit lock.** Authors can edit **and** delete their own posts **until the
   post has descendants** (someone was inspired by it); after that **edit is
   locked, delete remains**. Enforced by a DB trigger; admins bypass.
3. **Withdrawn vs gone.** Delete is always soft (`deleted_at`). Deleting a post
   that has descendants leaves a faded *withdrawn* trace in lineage; deleting a
   leaf removes it from view. Positional — no new column. `inspired_by_id` stays
   immutable regardless.
4. **Admin tools** are a real feature, not backlog. Membership comes from a
   backend-configured `admins` table (never a client flag); admins may edit or
   soft-delete **any public post** under the same withdrawn-vs-gone rule,
   enforced by `is_admin()` + RLS.
5. **Tier thresholds** match the design's orbit math: Io 0 / Europa 50 /
   Ganymede **140** / Callisto **300** (was 150 / 400). Caps unchanged
   (3 / 4 / 5 / 6).
6. **Context note ≤ 120.** Kept the generous value; the prototype's 80 is a
   preview artifact, not the rule.
7. **Palette:** Europa-ice tokens (`README.md`) are the target; the amber files
   in `reference/` are shelved.

---

## 1. Stack

| Layer        | Choice                                   | Notes |
|--------------|------------------------------------------|-------|
| Frontend     | Next.js (App Router) + TypeScript        | Deployed on Vercel free tier |
| Styling      | Tailwind CSS                             | Matches Claude Design handoff output |
| Backend      | Supabase (free tier)                     | Postgres + pgvector + Auth + Storage + Edge Functions |
| Auth         | Supabase Auth, Google OAuth provider     | Pseudonym auto-generated on first sign-in (DB trigger) |
| Embeddings   | Supabase Edge Function running `gte-small` (384-dim) | Triggered after post insert; writes `posts.embedding` |
| Sigils       | Fixed line-art glyph set in `app_settings.sigils` | Optional, one per post (`posts.sigil`); set is tunable |
| Images       | Supabase Storage, bucket `post-images`   | **Backlog** — superseded by sigils in compose; not built yet |
| Schema       | `supabase/migrations/*.sql`              | Single source of truth; all business rules live in DB |

Principle: **the database is the referee.** Daily caps, point awards,
inspirer immutability, and privacy are enforced by triggers and RLS,
not by frontend code. The frontend may duplicate checks for UX only.

## 2. Repo layout

```
jupiter/
  ARCHITECTURE.md
  supabase/
    migrations/           # schema SQL, numbered
    functions/
      embed-post/         # Edge Function: compute gte-small embedding
  src/
    app/
      (auth)/login/       # Google sign-in
      feed/               # public commons
      compose/            # new entry
      post/[id]/          # entry + lineage tree + resonance
      me/                 # own diary (private + public), orbit/tier, pseudonym edit
    lib/
      supabase/           # client helpers (browser + server)
      queries.ts          # typed data access, thin
    components/           # from Claude Design handoff
```

## 3. Environment

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only; never NEXT_PUBLIC
```
Set locally in `.env.local` (gitignored) and in Vercel project settings.

## 4. Core flows

### Sign-in
Google OAuth via Supabase. The `on_auth_user_created` DB trigger creates a
profile with a generated pseudonym (`quiet_callisto_42` style). The app never
displays the Google identity anywhere.

### Compose
Fields: body (<=480 chars, live counter), optional context note (<=120 — the
prototype caps at 80 for preview only; **120 is the rule**), optional **sigil**
(one of the fixed set in `app_settings.sigils`; line-art glyph, not an image),
optional inspirer (preselected when arriving via "this inspired me" on another
post), visibility toggle — **default private**. On insert the DB enforces the
daily cap; surface the remaining-posts count in the UI before submission (query:
posts today vs `user_daily_cap()`). After insert, invoke the `embed-post` Edge
Function (DB webhook or direct call). The same screen handles **edit** (own posts
when unlocked, or any public post for admins).

### Edit & delete
- **Edit** is allowed on a post **until it has descendants** (someone was
  inspired by it). Once it does, **edit is locked and only delete remains** — the
  page others built on must not shift under them. Enforced by the
  `posts_edit_lock` trigger; the UI mirrors it (hides edit) for UX. Admins bypass.
- **Delete is always soft** (`deleted_at`; never `DELETE FROM posts`):
  - a post **with descendants** becomes a faded **withdrawn** trace in lineage;
  - a **leaf** post is removed from view ("gone entirely").
  Which one applies is positional (`has_descendants()`), not a stored flag.
- `inspired_by_id` is immutable in every case (existing trigger).

### Admin
Admin membership comes from the backend-configured `admins` table — never a
client flag. The client may read **only its own** admin row to surface admin
affordances (`adminMode`); `is_admin()` is the authoritative check used by RLS.
Admins may **edit or soft-delete any public post**, under the same
withdrawn-vs-gone rule; edits overwrite body/context/sigil only, never authorship
or `inspired_by_id`. To grant admin, insert a row out-of-band (service role / SQL
editor): `insert into admins (user_id) values ('<profile uuid>');`.

### Feed (the commons)
Public, non-deleted posts, newest first, paginated. Each card: pseudonym,
body, context note, image if any, and a quiet "inspired by" link when present.
One action only: **"this inspired me"** -> opens compose with inspirer set.
No like buttons, no counters on cards.

### Post page
The entry, its resonance ("a few others felt something similar" — rendered
from `resonant_posts()`, shown as readable kin entries, never as a number),
and its lineage tree from `lineage()`. Hidden nodes (private or withdrawn)
render as faded placeholders: "a private reflection" / "a thought, since
withdrawn". Tree is small-scale; simple nested rendering is fine, no graph
library needed initially.

### My diary (`/me`)
All own posts, private and public, with private->public toggle (one-way
public->private is allowed too — it's an UPDATE on own row; decide product
stance later, technically both work). Shows tier as an orbit metaphor
(io -> europa -> ganymede -> callisto), current points, and current daily cap.
Pseudonym is editable here (uniqueness errors handled gracefully).

### Embedding pipeline
Edge Function `embed-post`: input post id -> fetch body (+context note) ->
run gte-small via Supabase AI inference -> update `posts.embedding`.
Embeddings are computed for private posts too (the author's own resonance
still works); privacy is enforced at query time by `resonant_posts()`.

## 5. Milestones (each independently shippable)

1. **Walking skeleton** — Supabase project, schema applied, Google login,
   create text post, see own posts at `/me`. No styling polish.
2. **The commons** — feed of public posts, visibility toggle, compose flow
   with cap indicator.
3. **The soul** — inspiration links, lineage tree, points/tiers on `/me`.
4. **Resonance** — embedding Edge Function + resonant kin on post page.
5. **Images** — *(backlog)* Storage upload + display; superseded by sigils in
   the compose flow, milestone retained for a possible future image feature.
6. **Polish & admin** — Claude Design system applied end to end; `AdminControls`
   + admin RLS exercised; `prefers-reduced-motion` (disable twinkle + parallax);
   PWA manifest (installable; groundwork for the later lightweight app).

Sigils ship in milestone 2 (compose flow). Backlog: AI-generated images for
text-only posts; resonance clustering; public/private stance refinements.

## 6. Workflow

1. Design screens interactively in **Claude Design** (claude.ai/design) from
   the Windows PC, iterating on the canvas.
2. Use **Handoff to Claude Code**: drop the bundle into the repo on the
   headless Linux box.
3. Implement with Claude Code milestone by milestone; commit per milestone.
4. Push -> GitHub -> Vercel auto-deploys preview; promote to production
   when a milestone is accepted. Supabase free tier serves both local dev
   and deployed environments (consider a second free project as "prod" later).

## 7. Conventions & cautions

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- All times stored/compared in UTC; the daily cap day boundary is UTC.
- Keep `app_settings` the single home for tunables (cap, tiers, threshold,
  char limits, **sigil set**); read them server-side, don't hardcode.
- Soft delete only (`deleted_at`); never `DELETE FROM posts`.
- `inspired_by_id` is immutable — set at creation, enforced by trigger.
- Content edits are locked once a post has descendants (delete still allowed);
  enforced by the `posts_edit_lock` trigger. Admins bypass via `is_admin()`.
- Admin membership lives in the `admins` table (backend-configured); never trust
  a client-side admin flag.
- Resonance is a phrase, never a number, anywhere in the UI.
