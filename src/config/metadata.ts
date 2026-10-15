import type { Metadata } from "next";

// Centralized metadata for pages that don't define their own. Titles get
// the " | MagicSAK" suffix from the root layout's title template.
//
// Next stops applying a parent's title template below any layout that sets a
// plain string title. Layouts with child pages (archenemy, myDecks) therefore
// re-declare the template so nested pages keep the suffix.
const TITLE_TEMPLATE = "%s | MagicSAK";

export const pageMetadata = {
  home: {
    title: "Home",
    description:
      "Game utilities and stats for Magic: The Gathering. Track life totals, run Archenemy and dungeons, record your games, and see your win rate, best decks, and colors.",
  } as Metadata,

  gameUtilities: {
    title: "Game Utilities",
    description:
      "Free Magic: The Gathering game utilities: life tracker, Archenemy, dungeons, coin flipper, and dice roller. Run several at once in tabs. No account needed.",
  } as Metadata,

  archenemy: {
    title: { default: "Archenemy", template: TITLE_TEMPLATE },
    description:
      "Everything for Magic: The Gathering Archenemy: built-in scheme decks, community decks, popular schemes, and a deck builder.",
  } as Metadata,

  builtInDecks: {
    title: "Built-in Archenemy Decks",
    description:
      "Ready-to-play Archenemy scheme decks, including Archenemy: Nicol Bolas. No account needed.",
  } as Metadata,

  deckDetail: {
    title: "Archenemy Deck",
    description:
      "View this Archenemy scheme deck's cards and play it in MagicSAK's Archenemy utility.",
  } as Metadata,

  deckBuilder: {
    title: "Archenemy Deck Builder",
    description:
      "Create and customize your Magic: The Gathering Archenemy scheme decks.",
  } as Metadata,

  myDecks: {
    title: { default: "My Archenemy Decks", template: TITLE_TEMPLATE },
    description:
      "View, play, and manage your Magic: The Gathering Archenemy scheme decks.",
  } as Metadata,

  publicDecks: {
    title: "Community Archenemy Decks",
    description:
      "Browse Archenemy scheme decks shared by the MagicSAK community, and play any of them in a click.",
  } as Metadata,

  popularCards: {
    title: "Popular Archenemy Cards",
    description:
      "The most-played Archenemy scheme cards in the MagicSAK community.",
  } as Metadata,

  articles: {
    title: "Articles",
    description:
      "Magic: The Gathering articles, strategy, and deck ideas from MagicSAK.",
  } as Metadata,

  signUp: {
    title: "Sign Up",
    description:
      "Create a free MagicSAK account to record your Magic games, track your stats, add friends, and build Archenemy decks.",
  } as Metadata,

  signIn: {
    title: "Sign In",
    description:
      "Sign in to MagicSAK to see your stats, record games, and manage your decks.",
  } as Metadata,
};
