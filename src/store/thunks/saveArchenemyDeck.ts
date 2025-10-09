import { createAsyncThunk } from "@reduxjs/toolkit";
import { createDeck, addCardToDeck } from "~/lib/api/decks";
import { CustomArchenemyCard } from "~/types";

export const saveArchenemyDeck = createAsyncThunk(
  "deck/save",
  async ({
    deckName,
    description,
    selectedCards,
  }: {
    deckName: string;
    description?: string;
    selectedCards: CustomArchenemyCard[];
  }) => {
    // Create the deck
    const deck = await createDeck(deckName, description);

    // Add all cards to the deck
    for (const card of selectedCards) {
      await addCardToDeck(deck.id, card.id);
    }

    return deck;
  }
);
