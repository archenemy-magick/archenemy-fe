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

const mockGetRecordedGames = jest.fn();
const mockGetFriendLists = jest.fn();
jest.mock("~/lib/api/recordedGames", () => ({
  getRecordedGames: () => mockGetRecordedGames(),
}));
jest.mock("~/lib/api/friends", () => ({
  getFriendLists: () => mockGetFriendLists(),
}));

import { screen } from "@testing-library/react";
import { render } from "~/testUtils/render";
import { HomeDashboard } from "~/components/HomeDashboard";
import { initialUserState } from "~/store/reducers/userReducer";
import type { RecordedGame } from "~/types/recordedGame";

const signedIn = {
  user: {
    ...initialUserState,
    isAuthenticated: true,
    loading: false,
    id: "me",
    username: "hhoburg",
  },
};

function game(id: string, iWon: boolean, playedAt: string): RecordedGame {
  const seat = (over: object) => ({
    id: `${id}-${Math.random()}`,
    game_id: id,
    user_id: null,
    display_name: "Sam",
    is_recorder: false,
    commander_name: "Krenko, Mob Boss",
    deck_name: null,
    colors: ["R" as const],
    is_winner: false,
    seat_order: 1,
    ending_life: null,
    created_at: playedAt,
    ...over,
  });
  return {
    id,
    recorded_by: "me",
    played_at: playedAt,
    format: "commander",
    ended_on_turn: 8,
    win_condition: "combat",
    notes: null,
    created_at: playedAt,
    updated_at: playedAt,
    players: [
      seat({
        user_id: "me",
        display_name: "hhoburg",
        is_recorder: true,
        is_viewer: true,
        commander_name: "Yuriko, the Tiger's Shadow",
        colors: ["U", "B"],
        is_winner: iWon,
        seat_order: 0,
      }),
      seat({ is_winner: !iWon }),
    ],
  };
}

describe("HomeDashboard", () => {
  beforeEach(() => {
    mockGetFriendLists.mockResolvedValue({
      friends: [],
      incoming: [{ id: "req" }],
      outgoing: [],
    });
  });

  it("greets the user and summarizes their stats and recent games", async () => {
    mockGetRecordedGames.mockResolvedValue([
      game("g3", true, "2026-10-04T12:00:00Z"),
      game("g2", true, "2026-10-03T12:00:00Z"),
      game("g1", false, "2026-10-02T12:00:00Z"),
      game("g0", false, "2026-10-01T12:00:00Z"),
    ]);

    render(<HomeDashboard />, { initialState: signedIn });

    expect(screen.getByText("Welcome back, hhoburg")).toBeInTheDocument();
    expect(await screen.findByText("50%")).toBeInTheDocument();
    expect(screen.getByText("W2")).toBeInTheDocument();
    // Top deck, plus the three most recent games.
    expect(screen.getAllByText("Yuriko, the Tiger's Shadow")).toHaveLength(4);
    // Pending friend request badge.
    expect(await screen.findByText("1")).toBeInTheDocument();
  });

  it("links utilities to their tabs and shows a first-game prompt", async () => {
    mockGetRecordedGames.mockResolvedValue([]);

    render(<HomeDashboard />, { initialState: signedIn });

    expect(
      await screen.findByText("Record your first game")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Life Tracker").closest("a")?.getAttribute("href")
    ).toBe("/game?utility=life-tracker");
    expect(
      screen.getByText("My Profile").closest("a")?.getAttribute("href")
    ).toBe("/profile/hhoburg");
  });
});
