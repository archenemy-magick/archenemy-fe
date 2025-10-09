import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCards } from "~/lib/api/cards";

const fetchAllArchenemyCards = createAsyncThunk("cards/fetchAll", async () => {
  const cards = await getAllCards();
  return cards;
});

export default fetchAllArchenemyCards;
