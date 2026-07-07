# Jupiter — Delivery Roadmap (v1)

Supersedes `ARCHITECTURE.md` §5 as the working plan. Written to be executed
**phase by phase with a mid-tier model** (Sonnet-class, or Opus with medium
thinking): each phase is small, has explicit scope boundaries, names the files
it may touch, and ends with mechanical acceptance checks. Do not start a phase
before the previous one's checks pass. One commit (or a few) per phase.

Ground rules for every phase (from `ARCHITECTURE.md` §7):

- The **database is the referee** — caps, edit lock, immutability, privacy,
  admin rights are triggers + RLS; the frontend only mirrors them.
- Tunables (caps, tiers, char limits, sigil set) are read from `app_settings`.
- Soft delete only; `inspired_by_id` immutable; resonance is a phrase, never a
  number; never expose `SUPABASE_SERVICE_ROLE_KEY` — and **never wire a
  service-role client into request paths** (it would bypass the referee).
- Design source of truth: `design_handoff_jupiter/` (README = visual spec,
  COMPONENTS.md = file map, Jupiter.dc.html = exact SVG paths + orbit math).
- Verify SQL changes empirically: `docker run pgvector/pgvector:pg15`, stub
  `auth` schema + `authenticated` role, run migrations, exercise the triggers
  (see Phase 0 checks for the recipe).

---

## Phase 0 — Repairs (bugs found in review, 2026-07-07) — SHIP FIRST

All five DB findings were **reproduced against a real Postgres 15**; this is
not speculation. The schema has never applied cleanly, so **fix migrations
001 and 002 in place** and re-run them on a fresh Supabase project (there is
no production data to preserve). If a partially-applied project must be kept
instead, port the same fixes into a `003_repairs.sql`.

### 0.1 `lineage()` breaks both migrations *(blocker — confirmed)*
`001:264` and `002:183` fail with `ERROR: column "created_at" does not exist`.
In the `root` CTE, `ORDER BY … LIMIT 1` after an unparenthesized `UNION ALL`
binds to the **whole** set operation and may only reference output columns
(`id`). The fallback arm is also unreachable: `inspired_by_id` is a validated
FK and immutable, so a cycle-free chain always ends at a null-inspirer root.
**Fix:** delete the fallback arm — `root as (select id from up where
inspired_by_id is null)` and `where p.id = (select id from root)`.

### 0.2 `002` redefines `lineage()` with a new return type *(blocker — confirmed)*
Once 0.1 is fixed, `002` still fails: `cannot change return type of existing
function` (it adds `hidden_reason`). **Fix:** `drop function if exists
lineage(uuid);` in `002` before the `create`. (Moot if 001+002 are collapsed —
see 0.6.)

### 0.3 Every "inspired by" post fails to insert *(blocker — confirmed)*
`on_post_insert` is a **BEFORE INSERT** trigger that inserts into
`point_events` with `post_id = new.id` — a row that does not exist yet, so the
FK check aborts the insert: `violates foreign key constraint
point_events_post_id_fkey`. The M3 core flow is dead on arrival. **Fix:** keep
the cap check BEFORE; move the point award to a separate **AFTER INSERT**
trigger.

### 0.4 Daily cap is bypassable; points are farmable *(confirmed)*
The cap counts `deleted_at is null`, so soft-deleting refunds the day
(reproduced: 4 live posts on a cap-3 day via delete → insert → un-delete).
`point_events` are never revoked, so delete-and-repost also farms inspirer
points without limit. **Fix (three parts):**
- cap counts **all** posts created today, deleted or not (drop the
  `deleted_at is null` filter in the trigger count);
- forbid un-delete: in the edit-lock trigger (or a dedicated one), reject
  `deleted_at` transitions from non-null to null for non-admins;
- pin the day boundary to UTC explicitly: `created_at >= date_trunc('day',
  now() at time zone 'utc')` (the current `date_trunc('day', now())` follows
  the session timezone GUC).

### 0.5 Admins can reassign authorship *(security — confirmed by policy semantics)*
`posts_admin_update`'s `WITH CHECK (is_admin() and visibility='public')` says
nothing about `author_id` or `created_at`, and no trigger protects them
(only `inspired_by_id` has one). An admin UPDATE can silently transfer a post
to any profile — contradicting "edits … never authorship" (`ARCHITECTURE.md`).
**Fix:** generalize `forbid_inspirer_change` into an immutable-columns trigger
covering `inspired_by_id`, `author_id`, `created_at` for everyone.

