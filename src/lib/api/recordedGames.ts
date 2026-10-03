import type {
  CreateRecordedGameInput,
  GameFormat,
  RecordedGame,
  RecordedGamePlayer,
  WinCondition,
} from "~/types/recordedGame";
import { createClient } from "../supabase/client";
import { sortColors } from "~/lib/mtgColors";

const supabase = createClient();

type GameRow = Omit<RecordedGame, "players" | "format" | "win_condition"> & {
  format: string;
  win_condition: string | null;
};

type PlayerRow = Omit<RecordedGamePlayer, "colors"> & {
  colors: string[] | null;
};

function normalizeGame(
  row: GameRow & { players?: PlayerRow[] | null }
): RecordedGame {
  const players = (row.players ?? [])
    .map((player) => ({
      ...player,
      colors: sortColors(player.colors ?? []),
    }))
    .sort((a, b) => a.seat_order - b.seat_order);

  return {
    ...row,
    format: row.format as GameFormat,
    win_condition: (row.win_condition as WinCondition | null) ?? null,
    players,
  };
}

export async function getRecordedGames(): Promise<RecordedGame[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("recorded_games")
    .select(
      `
      *,
      players:recorded_game_players(*)
    `
    )
    .eq("recorded_by", user.id)
    .order("played_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as (GameRow & { players?: PlayerRow[] })[]).map(
    normalizeGame
  );
}

export async function createRecordedGame(
  input: CreateRecordedGameInput
): Promise<RecordedGame> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const recorderCount = input.players.filter((p) => p.is_recorder).length;
  if (recorderCount !== 1) {
    throw new Error("Mark exactly one player as you");
  }
  if (input.players.length < 2) {
    throw new Error("A game needs at least two players");
  }

  const { data: game, error: gameError } = await supabase
    .from("recorded_games")
    .insert({
      recorded_by: user.id,
      played_at: input.played_at,
      format: input.format,
      ended_on_turn: input.ended_on_turn,
      win_condition: input.win_condition,
      notes: input.notes,
    })
    .select()
    .single();

  if (gameError) throw gameError;

  const playersPayload = input.players.map((player, index) => ({
    game_id: game.id,
    user_id: player.is_recorder ? user.id : player.user_id,
    display_name: player.display_name.trim(),
    is_recorder: player.is_recorder,
    commander_name: player.commander_name?.trim() || null,
    deck_name: player.deck_name?.trim() || null,
    colors: sortColors(player.colors),
    is_winner: player.is_winner,
    seat_order: player.seat_order ?? index,
    ending_life: player.ending_life,
  }));

  const { data: players, error: playersError } = await supabase
    .from("recorded_game_players")
    .insert(playersPayload)
    .select();

  if (playersError) {
    await supabase.from("recorded_games").delete().eq("id", game.id);
    throw playersError;
  }

  return normalizeGame({
    ...(game as GameRow),
    players: (players ?? []) as PlayerRow[],
  });
}

export async function deleteRecordedGame(gameId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("recorded_games")
    .delete()
    .eq("id", gameId)
    .eq("recorded_by", user.id);

  if (error) throw error;
}
