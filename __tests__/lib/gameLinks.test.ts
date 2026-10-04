import {
  gameUtilityHref,
  parseGameUtilityParams,
  playArchenemyDeckHref,
} from "~/lib/gameLinks";

describe("game utility links", () => {
  it("builds links that the game page can parse back", () => {
    const href = playArchenemyDeckHref("deck-123");
    expect(href).toBe("/game?utility=archenemy&deck=deck-123");
    expect(parseGameUtilityParams(href.split("?")[1])).toEqual({
      utility: "archenemy",
      deckId: "deck-123",
    });
  });

  it("links to the bare page when no utility is given", () => {
    expect(gameUtilityHref()).toBe("/game");
    expect(gameUtilityHref("life-tracker")).toBe("/game?utility=life-tracker");
  });

  it("ignores unknown utilities", () => {
    expect(parseGameUtilityParams("?utility=nope&deck=x")).toEqual({
      utility: null,
      deckId: "x",
    });
  });
});
