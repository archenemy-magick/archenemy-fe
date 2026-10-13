"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconCheck, IconSend } from "@tabler/icons-react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useSelector } from "react-redux";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_LIMITS,
  parseFeedback,
  type FeedbackCategory,
} from "~/lib/feedback/validation";
import type { RootState } from "~/store";

export function FeedbackForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const signedInEmail = useSelector((state: RootState) => state.user.email);

  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [message, setMessage] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  // Honeypot: hidden from people, often filled in by bots.
  const [website, setWebsite] = useState("");
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (signedInEmail) setReplyEmail((current) => current || signedInEmail);
  }, [signedInEmail]);

  // Which page they came from, if it was on this site. Helps with bug reports.
  useEffect(() => {
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      if (referrer && referrer.origin === window.location.origin) {
        setPageUrl(referrer.pathname + referrer.search);
      }
    } catch {
      // Ignore malformed referrers.
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const local = parseFeedback({ category, message, replyEmail, pageUrl });
    if (!local.ok) {
      setError(local.error);
      return;
    }

    setSubmitting(true);
    try {
      const recaptchaToken = executeRecaptcha
        ? await executeRecaptcha("feedback")
        : null;
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message,
          replyEmail,
          pageUrl,
          website,
          recaptchaToken,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Couldn't send your feedback. Check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Card withBorder padding="xl">
        <Stack gap="sm" align="flex-start">
          <Alert color="green" icon={<IconCheck size={18} />} w="100%">
            Thanks! Your feedback was sent.
          </Alert>
          <Button
            variant="subtle"
            onClick={() => {
              setSent(false);
              setMessage("");
            }}
          >
            Send more feedback
          </Button>
        </Stack>
      </Card>
    );
  }

  const remaining = FEEDBACK_LIMITS.messageMax - message.length;

  return (
    <Card withBorder padding="lg" component="form" onSubmit={handleSubmit}>
      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb={6}>
            What kind of feedback?
          </Text>
          <SegmentedControl
            fullWidth
            value={category}
            onChange={(value) => setCategory(value as FeedbackCategory)}
            data={FEEDBACK_CATEGORIES.map((value) => ({
              value,
              label: FEEDBACK_CATEGORY_LABELS[value],
            }))}
          />
        </div>

        <Textarea
          label="Message"
          placeholder={
            category === "bug"
              ? "What happened, and what did you expect instead?"
              : "Tell us what's on your mind."
          }
          required
          autosize
          minRows={5}
          maxLength={FEEDBACK_LIMITS.messageMax}
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
          description={
            remaining < 500 ? `${remaining} characters left` : undefined
          }
        />

        <TextInput
          label="Your email"
          description="Optional. Only used if we need to reply."
          type="email"
          placeholder="you@example.com"
          maxLength={FEEDBACK_LIMITS.emailMax}
          value={replyEmail}
          onChange={(event) => setReplyEmail(event.currentTarget.value)}
        />

        {/* Honeypot. Off-screen rather than display:none, which some bots
            detect. Hidden from screen readers and keyboard users. */}
        <Box
          aria-hidden="true"
          style={{ position: "absolute", left: "-10000px", top: "auto" }}
        >
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.currentTarget.value)}
            />
          </label>
        </Box>

        {error ? <Alert color="red">{error}</Alert> : null}

        <Button
          type="submit"
          loading={submitting}
          leftSection={<IconSend size={16} />}
          style={{ alignSelf: "flex-start" }}
        >
          Send feedback
        </Button>
      </Stack>
    </Card>
  );
}
