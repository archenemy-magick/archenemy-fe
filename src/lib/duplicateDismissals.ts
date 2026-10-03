// "Not a duplicate" choices are a per-device convenience; losing them only
// means a flag reappears.
const STORAGE_KEY = "magicsak.dismissed-duplicate-pairs";

export function loadDismissedPairs(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

export function saveDismissedPairs(pairs: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...pairs]));
  } catch {
    // Storage unavailable (private mode, blocked); keep the in-memory state.
  }
}
