# JUPITER — Claude Design Brief

Paste the sections below into Claude Design (claude.ai/design) as the opening
prompt, then iterate on the canvas. Request the Claude Code handoff bundle
when a screen feels right.

---

## Opening prompt

Design a web app called **Jupiter** — a contemplative micro-diary inspired by
the closing monologue of the film *Manhattan*, where the narrator lists the
things that make life worth living. Users write short private reflections
(max 480 characters) about real moments; they may optionally make an entry
public. There are no likes, no follower counts, no metrics on display.
Instead of replies, an entry can declare a single **inspirer** (another entry
that sparked it), forming quiet branching trees of thought. Entries may show
soft "resonance" — a gentle note that a few strangers wrote something
similar — always as a phrase, never a number.

**Mood:** a quiet observatory at night. Unhurried, literary, warm.
Think paper journal meets planetarium — NOT a social network.

**Visual direction:**
- Dark, deep-space-adjacent palette but warm, not cold sci-fi: near-black
  indigo background, warm off-white text, one restrained accent
  (suggest: muted amber, like Jupiter's bands). High contrast for long reading.
- Generous whitespace; single readable column (~65ch) for text.
- Typography-led: a serif for entry bodies (literary feel), a quiet
  sans-serif for UI chrome. Large, calm line-height.
- Imagery minimal. If decorative motifs are used, faint orbital lines or a
  small moon-phase glyph — subtle, never busy. No stock space photos.
- Motion: almost none. Slow fades only.
- Light mode optional later; design dark-first.

**Anti-goals:** no badges, no streaks, no notification bells, no infinite-
scroll dopamine patterns, no card grids that look like a feed of products.

## Screens to design (in this order)

1. **Sign-in** — single screen: the name "Jupiter", one line of purpose
   ("a quiet place for the things that make life worth living"),
   a "Continue with Google" button. Note beneath: "you'll appear under a
   pseudonym; your identity is never shown."

2. **Compose** — the heart of the app. A serene writing surface:
   body field with a live character count that appears only near the limit;
   optional small "context" line (where / what prompted this);
   optional image attach; visibility toggle defaulting to **Private**
   (private = a closed journal glyph, public = an open one);
   if arriving via "this inspired me", a quiet banner shows the inspiring
   entry's first line. A subtle indicator of remaining entries today
   ("2 of 3 entries remain today") — informative, not gamified.

3. **The Commons (feed)** — public entries, newest first, one column.
   Each entry: pseudonym, body in serif, optional context note in small
   italic, optional image (modest size), and — only when applicable —
   a hairline "inspired by quiet_europa_17" link. Exactly one action per
   entry: **"this inspired me"** (text link, not a button-cluster).
   No counts of any kind on entries.

4. **Entry page** — the entry large and centered; beneath it, when present:
   (a) *Resonance*: "a few others have felt something similar" expanding to
   2–3 kin entries; (b) *Lineage*: a small vertical tree of inspiration —
   ancestors above, descendants below — where private or withdrawn entries
   render as faded placeholders labeled "a private reflection" or
   "a thought, since withdrawn".

5. **My diary (/me)** — the user's own entries (private ones marked with the
   closed-journal glyph), a pseudonym field with edit affordance, and an
   **orbit panel**: a minimal diagram of four orbital rings labeled
   Io, Europa, Ganymede, Callisto with the user's marker on their current
   ring, current points shown small, and one line: "at 50 points your orbit
   reaches Europa and your daily limit becomes 4". Calm, diagrammatic,
   no progress-bar gamification styling.

## Components to extract for handoff

Entry card, compose form, visibility toggle, lineage tree node (normal /
hidden), resonance disclosure, orbit panel, pseudonym editor, daily-cap
indicator, top navigation (Commons · Write · My diary — three items, no more).

## Handoff

Target stack: Next.js App Router + Tailwind. Use the "Handoff to Claude Code"
feature per screen; the implementation repo follows ARCHITECTURE.md.
