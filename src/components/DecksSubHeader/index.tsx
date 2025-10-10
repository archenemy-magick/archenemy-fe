"use client";

import { Tabs, Container, Group, Title, Text } from "@mantine/core";
import { useRouter, usePathname } from "next/navigation";
import { IconPlus, IconWorld, IconCards } from "@tabler/icons-react";

interface DecksSubHeaderProps {
  title?: string;
  subtitle?: string;
}

const DecksSubHeader = ({ title, subtitle }: DecksSubHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab based on pathname
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
    <div
      style={{
        borderBottom: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "var(--mantine-color-body)",
      }}
    >
      <Container size="xl" py="sm">
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
      </Container>
    </div>
  );
};

export default DecksSubHeader;
