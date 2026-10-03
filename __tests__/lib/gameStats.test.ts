import {
  computeUserGameStats,
  DEFAULT_STATS_FILTERS,
  type GameStatsFilters,
} from "~/lib/gameStats";
import type { RecordedGame, RecordedGamePlayer } from "~/types/recordedGame";

function player(
  overrides: Partial<RecordedGamePlayer> & Pick<RecordedGamePlayer, "id">
): RecordedGamePlayer {
  return {
    game_id: "game-1",
    user_id: null,
    display_name: "Player",
    is_recorder: false,
    commander_name: "Atraxa, Praetors' Voice",
    deck_name: null,
    colors: ["W", "U", "B", "G"],
    is_winner: false,
    seat_order: 0,
    ending_life: 40,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function game(
  overrides: Partial<RecordedGame> & {
    id: string;
    players: RecordedGamePlayer[];
  }
): RecordedGame {
  return {
    recorded_by: "user-1",
    played_at: "2026-09-01T12:00:00.000Z",
    format: "commander",
    ended_on_turn: 8,
    win_condition: "combat",
    notes: null,
    created_at: "2026-09-01T12:00:00.000Z",
    updated_at: "2026-09-01T12:00:00.000Z",
    ...overrides,
  };
}

const now = new Date("2026-10-02T12:00:00.000Z");

const sampleGames: RecordedGame[] = [
  game({
    id: "g1",
    played_at: "2026-09-20T12:00:00.000Z",
    ended_on_turn: 10,
    players: [
      player({
        id: "p1",
        game_id: "g1",
        display_name: "Me",
        is_recorder: true,
        commander_name: "Atraxa, Praetors' Voice",
        colors: ["W", "U", "B", "G"],
        is_winner: true,
        seat_order: 0,
      }),
      player({
        id: "p2",
        game_id: "g1",
        display_name: "Sam",
        commander_name: "Krenko, Mob Boss",
        colors: ["R"],
        seat_order: 1,
      }),
    ],
  }),
  game({
    id: "g2",
    played_at: "2026-08-01T12:00:00.000Z",
    format: "archenemy",
    ended_on_turn: 6,
    players: [
      player({
        id: "p3",
        game_id: "g2",
        display_name: "Me",
        is_recorder: true,
        commander_name: "Krenko, Mob Boss",
        colors: ["R"],
        is_winner: false,
        seat_order: 0,
      }),
      player({
        id: "p4",
        game_id: "g2",
        display_name: "Alex",
        commander_name: "Atraxa, Praetors' Voice",
        colors: ["W", "U", "B", "G"],
        is_winner: true,
        seat_order: 1,
      }),
      player({
        id: "p5",
        game_id: "g2",
        display_name: "Jo",
        commander_name: "Yuriko, the Tiger's Shadow",
        colors: ["U", "B"],
        seat_order: 2,
      }),
    ],
  }),
  game({
    id: "g3",
    played_at: "2026-09-25T12:00:00.000Z",
    ended_on_turn: null,
    win_condition: null,
    players: [
      player({
        id: "p6",
        game_id: "g3",
        display_name: "Me",
        is_recorder: true,
        commander_name: "Atraxa, Praetors' Voice",
        colors: ["W", "U", "B", "G"],
        is_winner: false,
        seat_order: 0,
      }),
      player({
        id: "p7",
        game_id: "g3",
        display_name: "Sam",
        commander_name: "Krenko, Mob Boss",
        colors: ["R"],
        is_winner: false,
        seat_order: 1,
      }),
    ],
  }),
];

describe("computeUserGameStats", () => {
  it("computes win rate over all games, counting draws as non-wins", () => {
    const stats = computeUserGameStats(sampleGames, DEFAULT_STATS_FILTERS, now);

    expect(stats.gamesPlayed).toBe(3);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(1);
    expect(stats.draws).toBe(1);
    expect(stats.winRate).toBeCloseTo(1 / 3);
  });

  it("averages ending turn when present", () => {
    const stats = computeUserGameStats(sampleGames, DEFAULT_STATS_FILTERS, now);
    expect(stats.averageEndingTurn).toBe(8);
  });

  it("ranks winningest decks by total wins", () => {
    const stats = computeUserGameStats(sampleGames, DEFAULT_STATS_FILTERS, now);
    expect(stats.winningestDecks[0].commanderName).toBe(
      "Atraxa, Praetors' Voice"
    );
    expect(stats.winningestDecks[0].games).toBe(2);
    expect(stats.winningestDecks[0].wins).toBe(1);
  });

  it("counts color pips from the recorder seat", () => {
    const stats = computeUserGameStats(sampleGames, DEFAULT_STATS_FILTERS, now);
    const red = stats.mostUsedColors.find((c) => c.color === "R");
    const white = stats.mostUsedColors.find((c) => c.color === "W");
    expect(red?.games).toBe(1);
    expect(white?.games).toBe(2);
  });

  it("filters by format", () => {
    const filters: GameStatsFilters = {
      ...DEFAULT_STATS_FILTERS,
      format: "archenemy",
    };
    const stats = computeUserGameStats(sampleGames, filters, now);
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.losses).toBe(1);
  });

  it("filters by pod size", () => {
    const filters: GameStatsFilters = {
      ...DEFAULT_STATS_FILTERS,
      playerCount: 3,
    };
    const stats = computeUserGameStats(sampleGames, filters, now);
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.byPlayerCount[0].playerCount).toBe(3);
  });

  it("filters by date preset", () => {
    const filters: GameStatsFilters = {
      ...DEFAULT_STATS_FILTERS,
      datePreset: "30d",
    };
    const stats = computeUserGameStats(sampleGames, filters, now);
    expect(stats.gamesPlayed).toBe(2);
  });

  it("filters by colors the recorder played", () => {
    const filters: GameStatsFilters = {
      ...DEFAULT_STATS_FILTERS,
      colors: ["R"],
    };
    const stats = computeUserGameStats(sampleGames, filters, now);
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.filteredGames[0].id).toBe("g2");
  });

  it("tracks head-to-head records per opponent", () => {
    const stats = computeUserGameStats(sampleGames, DEFAULT_STATS_FILTERS, now);
    const sam = stats.opponents.find((o) => o.name === "Sam");
    const alex = stats.opponents.find((o) => o.name === "Alex");

    expect(stats.opponents[0].name).toBe("Sam");
    expect(sam).toMatchObject({
      games: 2,
      yourWins: 1,
      theirWins: 0,
      favoriteCommander: "Krenko, Mob Boss",
    });
    expect(alex).toMatchObject({ games: 1, yourWins: 0, theirWins: 1 });
  });

  it("groups opponents by linked account before display name", () => {
    const linked = sampleGames.map((g) => ({
      ...g,
      players: g.players.map((p) =>
        p.display_name === "Sam" || p.display_name === "Alex"
          ? { ...p, user_id: "friend-1" }
          : p
      ),
    }));
    const stats = computeUserGameStats(linked, DEFAULT_STATS_FILTERS, now);
    const friend = stats.opponents.find((o) => o.key === "friend-1");
    expect(friend?.games).toBe(3);
  });

  it("breaks down how games ended", () => {
    const stats = computeUserGameStats(sampleGames, DEFAULT_STATS_FILTERS, now);
    expect(stats.winConditions).toEqual([
      { condition: "combat", games: 2, yourWins: 1 },
      { condition: "unknown", games: 1, yourWins: 0 },
    ]);
  });

  it("computes streaks in chronological order", () => {
    const stats = computeUserGameStats(sampleGames, DEFAULT_STATS_FILTERS, now);
    // Chronological: g2 (L, Aug 1), g1 (W, Sep 20), g3 (D, Sep 25)
    expect(stats.streaks.recent).toEqual(["D", "W", "L"]);
    expect(stats.streaks.current).toEqual({ result: "D", length: 1 });
    expect(stats.streaks.longestWin).toBe(1);
  });

  it("uses the viewer's seat for games a friend recorded", () => {
    const friendRecorded = game({
      id: "g4",
      recorded_by: "friend-1",
      players: [
        player({
          id: "p8",
          game_id: "g4",
          user_id: "friend-1",
          display_name: "Sam",
          is_recorder: true,
          commander_name: "Krenko, Mob Boss",
          colors: ["R"],
          is_winner: false,
        }),
        player({
          id: "p9",
          game_id: "g4",
          user_id: "user-1",
          display_name: "Me",
          is_viewer: true,
          commander_name: "Yuriko, the Tiger's Shadow",
          colors: ["U", "B"],
          is_winner: true,
          seat_order: 1,
        }),
      ],
    });

    const stats = computeUserGameStats(
      [friendRecorded],
      DEFAULT_STATS_FILTERS,
      now
    );

    expect(stats.wins).toBe(1);
    expect(stats.winningestDecks[0].commanderName).toBe(
      "Yuriko, the Tiger's Shadow"
    );
    expect(stats.opponents).toEqual([
      expect.objectContaining({ key: "friend-1", name: "Sam", theirWins: 0 }),
    ]);
  });
});
