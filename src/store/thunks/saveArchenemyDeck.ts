import { createAsyncThunk } from "@reduxjs/toolkit";
import DeckApi from "src/http/decks";

const saveArchenemyDeck = createAsyncThunk(
  "deckBuilder/saveArchenemyDeck",
  async ({
    deck,
    userId,
  }: {
    deck: { cardIds: string[]; name: string };
    userId: string;
  }) => {
    console.log("deck to save", deck, userId);

    // Remove .then/.catch - let the thunk handle success/failure
    return await DeckApi.saveArchenemyDeck(deck, userId)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw error; // Rethrow the error to be handled by the thunk
      });
  }
);

export default saveArchenemyDeck;
