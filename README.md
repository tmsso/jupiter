# Jupiter

A contemplative micro-diary — short entries about what makes life worth living.
Private by default, no likes, no counters. Connection happens through
**inspiration lineage** and **soft semantic resonance** (a phrase, never a number).

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the data model, rules, and
milestones, and [`design_handoff_jupiter/`](./design_handoff_jupiter/) for the
Europa-ice visual spec.

## Stack

Next.js (App Router) + TypeScript + Tailwind v4 · Supabase (Postgres + Auth).
The **database is the referee**: daily caps, the edit lock, immutable
`inspired_by`, privacy, and admin rights are enforced by triggers + RLS; the
frontend mirrors them for UX only.

## Setup

1. **Install:** `npm install`
2. **Supabase:** create a project, enable the Google auth provider, then run the
   migrations in order in the SQL editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_design_reconciliation.sql`
3. **Env:** copy `.env.local.example` to `.env.local` and fill in the values
   (Supabase → Settings → API). `SUPABASE_SERVICE_ROLE_KEY` is server-only —
   never prefix it with `NEXT_PUBLIC`.
4. **OAuth redirect:** add `http://localhost:3000/auth/callback` (and your
   deployed origin) to the Supabase Auth redirect allow-list.
5. **Run:** `npm run dev` → http://localhost:3000

To grant admin (moderation) rights, insert a row out-of-band via the SQL editor:
`insert into admins (user_id) values ('<profile uuid>');`

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`

## Milestones

Built milestone by milestone (ARCHITECTURE.md §5). **M1 (walking skeleton):**
sign-in, compose (text + sigil + visibility), the diary at `/me`, plus minimal
Commons and post views. Later milestones add the full entry cards, lineage,
resonance, orbit/tiers, owner/admin controls, and polish.
