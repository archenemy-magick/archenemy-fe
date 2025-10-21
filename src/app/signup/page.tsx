"use client";

import { Container, Box } from "@mantine/core";
import { SignUpForm } from "~/components/SignUpForm";
import { pageMetadata } from "~/config/metadata";

export const metadata = pageMetadata.signUp;

export default function SignUpPage() {
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
        <SignUpForm />
      </Container>
    </Box>
  );
}
