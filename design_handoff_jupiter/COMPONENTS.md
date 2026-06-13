# Jupiter — Component & Route Map

Concrete implementation skeleton: every design piece → a file in the
Next.js (App Router) + TypeScript + Tailwind + Supabase structure from
`ARCHITECTURE.md`. Pair this with `README.md` (the visual spec). Names are
suggestions; follow existing repo conventions where they differ.

Legend: **[S]** server component · **[C]** client component (`"use client"`) ·
**[F]** function/helper · **[T]** type.

---

## Routes — `src/app/`

| Screen (README) | Route file | Kind | Notes |
|---|---|---|---|
| Sign in | `(auth)/login/page.tsx` | [C] | Google OAuth button → Supabase; redirect to `/feed` |
| The Commons | `feed/page.tsx` | [S] | Fetch public, non-deleted posts (paginated) → render `<EntryCard>` list |
| Post page | `post/[id]/page.tsx` | [S] | Fetch post + `lineage(id)` + `resonant_posts(id)` |
| Write / Edit | `compose/page.tsx` | [C] | Query params: `?inspirer=<id>` and/or `?edit=<id>` |
| My diary | `me/page.tsx` | [S] | Own posts + tier/points + cap; pseudonym block |
| App shell | `layout.tsx` | [S] | Mounts `<BackgroundField>` + `<AppHeader>` + `<main>` wrapper |
| — | `globals.css` | — | Tailwind base + `@font-face`/links, `::selection`, keyframes |

Auth gating: protect `feed/compose/post/me` via middleware or a server check;
unauthenticated → `(auth)/login`.

---

## Components — `src/components/`

### Layout & chrome
| Component | File | Kind | Props | Description |
|---|---|---|---|---|
| `BackgroundField` | `layout/BackgroundField.tsx` | [C] | — | Fixed star/galaxy/horizon field + scroll parallax; honors `prefers-reduced-motion` |
| `AppHeader` | `layout/AppHeader.tsx` | [C] | `active` | Wordmark + commons/write/my-diary nav; active = bright |
| `AppFooter` | `layout/AppFooter.tsx` | [S] | — | Italic tagline + sign-out |
| `PageColumn` | `layout/PageColumn.tsx` | [S] | `children` | Centered 680px column, standard top padding |
| `Eyebrow` | `primitives/Eyebrow.tsx` | [S] | `children` | 11px / 0.22em uppercase muted label |
| `RuleDivider` | `primitives/RuleDivider.tsx` | [S] | `color`, `centered?` | 76×2 gradient rule |
| `PrimaryButton` | `primitives/PrimaryButton.tsx` | [S] | `as?`,`onClick?` | Outline uppercase accent button |

### Entries
| Component | File | Kind | Props | Description |
|---|---|---|---|---|
| `EntryCard` | `entry/EntryCard.tsx` | [C] | `post`, `variant` | Feed/diary card: sigil decoration, byline, rule, body, context, links/actions. `variant: 'feed' \| 'diary'` |
| `EntryByline` | `entry/EntryByline.tsx` | [S] | `post`, `mode` | Moon glyph + pseudonym + date (feed) OR privacy mark + label + date (diary) |
| `InspiredByLink` | `entry/InspiredByLink.tsx` | [S] | `inspirer` | Hairline "inspired by <pseud>" → post page |
| `InspireAction` | `entry/InspireAction.tsx` | [C] | `postId` | "this inspired me" → `/compose?inspirer=id` |
| `OwnerControls` | `entry/OwnerControls.tsx` | [C] | `post` | Edit/delete for own posts; edit hidden once `hasDescendants`; inline delete confirm |
| `AdminControls` | `entry/AdminControls.tsx` | [C] | `post` | Admin edit/remove (rose); gated by server `isAdmin` |
| `DeleteConfirm` | `entry/DeleteConfirm.tsx` | [C] | `post`,`onConfirm` | Inline "withdrawn vs gone" confirm copy |

### Post page
| Component | File | Kind | Props | Description |
|---|---|---|---|---|
| `FocalEntry` | `post/FocalEntry.tsx` | [S] | `post` | Large centered entry + admin controls slot |
| `Resonance` | `post/Resonance.tsx` | [C] | `kin` | Disclosure → kin entries; **phrase, never a number** |
| `LineageTree` | `post/LineageTree.tsx` | [S] | `nodes` | Vertical spine; normal / this-entry / hidden nodes |
| `LineageNode` | `post/LineageNode.tsx` | [S] | `node` | One node (3 visual states) |

