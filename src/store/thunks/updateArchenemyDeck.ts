import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  updateDeck,
  getDeckCards,
  removeCardFromDeck,
  addCardToDeck,
} from "~/lib/api/decks";
import { CustomArchenemyCard } from "~/types";

export const updateArchenemyDeck = createAsyncThunk(
  "deck/update",
  async ({
    deckId,
    deckName,
    description,
    selectedCards,
  }: {
    deckId: string;
    deckName: string;
    description?: string;
    selectedCards: CustomArchenemyCard[];
  }) => {
    // Update deck metadata
    await updateDeck(deckId, {
      name: deckName,
      description,
    });

    // Get current cards in the deck
    const currentCards = await getDeckCards(deckId);
    const currentCardIds = currentCards.map((card) => card.id);
    const newCardIds = selectedCards.map((card) => card.id);

    // Find cards to remove (in current but not in new)
    const cardsToRemove = currentCardIds.filter(
      (id) => !newCardIds.includes(id)
    );

    // Find cards to add (in new but not in current)
    const cardsToAdd = newCardIds.filter((id) => !currentCardIds.includes(id));

    // Remove cards that are no longer in the deck
    for (const cardId of cardsToRemove) {
      await removeCardFromDeck(deckId, cardId);
    }

    // Add new cards to the deck
    for (const cardId of cardsToAdd) {
      await addCardToDeck(deckId, cardId);
    }

    return { deckId, deckName, description };
  }
);
