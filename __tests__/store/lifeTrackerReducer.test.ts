import {
  addPlayer,
  adjustCounter,
  newGame,
  setTableRole,
  startTurnTracking,
  stepTurnAction,
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

describe("lifeTracker counters and table roles", () => {
  const player = (state: InitialLifeTrackerState, i: number) =>
    state.games[TAB].players[i];

  it("adjusts counters and never goes below zero", () => {
    let state = gameWith(2);
    const id = player(state, 0).id;
    state = reduce(
      state,
      adjustCounter({ tabId: TAB, playerId: id, counter: "poison", amount: 3 })
    );
    state = reduce(
      state,
      adjustCounter({ tabId: TAB, playerId: id, counter: "poison", amount: -5 })
    );
    state = reduce(
      state,
      adjustCounter({ tabId: TAB, playerId: id, counter: "energy", amount: 2 })
    );
    expect(player(state, 0).counters).toEqual({ poison: 0, energy: 2 });
  });

  it("moves the monarch between players and can clear it", () => {
    let state = gameWith(3);
    const [a, b] = [player(state, 0).id, player(state, 1).id];
    state = reduce(
      state,
      setTableRole({ tabId: TAB, role: "monarch", playerId: a })
    );
    state = reduce(
      state,
      setTableRole({ tabId: TAB, role: "monarch", playerId: b })
    );
    expect(state.games[TAB].roles?.monarch).toBe(b);
    state = reduce(
      state,
      setTableRole({ tabId: TAB, role: "monarch", playerId: null })
    );
    expect(state.games[TAB].roles?.monarch).toBeNull();
  });

  it("clears a role when its holder is removed", () => {
    let state = gameWith(3);
    const c = player(state, 2).id;
    state = reduce(
      state,
      setTableRole({ tabId: TAB, role: "initiative", playerId: c })
    );
    state = reduce(state, removePlayer({ tabId: TAB, playerId: c }));
    expect(state.games[TAB].roles?.initiative).toBeNull();
  });

  it("resets counters, roles, and turns on New Game", () => {
    let state = gameWith(2);
    const a = player(state, 0).id;
    state = reduce(
      state,
      adjustCounter({ tabId: TAB, playerId: a, counter: "rad", amount: 4 })
    );
    state = reduce(
      state,
      setTableRole({ tabId: TAB, role: "monarch", playerId: a })
    );
    state = reduce(
      state,
      startTurnTracking({ tabId: TAB, firstPlayerId: a, now: 0 })
    );
    state = reduce(state, newGame(TAB));
    expect(player(state, 0).counters).toEqual({});
    expect(state.games[TAB].roles).toEqual({});
    expect(state.games[TAB].turn).toBeNull();
  });

  it("skips a player with 10 poison when passing the turn", () => {
    let state = gameWith(3);
    const [a, b, c] = [0, 1, 2].map((i) => player(state, i).id);
    state = reduce(
      state,
      adjustCounter({ tabId: TAB, playerId: b, counter: "poison", amount: 10 })
    );
    state = reduce(
      state,
      startTurnTracking({ tabId: TAB, firstPlayerId: a, now: 0 })
    );
    state = reduce(state, stepTurnAction({ tabId: TAB, direction: 1, now: 1 }));
    expect(state.games[TAB].turn?.activePlayerId).toBe(c);
  });
});
