import {
  IconBiohazard,
  IconBolt,
  IconChevronsUp,
  IconCrown,
  IconFlag,
  IconRadioactive,
  IconSkull,
} from "@tabler/icons-react";
import { LETHAL_POISON } from "./turns";

/** Per-player counters. Add one here and it appears everywhere. */
export const PLAYER_COUNTERS = [
  {
    key: "poison",
    label: "Poison",
    icon: IconBiohazard,
    color: "lime",
    hint: `${LETHAL_POISON} poison counters and you lose.`,
  },
  {
    key: "commanderCasts",
    label: "Commander tax",
    icon: IconSkull,
    color: "grape",
    hint: "Count each cast from the command zone; tax is +2 per cast.",
  },
  {
    key: "energy",
    label: "Energy",
    icon: IconBolt,
    color: "yellow",
    hint: undefined,
  },
  {
    key: "experience",
    label: "Experience",
    icon: IconChevronsUp,
    color: "blue",
    hint: undefined,
  },
  {
    key: "rad",
    label: "Rad",
    icon: IconRadioactive,
    color: "green",
    hint: "At the start of your precombat main phase, mill that many cards.",
  },
] as const;

export type CounterKey = (typeof PLAYER_COUNTERS)[number]["key"];
export type PlayerCounters = Partial<Record<CounterKey, number>>;

/** What a counter's badge shows: commander tax is 2 per cast. */
export function counterDisplayValue(key: CounterKey, value: number): string {
  return key === "commanderCasts" ? `+${value * 2}` : String(value);
}

/** Table-wide markers that exactly one player (or nobody) holds. */
export const TABLE_ROLES = [
  { key: "monarch", label: "The monarch", icon: IconCrown, color: "yellow" },
  {
    key: "initiative",
    label: "The initiative",
    icon: IconFlag,
    color: "orange",
  },
] as const;

export type TableRole = (typeof TABLE_ROLES)[number]["key"];
