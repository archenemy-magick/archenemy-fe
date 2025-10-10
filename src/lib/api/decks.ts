import { CustomArchenemyCard } from "~/types";
import { createClient } from "../supabase/client";

// Type for the nested deck_cards structure from Supabase
type DeckCardRelation = {
  id: string;
  card: CustomArchenemyCard;
};

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

  const slightlyFlattenedDeck = data.map((deck) => ({
    ...deck,
    deck_cards: (deck.deck_cards as unknown as DeckCardRelation[]).map(
      (dc) => dc.card
    ),
  }));
  return slightlyFlattenedDeck;
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

  const slightlyFlattenedDeck = {
    ...data,
    deck_cards: (data.deck_cards as unknown as DeckCardRelation[]).map(
      (dc) => dc.card
    ),
  };

  return slightlyFlattenedDeck;
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

// Replace the getPublicDecks function in src/lib/api/decks.ts with this:

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

  // Type for the nested structure from Supabase
  type DeckCardWithCard = {
    archenemy_cards: CustomArchenemyCard | null;
  };

  // Transform the nested data structure
  const transformedData = data.map((deck) => ({
    ...deck,
    deck_cards:
      (deck.deck_cards as unknown as DeckCardWithCard[])
        ?.map((dc) => dc.archenemy_cards)
        .filter((card): card is CustomArchenemyCard => card !== null) || [],
  }));

  return transformedData;
}

// Replace the cloneDeck function with this fixed version:

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
      is_public: false, // Cloned decks are private by default
      is_archived: false,
      user_id: user.id,
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating cloned deck:", createError);
    throw createError;
  }

  // Type for the deck_cards structure
  type DeckCardRelation = {
    card_id: string;
  };

  // Copy all the cards to the new deck
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
    // If card insertion fails, clean up the deck we created
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
