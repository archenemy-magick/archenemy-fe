import {
  duplicatePairKey,
  findDuplicateGroups,
  isLikelySameGame,
  type ComparableGame,
} from "~/lib/gameDuplicates";
import type { RecordedGame, RecordedGamePlayer } from "~/types/recordedGame";

function seat(
  display_name: string,
  commander_name: string | null,
  user_id: string | null = null
) {
  return { display_name, commander_name, user_id };
}

function recorded(id: string, base: ComparableGame): RecordedGame {
  return {
    id,
    recorded_by: "someone",
    played_at: base.played_at,
    format: "commander",
    ended_on_turn: null,
    win_condition: null,
    notes: null,
    created_at: base.played_at,
    updated_at: base.played_at,
    players: base.players.map(
      (p, index) =>
        ({
          ...p,
          id: `${id}-${index}`,
          game_id: id,
          is_recorder: index === 0,
          deck_name: null,
          colors: [],
          is_winner: false,
          seat_order: index,
          ending_life: null,
          created_at: base.played_at,
        } satisfies RecordedGamePlayer)
    ),
  };
}

const mine: ComparableGame = {
  played_at: "2026-10-02T12:00:00",
  players: [
    seat("Me", "Yuriko, the Tiger's Shadow", "me"),
    seat("Sam", "Krenko, Mob Boss", "sam"),
    seat("Jo", "Atraxa, Praetors' Voice"),
    seat("Riley", "Edgar Markov"),
  ],
};

// Sam's recording of the same game: different names typed for strangers,
// one commander misspelled.
const samsCopy: ComparableGame = {
  played_at: "2026-10-02T12:00:00",
  players: [
    seat("sam", "Krenko, Mob Boss", "sam"),
    seat("hhoburg", "Yuriko, the Tiger's Shadow", "me"),
    seat("Joanna", "Atraxa, Praetors' Voice"),
    seat("Riley", "Edgar Markhov"),
  ],
};

describe("isLikelySameGame", () => {
  it("matches the same pod recorded by two people", () => {
    expect(isLikelySameGame(mine, samsCopy)).toBe(true);
  });

  it("ignores games on other days", () => {
    expect(
      isLikelySameGame(mine, { ...samsCopy, played_at: "2026-10-03T12:00:00" })
    ).toBe(false);
  });

  it("ignores games with a different pod size", () => {
    expect(
      isLikelySameGame(mine, {
        ...samsCopy,
        players: samsCopy.players.slice(0, 3),
      })
    ).toBe(false);
  });

  it("does not match when two or more seats differ", () => {
    expect(
      isLikelySameGame(mine, {
        ...samsCopy,
        players: [
          samsCopy.players[0],
          samsCopy.players[1],
          seat("Pat", "Kinnan, Bonder Prodigy"),
          seat("Lee", "Urza, Lord High Artificer"),
        ],
      })
    ).toBe(false);
  });

  it("counts each seat at most once", () => {
    const allKrenko: ComparableGame = {
      played_at: mine.played_at,
      players: [1, 2, 3, 4].map((n) => seat(`P${n}`, "Krenko, Mob Boss")),
    };
    expect(isLikelySameGame(mine, allKrenko)).toBe(false);
  });
});

describe("findDuplicateGroups", () => {
  const games = [
    recorded("a", mine),
    recorded("b", samsCopy),
    recorded("c", { ...mine, played_at: "2026-09-01T12:00:00" }),
  ];

  it("links likely duplicates both ways", () => {
    const groups = findDuplicateGroups(games);
    expect(groups.get("a")?.map((g) => g.id)).toEqual(["b"]);
    expect(groups.get("b")?.map((g) => g.id)).toEqual(["a"]);
    expect(groups.has("c")).toBe(false);
  });

  it("skips dismissed pairs", () => {
    const groups = findDuplicateGroups(
      games,
      new Set([duplicatePairKey("b", "a")])
    );
    expect(groups.size).toBe(0);
  });
});