### Compose
| Component | File | Kind | Props | Description |
|---|---|---|---|---|
| `Composer` | `compose/Composer.tsx` | [C] | `inspirer?`,`editing?` | Orchestrates fields, banners, save; new-vs-edit modes |
| `BodyField` | `compose/BodyField.tsx` | [C] | `value`,`onChange` | Textarea, ≤480, live counter (≤80 remaining) |
| `ContextField` | `compose/ContextField.tsx` | [C] | `value`,`onChange` | Italic context input, **≤120** (use 120, not the mock's 80) |
| `SigilPicker` | `compose/SigilPicker.tsx` | [C] | `value`,`onChange` | 11 selectable 46px glyph swatches; optional |
| `VisibilityToggle` | `compose/VisibilityToggle.tsx` | [C] | `value`,`onChange` | Private(default)/Public with journal glyphs; new posts only |
| `InspirerBanner` | `compose/InspirerBanner.tsx` | [S] | `inspirer` | "This inspired you" quote block + clear |
| `EditBanner` | `compose/EditBanner.tsx` | [S] | `post`,`isAdmin` | Rose "Editing…" banner |
| `CapLine` | `compose/CapLine.tsx` | [S] | `remaining`,`cap`,`editing` | "N of M entries remain today" / full / editing |

### My diary
| Component | File | Kind | Props | Description |
|---|---|---|---|---|
| `PseudonymEditor` | `me/PseudonymEditor.tsx` | [C] | `pseudonym` | Inline edit; lowercase + underscores; uniqueness errors |
| `OrbitPanel` | `me/OrbitPanel.tsx` | [S] | `points`,`ring`,`cap`,`next` | Bordered card: diagram + text |
| `OrbitDiagram` | `me/OrbitDiagram.tsx` | [S] | `ringIndex`,`points` | SVG 232×244: 4 rings, Jupiter glyph, marker (see orbit math) |

### Icons — `src/components/icons/` [S]
Port the prototype's inline SVGs as small components (48×48 viewBox, 1.5 stroke,
round caps/joins): `Wordmark`, `MoonPhase` (takes `phase`), `JournalOpen`,
`JournalClosed`, and a `Sigil` set keyed by name —
`moon, citrus, music, cup, book, candle, leaf, wave, paw, window`
(exact paths + signature colors live in `Jupiter.dc.html`).

---

## Data & logic — `src/lib/`

| File | Kind | Contents |
|---|---|---|
| `supabase/client.ts` / `server.ts` | [F] | Browser + server Supabase clients (per `ARCHITECTURE.md` §3) |
| `queries.ts` | [F] | `getFeed(page)`, `getPost(id)`, `getLineage(id)`, `getResonant(id)`, `getOwnPosts()`, `getStanding()`, `getTodayCount()` |
| `mutations.ts` | [F] | `createPost(input)`, `updatePost(id, patch)`, `softDeletePost(id)`, `updatePseudonym(name)` — then call `embed-post` after insert |
| `orbit.ts` | [F] | `ringForPoints(points)`, `nextRing(points)`; thresholds sourced from `app_settings` (Io 0/cap3 · Europa 50/cap4 · Ganymede 140/cap5 · Callisto 300/cap6) |
| `sigils.ts` | [F]/[T] | Sigil name→color map + the fallback rule palette |
| `auth.ts` | [F] | `getSessionUser()`, `isAdmin(user)` — admin membership from the **backend-configured list**, never the client |
| `types.ts` | [T] | `Post`, `Profile`, `LineageNode`, `Ring`, `Sigil`, `Visibility` |

### `Post` shape (UI-facing)
```ts
type Visibility = 'private' | 'public';
interface Post {
  id: string;
  authorId: string;
  pseudonym: string;          // resolved display name
  isOwn: boolean;
  body: string;               // ≤480
  context: string | null;     // ≤120
  sigil: SigilName | null;
  visibility: Visibility;
  inspiredById: string | null;   // immutable after creation
  hasDescendants: boolean;       // → edit lock for owner
  withdrawn: boolean;            // soft-deleted but still referenced
  createdAt: string;             // UTC
}
```

---

## Server actions / API surface
Prefer **server actions** (or route handlers) so the **DB stays the referee**:
- `createPostAction` — insert; DB enforces daily cap + sets immutable `inspired_by_id`; then invoke `embed-post`.
- `updatePostAction` — owner (body/context/sigil) **only if `!hasDescendants`**; admin may edit any; never touches authorship or `inspired_by_id`.
- `deletePostAction` — soft delete (`deleted_at`); owner or admin; RLS-enforced.
- `updatePseudonymAction` — unique; surface conflicts to `PseudonymEditor`.

The frontend's edit-lock, cap line, and admin affordances are **UX mirrors**;
authoritative checks are DB triggers + RLS.

---

## Build order (maps to ARCHITECTURE.md §5 milestones)
1. **Skeleton** — `layout.tsx`, `BackgroundField`, `AppHeader`, `login`, `me` (list own), `Composer` (text only). Tokens + fonts in `globals.css`.
2. **The commons** — `feed`, `EntryCard`, `VisibilityToggle`, `CapLine`.
3. **The soul** — `InspireAction`/`InspirerBanner`, `LineageTree`, `OrbitPanel`/`OrbitDiagram`, `OwnerControls` (+ edit lock).
4. **Resonance** — `embed-post` wiring, `Resonance`.
5. **Images** — (backlog per ARCHITECTURE; design currently has no image slot).
6. **Polish & admin** — `AdminControls` + admin RLS; reduced-motion; PWA manifest.

> The earlier amber palette in `reference/` is **not** the target — build against the Europa-ice tokens in `README.md`.
