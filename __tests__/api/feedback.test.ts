/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

// --- Mocks -----------------------------------------------------------------
// Counts returned by the rate-limit queries, in the order the route issues
// them: per-IP short window, per-IP day, global day, emailed today.
let counts = [0, 0, 0, 0];
const inserted: Record<string, unknown>[] = [];
const sendEmail = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => {
    let countCall = 0;
    const countQuery = () => {
      const index = countCall++;
      const query = {
        gte: () => query,
        eq: () => query,
        then: (resolve: (v: unknown) => unknown) =>
          resolve({ count: counts[index], error: null }),
      };
      return query;
    };
    return {
      from: () => ({
        select: (_cols: string, opts?: { head?: boolean }) =>
          opts?.head ? countQuery() : null,
        insert: (row: Record<string, unknown>) => {
          inserted.push(row);
          return {
            select: () => ({
              single: async () => ({ data: { id: "row-1" }, error: null }),
            }),
          };
        },
        update: () => ({ eq: async () => ({ error: null }) }),
      }),
    };
  },
}));
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (args: unknown) => sendEmail(args) },
  })),
}));
jest.mock("~/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

let recaptcha = { success: true, score: 0.9, action: "feedback" };
global.fetch = jest.fn(async () => ({
  json: async () => recaptcha,
})) as unknown as typeof fetch;

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
process.env.RECAPTCHA_SECRET_KEY = "recaptcha-secret";
process.env.RESEND_API_KEY = "resend-key";

import { POST } from "~/app/api/feedback/route";

const valid = {
  category: "bug",
  message: "The life tracker resets when I rotate my phone.",
  replyEmail: "player@example.com",
  pageUrl: "/game",
  website: "",
  recaptchaToken: "token",
};

function request(body: unknown, headers: Record<string, string> = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return new NextRequest("http://localhost/api/feedback", {
    method: "POST",
    body: text,
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
      ...headers,
    },
  });
}

beforeEach(() => {
  counts = [0, 0, 0, 0];
  inserted.length = 0;
  sendEmail.mockReset().mockResolvedValue({ data: { id: "e" }, error: null });
  recaptcha = { success: true, score: 0.9, action: "feedback" };
});

// --- Tests -----------------------------------------------------------------
describe("POST /api/feedback", () => {
  it("stores and emails valid feedback, replying to the sender", async () => {
    const response = await POST(request(valid));
    expect(response.status).toBe(200);
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({ category: "bug", user_id: null });
    // Raw IPs are never stored.
    expect(JSON.stringify(inserted[0])).not.toContain("203.0.113.7");
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "helloignorami@gmail.com",
        replyTo: "player@example.com",
      })
    );
  });

  it("escapes HTML in the email body", async () => {
    await POST(request({ ...valid, message: "<script>alert(1)</script> hi" }));
    const { html } = sendEmail.mock.calls[0][0];
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("silently drops honeypot submissions", async () => {
    const response = await POST(request({ ...valid, website: "spam.biz" }));
    expect(response.status).toBe(200);
    expect(inserted).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects oversized bodies before parsing", async () => {
    const huge = JSON.stringify({ ...valid, message: "x".repeat(20_000) });
    const response = await POST(request(huge));
    expect(response.status).toBe(413);
    expect(inserted).toHaveLength(0);
  });

  it("rejects invalid input", async () => {
    expect((await POST(request({ ...valid, message: "short" }))).status).toBe(
      400
    );
    expect((await POST(request({ ...valid, category: "x" }))).status).toBe(400);
    expect((await POST(request("not json"))).status).toBe(400);
  });

  it("rejects failed or low-score reCAPTCHA", async () => {
    recaptcha = { success: true, score: 0.1, action: "feedback" };
    expect((await POST(request(valid))).status).toBe(403);
    recaptcha = { success: true, score: 0.9, action: "signup" };
    expect((await POST(request(valid))).status).toBe(403);
    expect(inserted).toHaveLength(0);
  });

  it("rate-limits per IP", async () => {
    counts = [3, 3, 3, 0];
    const response = await POST(request(valid));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("600");
    expect(inserted).toHaveLength(0);
  });

  it("caps total submissions per day", async () => {
    counts = [0, 0, 300, 0];
    expect((await POST(request(valid))).status).toBe(429);
  });

  it("stores but doesn't email once the daily email cap is hit", async () => {
    counts = [0, 0, 60, 50];
    const response = await POST(request(valid));
    expect(response.status).toBe(200);
    expect(inserted).toHaveLength(1);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("still succeeds if the email fails (feedback is stored)", async () => {
    sendEmail.mockResolvedValue({ data: null, error: { message: "down" } });
    jest.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(request(valid));
    expect(response.status).toBe(200);
    expect(inserted).toHaveLength(1);
  });
});
