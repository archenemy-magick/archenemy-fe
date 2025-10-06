// TODO: delete this once we can fetch decks by user
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

    return await DeckApi.saveArchenemyDeck(deck, userId)
      .then((data) => {
        console.log("in the action", data);

        return data;
      })
      .catch((e) => {
        // TODO: do something here
      });
  }
);

export default saveArchenemyDeck;
