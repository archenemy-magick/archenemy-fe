export const MTG_COLORS = ["W", "U", "B", "R", "G"] as const;
export type MtgColor = (typeof MTG_COLORS)[number];

export const GAME_FORMATS = [
  "commander",
  "archenemy",
  "standard",
  "modern",
  "pioneer",
  "limited",
  "other",
] as const;
export type GameFormat = (typeof GAME_FORMATS)[number];

export const WIN_CONDITIONS = [
  "combat",
  "commander_damage",
  "combo",
  "mill",
  "poison",
  "concession",
  "other",
] as const;
export type WinCondition = (typeof WIN_CONDITIONS)[number];

export const FORMAT_LABELS: Record<GameFormat, string> = {
  commander: "Commander",
  archenemy: "Archenemy",
  standard: "Standard",
  modern: "Modern",
  pioneer: "Pioneer",
  limited: "Limited",
  other: "Other",
};

export const WIN_CONDITION_LABELS: Record<WinCondition, string> = {
  combat: "Combat damage",
  commander_damage: "Commander damage",
  combo: "Combo",
  mill: "Mill",
  poison: "Poison / infect",
  concession: "Concession",
  other: "Other",
};

export type RecordedGamePlayer = {
  id: string;
  game_id: string;
  user_id: string | null;
  display_name: string;
  is_recorder: boolean;
  commander_name: string | null;
  deck_name: string | null;
  colors: MtgColor[];
  is_winner: boolean;
  seat_order: number;
  ending_life: number | null;
  created_at: string;
};

export type RecordedGame = {
  id: string;
  recorded_by: string;
  played_at: string;
  format: GameFormat;
  ended_on_turn: number | null;
  win_condition: WinCondition | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  players: RecordedGamePlayer[];
};

export type RecordedGamePlayerInput = {
  user_id: string | null;
  display_name: string;
  is_recorder: boolean;
  commander_name: string | null;
  deck_name: string | null;
  colors: MtgColor[];
  is_winner: boolean;
  seat_order: number;
  ending_life: number | null;
};

export type CreateRecordedGameInput = {
  played_at: string;
  format: GameFormat;
  ended_on_turn: number | null;
  win_condition: WinCondition | null;
  notes: string | null;
  players: RecordedGamePlayerInput[];
};

export type RecordGameDraftPlayer = {
  displayName: string;
  endingLife: number | null;
  isRecorder: boolean;
};

export type RecordGameDraft = {
  format: GameFormat;
  players: RecordGameDraftPlayer[];
};
