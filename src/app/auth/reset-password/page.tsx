"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  Container,
  Stack,
  Title,
  Text,
  Loader,
  Alert,
  PasswordInput,
  Button,
  Paper,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconLock } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    "loading" | "ready" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (!token_hash || type !== "recovery") {
          setStatus("error");
          setErrorMessage(
            "Invalid reset link. Please request a new password reset."
          );
          return;
        }

        // Verify the recovery token
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "recovery",
        });

        if (error) {
          console.error("Error verifying token:", error);
          setStatus("error");
          setErrorMessage(
            "This reset link has expired or is invalid. Please request a new one."
          );
          return;
        }

        // Token is valid, show password form
        setStatus("ready");
      } catch (err) {
        console.error("Unexpected error:", err);
        setStatus("error");
        setErrorMessage("An unexpected error occurred");
      }
    };

    verifyToken();
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      notifications.show({
        title: "Password too short",
        message: "Password must be at least 6 characters",
        color: "red",
        icon: <IconAlertCircle />,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      notifications.show({
        title: "Passwords don't match",
        message: "Please make sure both passwords are the same",
        color: "red",
        icon: <IconAlertCircle />,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setStatus("success");
      notifications.show({
        title: "Password Updated!",
        message: "Your password has been successfully changed.",
        color: "green",
        icon: <IconCheck />,
      });

      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      notifications.show({
        title: "Error",
        message:
          (error as { message: string }).message || "Failed to update password",
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="xs" style={{ marginTop: "100px" }}>
      <Stack align="center" gap="lg">
        {status === "loading" && (
          <>
            <Loader size="xl" color="magenta" />
            <Title order={2}>Verifying reset link...</Title>
            <Text c="dimmed" ta="center">
              Please wait while we verify your password reset link.
            </Text>
          </>
        )}

        {status === "ready" && (
          <Paper
            withBorder
            shadow="xl"
            p={40}
            radius="lg"
            style={{ width: "100%", maxWidth: 420 }}
          >
            <Stack gap="md">
              <div style={{ textAlign: "center" }}>
                <IconLock
                  size={48}
                  color="var(--mantine-color-magenta-6)"
                  style={{ marginBottom: 16 }}
                />
                <Title order={2} mb="xs">
                  Create New Password
                </Title>
                <Text size="sm" c="dimmed">
                  Choose a strong password for your account
                </Text>
              </div>

              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <PasswordInput
                    label="New Password"
                    placeholder="Enter new password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    size="md"
                  />

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    size="md"
                  />

                  <Button
                    fullWidth
                    type="submit"
                    loading={isSubmitting}
                    size="lg"
                    mt="sm"
                    gradient={{ from: "magenta", to: "grape", deg: 135 }}
                    variant="gradient"
                  >
                    Update Password
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Paper>
        )}

        {status === "success" && (
          <>
            <IconCheck size={64} style={{ color: "green" }} />
            <Title order={2}>Password Updated! 🎉</Title>
            <Text c="dimmed" ta="center">
              Your password has been successfully changed. Redirecting to sign
              in...
            </Text>
          </>
        )}

        {status === "error" && (
          <>
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Reset Link Invalid"
              color="red"
              variant="light"
              style={{ width: "100%", maxWidth: 420 }}
            >
              {errorMessage}
            </Alert>
            <Button variant="light" onClick={() => router.push("/signin")}>
              Back to Sign In
            </Button>
          </>
        )}
      </Stack>
    </Container>
  );
}
