"use client";

import { useState, useEffect, useCallback } from "react";
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
  Alert,
  Loader,
  Checkbox,
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~/store/configureStore";
import { signUp, clearError } from "~/store/reducers";
import { useRouter } from "next/navigation";
import { validateUsername } from "~/lib/validation/contentFilter";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconMailCheck,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false); // NEW

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const { colorScheme } = useMantineColorScheme();

  // Debounce username for API checks (wait 500ms after user stops typing)
  const [debouncedUsername] = useDebouncedValue(username, 500);

  // Check username availability with API
  const checkUsernameAvailability = useCallback(
    async (usernameToCheck: string) => {
      if (!usernameToCheck || usernameToCheck.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setCheckingUsername(true);
      try {
        const response = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(
            usernameToCheck
          )}`
        );
        const data = await response.json();

        if (response.ok) {
          setUsernameAvailable(data.available);
          if (!data.available) {
            setUsernameError("This username is already taken");
          }
        } else {
          console.error("Error checking username:", data.error);
        }
      } catch (error) {
        console.error("Failed to check username:", error);
      } finally {
        setCheckingUsername(false);
      }
    },
    []
  );

  // Check username availability when debounced value changes
  useEffect(() => {
    if (debouncedUsername && touched) {
      const validation = validateUsername(debouncedUsername);
      if (validation.valid) {
        checkUsernameAvailability(debouncedUsername);
      } else {
        setUsernameAvailable(null);
      }
    }
  }, [debouncedUsername, touched, checkUsernameAvailability]);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setTouched(true);
    setUsernameAvailable(null);

    // Validate format in real-time
    if (value.trim().length === 0) {
      setUsernameError("Username cannot be empty");
    } else if (value.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
    } else {
      const validation = validateUsername(value);
      setUsernameError(validation.valid ? null : validation.error || null);
    }
  };

  const handleUsernameBlur = () => {
    setTouched(true);

    if (username.trim().length === 0) {
      setUsernameError("Username cannot be empty");
    } else if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
    } else {
      const validation = validateUsername(username);
      setUsernameError(validation.valid ? null : validation.error || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    // Check if user agreed to terms
    if (!agreedToTerms) {
      notifications.show({
        title: "Terms Required",
        message:
          "You must agree to the Terms of Service and Privacy Policy to continue.",
        color: "red",
        icon: <IconAlertCircle />,
      });
      return;
    }

    // Final username validation
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

    // Check if username is available
    if (usernameAvailable === false) {
      notifications.show({
        title: "Username Taken",
        message: "This username is already in use. Please choose another.",
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
      // Show success state instead of redirecting
      setSignupSuccess(true);

      notifications.show({
        title: "Account Created!",
        message: "Please check your email to confirm your account.",
        color: "green",
        autoClose: false,
      });
    } else if (signUp.rejected.match(result)) {
      // Handle specific error cases
      const errorMessage = result.payload as string;

      if (errorMessage?.toLowerCase().includes("username")) {
        setUsernameError("This username is already taken");
        notifications.show({
          title: "Username Taken",
          message: "This username is already in use. Please choose another.",
          color: "red",
          icon: <IconAlertCircle />,
        });
      } else if (errorMessage?.toLowerCase().includes("email")) {
        notifications.show({
          title: "Email Already Registered",
          message: "An account with this email already exists.",
          color: "red",
          icon: <IconAlertCircle />,
        });
      } else {
        notifications.show({
          title: "Signup Failed",
          message:
            errorMessage ||
            "An error occurred during signup. Please try again.",
          color: "red",
          icon: <IconAlertCircle />,
        });
      }
    }
  };

  const isDark = colorScheme === "dark";

  // Determine the right section icon for username field
  const getUsernameRightSection = () => {
    if (checkingUsername) {
      return <Loader size="xs" />;
    }
    if (usernameAvailable === true && !usernameError) {
      return <IconCheck size={16} color="green" />;
    }
    if (usernameAvailable === false || (usernameError && touched)) {
      return <IconX size={16} color="red" />;
    }
    return null;
  };

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

      {signupSuccess ? (
        <Stack gap="lg" align="center">
          <Alert
            icon={<IconMailCheck size={24} />}
            title="Check Your Email!"
            color="green"
            variant="light"
            style={{ width: "100%" }}
          >
            <Stack gap="sm">
              <Text size="sm">
                We&apos;ve sent a confirmation email to <strong>{email}</strong>
              </Text>
              <Text size="sm">
                Please check your inbox and click the confirmation link to
                activate your account.
              </Text>
              <Text size="xs" c="dimmed">
                Can&apos;t find the email? Check your spam folder or{" "}
                <Anchor
                  size="xs"
                  onClick={() => {
                    setSignupSuccess(false);
                    setEmail("");
                    setPassword("");
                    setUsername("");
                    setFirstName("");
                    setLastName("");
                    setUsernameAvailable(null);
                    setTouched(false);
                    setAgreedToTerms(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Try again
                </Anchor>
              </Text>
            </Stack>
          </Alert>

          <Button
            variant="light"
            fullWidth
            onClick={() => router.push("/signin")}
            mt="md"
          >
            Go to Sign In
          </Button>
        </Stack>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Username"
                name="username"
                placeholder="archenemy_master"
                required
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onBlur={handleUsernameBlur}
                error={usernameError}
                rightSection={getUsernameRightSection()}
                description={
                  usernameAvailable === true && !usernameError
                    ? "Username is available!"
                    : undefined
                }
                size="md"
                styles={{
                  label: {
                    color: isDark
                      ? "var(--mantine-color-gray-3)"
                      : "var(--mantine-color-dark-6)",
                  },
                  description: {
                    color: "var(--mantine-color-green-6)",
                  },
                }}
              />

              <TextInput
                label="Email"
                placeholder="you@example.com"
                type="email"
                name="email"
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

              {/* NEW: Terms & Privacy Checkbox */}
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.currentTarget.checked)}
                label={
                  <Text size="sm" c={isDark ? "gray.4" : "dark.4"}>
                    I agree to the{" "}
                    <Anchor href="/terms" target="_blank" c="pink" fw={500}>
                      Terms of Service
                    </Anchor>{" "}
                    and{" "}
                    <Anchor href="/privacy" target="_blank" c="pink" fw={500}>
                      Privacy Policy
                    </Anchor>
                  </Text>
                }
                required
              />

              {error && !usernameError && (
                <Alert icon={<IconAlertCircle />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                type="submit"
                loading={loading}
                disabled={
                  checkingUsername ||
                  usernameAvailable === false ||
                  !!usernameError ||
                  !agreedToTerms // NEW: Disable if not agreed
                }
                size="lg"
                mt="sm"
                color="pink"
              >
                Sign Up
              </Button>
            </Stack>
          </form>

          <Text ta="center" mt="lg" size="sm" c={isDark ? "gray.4" : "dark.4"}>
            Already have an account?{" "}
            <Anchor href="/signin" fw={700} c="pink">
              Sign In
            </Anchor>
          </Text>
        </>
      )}
    </Paper>
  );
}
