"use client";

import { Menu, Avatar, Text, Button, Group } from "@mantine/core";
import {
  IconLogout,
  IconUser,
  IconCards,
  IconDownload,
  IconHome,
} from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~/store/configureStore";
import { signOut } from "~/store/reducers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";

// Extend Window interface for PWA
declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent;
  }

  interface BeforeInstallPromptEvent extends Event {
    // prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
}

export function UserMenu() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { username, email, isAuthenticated, avatar_url } = useSelector(
    (state: RootState) => state.user
  );

  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for the prompt event
    const handler = (e: Event) => {
      e.preventDefault();
      window.__pwaInstallPrompt = e as BeforeInstallPromptEvent;
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    // Check if already installed
    if (isInstalled) {
      notifications.show({
        title: "Already Installed",
        message: "The app is already installed on your device",
        color: "blue",
      });
      return;
    }

    const installPrompt = window.__pwaInstallPrompt;

    if (!installPrompt) {
      // No prompt available - provide helpful message
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        notifications.show({
          title: "Install on iOS",
          message: "Tap the Share button, then tap 'Add to Home Screen'",
          color: "blue",
          autoClose: 8000,
        });
      } else {
        notifications.show({
          title: "Installation Not Available",
          message:
            "App may already be installed, or your browser doesn't support installation. Try using Chrome or Edge.",
          color: "orange",
          autoClose: 8000,
        });
      }
      return;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        delete window.__pwaInstallPrompt;
        setIsInstalled(true);
        notifications.show({
          title: "Success!",
          message: "App installed successfully",
          color: "green",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to install app. Please try again.",
        color: "red",
      });
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
        <Avatar
          src={avatar_url}
          radius="xl"
          style={{ cursor: "pointer" }}
          color="magenta"
        >
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
        <Menu.Item
          leftSection={<IconHome size={14} />}
          onClick={() => router.push("/")}
        >
          Home
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconDownload size={14} />}
          onClick={handleInstallClick}
          color="blue"
        >
          {isInstalled ? "App Installed ✓" : "Install App"}
        </Menu.Item>

        <Menu.Divider />

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
