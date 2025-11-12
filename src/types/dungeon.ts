export interface DungeonRoom {
  name: string;
  effect: string;
  leadsTo: string[];
  position: { x: number; y: number };
}

export interface DungeonCard {
  id: string;
  oracle_id: string;
  name: string;
  type_line: string;
  oracle_text: string;
  released_at: string;
  scryfall_uri: string;
  set_id: string;
  set_code: string;
  set_name: string;
  image_small: string;
  image_normal: string;
  image_large: string;
  image_border_crop: string;
  keywords: string[];
  rulings_uri: string;
  created_at?: string;
  updated_at?: string;
}

export interface DungeonProgress {
  id: string;
  game_id?: string;
  player_id: string;
  dungeon_id: string;
  current_room: string;
  rooms_visited: string[];
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}
