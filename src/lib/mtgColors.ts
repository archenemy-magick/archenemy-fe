import { MTG_COLORS, type MtgColor } from "~/types/recordedGame";

export const COLOR_META: Record<
  MtgColor,
  { label: string; name: string; fill: string; text: string }
> = {
  W: { label: "W", name: "White", fill: "#F8F6D8", text: "#5C4A12" },
  U: { label: "U", name: "Blue", fill: "#0E68AB", text: "#FFFFFF" },
  B: { label: "B", name: "Black", fill: "#150B00", text: "#FFFFFF" },
  R: { label: "R", name: "Red", fill: "#D3202A", text: "#FFFFFF" },
  G: { label: "G", name: "Green", fill: "#00733E", text: "#FFFFFF" },
};

/** An empty color identity. Not a color in the data model: colors = []. */
export const COLORLESS_META = {
  label: "C",
  name: "Colorless",
  fill: "#C4C4C4",
  text: "#222222",
};

export function sortColors(colors: readonly string[]): MtgColor[] {
  return MTG_COLORS.filter((color) => colors.includes(color));
}

export function colorIdentityKey(colors: readonly string[]): string {
  const sorted = sortColors(colors);
  return sorted.length === 0 ? "C" : sorted.join("");
}

export function colorIdentityLabel(colors: readonly string[]): string {
  const sorted = sortColors(colors);
  if (sorted.length === 0) return "Colorless";
  return sorted.map((color) => COLOR_META[color].name).join(" / ");
}
