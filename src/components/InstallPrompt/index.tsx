"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Paper,
  Text,
  Group,
  ActionIcon,
  Checkbox,
} from "@mantine/core";
import { IconX, IconDownload } from "@tabler/icons-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Window {
  __pwaInstallPrompt?: BeforeInstallPromptEvent;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [neverAskAgain, setNeverAskAgain] = useState(false);

  useEffect(() => {
    // Check if user chose "never ask again"
    const neverAsk = localStorage.getItem("pwa-never-ask");
    if (neverAsk === "true") {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);

    if (neverAskAgain) {
      localStorage.setItem("pwa-never-ask", "true");
    } else {
      // Dismiss for 7 days
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    }
  };

  // Check if dismissed recently (within 7 days)
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const neverAsk = localStorage.getItem("pwa-never-ask");

    if (neverAsk === "true") {
      setShowPrompt(false);
      return;
    }

    if (dismissed) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }
  }, []);

  // Store prompt globally so UserMenu can access it
  useEffect(() => {
    if (deferredPrompt) {
      window.__pwaInstallPrompt = deferredPrompt;
    }
  }, [deferredPrompt]);

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <Paper
      p="md"
      withBorder
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <Group justify="space-between" align="flex-start">
        <div style={{ flex: 1 }}>
          <Text fw={600} mb="xs">
            Install Archenemy App (Beta)
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            Install our app for quick access and offline play!
          </Text>

          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleInstall}
            fullWidth
            mb="sm"
          >
            Install Now
          </Button>

          <Checkbox
            label="Don't ask me again"
            size="sm"
            checked={neverAskAgain}
            onChange={(e) => setNeverAskAgain(e.currentTarget.checked)}
          />
        </div>
        <ActionIcon variant="subtle" color="gray" onClick={handleDismiss}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
