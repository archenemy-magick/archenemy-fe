import { createClient } from "../supabase/client";

const supabase = createClient();

/**
 * deck id -> creator's username, for public decks only. Works signed in or
 * not; private decks and failures are simply absent (callers hide the
 * author line).
 */
export async function getDeckAuthors(
  deckIds: string[]
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(deckIds.filter(Boolean)));
  if (unique.length === 0) return new Map();

  const { data, error } = await supabase.rpc("get_public_deck_authors", {
    p_deck_ids: unique,
  });

  if (error) return new Map();
  return new Map(
    ((data ?? []) as { deck_id: string; username: string }[]).map((row) => [
      row.deck_id,
      row.username,
    ])
  );
}
