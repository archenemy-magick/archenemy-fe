import {
  afterPlayerRemoved,
  clockElapsedMs,
  formatDuration,
  isEliminated,
  pauseClock,
  resumeClock,
  startTurns,
  stepTurn,
  type Clock,
  type TrackedPlayer,
} from "~/lib/lifeTracker/turns";

const player = (
  id: string,
  over: Partial<TrackedPlayer> = {}
): TrackedPlayer => ({
  id,
  life: 40,
  commanderDamage: {},
  ...over,
});
const four = ["a", "b", "c", "d"].map((id) => player(id));

const walk = (players: TrackedPlayer[], first: string, steps: number) => {
  let turn = startTurns(first, 0);
  const seen = [`${turn.round}:${turn.activePlayerId}`];
  for (let i = 0; i < steps; i++) {
    turn = stepTurn(turn, players, 1, i + 1);
    seen.push(`${turn.round}:${turn.activePlayerId}`);
  }
  return { turn, seen };
};

describe("stepTurn", () => {
  it("goes around the table and counts rounds from the first player", () => {
    // Seat order from "c": c, d, a, b. Round 2 starts back at c.
    expect(walk(four, "c", 5).seen).toEqual([
      "1:c",
      "1:d",
      "1:a",
      "1:b",
      "2:c",
      "2:d",
    ]);
  });

  it("starts a new round when play returns to the first player", () => {
    const { seen } = walk(four, "a", 4);
    expect(seen).toEqual(["1:a", "1:b", "1:c", "1:d", "2:a"]);
  });

  it("skips eliminated players", () => {
    const players = [player("a"), player("b", { life: 0 }), player("c")];
    const { seen } = walk(players, "a", 2);
    expect(seen).toEqual(["1:a", "1:c", "2:a"]);
  });

  it("still counts rounds when the first player is eliminated", () => {
    const players = [player("a", { life: 0 }), player("b"), player("c")];
    let turn = { ...startTurns("a", 0), activePlayerId: "b" };
    turn = stepTurn(turn, players, 1, 1); // b -> c
    turn = stepTurn(turn, players, 1, 2); // c -> (a out) -> b, new round
    expect([turn.round, turn.activePlayerId]).toEqual([2, "b"]);
  });

  it("doesn't move when everyone else is out", () => {
    const players = [player("a"), player("b", { life: 0 })];
    const turn = startTurns("a", 0);
    expect(stepTurn(turn, players, 1, 5)).toBe(turn);
  });

  it("steps back, undoing a round change but never below round 1", () => {
    let turn = startTurns("a", 0);
    turn = stepTurn(turn, four, -1, 1); // back from round 1 start
    expect([turn.round, turn.activePlayerId]).toEqual([1, "d"]);
    turn = { ...startTurns("a", 0), round: 2 };
    turn = stepTurn(turn, four, -1, 1);
    expect([turn.round, turn.activePlayerId]).toEqual([1, "d"]);
  });

  it("restarts the turn clock but not the game clock", () => {
    let turn = startTurns("a", 0);
    turn = stepTurn(turn, four, 1, 30_000);
    expect(clockElapsedMs(turn.turnClock, 40_000)).toBe(10_000);
    expect(clockElapsedMs(turn.gameClock, 40_000)).toBe(40_000);
  });
});

describe("clocks", () => {
  it("pauses and resumes, banking elapsed time", () => {
    let clock: Clock = { runningSince: 0, accumulatedMs: 0 };
    clock = pauseClock(clock, 5_000);
    expect(clockElapsedMs(clock, 60_000)).toBe(5_000);
    clock = resumeClock(clock, 60_000);
    expect(clockElapsedMs(clock, 62_000)).toBe(7_000);
  });

  it("formats durations", () => {
    expect(formatDuration(5_000)).toBe("0:05");
    expect(formatDuration(65_000)).toBe("1:05");
    expect(formatDuration(3_723_000)).toBe("1:02:03");
  });
});

describe("afterPlayerRemoved", () => {
  it("passes the turn on when the active player is removed", () => {
    const turn = { ...startTurns("a", 0), activePlayerId: "b" };
    expect(afterPlayerRemoved(turn, four, "b", 1)?.activePlayerId).toBe("c");
  });

  it("moves 'first player' to the next seat", () => {
    const turn = startTurns("a", 0);
    const next = afterPlayerRemoved(turn, four, "a", 1);
    expect(next?.firstPlayerId).toBe("b");
    expect(next?.activePlayerId).toBe("b");
  });
});

describe("isEliminated", () => {
  it("counts life, poison, and commander damage", () => {
    expect(isEliminated(player("a"))).toBe(false);
    expect(isEliminated(player("a", { life: 0 }))).toBe(true);
    expect(isEliminated(player("a", { counters: { poison: 10 } }))).toBe(true);
    expect(isEliminated(player("a", { commanderDamage: { b: 21 } }))).toBe(
      true
    );
  });
});
