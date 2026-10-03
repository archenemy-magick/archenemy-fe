"use client";

import { Container, Stack, Text, Title } from "@mantine/core";
import { FriendsManager } from "~/components/FriendsManager";

export default function FriendsPage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Friends</Title>
          <Text c="dimmed">
            Add friends by username. Games you record with a friend at the table
            show up in their stats too.
          </Text>
        </div>
        <FriendsManager />
      </Stack>
    </Container>
  );
}
