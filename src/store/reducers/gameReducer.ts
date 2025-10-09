import { createSlice } from "@reduxjs/toolkit";
import { fetchAllArchenemyCards, deleteArchenemyDeck } from "src/store/thunks";
import fetchAllArchenemyDecks from "../thunks/fetchAllDecks";
import { CustomArchenemyCard, CustomArchenemyDeck } from "~/types";

export type InitialCardsState = {
  currentCard: CustomArchenemyCard | null;
  cardPool: CustomArchenemyCard[];
  ongoingCards: CustomArchenemyCard[];
  previousCards: CustomArchenemyCard[];
};

export type InitialGameState = {
  gameStarted: boolean;
  gameEnded: boolean;
  deckSelected: boolean;
  cards: InitialCardsState;
  decks: CustomArchenemyDeck[];
  selectedDeckId?: string;
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
  decks: [],
};

const gameSliceReducer = {
  startGame(state: InitialGameState) {
    state.gameStarted = true;
  },
  endGame(state: InitialGameState) {
    state.gameEnded = true;
    // TODO: change these later, when we want to allow a player to look
    // back at the game without starting a new one
    state.gameStarted = false;
    state.deckSelected = false;
    state.selectedDeckId = undefined;
    state.cards.cardPool = [];
    state.cards.currentCard = null;
    state.cards.ongoingCards = [];
    state.cards.previousCards = [];
  },
  selectDeck(state: InitialGameState, action: { payload: { deckId: string } }) {
    state.deckSelected = true;
    state.selectedDeckId = action.payload.deckId;

    const selectedDeck = state.decks.find(
      (deck) => deck.id === action.payload.deckId
    );

    console.log("selectedDeck", selectedDeck);

    state.cards = {
      currentCard: null,
      cardPool: selectedDeck ? selectedDeck.deck_cards : [],
      ongoingCards: [],
      previousCards: [],
    };
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
  // TODO: get rid of this once you can choose decks when starting the game, even if the deck is just all 100 archenemy cards
  extraReducers: (builder) => {
    builder.addCase(fetchAllArchenemyDecks.fulfilled, (state, action) => {
      state.decks = action.payload;
    });
    builder.addCase(deleteArchenemyDeck.fulfilled, (state, action) => {
      state.decks = state.decks.filter((deck) => deck.id !== action.payload);
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
