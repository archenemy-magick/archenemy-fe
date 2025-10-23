"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Container, Stack, Title, Text, Loader, Alert } from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const confirmEmail = async () => {
      // Create Supabase client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      try {
        // Get the token hash from URL
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (!token_hash || type !== "signup") {
          setStatus("error");
          setErrorMessage("Invalid confirmation link");
          setTimeout(() => router.push("/signin"), 3000);
          return;
        }

        // Verify the OTP
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "signup",
        });

        if (error) {
          console.error("Error confirming email:", error);
          setStatus("error");
          setErrorMessage(error.message || "Failed to confirm email");
          setTimeout(() => router.push("/signin"), 3000);
          return;
        }

        if (data.session) {
          // Success! User is confirmed and logged in
          setStatus("success");
          setTimeout(() => router.push("/decks"), 2000);
        } else {
          setStatus("error");
          setErrorMessage("No session created");
          setTimeout(() => router.push("/signin"), 3000);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setStatus("error");
        setErrorMessage("An unexpected error occurred");
        setTimeout(() => router.push("/signin"), 3000);
      }
    };

    confirmEmail();
  }, [router, searchParams]);

  return (
    <Container size="xs" style={{ marginTop: "100px" }}>
      <Stack align="center" gap="lg">
        {status === "loading" && (
          <>
            <Loader size="xl" color="magenta" />
            <Title order={2}>Confirming your email...</Title>
            <Text c="dimmed" ta="center">
              Please wait while we verify your account.
            </Text>
          </>
        )}

        {status === "success" && (
          <>
            <IconCheck size={64} color="green" />
            <Title order={2}>Email Confirmed! 🎉</Title>
            <Text c="dimmed" ta="center">
              Your account is now active. Redirecting you to your decks...
            </Text>
          </>
        )}

        {status === "error" && (
          <>
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Confirmation Failed"
              color="red"
              variant="light"
            >
              {errorMessage ||
                "Something went wrong. Please try again or contact support."}
            </Alert>
            <Text size="sm" c="dimmed">
              Redirecting to sign in...
            </Text>
          </>
        )}
      </Stack>
    </Container>
  );
}
