"use client";

import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Stack,
  useMantineColorScheme,
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~/store/configureStore";
import { signUp, clearError } from "~/store/reducers";
import { useRouter } from "next/navigation";
import { validateUsername } from "~/lib/validation/contentFilter";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const { colorScheme } = useMantineColorScheme();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleUsernameChange = (value: string) => {
    setUsername(value);

    if (touched) {
      if (value.trim().length === 0) {
        setUsernameError("Username cannot be empty");
      } else {
        const validation = validateUsername(value);
        setUsernameError(validation.valid ? null : validation.error || null);
      }
    }
  };

  const handleUsernameBlur = () => {
    setTouched(true);

    if (username.trim().length === 0) {
      setUsernameError("Username cannot be empty");
    } else {
      const validation = validateUsername(username);
      setUsernameError(validation.valid ? null : validation.error || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      setUsernameError(usernameValidation.error || "Invalid username");
      notifications.show({
        title: "Invalid Username",
        message: usernameValidation.error || "Please enter a valid username",
        color: "red",
        icon: <IconAlertCircle />,
      });
      return;
    }

    // Execute reCAPTCHA
    if (!executeRecaptcha) {
      notifications.show({
        title: "Error",
        message: "reCAPTCHA not loaded. Please refresh and try again.",
        color: "red",
        icon: <IconAlertCircle />,
      });
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha("signup");

      const verifyResponse = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      const verifyResult = await verifyResponse.json();
      if (!verifyResult.success || verifyResult.score < 0.5) {
        notifications.show({
          title: "Verification Failed",
          message:
            "Please try again. If the problem persists, contact support.",
          color: "red",
          icon: <IconAlertCircle />,
        });
        return;
      }

      const result = await dispatch(
        signUp({
          email,
          password,
          username,
          firstName,
          lastName,
        })
      );

      if (signUp.fulfilled.match(result)) {
        router.push("/decks");
      }
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      notifications.show({
        title: "Error",
        message: "Something went wrong. Please try again.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  const isDark = colorScheme === "dark";

  return (
    <Paper
      withBorder
      shadow="xl"
      p={40}
      radius="lg"
      style={{
        maxWidth: 420,
        width: "100%",
        backgroundColor: isDark
          ? "var(--mantine-color-dark-7)"
          : "rgba(255, 255, 255, 0.95)",
      }}
    >
      <Title order={2} mb="lg" ta="center" c={isDark ? "white" : "dark"}>
        Create Account
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Username"
            placeholder="archenemy_master"
            required
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            onBlur={handleUsernameBlur}
            error={usernameError}
            size="md"
            styles={{
              label: {
                color: isDark
                  ? "var(--mantine-color-gray-3)"
                  : "var(--mantine-color-dark-6)",
              },
            }}
          />

          <TextInput
            label="Email"
            placeholder="you@example.com"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="md"
            styles={{
              label: {
                color: isDark
                  ? "var(--mantine-color-gray-3)"
                  : "var(--mantine-color-dark-6)",
              },
            }}
          />

          <PasswordInput
            label="Password"
            placeholder="Strong password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="md"
            styles={{
              label: {
                color: isDark
                  ? "var(--mantine-color-gray-3)"
                  : "var(--mantine-color-dark-6)",
              },
            }}
          />

          <TextInput
            label="First Name (optional)"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            size="md"
            styles={{
              label: {
                color: isDark
                  ? "var(--mantine-color-gray-3)"
                  : "var(--mantine-color-dark-6)",
              },
            }}
          />

          <TextInput
            label="Last Name (optional)"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            size="md"
            styles={{
              label: {
                color: isDark
                  ? "var(--mantine-color-gray-3)"
                  : "var(--mantine-color-dark-6)",
              },
            }}
          />

          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}

          <Button
            fullWidth
            type="submit"
            loading={loading}
            size="lg"
            mt="sm"
            color="pink"
          >
            Sign Up
          </Button>

          <Text size="xs" c="dimmed" ta="center">
            This site is protected by reCAPTCHA and the Google{" "}
            <Anchor
              href="https://policies.google.com/privacy"
              target="_blank"
              size="xs"
            >
              Privacy Policy
            </Anchor>{" "}
            and{" "}
            <Anchor
              href="https://policies.google.com/terms"
              target="_blank"
              size="xs"
            >
              Terms of Service
            </Anchor>{" "}
            apply.
          </Text>
        </Stack>
      </form>

      <Text ta="center" mt="lg" size="sm" c={isDark ? "gray.4" : "dark.4"}>
        Already have an account?{" "}
        <Anchor href="/signin" fw={700} c="pink">
          Sign In
        </Anchor>
      </Text>
    </Paper>
  );
}
