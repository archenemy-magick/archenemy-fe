import { getAllCards } from "~/lib/api/cards";
import type { CustomArchenemyCard, CustomArchenemyDeck } from "~/types";

/**
 * Built-in scheme decks anyone can play, signed in or not. They are built
 * from the archenemy_cards table (readable without an account), so there is
 * nothing to seed. IDs are not UUIDs, which keeps them from ever colliding
 * with user decks in archenemy_decks.
 */
export const DEFAULT_DECK_ID_PREFIX = "default-";

export function isDefaultDeckId(deckId: string): boolean {
  return deckId.startsWith(DEFAULT_DECK_ID_PREFIX);
}

type DefaultDeckDefinition = {
  id: string;
  name: string;
  description: string;
  includes: (card: CustomArchenemyCard) => boolean;
};

// The 20 schemes in Archenemy: Nicol Bolas (2017), per Scryfall's oe01 set.
// Matched by name because four of them are stored under their Duskmourn
// Commander reprints.
const NICOL_BOLAS_SCHEMES = new Set([
  "A Reckoning Approaches",
  "Because I Have Willed It",
  "Behold My Grandeur",
  "Bow to My Command",
  "Choose Your Demise",
  "Delight in the Hunt",
  "Every Dream a Nightmare",
  "For Each of You, a Gift",
  "Know Evil",
  "Make Yourself Useful",
  "My Forces Are Innumerable",
  "My Laughter Echoes",
  "No One Will Hear Your Cries",
  "Pay Tribute to Me",
  "Power Without Equal",
  "The Mighty Will Fall",
  "There Is No Refuge",
  "This World Belongs to Me",
  "What's Yours Is Now Mine",
  "When Will You Learn?",
]);

export const DEFAULT_DECK_DEFINITIONS: DefaultDeckDefinition[] = [
  {
    id: `${DEFAULT_DECK_ID_PREFIX}nicol-bolas`,
    name: "Archenemy: Nicol Bolas",
    description: "The 20 schemes from the 2017 Archenemy: Nicol Bolas deck.",
    includes: (card) => NICOL_BOLAS_SCHEMES.has(card.name),
  },
  {
    id: `${DEFAULT_DECK_ID_PREFIX}classic`,
    name: "Classic Archenemy",
    description:
      "Every scheme from the original 2010 Archenemy release, shuffled together.",
    includes: (card) => card.set === "oarc",
  },
  {
    id: `${DEFAULT_DECK_ID_PREFIX}duskmourn`,
    name: "Duskmourn Schemes",
    description:
      "All 40 schemes from the Duskmourn: House of Horror Commander decks.",
    includes: (card) => card.set === "dsc",
  },
];

/** Pure: build the default decks from a list of scheme cards. */
export function buildDefaultDecks(
  cards: CustomArchenemyCard[]
): CustomArchenemyDeck[] {
  return DEFAULT_DECK_DEFINITIONS.map((definition) => ({
    id: definition.id,
    name: definition.name,
    description: definition.description,
    user_id: "",
    created_at: "",
    updated_at: "",
    deck_cards: uniqueByName(cards.filter(definition.includes)).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  })).filter((deck) => deck.deck_cards.length > 0);
}

// One copy of each scheme, even if the table holds several printings.
function uniqueByName(cards: CustomArchenemyCard[]): CustomArchenemyCard[] {
  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.name)) return false;
    seen.add(card.name);
    return true;
  });
}

let cache: Promise<CustomArchenemyDeck[]> | null = null;

/** Default decks, fetched once per page load. */
export function getDefaultArchenemyDecks(): Promise<CustomArchenemyDeck[]> {
  if (!cache) {
    cache = getAllCards()
      .then((cards) => buildDefaultDecks(cards as CustomArchenemyCard[]))
      .catch((error) => {
        cache = null; // let a later call retry
        throw error;
      });
  }
  return cache;
}
