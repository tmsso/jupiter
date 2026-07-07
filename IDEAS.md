# Jupiter — Idea Backlog

A pick-list for future releases. Nothing here is scheduled; move an item into
`ROADMAP.md` (with scope + acceptance checks) before building it. Each idea is
tagged with a rough fit against the product ethos (`docs/design_brief.md`:
contemplative, no metrics, no dopamine patterns).

## Product

- **Images, revisited** (the shelved M5): Supabase Storage upload + modest
  display. Superseded by sigils in compose; only revive if entries genuinely
  need photos. *(ethos: neutral)*
- **AI-generated line-art for text-only posts** — generate a sigil-style
  illustration from the entry text; keep it faint and optional. *(ethos: good
  if quiet; risk of gimmick)*
- **Resonance clustering** — periodic job groups semantically-kin public
  entries into unnamed "constellations" browsable from a post. *(ethos: good)*
- **On this day** — on `/me`, surface your entry from a year/month ago as a
  quiet single line. *(ethos: very good — private, reflective)*
- **Diary export** — download your full diary (private included) as
  Markdown/JSON. Data ownership; trivially cheap. *(ethos: very good)*
- **Public permalink stance** — decide whether a public post is readable
  logged-out (currently members-only via RLS `to authenticated`). Would need
  an `anon` read policy + middleware change; enables sharing a page with a
  non-member friend. *(ethos: debatable — widens the commons)*
- **Public→private flip stance** (open question in the design README):
  currently technically allowed; decide and enforce/document. Consider the
  lineage consequence (children's "inspired by" goes hidden).
- **Local-midnight caps** — per-user timezone on the profile; the cap day and
  the "reopen at midnight" promise both become true locally. DB gets the
  timezone column; trigger uses it. *(ethos: good — honesty)*
- **Withdrawn-vs-private precedence** — product ruling on `hidden_reason` for
  deleted private posts (see Phase 3.1 note in ROADMAP).
- **Pseudonym regeneration** — "deal me another name" button instead of free
  editing; keeps names in the celestial family. *(ethos: good)*
- **Weekly commons letter** — opt-in email digest of a few public entries,
  written like a letter, no links to "engage". *(ethos: careful — borders the
  notification anti-goal)*
- **Light mode** — the design brief defers it; Europa-ice tokens need a
  daylight counterpart. *(effort: medium)*
- **Gentle onboarding** — first-run compose shows the Manhattan-monologue
  framing as placeholder rotation. *(ethos: very good, tiny)*

## Engineering

- **Sigil set fully DB-driven** — move color + display order into
  `app_settings.sigils` entries (objects, not bare ids); unknown ids render a
  fallback glyph instead of disappearing. Removes the three-file TS hardcode.
- **Char limits: one source of truth** — enforce `max_post_chars` /
  `max_context_chars` via a trigger reading `app_settings` (the `valid_sigil`
  pattern) and drop the hardcoded CHECK constraints.
- **`posts_used_today(p_user)` SQL function** — one definition of "today",
  used by both the trigger and the UI (replaces the duplicated count query in
  `getTodayCount`).
- **Concurrency-safe cap** — the cap check trigger can race concurrent
  inserts (both count N-1, both pass). Advisory lock on `author_id` in the
  trigger, or count with the new row via a constraint trigger. Low urgency at
  this scale.
- **`user_points` for other users** — the RPC silently returns 0 for anyone
  but the caller (RLS filters inside a non-definer function). Needed the day
  any screen shows another member's standing; fix = `security definer` +
  explicit grants, or a public-standing view.
- **Rate limiting beyond the cap** — per-IP/per-user request limits on the
  server actions (Supabase or Vercel middleware) against scripted abuse.
- **Test harness** — the Phase-0 docker recipe (pgvector + auth stubs)
  promoted to a repeatable `npm run test:sql` script; Playwright smoke for
  login→compose→feed. Makes lower-tier-model delivery much safer.
- **Supabase branch environments / second free project as prod** — separate
  dev from prod data before inviting anyone.
- **Structured logging in server actions** — currently errors are swallowed
  into generic copy with no server-side trace.
- **Embedding refresh on edit** — covered in Phase 4, listed here in case the
  Edge Function ships insert-only.
- **`app_settings` audit** — settings changes are silent; a tiny
  `settings_history` table (old/new/who/when) keeps the referee accountable.
