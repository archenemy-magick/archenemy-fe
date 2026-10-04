import { createAsyncThunk } from "@reduxjs/toolkit";

// Mock thunks before importing the store helpers (see Footer.test.tsx).
jest.mock("~/store/thunks/fetchAllDecks", () => ({
  __esModule: true,
  default: createAsyncThunk("decks/fetchAll", async () => []),
}));
jest.mock("~/store/thunks", () => ({
  fetchAllArchenemyCards: createAsyncThunk("cards/fetchAll", async () => []),
  deleteArchenemyDeck: createAsyncThunk("decks/delete", async () => "id"),
  saveArchenemyDeck: createAsyncThunk("decks/save", async () => ({})),
}));

import { screen } from "@testing-library/react";
import { render } from "~/testUtils/render";
import HomePage from "~/app/page";
import { initialUserState } from "~/store/reducers/userReducer";

describe("HomePage", () => {
  it("leads with game utilities and stats for signed-out visitors", () => {
    render(<HomePage />, {
      initialState: {
        user: { ...initialUserState, loading: false },
      },
    });

    expect(screen.getByText("Know your stats.")).toBeInTheDocument();
    expect(screen.getByText("Get started free")).toBeInTheDocument();
    expect(screen.getByText("Example")).toBeInTheDocument();
    expect(screen.getByText("The Archenemy Suite")).toBeInTheDocument();
  });

  it("links each utility card to its tab", () => {
    render(<HomePage />);

    const href = (title: string) =>
      screen.getByText(title).closest("a")?.getAttribute("href");
    expect(href("Life Tracker")).toBe("/game?utility=life-tracker");
    expect(href("Coin Flipper")).toBe("/game?utility=coin-flipper");
    expect(href("Community Decks")).toBe("/archenemy/decks/public");
  });

  it("offers stats and utilities to signed-in users", () => {
    render(<HomePage />, {
      initialState: {
        user: { ...initialUserState, isAuthenticated: true, loading: false },
      },
    });

    expect(screen.getByText("View my stats")).toBeInTheDocument();
    expect(screen.getAllByText("Open Game Utilities")).toHaveLength(2);
    expect(screen.queryByText("Get started free")).not.toBeInTheDocument();
  });
});
