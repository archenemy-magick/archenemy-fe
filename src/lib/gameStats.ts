import { colorIdentityKey, colorIdentityLabel } from "~/lib/mtgColors";
import {
  MTG_COLORS,
  type MtgColor,
  type RecordedGame,
  type WinCondition,
} from "~/types/recordedGame";

export type StatsDatePreset = "all" | "30d" | "90d" | "365d";

export type GameStatsFilters = {
  format: string;
  playerCount: number | "all";
  datePreset: StatsDatePreset;
  colors: MtgColor[];
  deckKey: string | null;
};

export const DEFAULT_STATS_FILTERS: GameStatsFilters = {
  format: "all",
  playerCount: "all",
  datePreset: "all",
  colors: [],
  deckKey: null,
};

export type DeckStat = {
  key: string;
  commanderName: string;
  deckName: string | null;
  colors: MtgColor[];
  colorLabel: string;
  games: number;
  wins: number;
  winRate: number;
};

export type ColorUsage = {
  color: MtgColor;
  games: number;
  wins: number;
  winRate: number;
};

export type MonthlyStat = {
  month: string;
  label: string;
  games: number;
  wins: number;
};

export type PlayerCountStat = {
  playerCount: number;
  games: number;
  wins: number;
  winRate: number;
};

export type OpponentStat = {
  key: string;
  name: string;
  games: number;
  /** Games the recorder won with this opponent at the table. */
  yourWins: number;
  /** Games this opponent won. */
  theirWins: number;
  favoriteCommander: string | null;
};

export type WinConditionStat = {
  condition: WinCondition | "unknown";
  games: number;
  yourWins: number;
};

export type GameResult = "W" | "L" | "D";

export type StreakStats = {
  current: { result: GameResult; length: number } | null;
  longestWin: number;
  recent: GameResult[];
};

export type UserGameStats = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageEndingTurn: number | null;
  mostUsedColors: ColorUsage[];
  winningestDecks: DeckStat[];
  monthly: MonthlyStat[];
  byPlayerCount: PlayerCountStat[];
  opponents: OpponentStat[];
  winConditions: WinConditionStat[];
  streaks: StreakStats;
  filteredGames: RecordedGame[];
};

