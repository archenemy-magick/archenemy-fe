"use client";

import { Container, Box } from "@mantine/core";
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
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
      }}
    >
      <Container size="xs" style={{ width: "100%" }}>
        <SignInForm />
      </Container>
    </Box>
  );
};

export default SignInPage;
