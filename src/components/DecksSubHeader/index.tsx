"use client";

import { Tabs, Group, Title, Text, Box } from "@mantine/core";
import { useRouter, usePathname } from "next/navigation";
import { IconPlus, IconWorld, IconCards } from "@tabler/icons-react";

interface DecksSubHeaderProps {
  title?: string;
  subtitle?: string;
}

const DecksSubHeader = ({ title, subtitle }: DecksSubHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === "/decks") return "my-decks";
    if (pathname === "/decks/public") return "public";
    if (pathname.startsWith("/decks/builder")) return "builder";
    return "my-decks";
  };

  const handleTabChange = (value: string | null) => {
    if (value === "my-decks") router.push("/decks");
    if (value === "public") router.push("/decks/public");
    if (value === "builder") router.push("/decks/builder");
  };

  return (
    <Box
      style={{
        backgroundColor: "var(--mantine-color-body)",
        position: "sticky",
        top: 60,
        zIndex: 100,
      }}
    >
      <Box
        style={{
          paddingTop: "var(--mantine-spacing-sm)",
        }}
      >
        {(title || subtitle) && (
          <Group mb="sm">
            {title && <Title order={2}>{title}</Title>}
            {subtitle && (
              <Text c="dimmed" size="sm">
                {subtitle}
              </Text>
            )}
          </Group>
        )}
        <Tabs value={getActiveTab()} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="my-decks" leftSection={<IconCards size={16} />}>
              My Decks
            </Tabs.Tab>
            <Tabs.Tab value="public" leftSection={<IconWorld size={16} />}>
              Public Decks
            </Tabs.Tab>
            <Tabs.Tab value="builder" leftSection={<IconPlus size={16} />}>
              New Deck
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Box>
    </Box>
  );
};

export default DecksSubHeader;
