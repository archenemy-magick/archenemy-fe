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
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~/store/configureStore";
import { signUp, clearError } from "~/store/reducers";
import { useRouter } from "next/navigation";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

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
  };

  return (
    <Paper
      withBorder
      shadow="md"
      p={30}
      radius="md"
      style={{ maxWidth: 420, margin: "0 auto" }}
    >
      <Title order={2} mb="md">
        Create Account
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Username"
            placeholder="archenemy_master"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextInput
            label="Email"
            placeholder="you@example.com"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            label="Password"
            placeholder="Strong password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TextInput
            label="First Name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <TextInput
            label="Last Name (optional)"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}

          <Button fullWidth type="submit" loading={loading}>
            Sign Up
          </Button>
        </Stack>
      </form>

      <Text ta="center" mt="md">
        Already have an account?{" "}
        <Anchor href="/signin" fw={700}>
          Sign In
        </Anchor>
      </Text>
    </Paper>
  );
}
