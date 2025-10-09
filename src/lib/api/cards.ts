import { createClient } from "../supabase/client";

// Get all cards
export async function getAllCards() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("archenemy_cards")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

// Search cards using full-text search
export async function searchCards(query: string, limit = 20) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("search_cards", {
    search_query: query,
    limit_count: limit,
  });

  if (error) throw error;
  return data;
}

// Get card by ID
export async function getCardById(cardId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("archenemy_cards")
    .select("*")
    .eq("id", cardId)
    .single();

  if (error) throw error;
  return data;
}

// Get popular cards
export async function getPopularCards(limit = 10) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_popular_cards", {
    limit_count: limit,
  });

  if (error) throw error;
  return data;
}
