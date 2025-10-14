import { createSlice } from "@reduxjs/toolkit";
import { fetchAllArchenemyCards, deleteArchenemyDeck } from "../thunks";
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
  // New fields for enhanced features
  gameHistory: {
    cardId: string;
    action: "played" | "abandoned" | "undone";
    timestamp: number;
  }[];
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
  gameHistory: [],
};

// Helper function to shuffle array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const gameSliceReducer = {
  startGame(state: InitialGameState) {
    state.gameStarted = true;
    state.gameHistory = [];
  },
  endGame(state: InitialGameState) {
    state.gameEnded = true;
    state.gameStarted = false;
    state.deckSelected = false;
    state.selectedDeckId = undefined;
    state.cards.cardPool = [];
    state.cards.currentCard = null;
    state.cards.ongoingCards = [];
    state.cards.previousCards = [];
    state.gameHistory = [];
  },
  selectDeck(state: InitialGameState, action: { payload: { deckId: string } }) {
    const selectedDeck = state.decks.find(
      (deck) => deck.id === action.payload.deckId
    );

    state.deckSelected = selectedDeck ? true : false;
    state.selectedDeckId = action.payload.deckId || undefined;

    state.cards = {
      currentCard: null,
      cardPool: selectedDeck ? [...selectedDeck.deck_cards] : [],
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

    // Add to history
    if (randomCard[0]) {
      state.gameHistory.push({
        cardId: randomCard[0].id,
        action: "played",
        timestamp: Date.now(),
      });
    }
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

    // Add to history
    state.gameHistory.push({
      cardId: card.id,
      action: "abandoned",
      timestamp: Date.now(),
    });
  },

  undoLastCard(state: InitialGameState) {
    const { cards } = state;

    if (!cards.currentCard) return;

    // Put current card back in pool
    cards.cardPool.push(cards.currentCard);

    // Check if there was a previous card
    if (cards.previousCards.length > 0) {
      // Get the last previous card
      const lastCard = cards.previousCards.pop();
      cards.currentCard = lastCard || null;
    } else if (cards.ongoingCards.length > 0) {
      // If no previous cards, check ongoing cards
      const lastOngoing = cards.ongoingCards.pop();
      cards.currentCard = lastOngoing || null;
    } else {
      // No cards to undo to
      cards.currentCard = null;
    }

    // Add to history
    state.gameHistory.push({
      cardId: cards.currentCard?.id || "",
      action: "undone",
      timestamp: Date.now(),
    });
  },

  shuffleCardPool(state: InitialGameState) {
    state.cards.cardPool = shuffleArray(state.cards.cardPool);
  },

  saveGameState(state: InitialGameState) {
    const gameState = {
      gameStarted: state.gameStarted,
      deckSelected: state.deckSelected,
      selectedDeckId: state.selectedDeckId,
      cards: state.cards,
      gameHistory: state.gameHistory,
      savedAt: Date.now(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("archenemyGameState", JSON.stringify(gameState));
    }
  },

  loadGameState(state: InitialGameState) {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("archenemyGameState");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        state.gameStarted = parsed.gameStarted;
        state.deckSelected = parsed.deckSelected;
        state.selectedDeckId = parsed.selectedDeckId;
        state.cards = parsed.cards;
        state.gameHistory = parsed.gameHistory || [];
      }
    }
  },

  clearSavedGame() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("archenemyGameState");
    }
  },
};

export const gameSlice = createSlice({
  name: "game",
  initialState: initialGameState as InitialGameState,
  reducers: gameSliceReducer,
  extraReducers: (builder) => {
    builder.addCase(fetchAllArchenemyDecks.fulfilled, (state, action) => {
      state.decks = action.payload;
    });
    builder.addCase(deleteArchenemyDeck.fulfilled, (state, action) => {
      state.decks = state.decks.filter(
        (deck: CustomArchenemyDeck) => deck.id !== action.payload
      );
    });
  },
});

export const {
  startGame,
  endGame,
  selectDeck,
  abandonScheme,
  chooseSingleCard,
  undoLastCard,
  shuffleCardPool,
  saveGameState,
  loadGameState,
  clearSavedGame,
} = gameSlice.actions;
