"use client";

import { Menu, Avatar, Text, Button, Group } from "@mantine/core";
import { IconLogout, IconUser, IconCards } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~/store/configureStore";
import { signOut } from "~/store/reducers";
import { useRouter } from "next/navigation";
import { IconDownload } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function UserMenu() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { username, email, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if install prompt is available
    const checkInstallable = () => {
      const prompt = window.__pwaInstallPrompt;
      setCanInstall(!!prompt);
    };

    checkInstallable();

    // Listen for the prompt event
    const handler = () => checkInstallable();
    window.addEventListener("beforeinstallprompt", handler);

    // Also check periodically in case prompt becomes available
    const interval = setInterval(checkInstallable, 1000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearInterval(interval);
    };
  }, []);

  const handleInstallClick = async () => {
    const prompt = window.__pwaInstallPrompt as BeforeInstallPromptEvent;
    if (!prompt) return;

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;

      if (outcome === "accepted") {
        setCanInstall(false);
        delete window.__pwaInstallPrompt;
      }
    } catch (error) {
      console.error("Install prompt error:", error);
    }
  };

  const handleSignOut = async () => {
    await dispatch(signOut());
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <Group gap="sm">
        <Button variant="subtle" onClick={() => router.push("/signin")}>
          Sign In
        </Button>
        <Button onClick={() => router.push("/signup")}>Sign Up</Button>
      </Group>
    );
  }

  const displayName = username || email?.split("@")[0] || "User";

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Avatar radius="xl" style={{ cursor: "pointer" }}>
          {displayName[0].toUpperCase()}
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" fw={500}>
            {displayName}
          </Text>
          <Text size="xs" c="dimmed">
            {email}
          </Text>
        </Menu.Label>

        <Menu.Item
          leftSection={<IconCards size={14} />}
          onClick={() => router.push("/decks")}
        >
          My Decks
        </Menu.Item>

        <Menu.Item
          leftSection={<IconUser size={14} />}
          onClick={() => router.push("/profile")}
        >
          Profile
        </Menu.Item>

        <Menu.Divider />

        {canInstall && (
          <>
            <Menu.Item
              leftSection={<IconDownload size={14} />}
              onClick={handleInstallClick}
            >
              Install App
            </Menu.Item>
            <Menu.Divider />
          </>
        )}

        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} />}
          onClick={handleSignOut}
        >
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
