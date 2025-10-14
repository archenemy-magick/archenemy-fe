import {
  gameSlice,
  chooseSingleCard,
  abandonScheme,
  startGame,
  selectDeck,
  endGame,
  undoLastCard,
  shuffleCardPool,
  saveGameState,
  loadGameState,
  clearSavedGame,
} from "~/store/reducers";
import type { CustomArchenemyCard, CustomArchenemyDeck } from "~/types";

describe("Game Reducer", () => {
  const gameReducer = gameSlice.reducer;

  const mockCard: CustomArchenemyCard = {
    id: "card-1",
    name: "Test Scheme",
    type_line: "Scheme",
    oracle_text: "Test oracle text",
    normal_image: "https://example.com/card.jpg",
    large_image: "https://example.com/card-large.jpg",
    lang: "EN",
    border_crop_image: "https://example.com/card-border.jpg",
    released_at: "2023-01-01",
    set_id: "set-1",
    set_name: "Test Set",
    rarity: "common",
    reprint: false,
    rulings_uri: "https://example.com/rulings",
    set: "set",
    artist: "artist",
    artist_ids: ["artist-id"],
  };

  const mockOngoingCard: CustomArchenemyCard = {
    id: "card-2",
    name: "Ongoing Scheme",
    type_line: "Ongoing Scheme",
    oracle_text: "This scheme is ongoing",
    normal_image: "https://example.com/ongoing.jpg",
    large_image: "https://example.com/ongoing-large.jpg",
    lang: "EN",
    border_crop_image: "https://example.com/card-border.jpg",
    released_at: "2023-01-01",
    set_id: "set-1",
    set_name: "Test Set",
    rarity: "common",
    reprint: false,
    rulings_uri: "https://example.com/rulings",
    set: "set",
    artist: "artist",
    artist_ids: ["artist-id"],
  };

  const mockDeck: CustomArchenemyDeck = {
    id: "deck-1",
    name: "Test Deck",
    deck_cards: [mockCard, mockOngoingCard], // Changed from 'cards' to 'deck_cards'
    description: "Test deck",
    user_id: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lang: "EN",
    is_archived: false,
    is_public: true,
  };

  const initialState = {
    gameStarted: false,
    gameEnded: false,
    deckSelected: false,
    cards: {
      currentCard: null,
      previousCards: [],
      ongoingCards: [],
      cardPool: [],
    },
    decks: [mockDeck],
    selectedDeck: null,
    gameHistory: [],
  };

  describe("selectDeck", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("should select a deck and populate card pool", () => {
      const state = {
        ...initialState,
        decks: [mockDeck],
      };

      const action = selectDeck({ deckId: "deck-1" });
      const newState = gameReducer(state, action);

      expect(newState.deckSelected).toBe(true);
      expect(newState.selectedDeckId).toEqual("deck-1");
      expect(newState.cards.cardPool).toHaveLength(2);
      expect(newState.cards.cardPool).toEqual(
        expect.arrayContaining([mockCard, mockOngoingCard])
      );
    });

    it("should not select a non-existent deck", () => {
      const action = selectDeck({ deckId: "non-existent" });
      const newState = gameReducer(initialState, action);

      expect(newState.deckSelected).toBe(false);
    });
  });

  describe("startGame", () => {
    it("should start the game", () => {
      const action = startGame();
      const newState = gameReducer(initialState, action);

      expect(newState.gameStarted).toBe(true);
      expect(newState.gameEnded).toBe(false);
    });
  });

  describe("endGame", () => {
    it("should end the game and reset state", () => {
      const state = {
        ...initialState,
        gameStarted: true,
        cards: {
          currentCard: mockCard,
          previousCards: [mockCard],
          ongoingCards: [mockOngoingCard],
          cardPool: [mockCard, mockOngoingCard],
        },
      };

      const action = endGame();
      const newState = gameReducer(state, action);

      expect(newState.gameEnded).toBe(true);
      expect(newState.gameStarted).toBe(false);
      expect(newState.cards.currentCard).toBe(null);
      expect(newState.cards.previousCards).toEqual([]);
      expect(newState.cards.ongoingCards).toEqual([]);
    });
  });

  describe("chooseSingleCard", () => {
    it("should draw a card from the pool", () => {
      const state = {
        ...initialState,
        gameStarted: true,
        cards: {
          currentCard: null,
          previousCards: [],
          ongoingCards: [],
          cardPool: [mockCard, mockOngoingCard],
        },
      };

      const action = chooseSingleCard();
      const newState = gameReducer(state, action);

      expect(newState.cards.currentCard).not.toBe(null);
      expect(newState.cards.cardPool).toHaveLength(1);
    });

    it("should move current card to previousCards if not ongoing", () => {
      const state = {
        ...initialState,
        gameStarted: true,
        cards: {
          currentCard: mockCard,
          previousCards: [],
          ongoingCards: [],
          cardPool: [mockOngoingCard],
        },
      };

      const action = chooseSingleCard();
      const newState = gameReducer(state, action);

      expect(newState.cards.previousCards).toContainEqual(mockCard);
      expect(newState.cards.ongoingCards).not.toContainEqual(mockCard);
    });

    it("should move current card to ongoingCards if ongoing", () => {
      const state = {
        ...initialState,
        gameStarted: true,
        cards: {
          currentCard: mockOngoingCard,
          previousCards: [],
          ongoingCards: [],
          cardPool: [mockCard],
        },
      };

      const action = chooseSingleCard();
      const newState = gameReducer(state, action);

      expect(newState.cards.ongoingCards).toContainEqual(mockOngoingCard);
      expect(newState.cards.previousCards).not.toContainEqual(mockOngoingCard);
    });
  });

  describe("abandonScheme", () => {
    it("should remove an ongoing scheme by id", () => {
      const state = {
        ...initialState,
        gameStarted: true,
        cards: {
          currentCard: null,
          previousCards: [],
          ongoingCards: [mockOngoingCard],
          cardPool: [mockCard],
        },
      };

      const action = abandonScheme({ index: 0 });
      const newState = gameReducer(state, action);

      expect(newState.cards.ongoingCards).toEqual([]);
      expect(newState.cards.previousCards).toContainEqual(mockOngoingCard);
    });
  });

  describe("undoLastCard", () => {
    it("should undo the last card draw", () => {
      const state = {
        ...initialState,
        gameStarted: true,
        cards: {
          currentCard: mockCard,
          previousCards: [mockOngoingCard],
          ongoingCards: [],
          cardPool: [],
        },
      };

      const action = undoLastCard();
      const newState = gameReducer(state, action);

      expect(newState.cards.currentCard).toEqual(mockOngoingCard);
      expect(newState.cards.cardPool).toContainEqual(mockCard);
      expect(newState.cards.previousCards).toEqual([]);
    });
  });

  describe("shuffleCardPool", () => {
    it("should shuffle the card pool", () => {
      const cards = Array.from({ length: 10 }, (_, i) => ({
        ...mockCard,
        id: `card-${i}`,
      }));

      const state = {
        ...initialState,
        gameStarted: true,
        cards: {
          currentCard: null,
          previousCards: [],
          ongoingCards: [],
          cardPool: cards,
        },
      };

      const action = shuffleCardPool();
      const newState = gameReducer(state, action);

      // Pool should have same cards, just in different order
      expect(newState.cards.cardPool).toHaveLength(cards.length);
      expect(newState.cards.cardPool).toEqual(expect.arrayContaining(cards));
    });
  });
});
