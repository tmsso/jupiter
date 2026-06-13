// UI-facing domain types. The DB is the referee; these mirror what the
// screens render (see design_handoff_jupiter/COMPONENTS.md).

export type Visibility = "private" | "public";

// Sigil ids come from app_settings.sigils (kept flexible). This union is the
// current known set for ergonomics; unknown ids degrade gracefully to null.
export type SigilName =
  | "moon"
  | "citrus"
  | "music"
  | "cup"
  | "book"
  | "candle"
  | "leaf"
  | "wave"
  | "paw"
  | "window";

export interface Post {
  id: string;
  authorId: string;
  pseudonym: string; // resolved display name
  isOwn: boolean;
  body: string; // <= 480
  context: string | null; // <= 120
  sigil: SigilName | null;
  visibility: Visibility;
  inspiredById: string | null; // immutable after creation
  hasDescendants: boolean; // -> edit lock for owner
  withdrawn: boolean; // soft-deleted but still referenced
  createdAt: string; // UTC ISO
}

export interface Profile {
  id: string;
  pseudonym: string;
}

export type LineageHiddenReason = "private" | "withdrawn" | null;

export interface LineageNode {
  postId: string;
  inspiredById: string | null;
  pseudonym: string | null; // null when hidden
  body: string | null; // null when hidden
  createdAt: string;
  hidden: boolean;
  hiddenReason: LineageHiddenReason;
  isFocus: boolean;
}

export interface Ring {
  name: string; // "io" | "europa" | "ganymede" | "callisto"
  minPoints: number;
  cap: number;
}

export interface Standing {
  points: number;
  ring: Ring;
  next: Ring | null; // null at the outermost orbit
  cap: number;
}
