# Handoff: Jupiter — full UI (Europa ice)

## Overview
Jupiter is a contemplative micro-diary: short entries about what makes life
worth living. Private by default, no likes, no counters. Connection happens
through **inspiration lineage** (one entry sparks another) and **soft semantic
resonance** (kin entries shown as a phrase, never a number). This bundle is the
complete visual + interaction design for all five screens, in the final
**"Europa ice"** palette.

This README is self-sufficient: a developer who wasn't in the design sessions
should be able to rebuild every screen from it alone. It is the visual companion
to the repo's `ARCHITECTURE.md` (data model, RLS, milestones) — where the two
overlap, **`ARCHITECTURE.md` and the database win**; this doc governs look and feel.

## About the design files
The files here are **design references created in HTML** — a working prototype of
the intended look and behavior, **not production code to copy**. The task is to
**recreate these screens in the target codebase** — Next.js (App Router) +
TypeScript + Tailwind, per `ARCHITECTURE.md` — using its patterns and Supabase
data layer. Do not ship the HTML directly, and do not port the mock's
`localStorage` persistence: every read/write maps to Supabase (see *State* below).

- `Jupiter.dc.html` — the canonical design, all five screens in one file.
- `support.js` — the design runtime that renders `.dc.html`. Needed only to
  open the prototype in a browser; it is **not** part of the product.
- `reference/Jupiter Palettes.dc.html` — the five-way palette exploration that
  led to Europa ice (context only).
- `reference/Jupiter Amber (alt).dc.html` — the earlier warm-amber palette,
  **shelved** for a possible future project. Not the target.

To view the prototype: open `Jupiter.dc.html` in a browser (it loads `support.js`
from the same folder). It starts on the sign-in screen; "Continue with Google" is
a mock that advances to the Commons.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, glyphs, and interactions.
Recreate pixel-faithfully with Tailwind, mapping the tokens below. Two values are
**tweakable props** in the mock purely to preview states — they are not UI
controls in the product:
- `points` (int, default 32) — drives which orbit ring is current on `/me`.
- `adminMode` (boolean, default false) — reveals admin tools. In production this
  is decided server-side from a **configurable admin list on the backend**, never
  a client toggle.

---

## Design tokens

### Color — Europa ice
| Token | Hex | Use |
|---|---|---|
| Night (page bg) | `#101B24` | App background; also the "punch-out" color inside glyphs |
| Accent (turquoise) | `#74B2BC` | Primary accent: wordmark disc, pseudonyms, links, buttons, current orbit ring |
| Accent bright | `#93C7CF` | Hover/active accent; orbit marker dot |
| Accent deep | `#44808C` | Small shadow detail inside the sign-in wordmark |
| Ink primary | `#DFE8E6` | Headings, primary text on night |
| Ink body | `#E0E6E2` | Entry body text in feed/diary cards |
| Ink body (post page) | `#E9EFEA` | Larger entry body on the post page |
| Ink hover bright | `#F2F7F3` | Entry body hover |
| Destructive / admin rose | `#D8ADB4` (text), `rgba(206,160,166,α)` | Delete confirmations, admin labels & actions |

**Muted ink** is one ink at varying alpha — `rgba(223,232,230, α)`:
`0.55` lead/italic intro · `0.45` secondary · `0.42` eyebrows · `0.38` faint
labels · `0.35` meta/dates · `0.30–0.28` placeholders · `0.25` sign-out. Hairline
borders use the same ink at `0.09–0.18`; the night-on-night dividers at `0.10–0.13`.

**Sigil colors** — each line-art glyph has a signature color, which **also becomes
that entry's rule-divider color**. Entries with no sigil fall back to a hashed pick
from `['#74B2BC','#9FA3CF','#9DB89A','#A9B8D8','#7FB3A6']`.

| Sigil | Color | Sigil | Color |
|---|---|---|---|
| moon | `#A9B8D8` | candle | `#C5BD8E` |
| citrus | `#B9BC83` | leaf (growing) | `#8FBCA4` |
| music note | `#ABA0CE` | wave (water) | `#8FB0BD` |
| cup | `#B3A795` | paw (animal) | `#ADA398` |
| book | `#9DB89A` | window (home) | `#B0A4CC` |