### 0.6 Migration hygiene
Since the schema never applied, **collapse the fixed 001+002 into the two
files as corrected** (keep numbering) and state in the README that a fresh
Supabase project is required. Re-test with the docker recipe below.

### 0.7 Frontend repairs (small, same phase)
- `getTodayCount` (`src/lib/queries.ts:230`): an RPC error currently coerces
  the cap to **0**, which renders as "today's pages are full" and disables
  compose for everyone. Surface the error (throw or return a sentinel) instead
  of `Number(cap ?? 0)`.
- `createPostAction` (`src/lib/actions.ts:48`): stop matching the trigger's
  prose. Raise with a custom errcode in the trigger (`using errcode = 'JP001'`)
  and branch on `error.code`. Map the char-limit and sigil violations to real
  messages while there.
- `todayLine()` (`Composer.tsx:22`, `feed/page.tsx:11`): `new Date()` in a
  SSR'd client component hydration-mismatches whenever server (UTC) and
  browser disagree on the date. Move to one UTC-based helper in
  `src/lib/format.ts` used by both.
- Cap copy: "they reopen at midnight" is only true in UTC+0. Keep the poetry,
  add truth: "they reopen at midnight, universal time" (or compute the local
  reset hour).
- `.env.local.example`: delete the comment claiming the service key is "used
  by server actions … that must bypass RLS" — nothing does, and nothing
  should.

### Phase 0 acceptance checks
```bash
npm run typecheck && npm run build
# SQL: fresh pgvector container, stub auth schema/role, then:
#  - 001 and 002 apply with zero errors
#  - insert inspired post succeeds; inspirer gains exactly 1 point
#  - 4th insert on cap-3 day fails; delete → insert still fails (no refund)
#  - un-delete (deleted_at -> null) fails for owner
#  - admin UPDATE setting author_id fails
#  - select * from lineage(<leaf id>) returns the full chain with hidden_reason
```

---

## Phase 1 — Foundation hardening (before any new features)

Make the codebase cheap for a mid-tier model to extend. No visible product
change. All items are mechanical refactors with the existing behavior as the
spec.

1. **One decision, then act — Tailwind in or out.** Tailwind v4 is installed
   but **zero utility classes exist**; all styling is inline `style` objects.
   Either (a) drop `tailwindcss`/`@tailwindcss/postcss` and replace the
   `@theme` block with plain `:root` variables, or (b) adopt utilities in new
   components going forward. Recommendation: **(a) drop it** — the inline
   token-based style system already works and consistency beats fashion here.
   Update `ARCHITECTURE.md` §1 to match reality either way.
2. **`EntryCard`** (`src/components/entry/EntryCard.tsx` per COMPONENTS.md):
   consolidate the byline + rule + body + context block copy-pasted across
   `feed`, `me`, and `post/[id]` pages (already drifting: body 19/20/25px,
   context alpha 0.45/0.5 — keep the intentional size deltas as a `variant`
   prop). Extract `EntryByline` too.
3. **Session/query plumbing:** wrap `createClient` + `getUser` +
   `getSessionUser` in `React.cache()` so one request performs **one** auth
   round-trip instead of four (middleware + layout + page + helper).
   In `getOwnPosts`, drop the second profile fetch (the caller already has
   `getSessionUser`); parallelize the independent queries.
4. **One settings read:** replace `getSigilSet`/`getCharLimits`/`getRings`'s
   four `app_settings` queries with a single cached `getSettings()` and thin
   typed readers.
5. **Generated DB types:** `supabase gen types typescript` → drop the
   hand-rolled `PostRow`/`PostRowWithProfile` casts and the `Array.isArray`
   join gymnastics.
6. **Shared primitives:** move Composer's private `LinkButton` to
   `primitives/`; use `PrimaryButton` for the save button (it has drifted from
   the primitive); extract the duplicated serif-italic intro style and the
   `h*31` hash helper (`format.ts` + `sigils.ts`).
7. **Middleware:** compute `isPublic` before calling `auth.getUser()`; fix the
   matcher comment (the callback is allowed by `PUBLIC_PATHS`, not excluded by
   the matcher).
