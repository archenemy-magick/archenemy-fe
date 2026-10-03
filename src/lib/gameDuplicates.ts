import type { RecordedGame } from "~/types/recordedGame";

/** The parts of a game needed to compare it with another. */
export type ComparableSeat = {
  user_id: string | null;
  display_name: string;
  commander_name: string | null;
};

export type ComparableGame = {
  played_at: string;
  players: ComparableSeat[];
};

function localDateKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

// A seat in one recording matches a seat in another if they share a linked
// account, a commander, or a name. Two people recording the same game will
// often type names differently, so any single signal is enough.
function seatKeys(seat: ComparableSeat): string[] {
  const keys: string[] = [];
  if (seat.user_id) keys.push(`user:${seat.user_id}`);
  const commander = normalize(seat.commander_name);
  if (commander) keys.push(`cmd:${commander}`);
  const name = normalize(seat.display_name);
  if (name) keys.push(`name:${name}`);
  return keys;
}

function matchedSeatCount(a: ComparableSeat[], b: ComparableSeat[]) {
  const remaining = b.map(seatKeys);
  let matched = 0;
  for (const seat of a) {
    const keys = seatKeys(seat);
    const index = remaining.findIndex((candidate) =>
      candidate.some((key) => keys.includes(key))
    );
    if (index >= 0) {
      matched += 1;
      remaining.splice(index, 1);
    }
  }
  return matched;
}

/**
 * Same calendar day, same pod size, and every seat but at most one matches.
 * Deliberately loose: the result is only ever used to ask the user.
 */
export function isLikelySameGame(a: ComparableGame, b: ComparableGame) {
  if (a.players.length !== b.players.length) return false;
  if (localDateKey(a.played_at) !== localDateKey(b.played_at)) return false;
  const needed = Math.max(1, a.players.length - 1);
  return matchedSeatCount(a.players, b.players) >= needed;
}

export function findDuplicateCandidates(
  target: ComparableGame,
  games: RecordedGame[]
): RecordedGame[] {
  return games.filter((game) => isLikelySameGame(target, game));
}

/** Stable key for a pair of games, independent of order. */
export function duplicatePairKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * For each game, the other games that look like the same match. Pairs the
 * user has dismissed are skipped.
 */
export function findDuplicateGroups(
  games: RecordedGame[],
  dismissedPairs: ReadonlySet<string> = new Set()
): Map<string, RecordedGame[]> {
  const byDay = new Map<string, RecordedGame[]>();
  for (const game of games) {
    const key = localDateKey(game.played_at);
    byDay.set(key, [...(byDay.get(key) ?? []), game]);
  }

  const result = new Map<string, RecordedGame[]>();
  for (const sameDay of byDay.values()) {
    for (let i = 0; i < sameDay.length; i++) {
      for (let j = i + 1; j < sameDay.length; j++) {
        const a = sameDay[i];
        const b = sameDay[j];
        if (dismissedPairs.has(duplicatePairKey(a.id, b.id))) continue;
        if (!isLikelySameGame(a, b)) continue;
        result.set(a.id, [...(result.get(a.id) ?? []), b]);
        result.set(b.id, [...(result.get(b.id) ?? []), a]);
      }
    }
  }
  return result;
}
