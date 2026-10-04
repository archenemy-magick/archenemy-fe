"use client";

import { Suspense } from "react";
import { Container, Box } from "@mantine/core";
import { SignInForm } from "~/components/SignInForm";

const SignInPage = () => {
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
        {/* SignInForm reads ?redirectTo= with useSearchParams, which needs a
            Suspense boundary now that this page is prerendered. */}
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </Container>
    </Box>
  );
};

export default SignInPage;
