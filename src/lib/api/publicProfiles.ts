import { createClient } from "../supabase/client";

const supabase = createClient();

/**
 * The only cross-user view of a profile: username and avatar. Full rows in
 * `profiles` are readable by their owner only.
 */
export type PublicProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export async function getPublicProfiles(
  ids: string[]
): Promise<Map<string, PublicProfile>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return new Map();

  const { data, error } = await supabase
    .from("public_profiles")
    .select("id, username, avatar_url")
    .in("id", unique);

  // Author names are decorative; callers fall back to "Unknown".
  if (error) return new Map();

  return new Map(
    ((data ?? []) as PublicProfile[]).map((profile) => [profile.id, profile])
  );
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** Exact (case-insensitive) username lookup, for profile pages. */
export async function getPublicProfileByUsername(
  username: string
): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("id, username, avatar_url")
    .ilike("username", escapeLike(username.trim()))
    .maybeSingle();

  if (error) throw error;
  return (data as PublicProfile | null) ?? null;
}

/** Username prefix search, excluding the signed-in user. */
export async function searchPublicProfiles(
  query: string,
  limit = 10
): Promise<PublicProfile[]> {
  const term = query.trim();
  if (term.length < 3) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("public_profiles")
    .select("id, username, avatar_url")
    .ilike("username", `${escapeLike(term)}%`)
    .neq("id", user.id)
    .order("username")
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as PublicProfile[];
}
