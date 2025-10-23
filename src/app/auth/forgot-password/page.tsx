"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Container,
  Stack,
  Title,
  Text,
  TextInput,
  Button,
  Paper,
  Alert,
  Anchor,
} from "@mantine/core";
import {
  IconMailForward,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      notifications.show({
        title: "Email Sent!",
        message: "Check your inbox for password reset instructions.",
        color: "green",
        icon: <IconCheck />,
      });
    } catch (error: unknown) {
      console.error("Error sending reset email:", error);
      notifications.show({
        title: "Error",
        message:
          (error as Error).message ||
          "Failed to send reset email. Please try again.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="xs" style={{ marginTop: "100px" }}>
      <Paper
        withBorder
        shadow="xl"
        p={40}
        radius="lg"
        style={{ maxWidth: 420, margin: "0 auto" }}
      >
        <Stack gap="md">
          <div style={{ textAlign: "center" }}>
            <IconMailForward
              size={48}
              color="var(--mantine-color-magenta-6)"
              style={{ marginBottom: 16 }}
            />
            <Title order={2} mb="xs">
              Forgot Password?
            </Title>
            <Text size="sm" c="dimmed">
              {emailSent
                ? "We've sent you an email"
                : "Enter your email to reset your password"}
            </Text>
          </div>

          {emailSent ? (
            <>
              <Alert
                icon={<IconCheck size={16} />}
                title="Check Your Email!"
                color="green"
                variant="light"
              >
                <Stack gap="sm">
                  <Text size="sm">
                    We&apos;ve sent password reset instructions to{" "}
                    <strong>{email}</strong>
                  </Text>
                  <Text size="sm">
                    Click the link in the email to reset your password.
                  </Text>
                  <Text size="xs" c="dimmed">
                    Can&apos;t find the email? Check your spam folder.
                  </Text>
                </Stack>
              </Alert>

              <Stack gap="sm">
                <Button
                  variant="light"
                  fullWidth
                  onClick={() => router.push("/signin")}
                >
                  Back to Sign In
                </Button>
                <Button
                  variant="subtle"
                  fullWidth
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                >
                  Try a different email
                </Button>
              </Stack>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="md"
                />

                <Button
                  fullWidth
                  type="submit"
                  loading={isSubmitting}
                  size="lg"
                  gradient={{ from: "magenta", to: "grape", deg: 135 }}
                  variant="gradient"
                >
                  Send Reset Link
                </Button>

                <Text ta="center" size="sm" c="dimmed">
                  Remember your password?{" "}
                  <Anchor href="/signin" c="pink" fw={500}>
                    Sign In
                  </Anchor>
                </Text>
              </Stack>
            </form>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