### Typography
- **Serif — `Literata`** (Google Fonts; weights 300/400/500, italic 300/400).
  Wordmark, all headings, entry bodies, italic intros/quotes/notes.
- **Sans — `Public Sans`** (weights 300/400/500). Nav, eyebrow labels, buttons,
  meta. `system-ui` fallback.

| Role | Family / size / weight | Tracking | Notes |
|---|---|---|---|
| Sign-in wordmark | Literata 46 / 300 | `0.05em` | |
| Page H1 (Commons, My diary) | Literata 36 / 300 | `0.01em` | |
| Write H1 | Literata 30 / 300 | | "A new page" / "A small revision" |
| Post-page body | Literata 25 / 400 | | line-height 1.8, max-width 50ch, centered |
| Feed entry body | Literata 20 / 400 | | line-height 1.8 |
| Diary entry body | Literata 19 / 400 | | line-height 1.8 |
| Composer textarea | Literata 21 / 400 | | caret `#74B2BC` |
| Italic intro / resonance / notes | Literata italic 300–400 / 14–17 | | muted ink |
| Eyebrow label | Public Sans 11 / 400 | `0.22em` | UPPERCASE, muted |
| Pseudonym (cards) | Public Sans 12 / 400 | `0.14em` | accent |
| Meta / date | Public Sans 11 / 400 | `0.14em` | UPPERCASE, ink 0.35 |
| Button (primary) | Public Sans 12 / 500 | `0.18em` | UPPERCASE, 1px accent border, radius 2px, padding ~11–13×24–26 |
| Nav item | Public Sans 13 / 400 | `0.08em` | active = ink primary, else ink 0.45 |

### Spacing / layout
- Single centered column, **max-width 680px**, horizontal padding **28px**.
- Header: flex, space-between, baseline-aligned nav, padding `38px 28px 0`.
- Main top padding **92px** (post page **72px**).
- Vertical rhythm between entries: **feed 72px**, **diary 64px**; card inner gap **13px**.
- **Rule divider** under each entry's byline: `76px × 2px`, radius 2px,
  `linear-gradient(to right, <ruleColor>, transparent)`, opacity 0.9. On the
  post page it's centered: `linear-gradient(to right, transparent, <ruleColor>, transparent)`.
- Buttons radius **2px**; cards/panels radius **4px**; sigil swatch radius **3px**.
- No drop shadows anywhere — depth comes from the background field, not elevation.

### Background field (ambient, fixed, non-interactive)
A `position: fixed` layer behind everything, with light **parallax on scroll**:
- **Galaxies** — large blurred radial-gradient blobs (turquoise/violet/blue,
  blur 26–30px, opacity 0.10–0.15) + a few small bright "smudges" and one tiny
  dashed spiral. Parallax factor **0.13**.
- **Stars** — 120 seeded dots (sizes 1/1.6/2.4px, ~30% warm turquoise, rest pale),
  each twinkling via a 6–16s opacity keyframe. Parallax factor **0.06**.
- **Horizon glow** — soft turquoise gradient rising ~38vh from the bottom.
- **Orbital arcs** — faint concentric SVG arcs anchored above the header.
- `::selection` = `rgba(116,178,188,0.30)` on `#F0F6F2`.

Reimplement as a single fixed background component. Parallax is a `translateY`
on scroll; honor `prefers-reduced-motion` by disabling twinkle + parallax.

---

## Screens / views

Routes follow `ARCHITECTURE.md`: `(auth)/login` · `feed` · `compose` ·
`post/[id]` · `me`.

### 1. Sign in — `(auth)/login`
- **Purpose:** authenticate via Google; set expectation of pseudonymity.
- **Layout:** full-height centered column, max-width 680px, text-centered.
- **Components:** Jupiter wordmark glyph (58px turquoise disc with three
  punch-out bands + a small deep-teal moon) · "Jupiter" (Literata 46/300) ·
  italic tagline *"a quiet place for the things that make life worth living"* ·
  outline button **"Continue with Google"** (circled "G" + label, 1px ink border,
  hover border turns turquoise) · fine print *"you'll appear under a pseudonym;
  your identity is never shown."*
