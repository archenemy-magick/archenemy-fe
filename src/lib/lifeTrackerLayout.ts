export type LifeTrackerView = "same" | "outward";

/**
 * Card layout for the life tracker.
 *
 * "same": every card faces the phone's owner.
 * "outward": for a phone lying flat in the middle of the table, the top half
 * of the rows is turned 180° so the players sitting across can read their
 * own totals. Two players get one column (one at each end of the phone).
 */
export function lifeTrackerLayout(playerCount: number, view: LifeTrackerView) {
  if (view === "same") {
    return { cols: 2, isFlipped: () => false };
  }
  const cols = playerCount <= 2 ? 1 : 2;
  const rows = Math.ceil(playerCount / cols);
  const flippedRows = Math.floor(rows / 2);
  return {
    cols,
    isFlipped: (index: number) => Math.floor(index / cols) < flippedRows,
  };
}
