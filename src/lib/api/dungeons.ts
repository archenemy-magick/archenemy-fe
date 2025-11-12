// lib/api/dungeons.ts
import { createClient } from "~/lib/supabase/client";
import { DungeonCard, DungeonProgress } from "~/types/dungeon";

const supabase = createClient();

/**
 * Fetch all dungeon cards
 */
export async function getAllDungeons(): Promise<DungeonCard[]> {
  const { data, error } = await supabase
    .from("dungeon_cards")
    .select("*")
    .order("name");

  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single dungeon by ID
 */
export async function getDungeonById(id: string): Promise<DungeonCard> {
  const { data, error } = await supabase
    .from("dungeon_cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create or update dungeon progress
 */
export async function saveDungeonProgress(
  progress: Omit<DungeonProgress, "id" | "created_at" | "updated_at">
): Promise<DungeonProgress> {
  const { data, error } = await supabase
    .from("dungeon_progress")
    .upsert(progress)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get dungeon progress for a player
 */
export async function getDungeonProgress(
  playerId: string,
  dungeonId: string,
  gameId?: string
): Promise<DungeonProgress | null> {
  let query = supabase
    .from("dungeon_progress")
    .select("*")
    .eq("player_id", playerId)
    .eq("dungeon_id", dungeonId);

  if (gameId) {
    query = query.eq("game_id", gameId);
  }

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw error;
  }

  return data || null;
}

/**
 * Delete dungeon progress
 */
export async function deleteDungeonProgress(progressId: string): Promise<void> {
  const { error } = await supabase
    .from("dungeon_progress")
    .delete()
    .eq("id", progressId);

  if (error) throw error;
}

/**
 * Move to next room in dungeon
 */
export async function moveToRoom(
  progressId: string,
  newRoom: string,
  roomsVisited: string[]
): Promise<DungeonProgress> {
  const { data, error } = await supabase
    .from("dungeon_progress")
    .update({
      current_room: newRoom,
      rooms_visited: roomsVisited,
      updated_at: new Date().toISOString(),
    })
    .eq("id", progressId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark dungeon as completed
 */
export async function completeDungeon(
  progressId: string
): Promise<DungeonProgress> {
  const { data, error } = await supabase
    .from("dungeon_progress")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", progressId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
