"use client";

import { Container, Title, Paper } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInForm } from "~/components/SignInForm";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "~/store";

const SignInPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const redirectTo = searchParams.get("redirectTo") || "/decks";

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  return (
    <Container size="xs" mt="xl">
      <Title ta="center" mb="lg">
        Sign In
      </Title>
      <Paper withBorder shadow="md" p="xl" radius="md">
        <SignInForm />
      </Paper>
    </Container>
  );
};

export default SignInPage;
