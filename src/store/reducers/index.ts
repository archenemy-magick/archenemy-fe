import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import CardApi from "src/http/cards";
import type { RootState } from "../configureStore";
import { ScryfallCard } from "@scryfall/api-types";

type InitialCardsState = {
  currentCard: ScryfallCard.Scheme | null;
  cardPool: ScryfallCard.Scheme[];
  ongoingCards: ScryfallCard.Scheme[];
  previousCards: ScryfallCard.Scheme[];
};

const initialCardsState: InitialCardsState = {
  currentCard: {} as ScryfallCard.Scheme,
  cardPool: [],
  ongoingCards: [],
  previousCards: [],
};

export const fetchAllArchenemyCards = createAsyncThunk(
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

type CardsState = typeof initialCardsState;

const cardSliceReducer = {
  chooseSingleCard(state: CardsState) {
    console.log("cardpool length", state.cardPool.length);

    const randomCard = state.cardPool.splice(
      Math.floor(state.cardPool.length * Math.random()),
      1
    );

    if (
      state.currentCard?.type_line?.toLowerCase() === "ongoing scheme" &&
      state.currentCard
    ) {
      state.ongoingCards.push(state.currentCard);
    } else {
      if (state.currentCard) {
        state.previousCards.push(state.currentCard);
      }
    }

    state.currentCard = randomCard[0];
  },
  abandonScheme(state: CardsState, action: { payload: { index: number } }) {
    const index = action.payload.index;
    console.log("index", index);

    const card = state.ongoingCards[index];
    console.log("card", card);

    state.previousCards.push(card);
    state.ongoingCards.splice(index, 1);
  },
};

export const cardsSlice = createSlice({
  name: "cards",
  initialState: initialCardsState as CardsState,
  reducers: cardSliceReducer,
  extraReducers: (builder) => {
    builder.addCase(fetchAllArchenemyCards.fulfilled, (state, action) => {
      // TODO: type the response and stuff
      console.log("payload", action.payload);

      state.cardPool = action.payload.data;

      state.currentCard = action.payload.data[0];
    });
  },
});

export const { chooseSingleCard, abandonScheme } = cardsSlice.actions;