- **Real behavior:** Supabase Google OAuth. On first sign-in a DB trigger mints
  the pseudonym; the Google identity is never displayed anywhere.

### 2. The Commons — `feed`
- **Purpose:** read public entries from strangers, newest first.
- **Layout:** eyebrow (weekday · date) → H1 "The Commons" → italic intro → list
  of entry cards (gap 72px) → closing note + "Write your own" button.
- **Entry card:** faint sigil decoration bleeding off the top-right (opacity
  ~0.13, masked with a top-to-bottom fade) · byline row = moon-phase glyph +
  **pseudonym** (accent) + `· date` · rule divider · **body** (Literata 20,
  clickable → post page, hover brightens) · optional italic **context** line ·
  optional **"inspired by <pseud>"** hairline link (→ opens that inspirer) ·
  **"this inspired me"** italic accent action (→ compose with inspirer preset).
  **One action per card. No likes, no counts.**
- **Admin (when `adminMode`):** a small `admin` row appears on others' entries —
  `edit` and `remove` (rose). `remove` arms an inline confirm (see Behavior).
  A line under the intro notes "admin tools visible — configured on the backend".

### 3. Post page — `post/[id]`
- **Purpose:** dwell on one entry; see its resonance and lineage.
- **Layout:** back link → centered focal entry (large) → **Resonance** disclosure
  → **Lineage** tree. Max-width of the lower sections 480px.
- **Focal entry:** larger sigil decoration (opacity ~0.15) · centered byline ·
  centered rule · **body** Literata 25/1.8 · optional context · **"this inspired
  me"**. If `adminMode`, the centered `admin` edit/remove row appears here too.
- **Resonance:** a button — eyebrow "Resonance" + italic *"a few others have felt
  something similar ▾"*. Expands to 2–3 **kin entries** (pseudonym + excerpt,
  left hairline rule, clickable). Rendered from `resonant_posts()`; **always a
  phrase, never a number.**
- **Lineage:** eyebrow "Lineage" + a vertical timeline (1px spine, 11px nodes).
  Three node types: normal (hollow node, pseudonym + excerpt, clickable);
  **this entry** (filled turquoise node, "THIS ENTRY" label); hidden (dashed node,
  faded italic *"a private reflection"* or *"a thought, since withdrawn"*).
  Order: ancestors (oldest→) then focal then descendants (→newest). Simple nested
  render; no graph library.