8. **Dead code:** remove unused `galRef`/`starRef` **or** (better) use them to
   apply the parallax transform imperatively so scrolling stops re-rendering
   120 star spans per frame; delete unused `Profile`, `counterThreshold` prop;
   reconcile `LineageNode` with what `lineage()` actually returns before M3
   uses it.

**Checks:** `npm run typecheck && npm run build`; pages render identically
(eyeball diff of feed/me/post/compose before/after).

---

## Phase 2 — The Commons, completed (was M2)

1. `EntryCard` feed variant gains: faint sigil decoration (top-right, masked
   fade, opacity ~0.13 — paths in `Jupiter.dc.html`), "inspired by <pseud>"
   hairline link, and the single **"this inspired me"** action (not on own
   posts).
2. Compose accepts `?inspirer=<id>`: fetch the inspirer, show the turquoise
   quote banner with "write without it" escape, pass `inspiredById` on save.
   (DB path already fixed in Phase 0.3 — verify against a real project.)
3. Feed pagination: "earlier pages" link driven by `getFeed(page)` (already
   paginated server-side; just wire the param — keep it a link, not infinite
   scroll, per the anti-goals).
4. Diary privacy-mark byline variant (already partially present) moves into
   `EntryByline`.

**Checks:** typecheck/build; manual flow — post publicly from account A,
"this inspired me" from account B, B's post shows "inspired by <A's pseud>",
A's `point_events` gains one row.

---

## Phase 3 — The Soul (was M3)

1. **Lineage tree** on the post page from `lineage()`: vertical spine, three
   node states (normal / THIS ENTRY / hidden-dashed with "a private
   reflection" vs "a thought, since withdrawn"). Note: `hidden_reason`
   currently reports a deleted **private** post as "withdrawn" — decide the
   product stance (recommend: private wins over withdrawn for never-public
   posts; needs a small `lineage()` tweak reading the visibility first).
2. **Orbit panel** on `/me`: SVG diagram (exact geometry + marker math in
   `Jupiter.dc.html`), standing text from `getStanding()` — already built —
   plus `orbitNextLine()`.
3. **Owner controls** on `/me` cards: edit (routes to compose in edit mode) and
   delete with the inline withdrawn-vs-gone confirm. **Known trap:** the
   client's `hasDescendants` is RLS-filtered and cannot see other users'
   private children, while the DB edit lock counts them. Add a
   `has_descendants(p_post)` RPC (function exists; grant execute) and use it
   for own posts instead of `descendantSet`.
4. **Compose edit mode** (`?edit=<id>`): rose banner, "Keep the changes",
   "editing doesn't use today's pages" cap line; server action
   `updatePostAction` (body/context/sigil only).
5. **Pseudonym editor** on `/me`: inline edit, lowercase/underscores,
   uniqueness error surfaced gently.

**Checks:** typecheck/build; manual — edit locks after another account is
inspired by the post; withdrawn parent renders as faded trace in the child's
lineage; leaf delete disappears entirely.

---

## Phase 4 — Resonance (was M4)

1. Edge Function `supabase/functions/embed-post`: input post id → fetch
   body+context → `gte-small` via Supabase AI → update `posts.embedding`.
   Trigger via DB webhook on insert **and** on edit (body changed = embedding
   stale — the current TODO only mentions insert).
2. Post page **Resonance** disclosure fed by `resonant_posts()` — phrase,
   never a number; hide the section entirely below 1 kin.
3. Backfill embeddings for existing posts (one-off script or SQL loop calling
   the function).

**Checks:** two similar public posts by different authors resonate; a private
post never appears as anyone else's kin; author's own private post still finds
public kin.

---

## Phase 5 — Admin & polish (was M6)

1. `AdminControls` (rose) on others' public entries for admins; admin edit via
   compose banner; admin remove with the same withdrawn-vs-gone confirm.
   Exercise the RLS policies end-to-end with a second account granted admin.
2. Design polish pass against `Jupiter.dc.html`: transitions (`jfade`,
   resonance 0.5s), hover states, `prefers-reduced-motion` audit.
3. PWA manifest + icons (installable; groundwork for a later lightweight app).
4. Promote: second Supabase free project as prod; document env switch.

**Checks:** non-admin sees no admin affordances and cannot UPDATE others' rows
(verify via direct PostgREST call, not just UI); Lighthouse PWA installable.

---

Everything else lives in [`IDEAS.md`](./IDEAS.md) — do not pull ideas into a
phase without moving them here first.
