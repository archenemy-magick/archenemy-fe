import { createAsyncThunk } from "@reduxjs/toolkit";
import CardApi from "src/http/cards";

const fetchAllArchenemyCards = createAsyncThunk(
  "cards/fetchAllArchenemyCards",
  async () =>
    await CardApi.fetchAllArchenemyCards()
      .then((data) => {
        console.log("in the action", data);

        return data;
      })
      .catch((e) => {
        // TODO: do something here
      })
);

export default fetchAllArchenemyCards;
