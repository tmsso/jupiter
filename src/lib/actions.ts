"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";
import type { Visibility } from "./types";

export interface CreatePostInput {
  body: string;
  context: string | null;
  sigil: string | null;
  visibility: Visibility;
  inspiredById: string | null;
}

export interface ActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

// Insert a new entry. The DB is the referee: it enforces the daily cap, sets
// the immutable inspired_by_id, validates the sigil, and awards inspirer points
// via triggers. We only mirror the obvious client-side checks.
export async function createPostAction(input: CreatePostInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const body = input.body.trim();
  if (!body) return { ok: false, error: "An entry needs a few words." };

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      body,
      context_note: input.context?.trim() || null,
      sigil: input.sigil,
      visibility: input.visibility,
      inspired_by_id: input.inspiredById,
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.includes("Daily post limit")) {
      return { ok: false, error: "Today's pages are full — they reopen at midnight." };
    }
    return { ok: false, error: "Something kept this from being saved. Please try again." };
  }

  // TODO (milestone 4): invoke the embed-post Edge Function here.

  revalidatePath("/me");
  revalidatePath("/feed");
  return { ok: true, id: data.id };
}
