import type { Metadata } from "next";

// Centralized metadata for all pages
export const pageMetadata = {
  home: {
    title: "Home",
    description:
      "Build and play Magic: The Gathering Archenemy scheme decks and use other MTG tools.",
  } as Metadata,

  deckBuilder: {
    title: "Deck Builder",
    description:
      "Create and customize your Magic: The Gathering Archenemy scheme decks with our powerful deck builder.",
  } as Metadata,

  myDecks: {
    title: "My Decks",
    description:
      "View and manage all your Magic: The Gathering Archenemy scheme decks.",
  } as Metadata,

  publicDecks: {
    title: "Public Decks",
    description:
      "Browse and discover Archenemy scheme decks created by the MagicSAK community.",
  } as Metadata,

  popularCards: {
    title: "Popular Cards",
    description:
      "Discover the most popular Archenemy scheme cards used by the MagicSAK community.",
  } as Metadata,

  archenemyGame: {
    title: "Play Archenemy",
    description:
      "Play Magic: The Gathering Archenemy with your custom scheme decks.",
  } as Metadata,

  signUp: {
    title: "Sign Up",
    description:
      "Create your free MagicSAK account to start building Archenemy decks.",
  } as Metadata,

  signIn: {
    title: "Sign In",
    description:
      "Sign in to your MagicSAK account to access your decks and tools.",
  } as Metadata,

  // Optional: Add this if profile pages are public
  profile: {
    title: "Profile",
    description: "View user profile and their public Archenemy decks.",
  } as Metadata,
};
