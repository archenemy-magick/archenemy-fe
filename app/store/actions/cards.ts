// TODO: DELETE?
import { createAsyncThunk } from "@reduxjs/toolkit";
import CardApi from "../../http/cards";

export const test = () => ({
  type: "cards/test",
});

export const fetchSingleRandomCard = createAsyncThunk(
  "cards/fetchSingleRandomCard",
  async () =>
    await CardApi.fetchSingleRandomCard()
      .then((data) => {
        console.log("in the action", data);

        return data;
      })
      .catch((e) => {
        // TODO: do something here
      })
);
