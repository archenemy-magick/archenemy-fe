import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  updateDeck,
  removeCardFromDeck,
  addCardToDeck,
  getDeckCards,
} from "~/lib/api/decks";
import { CustomArchenemyCard } from "~/types";

export const updateArchenemyDeck = createAsyncThunk(
  "deck/update",
  async ({
    deckId,
    deckName,
    description,
    selectedCards,
    isPublic, // NEW
  }: {
    deckId: string;
    deckName: string;
    description?: string;
    selectedCards: CustomArchenemyCard[];
    isPublic?: boolean; // NEW
  }) => {
    // Update deck metadata (including privacy setting)
    const updatedDeck = await updateDeck(deckId, {
      name: deckName,
      description,
      is_public: isPublic, // NEW
    });

    // Get current cards in the deck
    const currentCards = await getDeckCards(deckId);
    const currentCardIds = new Set(currentCards.map((card) => card.id));
    const newCardIds = new Set(selectedCards.map((card) => card.id));

    // Remove cards that are no longer in the deck
    for (const card of currentCards) {
      if (!newCardIds.has(card.id)) {
        await removeCardFromDeck(deckId, card.id);
      }
    }

    // Add new cards that weren't in the deck before
    for (const card of selectedCards) {
      if (!currentCardIds.has(card.id)) {
        await addCardToDeck(deckId, card.id);
      }
    }

    return updatedDeck;
  }
);
