import {
  buildDefaultDecks,
  DEFAULT_DECK_DEFINITIONS,
  isDefaultDeckId,
} from "~/lib/archenemy/defaultDecks";
import type { CustomArchenemyCard } from "~/types";

const card = (name: string, set: string, id = `${set}-${name}`) =>
  ({ id, name, set } as CustomArchenemyCard);

describe("buildDefaultDecks", () => {
  it("builds Nicol Bolas by name, whatever set the printing is from", () => {
    const decks = buildDefaultDecks([
      card("Behold My Grandeur", "oe01"),
      // Stored under its Duskmourn reprint, still part of the Bolas deck.
      card("When Will You Learn?", "dsc"),
      card("Some Other Scheme", "oe01"),
    ]);
    const bolas = decks.find((d) => d.id === "default-nicol-bolas");
    expect(bolas?.deck_cards.map((c) => c.name)).toEqual([
      "Behold My Grandeur",
      "When Will You Learn?",
    ]);
  });

  it("builds set-based decks and keeps one copy of each scheme", () => {
    const decks = buildDefaultDecks([
      card("Dark Wings Bring Your Downfall", "dsc"),
      card("Dark Wings Bring Your Downfall", "dsc", "second-printing"),
      card("All in Good Time", "oarc"),
    ]);
    const duskmourn = decks.find((d) => d.id === "default-duskmourn");
    expect(duskmourn?.deck_cards).toHaveLength(1);
    expect(
      decks.find((d) => d.id === "default-classic")?.deck_cards
    ).toHaveLength(1);
  });

  it("drops decks with no cards", () => {
    expect(buildDefaultDecks([card("All in Good Time", "oarc")])).toHaveLength(
      1
    );
  });

  it("uses ids that cannot collide with user deck UUIDs", () => {
    for (const { id } of DEFAULT_DECK_DEFINITIONS) {
      expect(isDefaultDeckId(id)).toBe(true);
    }
    expect(isDefaultDeckId("3f1c2d4e-0000-4000-8000-000000000000")).toBe(false);
  });
});
