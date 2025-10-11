import {
  CustomArchenemyCard,
  CustomArchenemyDeck,
  SupabaseDeckResponse,
} from "~/types";

export const flattenDeck = (
  deck: SupabaseDeckResponse
): CustomArchenemyDeck & {
  profiles?: { username: string };
  like_count?: number;
} => {
  return {
    ...deck,
    lang: deck.lang || "en", // Provide default if missing
    deck_cards: deck.deck_cards
      .map((dc) => dc.archenemy_cards)
      .filter((card): card is CustomArchenemyCard => card !== null),
  };
};
