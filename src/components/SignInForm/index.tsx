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
import { signIn, clearError } from "~/store/reducers";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const { colorScheme } = useMantineColorScheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    const result = await dispatch(signIn({ email, password }));
    if (signIn.fulfilled.match(result)) {
      router.push("/decks");
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

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
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
