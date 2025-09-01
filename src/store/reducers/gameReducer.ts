import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import CardApi from "src/http/cards";
import { ScryfallCard } from "@scryfall/api-types";

export type InitialCardsState = {
  currentCard: ScryfallCard.Scheme | null;
  cardPool: ScryfallCard.Scheme[];
  ongoingCards: ScryfallCard.Scheme[];
  previousCards: ScryfallCard.Scheme[];
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

export type InitialGameState = {
  gameStarted: boolean;
  gameEnded: boolean;
  deckSelected: boolean;
  cards: InitialCardsState;
};

export const initialGameState: InitialGameState = {
  gameStarted: false,
  gameEnded: false,
  deckSelected: false,
  cards: {
    currentCard: null,
    cardPool: [],
    ongoingCards: [],
    previousCards: [],
  },
};

const gameSliceReducer = {
  startGame(state: InitialGameState) {
    console.log("in start game");

    state.gameStarted = true;
  },
  endGame(state: InitialGameState) {
    state.gameEnded = true;
    state.cards.currentCard = null;
    state.cards.ongoingCards = [];
    state.cards.previousCards = [];
  },
  selectDeck(state: InitialGameState) {
    state.deckSelected = true;
  },
  chooseSingleCard(state: InitialGameState) {
    const { cards } = state;
    const randomCard = cards.cardPool.splice(
      Math.floor(cards.cardPool.length * Math.random()),
      1
    );

    if (
      cards.currentCard?.type_line?.toLowerCase() === "ongoing scheme" &&
      cards.currentCard
    ) {
      cards.ongoingCards.push(cards.currentCard);
    } else {
      if (cards.currentCard) {
        cards.previousCards.push(cards.currentCard);
      }
    }

    cards.currentCard = randomCard[0];
  },
  abandonScheme(
    state: InitialGameState,
    action: { payload: { index: number } }
  ) {
    const index = action.payload.index;
    const { cards } = state;

    const card = cards.ongoingCards[index];

    cards.previousCards.push(card);
    cards.ongoingCards.splice(index, 1);
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState: initialGameState as InitialGameState,
  reducers: gameSliceReducer,
  extraReducers: (builder) => {
    builder.addCase(fetchAllArchenemyCards.fulfilled, (state, action) => {
      // TODO: type the response and stuff
      state.cards.cardPool = action.payload.data;

      // state.currentCard =
      //   action.payload.data[
      //     Math.floor(Math.random() * action.payload.data.length)
      //   ];
    });
  },
});

export const {
  startGame,
  endGame,
  selectDeck,
  abandonScheme,
  chooseSingleCard,
} = gameSlice.actions;
