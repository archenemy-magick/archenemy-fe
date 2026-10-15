import { randomInt as defaultRandomInt, type RandomInt } from "~/lib/random";

export const STANDARD_DICE = [4, 6, 8, 10, 12, 20] as const;
export type StandardDie = (typeof STANDARD_DICE)[number];
export type DieKind = StandardDie | "planar";

/** The Planechase planar die: four blank faces, one planeswalk, one chaos. */
export const PLANAR_FACES = [
  "blank",
  "blank",
  "blank",
  "blank",
  "planeswalk",
  "chaos",
] as const;
export type PlanarFace = (typeof PLANAR_FACES)[number];

export type DieResult =
  | { kind: "standard"; sides: StandardDie; value: number }
  | { kind: "planar"; face: PlanarFace };

export type Roll = {
  id: string;
  die: DieKind;
  results: DieResult[];
  /** Sum of standard dice; null for planar rolls. */
  total: number | null;
  timestamp: number;
};

export const MAX_DICE_PER_ROLL = 10;

export function rollDice(
  die: DieKind,
  count: number,
  randomInt: RandomInt = defaultRandomInt,
  now: number = Date.now()
): Roll {
  const n = Math.min(Math.max(Math.trunc(count), 1), MAX_DICE_PER_ROLL);
  const results: DieResult[] = Array.from({ length: n }, () =>
    die === "planar"
      ? { kind: "planar", face: PLANAR_FACES[randomInt(PLANAR_FACES.length)] }
      : { kind: "standard", sides: die, value: randomInt(die) + 1 }
  );
  const total =
    die === "planar"
      ? null
      : results.reduce(
          (sum, r) => sum + (r.kind === "standard" ? r.value : 0),
          0
        );
  return {
    id: `${now}-${randomInt(1_000_000)}`,
    die,
    results,
    total,
    timestamp: now,
  };
}

export function dieLabel(die: DieKind): string {
  return die === "planar" ? "Planar die" : `d${die}`;
}

/** "d20", "3d6", "Planar die", "2 planar dice". */
export function rollLabel(die: DieKind, count: number): string {
  if (die === "planar")
    return count > 1 ? `${count} planar dice` : "Planar die";
  return count > 1 ? `${count}d${die}` : `d${die}`;
}
