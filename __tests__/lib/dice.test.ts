import {
  MAX_DICE_PER_ROLL,
  PLANAR_FACES,
  rollDice,
  STANDARD_DICE,
} from "~/lib/dice";
import { randomInt } from "~/lib/random";

// Deterministic source that returns the given values in order.
const sequence = (...values: number[]) => {
  let i = 0;
  return (max: number) => values[i++ % values.length] % max;
};

describe("rollDice", () => {
  it("returns 1-based values and their total", () => {
    const roll = rollDice(6, 3, sequence(0, 5, 2));
    expect(roll.results.map((r) => r.kind === "standard" && r.value)).toEqual([
      1, 6, 3,
    ]);
    expect(roll.total).toBe(10);
  });

  it("clamps the number of dice to 1..MAX", () => {
    expect(rollDice(20, 0, sequence(0)).results).toHaveLength(1);
    expect(rollDice(20, 99, sequence(0)).results).toHaveLength(
      MAX_DICE_PER_ROLL
    );
  });

  it("rolls planar faces without a total", () => {
    const roll = rollDice("planar", 2, sequence(4, 5));
    expect(roll.results).toEqual([
      { kind: "planar", face: "planeswalk" },
      { kind: "planar", face: "chaos" },
    ]);
    expect(roll.total).toBeNull();
  });
});

describe("randomInt", () => {
  it("stays in range and covers every face of every die", () => {
    for (const sides of [...STANDARD_DICE, PLANAR_FACES.length]) {
      const seen = new Set<number>();
      for (let i = 0; i < 2000; i++) {
        const v = randomInt(sides);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(sides);
        seen.add(v);
      }
      expect(seen.size).toBe(sides);
    }
  });

  it("rejects invalid ranges", () => {
    expect(() => randomInt(0)).toThrow();
    expect(() => randomInt(2.5)).toThrow();
  });
});

describe("rollLabel", () => {
  it("reads naturally", () => {
    const { rollLabel } = jest.requireActual("~/lib/dice");
    expect(rollLabel(20, 1)).toBe("d20");
    expect(rollLabel(6, 3)).toBe("3d6");
    expect(rollLabel("planar", 1)).toBe("Planar die");
    expect(rollLabel("planar", 2)).toBe("2 planar dice");
  });
});
