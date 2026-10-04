import type { GameTabType } from "~/store/reducers/gameTabsReducer";

export const GAME_UTILITY_TYPES: readonly GameTabType[] = [
  "archenemy",
  "dungeons",
  "life-tracker",
  "coin-flipper",
];

/**
 * Link to the Game Utilities page with a utility tab opened (and, for
 * Archenemy, a deck loaded). The /game page consumes these params once and
 * then clears them from the URL.
 */
export function gameUtilityHref(
  utility?: GameTabType,
  options: { deckId?: string } = {}
): string {
  if (!utility) return "/game";
  const params = new URLSearchParams({ utility });
  if (options.deckId) params.set("deck", options.deckId);
  return `/game?${params}`;
}

export function playArchenemyDeckHref(deckId: string): string {
  return gameUtilityHref("archenemy", { deckId });
}

export function parseGameUtilityParams(search: string): {
  utility: GameTabType | null;
  deckId: string | null;
} {
  const params = new URLSearchParams(search);
  const utility = params.get("utility");
  return {
    utility: GAME_UTILITY_TYPES.includes(utility as GameTabType)
      ? (utility as GameTabType)
      : null,
    deckId: params.get("deck"),
  };
}
