import {
  CustomArchenemyCard,
  CustomArchenemyDeck,
  SupabaseDeckResponse,
} from "~/types";
import { createClient } from "../supabase/client";
import { flattenDeck } from "~/util";

const supabase = createClient();

// Get all user's decks
export async function getUserDecks() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("archenemy_decks")
    .select(
      `
      *,
      deck_cards:archenemy_deck_cards(
        id,
        card:archenemy_cards(*)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Map the old structure to new structure for this endpoint
  type OldStructure = Omit<SupabaseDeckResponse, "deck_cards"> & {
    deck_cards: {
      id: string;
      card: CustomArchenemyCard;
    }[];
  };

  return (data as unknown as OldStructure[]).map((deck) => ({
    ...deck,
    lang: deck.lang || "EN",
    deck_cards: deck.deck_cards.map((dc) => dc.card),
  }));
}

// Get single deck by ID
export async function getDeckById(deckId: string) {
  const { data, error } = await supabase
    .from("archenemy_decks")
    .select(
      `
      *,
      deck_cards:archenemy_deck_cards(
        id,
        card:archenemy_cards(*)
      )
    `
    )
    .eq("id", deckId)
    .single();

  if (error) throw error;

  type OldStructure = Omit<SupabaseDeckResponse, "deck_cards"> & {
    deck_cards: {
      id: string;
      card: CustomArchenemyCard;
    }[];
  };

  const deck = data as unknown as OldStructure;

  return {
    ...deck,
    lang: deck.lang || "en",
    deck_cards: deck.deck_cards.map((dc) => dc.card),
  };
}

// Create new deck
export async function createDeck(
  name: string,
  description?: string,
  isPublic = true
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("archenemy_decks")
    .insert({
      name,
      description,
      is_public: isPublic,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update deck
export async function updateDeck(
  deckId: string,
  updates: {
    name?: string;
    description?: string;
    is_public?: boolean;
    is_archived?: boolean;
  }
) {
  const { data, error } = await supabase
    .from("archenemy_decks")
    .update(updates)
    .eq("id", deckId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete deck
export async function deleteDeck(deckId: string) {
  const { error } = await supabase
    .from("archenemy_decks")
    .delete()
    .eq("id", deckId);

  if (error) throw error;
}

// Add card to deck
export async function addCardToDeck(deckId: string, cardId: string) {
  const { data, error } = await supabase
    .from("archenemy_deck_cards")
    .insert({
      deck_id: deckId,
      card_id: cardId,
    })
    .select(
      `
      *,
      card:archenemy_cards(*)
    `
    )
    .single();

  if (error) throw error;
  return data;
}

// Remove card from deck
export async function removeCardFromDeck(deckId: string, cardId: string) {
  const { error } = await supabase
    .from("archenemy_deck_cards")
    .delete()
    .eq("deck_id", deckId)
    .eq("card_id", cardId);

  if (error) throw error;
}

// Get deck statistics
export async function getDeckStats(deckId: string) {
  const { data, error } = await supabase.rpc("get_deck_stats", {
    deck_uuid: deckId,
  });

  if (error) throw error;
  return data;
}

// Get cards in a deck
export async function getDeckCards(deckId: string) {
  const { data, error } = await supabase
    .from("archenemy_deck_cards")
    .select(
      `
      card:archenemy_cards(*)
    `
    )
    .eq("deck_id", deckId);

  if (error) throw error;

  // Extract just the card objects with proper typing
  return (data as unknown as { card: CustomArchenemyCard }[]).map(
    (dc) => dc.card
  );
}

export async function getPublicDecks() {
  const { data, error } = await supabase
    .from("archenemy_decks")
    .select(
      `
      *,
      profiles:user_id (
        username
      ),
      deck_cards:archenemy_deck_cards (
        archenemy_cards (
          id,
          name,
          type_line,
          oracle_text,
          normal_image
        )
      )
    `
    )
    .eq("is_public", true)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching public decks:", error);
    throw error;
  }

  return (data as unknown as SupabaseDeckResponse[]).map(flattenDeck);
}

export async function cloneDeck(deckId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to clone a deck");
  }

  // Fetch the original deck with its cards
  const { data: originalDeck, error: fetchError } = await supabase
    .from("archenemy_decks")
    .select(
      `
      *,
      deck_cards:archenemy_deck_cards (
        card_id
      )
    `
    )
    .eq("id", deckId)
    .single();

  if (fetchError) {
    console.error("Error fetching deck to clone:", fetchError);
    throw fetchError;
  }

  if (!originalDeck.is_public) {
    throw new Error("This deck is not public");
  }

  // Create the cloned deck
  const { data: newDeck, error: createError } = await supabase
    .from("archenemy_decks")
    .insert({
      name: `${originalDeck.name} (Copy)`,
      description: originalDeck.description,
      is_public: false,
      is_archived: false,
      user_id: user.id,
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating cloned deck:", createError);
    throw createError;
  }

  type DeckCardRelation = {
    card_id: string;
  };

  const cardAssociations = (
    originalDeck.deck_cards as unknown as DeckCardRelation[]
  ).map((dc) => ({
    deck_id: newDeck.id,
    card_id: dc.card_id,
  }));

  const { error: cardsError } = await supabase
    .from("archenemy_deck_cards")
    .insert(cardAssociations);

  if (cardsError) {
    await supabase.from("archenemy_decks").delete().eq("id", newDeck.id);
    console.error("Error copying cards to cloned deck:", cardsError);
    throw cardsError;
  }

  return newDeck;
}

/**
 * Increment view count for a deck (optional - for tracking popularity)
 */
export async function incrementDeckViews(deckId: string) {
  // This assumes you have a 'view_count' column in your archenemy_decks table
  // If you don't have this column yet, you can add it or skip this feature for now
  const { error } = await supabase.rpc("increment_deck_views", {
    deck_id: deckId,
  });

  if (error) {
    console.error("Error incrementing deck views:", error);
    // Don't throw - view count is not critical
  }
}

export async function likeDeck(deckId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in to like a deck");

  const { data, error } = await supabase
    .from("deck_likes")
    .insert({
      deck_id: deckId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Unlike a deck
 */
export async function unlikeDeck(deckId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in to unlike a deck");

  const { error } = await supabase
    .from("deck_likes")
    .delete()
    .eq("deck_id", deckId)
    .eq("user_id", user.id);

  if (error) throw error;
}

/**
 * Check if current user has liked a deck
 */
export async function hasUserLikedDeck(deckId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("deck_likes")
    .select("id")
    .eq("deck_id", deckId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Get likes for multiple decks (efficient batch check)
 */
export async function getUserLikesForDecks(deckIds: string[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Set<string>();

  const { data, error } = await supabase
    .from("deck_likes")
    .select("deck_id")
    .eq("user_id", user.id)
    .in("deck_id", deckIds);

  if (error) throw error;

  return new Set(data.map((like) => like.deck_id));
}

export async function getUserLikedDecks() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("deck_likes")
    .select(
      `
      created_at,
      deck:archenemy_decks (
        *,
        profiles:user_id (
          username
        ),
        deck_cards:archenemy_deck_cards (
          archenemy_cards (
            id,
            name,
            type_line,
            oracle_text,
            normal_image
          )
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  type LikeResponse = {
    created_at: string;
    deck: SupabaseDeckResponse;
  };

  return (data as unknown as LikeResponse[]).map((like) => ({
    ...flattenDeck(like.deck),
    liked_at: like.created_at,
  }));
}

/**
 * Get most popular cards
 */
export async function getPopularCards(limit: number = 20) {
  const { data, error } = await supabase
    .from("card_popularity")
    .select("*")
    .order("deck_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Get card statistics
 */
export async function getCardStats(cardId: string) {
  const { data, error } = await supabase
    .from("card_popularity")
    .select("*")
    .eq("id", cardId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Refresh card popularity stats (call this periodically or after deck changes)
 */
export async function refreshCardPopularity() {
  const { error } = await supabase.rpc("refresh_card_popularity");

  if (error) {
    console.error("Error refreshing card popularity:", error);
    // Don't throw - this is not critical
  }
}

interface DeckCardJunction {
  card: CustomArchenemyCard;
}

/**
 * Fetch top-rated public decks
 * @param limit - Number of decks to fetch (default: 10)
 * @returns Array of top public decks with user profiles
 */
export async function getTopPublicDecks(
  limit: number = 10
): Promise<CustomArchenemyDeck[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("archenemy_decks")
    .select(
      `
      *,
      deck_cards:archenemy_deck_cards(
        card:archenemy_cards(*)
      ),
      user_profile:profiles(
        username,
        avatar_url
      )
    `
    )
    .eq("is_public", true)
    .order("like_count", { ascending: false })
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top public decks:", error);
    throw new Error("Failed to fetch top public decks");
  }

  // Transform the data to match CustomArchenemyDeck type
  return (data || []).map((deck) => ({
    ...deck,
    deck_cards:
      deck.deck_cards?.map((junction: DeckCardJunction) => junction.card) || [],
  }));
}
