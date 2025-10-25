import { createAsyncThunk } from "@reduxjs/toolkit";
import { createDeck, addCardToDeck } from "~/lib/api/decks";
import { CustomArchenemyCard } from "~/types";

export const saveArchenemyDeck = createAsyncThunk(
  "deck/save",
  async ({
    deckName,
    description,
    selectedCards,
    isPublic = false, // NEW - defaults to private
  }: {
    deckName: string;
    description?: string;
    selectedCards: CustomArchenemyCard[];
    isPublic?: boolean; // NEW
  }) => {
    // Create the deck with isPublic flag
    const deck = await createDeck(deckName, description, isPublic);

    // Add all cards to the deck
    for (const card of selectedCards) {
      await addCardToDeck(deck.id, card.id);
    }

    return deck;
  }
);
