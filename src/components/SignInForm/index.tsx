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
  Group,
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~/store/configureStore";
import { signIn, clearError } from "~/store/reducers";
import { useRouter, useSearchParams } from "next/navigation";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const { colorScheme } = useMantineColorScheme();

  // Get redirect path and decode it
  const redirectTo = searchParams.get("redirectTo") || "/decks";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    const result = await dispatch(signIn({ email, password }));

    if (signIn.fulfilled.match(result)) {
      // Use window.location for production redirect issues
      if (typeof window !== "undefined") {
        window.location.href = redirectTo;
      } else {
        router.push(redirectTo);
      }
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
        Sign In
      </Title>

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
            styles={{
              label: {
                color: isDark
                  ? "var(--mantine-color-gray-3)"
                  : "var(--mantine-color-dark-6)",
              },
            }}
          />

          <div>
            <Group justify="space-between" mb={5}>
              <Text
                component="label"
                size="sm"
                fw={500}
                c={
                  isDark
                    ? "var(--mantine-color-gray-3)"
                    : "var(--mantine-color-dark-6)"
                }
              >
                Password
              </Text>
              <Anchor href="/auth/forgot-password" size="xs" c="pink" fw={500}>
                Forgot password?
              </Anchor>
            </Group>
            <PasswordInput
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="md"
            />
          </div>

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
            Sign In
          </Button>
        </Stack>
      </form>

      <Text ta="center" mt="lg" size="sm" c={isDark ? "gray.4" : "dark.4"}>
        Don&apos;t have an account?{" "}
        <Anchor href="/signup" fw={700} c="pink">
          Sign Up
        </Anchor>
      </Text>
    </Paper>
  );
}