### 4. Write / Edit — `compose`
- **Purpose:** compose a new entry, or edit an existing one (own or, for admins, anyone's).
- **Layout:** eyebrow ("Write · date" or "Editing · date") → H1 → optional banner
  → textarea → counter → context input → **sigil picker** → visibility (new posts
  only) → save row (button + cap line).
- **Sigil picker:** label *"A small sign, if it wants one — optional"* then a wrap
  of **46px** square buttons, one per glyph (11 total), each a 26px line-art icon.
  Selected = glyph + border in the sigil's color; click again to deselect. Optional.
- **Visibility (new posts only):** two stacked options with journal glyphs —
  **Private** (closed book, *"kept in your diary, only for you"*) and **Public**
  (open book, *"placed in the Commons, as <pseudonym>"*). **Default Private.**
- **Banners:** arriving via "this inspired me" shows a turquoise *"This inspired
  you"* quote block with a "write without it" escape. Editing shows a rose
  *"Editing your page from <date>"* (or *"…a page by <pseud> — admin"*) with
  "leave it as it was".
- **Save row:** primary button — "Place it in the Commons" / "Keep this page" /
  "Keep the changes" (editing) — dims to 0.35 when empty or the cap is reached.
  **Cap line:** "N of M entries remain today" / "today's pages are full — they
  reopen at midnight" / "editing doesn't use today's pages".
- **Real behavior:** body ≤ 480 (live counter shows when ≤ 80 remain). Context
  note: the mock caps at **80**, but `ARCHITECTURE.md` specifies **≤ 120** —
  **use 120** in production. DB enforces the daily cap; the UI mirrors the count
  for UX only. After insert, trigger the `embed-post` Edge Function.

### 5. My diary — `me`
- **Purpose:** the author's full record (private + public), identity, and standing.
- **Layout:** eyebrow "A private record" → H1 "My diary" → **pseudonym** block →
  **orbit panel** → own entries (gap 64px) → "Begin a new page".
- **Pseudonym:** eyebrow "You appear as" + the pseudonym (Literata italic 21,
  accent) + inline **edit** → text input with "keep it"/"never mind" (Enter/Esc).
  Lowercased, spaces→underscores; handle uniqueness errors gracefully.
- **Orbit panel:** bordered card (radius 4px) with an SVG diagram + text. Diagram
  (232×244): four concentric rings labeled **IO / EUROPA / GANYMEDE / CALLISTO**
  (radii 34/64/94/124 from center), the **current ring** drawn turquoise and its
  label brightened; a small Jupiter glyph at center; the user's **marker** (hollow
  ring + bright dot) sits at ~38° on the current ring. Text: "Your orbit",
  `<Ring> — <description>`, "`<points>` points · `<cap>` entries a day", and an
  italic next-step line ("at 50 points your orbit reaches Europa and your daily
  limit becomes 4"). **Thresholds:** Io 0 (cap 3) · Europa 50 (cap 4) ·
  Ganymede 140 (cap 5) · Callisto 300 (cap 6). Source these from `app_settings`,
  not hardcoded.
- **Own entry card:** like a feed card but with a **privacy mark** (open-book +
  "in the Commons" accent / closed-book + "private" muted) instead of a pseudonym,
  plus the **edit / delete** controls below (see Behavior).

---

## Interactions & behavior

### Navigation
Header nav: **commons / write / my diary** (active = bright). Wordmark → Commons.
Feed body click → post page; back link returns to wherever you came from
(Commons or My diary). All view changes scroll to top.

### Inspiration ("this inspired me")
Present on every entry that isn't your own (feed + post page). Routes to
**compose** with the inspirer preset and the quote banner shown. `inspired_by_id`
is **set once at creation and is immutable** (DB trigger) — the UI never lets it
change afterward.

### Edit & delete (own posts) — `/me`
Per entry, below the body:
- **Before anyone is inspired by it** (no descendants): **edit** and **delete**
  both available.
- **After the first inspiration** (has descendants): **edit disappears — only
  delete remains.** A muted note explains: *"someone was inspired by this page —
  only deleting remains."* This preserves lineage integrity (the entry others
  built on shouldn't shift under them).
- **Delete** arms an inline confirm: *"delete this page?"* + "yes, delete" /
  "keep it". The confirm copy adapts: an entry **with** descendants becomes a
  faded **withdrawn** trace in its lineage (*"a faded trace will remain in its
  lineage."*); a leaf entry is **gone entirely** (*"it will be gone entirely."*).
  Maps to **soft delete only** (`deleted_at`): "withdrawn" = soft-deleted but
  still referenced by children; "gone" = soft-deleted with no references. **Never
  `DELETE FROM posts`.**

### Admin tools (configurable backend list)
When the signed-in user is an admin (membership comes from a **backend-configured
admin list**, surfaced to the client as `adminMode` — never a client-side toggle):
- Every public entry **by anyone** shows an `admin` row with **edit** and
  **remove** (rose-tinted, visually distinct from the author's own controls).
- **Admin edit** opens compose with the *"Editing a page by <pseud> — admin"*
  banner; saving overwrites the body/context/sigil (not authorship, not
  `inspired_by`).
- **Admin remove** uses the same withdrawn-vs-gone rule and the same soft-delete.
- Enforce **all** of this in the DB/RLS (admin role + policies); the frontend
  affordances are convenience only. *The database is the referee.*

### Transitions
Screens fade/translate in (`jfade`, ~0.9s). Hover color transitions ~0.4s.
Resonance expands with a 0.5s fade. Keep these subtle; respect reduced-motion.

---

## State management

Mock state (and its production source):

| Mock state | Meaning | Production source |
|---|---|---|
| `view` / `focusId` / `returnView` | which screen / focused post / back target | Next.js routing |
| `userEntries`, `edits{}`, `removed{}` | local entry store + edit/delete overlays | **Supabase `posts`** (INSERT / UPDATE / `deleted_at`) |
| `draft`, `draftContext`, `draftSigil`, `draftPublic` | composer fields | local form state; INSERT on save |
| `inspirerId` | preselected inspirer | query param / compose state → `inspired_by_id` |
| `editingId` | post being edited | route/state; UPDATE on save |
| `armedId` | which delete confirm is open | local UI only |
| `justSaved` | post-save confirmation (`public`/`private`/`edited`) | local UI only |
| `pseudonym` | display name | `profiles.pseudonym` |
| `points` (prop) | orbit standing | computed from `posts`/awards per `app_settings` |
| `adminMode` (prop) | admin affordances | server-derived admin role |

The mock persists to `localStorage` keys (`jupiter.signedin.v1`, `…entries.v1`,
`…edits.v1`, `…removed.v1`, `…draft.v1`, `…pseudonym.v1`) **only because it has no
backend** — drop all of it; use Supabase. The mock's daily-cap, edit-lock, and
admin checks are **UX mirrors**; the authoritative checks are DB triggers + RLS.

Data the screens need: feed = public non-deleted posts (paginated); post page =
the post + `lineage(id)` + `resonant_posts(id)`; me = own posts + tier/points +
cap; compose = today's count vs `user_daily_cap()`.

---

## Design tokens — quick copy
```
night        #101B24
accent       #74B2BC   accent-bright #93C7CF   accent-deep #44808C
ink          #DFE8E6   ink-body #E0E6E2   ink-body-lg #E9EFEA   ink-hover #F2F7F3
rose         #D8ADB4   rose-rgb 206,160,166
ink-rgb      223,232,230   (alpha 0.55/0.45/0.42/0.38/0.35/0.30/0.25)
sigil        moon #A9B8D8  citrus #B9BC83  note #ABA0CE  cup #B3A795  book #9DB89A
             candle #C5BD8E  leaf #8FBCA4  wave #8FB0BD  paw #ADA398  window #B0A4CC
rule-fallback #74B2BC #9FA3CF #9DB89A #A9B8D8 #7FB3A6
radius       button 2 · card 4 · sigil-swatch 3
column       max-width 680 · padding 28
fonts        Literata (serif) · Public Sans (sans)
```

## Assets
No bitmap assets. Everything is **inline SVG line-art** drawn in the prototype:
the Jupiter wordmark, the moon-phase byline glyph, the open/closed journal
(privacy) glyphs, the orbit diagram, and the 11 sigils (moon, citrus, music,
cup, book, candle, leaf, wave, paw, window). Reproduce them as small SVG/React
components (48×48 viewBox, 1.5 stroke, round caps/joins). Fonts: Literata +
Public Sans from Google Fonts (or self-host).

## Files
- `Jupiter.dc.html` — canonical design, all five screens (read this for exact
  markup, SVG paths, and the orbit math).
- `support.js` — prototype runtime (not product code).
- `reference/Jupiter Palettes.dc.html` — palette exploration.
- `reference/Jupiter Amber (alt).dc.html` — shelved warm alternative.

## Open questions to confirm against the DB
1. **Context note length:** mock 80 vs `ARCHITECTURE.md` 120 → use **120**.
2. **Edit-after-inspiration:** the design **locks editing once a post has
   descendants** (delete only). Confirm this is the product rule, or relax to
   allow body edits (inspirer stays immutable regardless).
3. **Public→private flip:** `ARCHITECTURE.md` leaves the stance open; the diary
   shows entries with a privacy mark but no inline flip — add later if desired.
