import { lifeTrackerLayout } from "~/lib/lifeTrackerLayout";

const flippedIndexes = (count: number) => {
  const layout = lifeTrackerLayout(count, "outward");
  return Array.from({ length: count }, (_, i) => i).filter(layout.isFlipped);
};

describe("lifeTrackerLayout", () => {
  it("keeps every card upright in 'same' view", () => {
    const layout = lifeTrackerLayout(4, "same");
    expect(layout.cols).toBe(2);
    expect([0, 1, 2, 3].some(layout.isFlipped)).toBe(false);
  });

  it("stacks two players and turns the top one around", () => {
    expect(lifeTrackerLayout(2, "outward").cols).toBe(1);
    expect(flippedIndexes(2)).toEqual([0]);
  });

  it("turns the top row around for three or four players", () => {
    expect(lifeTrackerLayout(4, "outward").cols).toBe(2);
    expect(flippedIndexes(3)).toEqual([0, 1]);
    expect(flippedIndexes(4)).toEqual([0, 1]);
  });

  it("turns only the top row around for five or six players", () => {
    expect(flippedIndexes(5)).toEqual([0, 1]);
    expect(flippedIndexes(6)).toEqual([0, 1]);
  });
});
