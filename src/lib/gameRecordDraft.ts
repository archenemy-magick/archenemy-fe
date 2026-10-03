import type { RecordGameDraft } from "~/types/recordedGame";

const DRAFT_KEY = "magicsak.record-game-draft";

export function saveRecordGameDraft(draft: RecordGameDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function consumeRecordGameDraft(): RecordGameDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(DRAFT_KEY);
  try {
    return JSON.parse(raw) as RecordGameDraft;
  } catch {
    return null;
  }
}
