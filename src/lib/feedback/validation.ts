// Shared by the /feedback form and /api/feedback. The server never trusts
// the client: the API route re-validates everything with parseFeedback().

export const FEEDBACK_CATEGORIES = ["bug", "idea", "other"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "Something's broken",
  idea: "Idea or request",
  other: "Something else",
};

export const FEEDBACK_LIMITS = {
  messageMin: 10,
  messageMax: 4000,
  emailMax: 254,
  pageUrlMax: 500,
  /** Requests larger than this are rejected before parsing. */
  bodyBytesMax: 10_000,
} as const;

/** Abuse limits enforced by /api/feedback. */
export const FEEDBACK_RATE_LIMITS = {
  /** Submissions per IP in the short window. */
  perIpShort: 3,
  shortWindowMinutes: 10,
  /** Submissions per IP per day. */
  perIpDaily: 10,
  /** Submissions stored per day from everyone; beyond this, reject. */
  globalDaily: 300,
  /**
   * Emails sent per day. Kept under Resend's free tier (100/day); later
   * submissions are still stored, just not emailed.
   */
  emailsDaily: 50,
} as const;

export type FeedbackInput = {
  category: FeedbackCategory;
  message: string;
  replyEmail: string | null;
  pageUrl: string | null;
};

type ParseResult =
  | { ok: true; data: FeedbackInput }
  | { ok: false; error: string };

// Deliberately simple: one @, no spaces, a dot in the domain.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseFeedback(input: unknown): ParseResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Invalid request." };
  }
  const body = input as Record<string, unknown>;

  const category = body.category;
  if (
    typeof category !== "string" ||
    !FEEDBACK_CATEGORIES.includes(category as FeedbackCategory)
  ) {
    return { ok: false, error: "Pick a feedback type." };
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length < FEEDBACK_LIMITS.messageMin) {
    return {
      ok: false,
      error: `Please write at least ${FEEDBACK_LIMITS.messageMin} characters.`,
    };
  }
  if (message.length > FEEDBACK_LIMITS.messageMax) {
    return {
      ok: false,
      error: `Please keep it under ${FEEDBACK_LIMITS.messageMax} characters.`,
    };
  }

  const rawEmail =
    typeof body.replyEmail === "string" ? body.replyEmail.trim() : "";
  if (
    rawEmail &&
    (rawEmail.length > FEEDBACK_LIMITS.emailMax ||
      !EMAIL_PATTERN.test(rawEmail))
  ) {
    return { ok: false, error: "That email address doesn't look right." };
  }

  const rawPage = typeof body.pageUrl === "string" ? body.pageUrl.trim() : "";

  return {
    ok: true,
    data: {
      category: category as FeedbackCategory,
      message,
      replyEmail: rawEmail || null,
      pageUrl: rawPage ? rawPage.slice(0, FEEDBACK_LIMITS.pageUrlMax) : null,
    },
  };
}

/** Escape user text before putting it in the notification email's HTML. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
