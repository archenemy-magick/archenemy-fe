// Turn order and clocks for the life tracker. Pure functions, used by the
// reducer (state changes) and the component (display).

export type TrackedPlayer = {
  id: string;
  life: number;
  commanderDamage: Record<string, number>;
  counters?: Partial<Record<string, number>>;
};

/** A stopwatch stored as data, so it survives reloads and tab switches. */
export type Clock = {
  /** When it was last started; null while paused. */
  runningSince: number | null;
  /** Time banked from earlier running stretches. */
  accumulatedMs: number;
};

export type TurnState = {
  /** Round number: goes up each time play passes the first player. */
  round: number;
  firstPlayerId: string;
  activePlayerId: string;
  gameClock: Clock;
  turnClock: Clock;
};

export const LETHAL_COMMANDER_DAMAGE = 21;
export const LETHAL_POISON = 10;

/** Out of the game: no life, 10 poison, or 21 from a single commander. */
export function isEliminated(player: TrackedPlayer): boolean {
  return (
    player.life <= 0 ||
    (player.counters?.poison ?? 0) >= LETHAL_POISON ||
    Object.values(player.commanderDamage).some(
      (damage) => damage >= LETHAL_COMMANDER_DAMAGE
    )
  );
}

export function startedClock(now: number): Clock {
  return { runningSince: now, accumulatedMs: 0 };
}

export function clockElapsedMs(clock: Clock, now: number): number {
  return (
    clock.accumulatedMs +
    (clock.runningSince === null ? 0 : Math.max(0, now - clock.runningSince))
  );
}

export function pauseClock(clock: Clock, now: number): Clock {
  if (clock.runningSince === null) return clock;
  return { runningSince: null, accumulatedMs: clockElapsedMs(clock, now) };
}

export function resumeClock(clock: Clock, now: number): Clock {
  if (clock.runningSince !== null) return clock;
  return { ...clock, runningSince: now };
}

export function isPaused(turn: TurnState): boolean {
  return turn.gameClock.runningSince === null;
}

/** "1:05", "12:40", "1:02:03". */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${ss}`
    : `${minutes}:${ss}`;
}

/** Seat order starting from the first player. */
function rotation(players: TrackedPlayer[], firstPlayerId: string) {
  const start = Math.max(
    0,
    players.findIndex((p) => p.id === firstPlayerId)
  );
  return [...players.slice(start), ...players.slice(0, start)];
}

export function startTurns(firstPlayerId: string, now: number): TurnState {
  return {
    round: 1,
    firstPlayerId,
    activePlayerId: firstPlayerId,
    gameClock: startedClock(now),
    turnClock: startedClock(now),
  };
}

/**
 * Step the turn forward (+1) or back (-1), skipping eliminated players. The
 * round changes whenever the step wraps past the first player's seat.
 */
export function stepTurn(
  turn: TurnState,
  players: TrackedPlayer[],
  direction: 1 | -1,
  now: number
): TurnState {
  const order = rotation(players, turn.firstPlayerId);
  if (order.length === 0) return turn;
  const current = Math.max(
    0,
    order.findIndex((p) => p.id === turn.activePlayerId)
  );

  // Walk seats in `direction` until a player still in the game.
  let found: number | null = null;
  let wrapped = false;
  for (let step = 1; step < order.length; step++) {
    const raw = current + direction * step;
    const index = ((raw % order.length) + order.length) % order.length;
    if (raw >= order.length || raw < 0) wrapped = true;
    if (!isEliminated(order[index])) {
      found = index;
      break;
    }
  }
  // Nobody else is left in the game: the turn stays put.
  if (found === null) return turn;

  const round =
    direction === 1
      ? turn.round + (wrapped ? 1 : 0)
      : Math.max(1, turn.round - (wrapped ? 1 : 0));
  const paused = isPaused(turn);
  return {
    ...turn,
    round,
    activePlayerId: order[found].id,
    turnClock: paused
      ? { runningSince: null, accumulatedMs: 0 }
      : startedClock(now),
  };
}

/**
 * Keep the turn valid after a player is removed: if they were active, pass
 * the turn to the next seat; if they went first, the next seat goes first.
 * `players` is the list *before* removal.
 */
export function afterPlayerRemoved(
  turn: TurnState,
  players: TrackedPlayer[],
  removedId: string,
  now: number
): TurnState | null {
  const remaining = players.filter((p) => p.id !== removedId);
  if (remaining.length === 0) return null;

  const order = rotation(players, turn.firstPlayerId);
  const nextAfter = (id: string) => {
    const i = order.findIndex((p) => p.id === id);
    return order[(i + 1) % order.length].id;
  };

  let next = { ...turn };
  if (turn.activePlayerId === removedId) {
    next = {
      ...next,
      activePlayerId: nextAfter(removedId),
      turnClock: isPaused(turn)
        ? { runningSince: null, accumulatedMs: 0 }
        : startedClock(now),
    };
  }
  if (turn.firstPlayerId === removedId) {
    next = { ...next, firstPlayerId: nextAfter(removedId) };
  }
  return next;
}
