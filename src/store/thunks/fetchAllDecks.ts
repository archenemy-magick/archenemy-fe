// TODO: delete this once we can fetch decks by user
import { createAsyncThunk } from "@reduxjs/toolkit";
import DeckApi from "src/http/decks";

const fetchAllArchenemyDecks = createAsyncThunk(
  "decks/fetchAllArchenemyDecks",
  async () =>
    await DeckApi.fetchAllArchenemyDecks()
      .then((data) => {
        console.log("in the action", data);

        return data;
      })
      .catch((e) => {
        // TODO: do something here
      })
);

export default fetchAllArchenemyDecks;
