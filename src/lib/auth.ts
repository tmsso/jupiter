import { createClient } from "./supabase/server";

export interface SessionUser {
  id: string;
  pseudonym: string;
  isAdmin: boolean;
}

// The signed-in user resolved to a Jupiter profile, or null. Admin membership
// comes from the `admins` table (RLS lets a user read only their own row) —
// never a client flag (ARCHITECTURE.md "Admin").
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: adminRow }] = await Promise.all([
    supabase.from("profiles").select("pseudonym").eq("id", user.id).single(),
    supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);

  return {
    id: user.id,
    pseudonym: profile?.pseudonym ?? "",
    isAdmin: !!adminRow,
  };
}
