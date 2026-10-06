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
import ArchenemyPage from "~/app/archenemy/page";
import { initialUserState } from "~/store/reducers/userReducer";

describe("ArchenemyPage", () => {
  it("links each section box to its page", () => {
    render(<ArchenemyPage />);

    const href = (title: string) =>
      screen.getByText(title).closest("a")?.getAttribute("href");

    expect(href("Built-in Archenemy Decks")).toBe("/archenemy/decks/built-in");
    expect(href("Popular Cards")).toBe("/archenemy/popular-cards");
    expect(href("Community Archenemy Decks")).toBe("/archenemy/decks/public");
    expect(href("My Archenemy Decks")).toBe("/archenemy/decks");
  });

  it("keeps shortcuts to play and build", () => {
    render(<ArchenemyPage />);

    expect(screen.getByText("Play Archenemy").closest("a")).toHaveAttribute(
      "href",
      "/game?utility=archenemy"
    );
    expect(screen.getByText("Build a deck").closest("a")).toHaveAttribute(
      "href",
      "/archenemy/decks/builder"
    );
  });

  it("marks My Archenemy Decks as needing an account when signed out", () => {
    render(<ArchenemyPage />, {
      initialState: { user: { ...initialUserState, loading: false } },
    });
    expect(screen.getByText("Sign in to open")).toBeInTheDocument();
  });

  it("opens My Archenemy Decks normally when signed in", () => {
    render(<ArchenemyPage />, {
      initialState: {
        user: { ...initialUserState, isAuthenticated: true, loading: false },
      },
    });
    expect(screen.queryByText("Sign in to open")).not.toBeInTheDocument();
  });
});
