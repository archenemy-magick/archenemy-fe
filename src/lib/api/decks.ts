import { CustomArchenemyCard } from "~/types";
import { createClient } from "../supabase/client";

// Type for the nested deck_cards structure from Supabase
type DeckCardRelation = {
  id: string;
  card: CustomArchenemyCard;
};

// Get all user's decks
export async function getUserDecks() {
  const supabase = createClient();
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
  const supabase = createClient();

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
  const supabase = createClient();
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
  const supabase = createClient();

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
  const supabase = createClient();

  const { error } = await supabase
    .from("archenemy_decks")
    .delete()
    .eq("id", deckId);

  if (error) throw error;
}

// Add card to deck
export async function addCardToDeck(deckId: string, cardId: string) {
  const supabase = createClient();

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
  const supabase = createClient();

  const { error } = await supabase
    .from("archenemy_deck_cards")
    .delete()
    .eq("deck_id", deckId)
    .eq("card_id", cardId);

  if (error) throw error;
}

// Get deck statistics
export async function getDeckStats(deckId: string) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_deck_stats", {
    deck_uuid: deckId,
  });

  if (error) throw error;
  return data;
}

// Get cards in a deck
export async function getDeckCards(deckId: string) {
  const supabase = createClient();

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
