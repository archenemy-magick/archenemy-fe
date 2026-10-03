import { sortColors } from "~/lib/mtgColors";
import type { MtgColor } from "~/types/recordedGame";

const SCRYFALL_API = "https://api.scryfall.com";

// Scryfall asks API clients to send an explicit Accept header.
const HEADERS = { Accept: "application/json" };

/**
 * Card names that are legal commanders and match a partial name.
 * Returns an empty list on network/API failure so the input still works
 * as a plain text field.
 */
export async function searchCommanderNames(
  partial: string,
  signal?: AbortSignal
): Promise<string[]> {
  const query = partial.trim();
  if (query.length < 2) return [];

  const params = new URLSearchParams({
    q: `is:commander name:"${query.replace(/"/g, "")}"`,
    order: "edhrec",
    unique: "cards",
  });

  try {
    const response = await fetch(`${SCRYFALL_API}/cards/search?${params}`, {
      headers: HEADERS,
      signal,
    });
    // 404 means "no matches" in Scryfall's search API.
    if (!response.ok) return [];
    const body = (await response.json()) as { data?: { name: string }[] };
    return (body.data ?? []).slice(0, 10).map((card) => card.name);
  } catch {
    return [];
  }
}

/** Color identity for an exact card name, or null if it cannot be found. */
export async function getColorIdentity(
  cardName: string,
  signal?: AbortSignal
): Promise<MtgColor[] | null> {
  const params = new URLSearchParams({ exact: cardName.trim() });

  try {
    const response = await fetch(`${SCRYFALL_API}/cards/named?${params}`, {
      headers: HEADERS,
      signal,
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { color_identity?: string[] };
    return sortColors(body.color_identity ?? []);
  } catch {
    return null;
  }
}
