import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { createServerSupabaseClient } from "~/lib/supabase/server";
import {
  escapeHtml,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_LIMITS,
  FEEDBACK_RATE_LIMITS,
  parseFeedback,
} from "~/lib/feedback/validation";

// Abuse protection for the public feedback form, cheapest checks first:
// size limit -> honeypot -> validation -> reCAPTCHA -> per-IP and global
// rate limits (stored in Supabase, since serverless memory doesn't persist)
// -> store -> email, under a daily email cap. Volumetric DDoS is handled by
// Vercel's platform protection before requests reach this code.

const TO_EMAIL = process.env.FEEDBACK_TO_EMAIL || "helloignorami@gmail.com";
// Resend's shared sender works without verifying a domain, but only delivers
// to the Resend account's own address. Verify magicsak.com to change this.
const FROM_EMAIL =
  process.env.FEEDBACK_FROM_EMAIL ||
  "MagicSAK Feedback <onboarding@resend.dev>";
const MIN_RECAPTCHA_SCORE = 0.5;

function json(status: number, body: Record<string, unknown>, headers = {}) {
  return NextResponse.json(body, { status, headers });
}

function clientIp(request: NextRequest): string {
  // Vercel sets x-forwarded-for; the first entry is the client.
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Keyed hash so stored values can't be reversed to IPs by brute force.
function hashIp(ip: string): string {
  const key =
    process.env.FEEDBACK_IP_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createHmac("sha256", key).update(ip).digest("hex");
}

async function verifyRecaptcha(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    // Fail closed in production; allow local development without keys.
    return process.env.NODE_ENV !== "production";
  }
  if (typeof token !== "string" || !token) return false;

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      }
    );
    const result = (await response.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
    };
    return (
      result.success === true &&
      result.action === "feedback" &&
      (result.score ?? 0) >= MIN_RECAPTCHA_SCORE
    );
  } catch {
    return false;
  }
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

export async function POST(request: NextRequest) {
  // 1. Size: refuse oversized bodies before reading them.
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > FEEDBACK_LIMITS.bodyBytesMax) {
    return json(413, { error: "That's too long to send." });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json(415, { error: "Invalid request." });
  }
  const raw = await request.text();
  if (raw.length > FEEDBACK_LIMITS.bodyBytesMax) {
    return json(413, { error: "That's too long to send." });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "Invalid request." });
  }

  // 2. Honeypot: a hidden field people never fill in. Pretend it worked so
  // bots don't learn to skip it.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json(200, { ok: true });
  }

  // 3. Validation.
  const parsed = parseFeedback(body);
  if (!parsed.ok) return json(400, { error: parsed.error });
  const feedback = parsed.data;

  // 4. reCAPTCHA.
  const ip = clientIp(request);
  if (!(await verifyRecaptcha(body.recaptchaToken, ip))) {
    return json(403, {
      error: "We couldn't verify you're human. Refresh the page and try again.",
    });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    console.error("feedback: SUPABASE_SERVICE_ROLE_KEY is not configured");
    return json(500, { error: "Feedback is unavailable right now." });
  }
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const ipHash = hashIp(ip);

  // 5. Rate limits.
  const count = async (filters: { ipHash?: string; since: string }) => {
    let query = admin
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .gte("created_at", filters.since);
    if (filters.ipHash) query = query.eq("ip_hash", filters.ipHash);
    const { count: n, error } = await query;
    if (error) throw error;
    return n ?? 0;
  };

  let emailsToday = 0;
  try {
    const [ipShort, ipDaily, globalDaily, emailedToday] = await Promise.all([
      count({
        ipHash,
        since: minutesAgo(FEEDBACK_RATE_LIMITS.shortWindowMinutes),
      }),
      count({ ipHash, since: minutesAgo(24 * 60) }),
      count({ since: minutesAgo(24 * 60) }),
      admin
        .from("feedback")
        .select("id", { count: "exact", head: true })
        .eq("emailed", true)
        .gte("created_at", minutesAgo(24 * 60))
        .then(({ count: n, error }) => {
          if (error) throw error;
          return n ?? 0;
        }),
    ]);
    emailsToday = emailedToday;

    if (
      ipShort >= FEEDBACK_RATE_LIMITS.perIpShort ||
      ipDaily >= FEEDBACK_RATE_LIMITS.perIpDaily
    ) {
      return json(
        429,
        { error: "You've sent a lot of feedback recently. Try again later." },
        { "Retry-After": String(FEEDBACK_RATE_LIMITS.shortWindowMinutes * 60) }
      );
    }
    if (globalDaily >= FEEDBACK_RATE_LIMITS.globalDaily) {
      return json(
        429,
        { error: "We're getting a lot of feedback today. Try again tomorrow." },
        { "Retry-After": String(24 * 60 * 60) }
      );
    }
  } catch (error) {
    console.error("feedback: rate limit check failed", error);
    return json(500, { error: "Feedback is unavailable right now." });
  }

  // Attach the account if signed in (optional; anonymous feedback is fine).
  let userId: string | null = null;
  let username: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
    username = (user?.user_metadata?.username as string | undefined) ?? null;
  } catch {
    // Treat as anonymous.
  }

  // 6. Store first, so nothing is lost if the email fails.
  const { data: row, error: insertError } = await admin
    .from("feedback")
    .insert({
      user_id: userId,
      category: feedback.category,
      message: feedback.message,
      reply_email: feedback.replyEmail,
      page_url: feedback.pageUrl,
      user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      ip_hash: ipHash,
    })
    .select("id")
    .single();

  if (insertError || !row) {
    console.error("feedback: insert failed", insertError);
    return json(500, { error: "Feedback is unavailable right now." });
  }

  // 7. Email, under the daily cap.
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && emailsToday < FEEDBACK_RATE_LIMITS.emailsDaily) {
    try {
      const label = FEEDBACK_CATEGORY_LABELS[feedback.category];
      const from = username ? `${username} (signed in)` : "Anonymous visitor";
      const lines = [
        `Type: ${label}`,
        `From: ${from}`,
        `Reply to: ${feedback.replyEmail ?? "not provided"}`,
        `Page: ${feedback.pageUrl ?? "unknown"}`,
        "",
        feedback.message,
      ];
      const { error: sendError } = await new Resend(resendKey).emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: feedback.replyEmail ?? undefined,
        subject: `MagicSAK feedback: ${label}`,
        text: lines.join("\n"),
        html: `<div style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(
          lines.join("\n")
        )}</div>`,
      });
      if (sendError) throw sendError;
      await admin.from("feedback").update({ emailed: true }).eq("id", row.id);
    } catch (error) {
      // Stored already; just log. The person still gets a success message.
      console.error("feedback: email failed", error);
    }
  }

  return json(200, { ok: true });
}
