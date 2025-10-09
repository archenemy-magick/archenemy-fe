import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteDeck } from "~/lib/api/decks";

export const deleteArchenemyDeck = createAsyncThunk(
  "deck/delete",
  async (deckId: string) => {
    await deleteDeck(deckId);
    return deckId;
  }
);
