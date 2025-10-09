import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserDecks } from "~/lib/api/decks";

const fetchAllArchenemyDecks = createAsyncThunk("decks/fetchAll", async () => {
  const decks = await getUserDecks();
  return decks;
});

export default fetchAllArchenemyDecks;
