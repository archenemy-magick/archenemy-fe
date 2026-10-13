import {
  addPlayer,
  initializeGame,
  lifeTrackerSlice,
  removePlayer,
  setView,
  updateCommanderDamage,
  type InitialLifeTrackerState,
} from "~/store/reducers/lifeTrackerReducer";

const reduce = lifeTrackerSlice.reducer;
const TAB = "tab";

function gameWith(playerCount: number): InitialLifeTrackerState {
  let state = reduce(
    undefined,
    initializeGame({ tabId: TAB, defaultStartingLife: 40 })
  );
  for (let i = 2; i < playerCount; i++) state = reduce(state, addPlayer(TAB));
  return state;
}

const names = (state: InitialLifeTrackerState) =>
  state.games[TAB].players.map((p) => p.name);

describe("lifeTracker players", () => {
  it("reuses the lowest free name instead of duplicating one", () => {
    let state = gameWith(5);
    expect(names(state)).toEqual([
      "Player 1",
      "Player 2",
      "Player 3",
      "Player 4",
      "Player 5",
    ]);
    const player3 = state.games[TAB].players[2];
    state = reduce(state, removePlayer({ tabId: TAB, playerId: player3.id }));
    state = reduce(state, addPlayer(TAB));

    expect(names(state)).toContain("Player 3");
    expect(new Set(names(state)).size).toBe(names(state).length);
  });

  it("gives a re-added player a color no one else has", () => {
    let state = gameWith(4);
    const removed = state.games[TAB].players[1];
    state = reduce(state, removePlayer({ tabId: TAB, playerId: removed.id }));
    state = reduce(state, addPlayer(TAB));
    const colors = state.games[TAB].players.map((p) => p.color);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it("gives every player a unique id", () => {
    const state = gameWith(6);
    const ids = state.games[TAB].players.map((p) => p.id);
    expect(new Set(ids).size).toBe(6);
  });
});

describe("lifeTracker commander damage", () => {
  const damage = (state: InitialLifeTrackerState, amount: number) =>
    reduce(
      state,
      updateCommanderDamage({
        tabId: TAB,
        targetPlayerId: "1",
        sourcePlayerId: "2",
        amount,
      })
    );
  const target = (state: InitialLifeTrackerState) =>
    state.games[TAB].players.find((p) => p.id === "1")!;

  it("adjusts life by the damage dealt", () => {
    const state = damage(gameWith(2), 7);
    expect(target(state).commanderDamage["2"]).toBe(7);
    expect(target(state).life).toBe(33);
  });

  it("only gives back the damage actually removed", () => {
    let state = damage(gameWith(2), 3);
    state = damage(state, -10); // a held "-" step
    expect(target(state).commanderDamage["2"]).toBe(0);
    expect(target(state).life).toBe(40);
  });

  it("doesn't add life once commander damage is already 0", () => {
    let state = gameWith(2);
    for (let i = 0; i < 5; i++) state = damage(state, -10);
    expect(target(state).life).toBe(40);
  });
});

describe("lifeTracker view", () => {
  it("defaults to unset (treated as 'same') and stores the chosen view", () => {
    let state = reduce(
      undefined,
      initializeGame({ tabId: TAB, defaultStartingLife: 40 })
    );
    expect(state.games[TAB].view).toBeUndefined();
    state = reduce(state, setView({ tabId: TAB, view: "outward" }));
    expect(state.games[TAB].view).toBe("outward");
  });
});