function startOfPreset(preset: StatsDatePreset, now: Date): Date | null {
  if (preset === "all") return null;
  const days = preset === "30d" ? 30 : preset === "90d" ? 90 : 365;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function recorderSeat(game: RecordedGame) {
  return game.players.find((player) => player.is_recorder) ?? null;
}

export function gameResultFor(game: RecordedGame): GameResult | null {
  const me = recorderSeat(game);
  if (!me) return null;
  const winnerCount = game.players.filter((p) => p.is_winner).length;
  if (winnerCount !== 1) return "D";
  return me.is_winner ? "W" : "L";
}

// Prefer the linked account so renamed friends still group together; fall
// back to the typed name for opponents who are not app users.
function opponentKeyFor(player: {
  user_id: string | null;
  display_name: string;
}): string {
  return player.user_id ?? `name:${player.display_name.trim().toLowerCase()}`;
}

function computeStreaks(games: RecordedGame[]): StreakStats {
  const results = [...games]
    .sort(
      (a, b) =>
        new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    )
    .map(gameResultFor)
    .filter((result): result is GameResult => result !== null);

  let longestWin = 0;
  let run = 0;
  for (const result of results) {
    run = result === "W" ? run + 1 : 0;
    longestWin = Math.max(longestWin, run);
  }

  let current: StreakStats["current"] = null;
  const last = results[results.length - 1];
  if (last) {
    let length = 0;
    for (let i = results.length - 1; i >= 0 && results[i] === last; i--) {
      length += 1;
    }
    current = { result: last, length };
  }

  return { current, longestWin, recent: results.slice(-10).reverse() };
}

function deckKeyFor(player: {
  commander_name: string | null;
  deck_name: string | null;
  colors: MtgColor[];
}): string {
  const commander = (player.commander_name ?? "").trim().toLowerCase();
  const deck = (player.deck_name ?? "").trim().toLowerCase();
  return `${commander}|${deck}|${colorIdentityKey(player.colors)}`;
}

export function filterRecordedGames(
  games: RecordedGame[],
  filters: GameStatsFilters,
  now: Date = new Date()
): RecordedGame[] {
  const since = startOfPreset(filters.datePreset, now);

  return games.filter((game) => {
    if (filters.format !== "all" && game.format !== filters.format) {
      return false;
    }
    if (
      filters.playerCount !== "all" &&
      game.players.length !== filters.playerCount
    ) {
      return false;
    }
    if (since && new Date(game.played_at) < since) {
      return false;
    }

    const me = recorderSeat(game);
    if (!me) return false;

    if (filters.colors.length > 0) {
      const hasAll = filters.colors.every((color) => me.colors.includes(color));
      if (!hasAll) return false;
    }

    if (filters.deckKey && deckKeyFor(me) !== filters.deckKey) {
      return false;
    }

    return true;
  });
}

export function computeUserGameStats(
  games: RecordedGame[],
  filters: GameStatsFilters = DEFAULT_STATS_FILTERS,
  now: Date = new Date()
): UserGameStats {
  const filteredGames = filterRecordedGames(games, filters, now);

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let endingTurnSum = 0;
  let endingTurnCount = 0;

  const colorMap = new Map<MtgColor, { games: number; wins: number }>();
  const deckMap = new Map<
    string,
    {
      commanderName: string;
      deckName: string | null;
      colors: MtgColor[];
      games: number;
      wins: number;
    }
  >();
  const monthMap = new Map<string, { games: number; wins: number }>();
  const playerCountMap = new Map<number, { games: number; wins: number }>();
  const winConditionMap = new Map<
    WinCondition | "unknown",
    { games: number; yourWins: number }
  >();
  const opponentMap = new Map<
    string,
    {
      name: string;
      games: number;
      yourWins: number;
      theirWins: number;
      commanders: Map<string, number>;
    }
  >();

  for (const color of MTG_COLORS) {
    colorMap.set(color, { games: 0, wins: 0 });
  }

  for (const game of filteredGames) {
    const me = recorderSeat(game);
    if (!me) continue;

    const result = gameResultFor(game);
    const won = result === "W";

    if (result === "D") {
      draws += 1;
    } else if (won) {
      wins += 1;
    } else {
      losses += 1;
    }

    const conditionKey = game.win_condition ?? "unknown";
    const conditionEntry = winConditionMap.get(conditionKey) ?? {
      games: 0,
      yourWins: 0,
    };
    conditionEntry.games += 1;
    if (won) conditionEntry.yourWins += 1;
    winConditionMap.set(conditionKey, conditionEntry);

    for (const opponent of game.players) {
      if (opponent.is_recorder) continue;
      const opponentKey = opponentKeyFor(opponent);
      const entry = opponentMap.get(opponentKey) ?? {
        name: opponent.display_name.trim(),
        games: 0,
        yourWins: 0,
        theirWins: 0,
        commanders: new Map<string, number>(),
      };
      entry.games += 1;
      if (won) entry.yourWins += 1;
      if (result === "L" && opponent.is_winner) entry.theirWins += 1;
      const commander = opponent.commander_name?.trim();
      if (commander) {
        entry.commanders.set(
          commander,
          (entry.commanders.get(commander) ?? 0) + 1
        );
      }
      opponentMap.set(opponentKey, entry);
    }

    if (game.ended_on_turn != null) {
      endingTurnSum += game.ended_on_turn;
      endingTurnCount += 1;
    }

    for (const color of me.colors) {
      const entry = colorMap.get(color);
      if (entry) {
        entry.games += 1;
        if (won) entry.wins += 1;
      }
    }

    const key = deckKeyFor(me);
    const existing = deckMap.get(key);
    if (existing) {
      existing.games += 1;
      if (won) existing.wins += 1;
    } else {
      deckMap.set(key, {
        commanderName: me.commander_name?.trim() || "Unknown commander",
        deckName: me.deck_name?.trim() || null,
        colors: me.colors,
        games: 1,
        wins: won ? 1 : 0,
      });
    }

    const playedAt = new Date(game.played_at);
    const monthKey = `${playedAt.getFullYear()}-${String(
      playedAt.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthEntry = monthMap.get(monthKey) ?? { games: 0, wins: 0 };
    monthEntry.games += 1;
    if (won) monthEntry.wins += 1;
    monthMap.set(monthKey, monthEntry);

    const countEntry = playerCountMap.get(game.players.length) ?? {
      games: 0,
      wins: 0,
    };
    countEntry.games += 1;
    if (won) countEntry.wins += 1;
    playerCountMap.set(game.players.length, countEntry);
  }

  const gamesPlayed = filteredGames.length;
  // Draws count as games played, matching the per-deck and per-color rates.
  const winRate = gamesPlayed === 0 ? 0 : wins / gamesPlayed;

  const toDeckStat = (
    key: string,
    value: {
      commanderName: string;
      deckName: string | null;
      colors: MtgColor[];
      games: number;
      wins: number;
    }
  ): DeckStat => ({
    key,
    commanderName: value.commanderName,
    deckName: value.deckName,
    colors: value.colors,
    colorLabel: colorIdentityLabel(value.colors),
    games: value.games,
    wins: value.wins,
    winRate: value.games === 0 ? 0 : value.wins / value.games,
  });

  const decks = Array.from(deckMap.entries()).map(([key, value]) =>
    toDeckStat(key, value)
  );

  // Rank by total wins first so a single lucky 1-0 game does not top the list.
  const winningestDecks = [...decks].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    return b.games - a.games;
  });

  const mostUsedColors: ColorUsage[] = MTG_COLORS.map((color) => {
    const entry = colorMap.get(color)!;
    return {
      color,
      games: entry.games,
      wins: entry.wins,
      winRate: entry.games === 0 ? 0 : entry.wins / entry.games,
    };
  });

  const monthly: MonthlyStat[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => {
      const [year, monthNum] = month.split("-");
      const date = new Date(Number(year), Number(monthNum) - 1, 1);
      return {
        month,
        label: date.toLocaleDateString(undefined, {
          month: "short",
          year: "numeric",
        }),
        games: value.games,
        wins: value.wins,
      };
    });

  const byPlayerCount: PlayerCountStat[] = Array.from(playerCountMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([playerCount, value]) => ({
      playerCount,
      games: value.games,
      wins: value.wins,
      winRate: value.games === 0 ? 0 : value.wins / value.games,
    }));

  const opponents: OpponentStat[] = Array.from(opponentMap.entries())
    .map(([key, value]) => {
      let favoriteCommander: string | null = null;
      let favoriteCount = 0;
      for (const [commander, count] of value.commanders) {
        if (count > favoriteCount) {
          favoriteCommander = commander;
          favoriteCount = count;
        }
      }
      return {
        key,
        name: value.name,
        games: value.games,
        yourWins: value.yourWins,
        theirWins: value.theirWins,
        favoriteCommander,
      };
    })
    .sort((a, b) => b.games - a.games || a.name.localeCompare(b.name));

  const winConditions: WinConditionStat[] = Array.from(
    winConditionMap.entries()
  )
    .map(([condition, value]) => ({ condition, ...value }))
    .sort((a, b) => b.games - a.games);

  return {
    gamesPlayed,
    wins,
    losses,
    draws,
    winRate,
    averageEndingTurn:
      endingTurnCount === 0 ? null : endingTurnSum / endingTurnCount,
    mostUsedColors,
    winningestDecks,
    monthly,
    byPlayerCount,
    opponents,
    winConditions,
    streaks: computeStreaks(filteredGames),
    filteredGames,
  };
}
