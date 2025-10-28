import { createServerSupabaseClient } from "../supabase/server";

export async function isAdmin(): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Option A: Check user metadata
  // return user.user_metadata?.is_admin === true;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin === true;
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}
