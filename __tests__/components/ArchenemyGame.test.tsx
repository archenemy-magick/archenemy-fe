import { createAsyncThunk } from "@reduxjs/toolkit";

jest.mock("~/store/thunks", () => ({
  fetchAllArchenemyCards: createAsyncThunk("cards/fetchAll", async () => []),
  deleteArchenemyDeck: createAsyncThunk(
    "decks/delete",
    async () => "deleted-id"
  ),
  saveArchenemyDeck: createAsyncThunk("decks/save", async () => ({})),
}));

// NOW import everything else
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "~/testUtils/render";
import ArchenemyGame from "~/components/ArchenemyGame";
import type { CustomArchenemyCard, CustomArchenemyDeck } from "~/types";
import { notifications } from "@mantine/notifications";

describe("ArchenemyGame", () => {
  const mockCard: CustomArchenemyCard = {
    id: "card-1",
    name: "Evil Scheme",
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
    description: "A test deck",
    user_id: "user-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deck_cards: [mockCard, mockOngoingCard],
    lang: "EN",
    is_archived: false,
    is_public: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock window.confirm to return true by default
    global.confirm = jest.fn(() => true);
  });

  describe("Initial Render", () => {
    it("should show deck selector when no deck is selected", () => {
      const initialState = {
        game: {
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
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(screen.getByText("Test Deck")).toBeInTheDocument();
    });

    it("should show stats card with zero cards", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: null,
            previousCards: [],
            ongoingCards: [],
            cardPool: [],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(screen.getByText("Remaining")).toBeInTheDocument();
      expect(screen.getByText("Played")).toBeInTheDocument();
    });

    it("should show 'No scheme played yet' when no current card", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: null,
            previousCards: [],
            ongoingCards: [],
            cardPool: [mockCard],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(screen.getByText("No scheme played yet")).toBeInTheDocument();
    });
  });

  describe("Current Card Display", () => {
    it("should display current card when one is played", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [],
            ongoingCards: [],
            cardPool: [mockOngoingCard],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      const cardImage = screen.getByAltText("Evil Scheme");
      expect(cardImage).toBeInTheDocument();
      expect(cardImage).toHaveAttribute("src", mockCard.normal_image);
    });
  });

  describe("Play Scheme Button", () => {
    it("should show 'Play A Scheme' when no cards played yet", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: null,
            previousCards: [],
            ongoingCards: [],
            cardPool: [mockCard],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(screen.getByText("Play A Scheme")).toBeInTheDocument();
    });

    it("should show 'Play New Scheme' when cards already played", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [],
            ongoingCards: [],
            cardPool: [mockOngoingCard],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(screen.getByText("Play New Scheme")).toBeInTheDocument();
    });

    it("should be disabled when card pool is empty", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [],
            ongoingCards: [],
            cardPool: [],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      const playButton = screen.getByRole("button", {
        name: /play new scheme/i,
      });
      expect(playButton).toBeDisabled();
    });

    it("should dispatch chooseSingleCard when clicked", async () => {
      const user = userEvent.setup();
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: null,
            previousCards: [],
            ongoingCards: [],
            cardPool: [mockCard],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      const { store } = render(<ArchenemyGame />, { initialState });

      const playButton = screen.getByText("Play A Scheme");
      await user.click(playButton);

      const actions = store.getState();
      // Check that a card was drawn
      expect(actions.game.cards.currentCard).not.toBe(null);
    });
  });

  describe("Game Controls", () => {
    it("should show all control buttons", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [],
            ongoingCards: [],
            cardPool: [mockOngoingCard],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(screen.getByText("Undo")).toBeInTheDocument();
      expect(screen.getByText("Shuffle")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("History")).toBeInTheDocument();
      expect(screen.getByText("End Game")).toBeInTheDocument();
    });

    it("should handle undo action", async () => {
      const user = userEvent.setup();
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [mockOngoingCard],
            ongoingCards: [],
            cardPool: [],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      const undoButton = screen.getByText("Undo");
      await user.click(undoButton);

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith({
          title: "Card Undone",
          message: "Moved back to the previous card",
          color: "blue",
        });
      });
    });

    it("should handle shuffle action", async () => {
      const user = userEvent.setup();
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [],
            ongoingCards: [],
            cardPool: [mockOngoingCard],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      const shuffleButton = screen.getByText("Shuffle");
      await user.click(shuffleButton);

      await waitFor(() => {
        expect(notifications.show).toHaveBeenCalledWith({
          title: "Deck Shuffled",
          message: "Remaining cards have been shuffled",
          color: "blue",
        });
      });
    });

    it("should open history modal when history button clicked", async () => {
      const user = userEvent.setup();
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [],
            ongoingCards: [],
            cardPool: [mockOngoingCard],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      const historyButton = screen.getByText("History");
      await user.click(historyButton);

      await waitFor(() => {
        expect(screen.getByText("Game History")).toBeInTheDocument();
      });
    });

    it("should handle end game with confirmation", async () => {
      const user = userEvent.setup();
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [],
            ongoingCards: [],
            cardPool: [mockOngoingCard],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      const { store } = render(<ArchenemyGame />, { initialState });

      const endGameButton = screen.getByText("End Game");
      await user.click(endGameButton);

      expect(global.confirm).toHaveBeenCalled();

      await waitFor(() => {
        expect(store.getState().game.gameEnded).toBe(true);
      });
    });
  });

  describe("Previous Schemes", () => {
    it("should show 'No previous schemes yet' when empty", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [],
            ongoingCards: [],
            cardPool: [],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(screen.getByText("No previous schemes yet")).toBeInTheDocument();
    });

    it("should display previous cards count badge", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: null,
            previousCards: [mockCard, mockOngoingCard],
            ongoingCards: [],
            cardPool: [],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(screen.getByText("2 cards")).toBeInTheDocument();
    });
  });

  describe("Ongoing Schemes", () => {
    it("should show 'No ongoing schemes' when empty", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [],
            ongoingCards: [],
            cardPool: [],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(screen.getByText("No ongoing schemes")).toBeInTheDocument();
    });

    it("should display ongoing cards with abandon buttons", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: null,
            previousCards: [],
            ongoingCards: [mockOngoingCard],
            cardPool: [],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(screen.getByText("1 active")).toBeInTheDocument();
      expect(screen.getByText("Abandon")).toBeInTheDocument();
    });

    it("should handle abandon action", async () => {
      const user = userEvent.setup();
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: null,
            previousCards: [],
            ongoingCards: [mockOngoingCard],
            cardPool: [],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      const { store } = render(<ArchenemyGame />, { initialState });

      const abandonButton = screen.getByText("Abandon");
      await user.click(abandonButton);

      await waitFor(() => {
        expect(store.getState().game.cards.ongoingCards).toHaveLength(0);
      });
    });
  });

  describe("Stats and Progress", () => {
    it("should show correct card counts", () => {
      const initialState = {
        game: {
          gameStarted: true,
          gameEnded: false,
          deckSelected: true,
          cards: {
            currentCard: mockCard,
            previousCards: [mockOngoingCard],
            ongoingCards: [],
            cardPool: [mockCard, mockOngoingCard],
          },
          decks: [mockDeck],
          selectedDeck: mockDeck,
          gameHistory: [],
        },
      };

      render(<ArchenemyGame />, { initialState });

      // Remaining: 2, Played: 2 (1 current + 1 previous)
      const remainingElements = screen.getAllByText("2");
      expect(remainingElements.length).toBeGreaterThan(0);
    });
  });

  describe("Saved Game Resume", () => {
    it("should prompt to resume saved game on mount", () => {
      const savedState = {
        gameStarted: true,
        cards: {
          currentCard: mockCard,
          previousCards: [],
          ongoingCards: [],
          cardPool: [mockOngoingCard],
        },
      };

      localStorage.setItem("archenemyGameState", JSON.stringify(savedState));

      const initialState = {
        game: {
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
        },
      };

      render(<ArchenemyGame />, { initialState });

      expect(global.confirm).toHaveBeenCalledWith(
        "A saved game was found. Would you like to resume it?"
      );
    });
  });
});
