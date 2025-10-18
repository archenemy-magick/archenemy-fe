"use client";

import {
  Container,
  Group,
  Stack,
  Text,
  ActionIcon,
  Box,
  Divider,
  SimpleGrid,
  Title,
  Anchor,
} from "@mantine/core";
import {
  IconBrandTwitter,
  IconBrandDiscord,
  IconBrandGithub,
  IconMail,
  IconCards,
} from "@tabler/icons-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: IconBrandTwitter,
      label: "Twitter",
      href: "https://twitter.com/yourhandle",
    },
    {
      icon: IconBrandDiscord,
      label: "Discord",
      href: "https://discord.gg/yourserver",
    },

    { icon: IconMail, label: "Email", href: "mailto:contact@archenemy.app" },
  ];

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Deck Builder", href: "/decks/builder" },
    { label: "My Decks", href: "/decks" },
    { label: "Popular Cards", href: "/popular-cards" },
    { label: "Play Game", href: "/game/archenemy" },
  ];

  return (
    <Box
      component="footer"
      style={{
        background: "linear-gradient(180deg, #1c1c22 0%, #0f0f14 100%)",
        borderTop: "3px solid",
        borderImage:
          "linear-gradient(90deg, #e91e8c 0%, #845ef7 50%, #ffc107 100%) 1",
        marginTop: "auto",
      }}
    >
      <Container size="xl" py="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          {/* Logo & Tagline Section */}
          <Stack gap="md">
            <Group gap="xs">
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--mantine-radius-md)",
                  background:
                    "linear-gradient(135deg, #e91e8c 0%, #845ef7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(233, 30, 140, 0.3)",
                }}
              >
                <IconCards size={28} color="white" />
              </Box>
              <Title
                order={3}
                style={{
                  background:
                    "linear-gradient(135deg, #e91e8c 0%, #845ef7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Archenemy
              </Title>
            </Group>
            <Text size="sm" c="dimmed" style={{ maxWidth: 250 }}>
              Build legendary scheme decks, unleash villainous strategies, and
              dominate the battlefield.
            </Text>
            <Text
              size="xs"
              c="dimmed"
              fw={600}
              tt="uppercase"
              style={{ letterSpacing: 1 }}
            >
              Embrace the Chaos
            </Text>
          </Stack>

          {/* Quick Links */}
          <Stack gap="md">
            <Text
              size="sm"
              fw={700}
              c="magenta"
              tt="uppercase"
              style={{ letterSpacing: 1 }}
            >
              Quick Links
            </Text>
            <Stack gap="xs">
              {quickLinks.map((link) => (
                <Anchor
                  key={link.label}
                  href={link.href}
                  size="sm"
                  c="dimmed"
                  style={{
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color =
                      "var(--mantine-color-magenta-4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--mantine-color-dimmed)";
                  }}
                >
                  {link.label}
                </Anchor>
              ))}
            </Stack>
          </Stack>

          {/* Community & Support */}
          <Stack gap="md">
            <Text
              size="sm"
              fw={700}
              c="magenta"
              tt="uppercase"
              style={{ letterSpacing: 1 }}
            >
              Community
            </Text>
            <Stack gap="xs">
              <Anchor
                href="https://discord.gg/yourserver"
                size="sm"
                c="dimmed"
                style={{ textDecoration: "none" }}
              >
                Join Discord
              </Anchor>
              <Anchor
                href="/feedback"
                size="sm"
                c="dimmed"
                style={{ textDecoration: "none" }}
              >
                Send Feedback
              </Anchor>
              <Anchor
                href="https://github.com/archenemy-magick/archenemy-fe/issues"
                size="sm"
                c="dimmed"
                style={{ textDecoration: "none" }}
              >
                Report Bug
              </Anchor>
              <Anchor
                href="/changelog"
                size="sm"
                c="dimmed"
                style={{ textDecoration: "none" }}
              >
                Changelog
              </Anchor>
            </Stack>
          </Stack>

          {/* Contact & Social */}
          <Stack gap="md">
            <Text
              size="sm"
              fw={700}
              c="magenta"
              tt="uppercase"
              style={{ letterSpacing: 1 }}
            >
              Connect
            </Text>
            <Text size="sm" c="dimmed">
              Questions or feedback?
            </Text>
            <Anchor
              href="mailto:contact@archenemy.app"
              size="sm"
              c="magenta.4"
              fw={500}
              style={{ textDecoration: "none" }}
            >
              contact@archenemy.app
            </Anchor>
            <Group gap="sm">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <ActionIcon
                    key={social.label}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                    variant="subtle"
                    color="gray"
                    aria-label={social.label}
                    style={{
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #e91e8c 0%, #845ef7 100%)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color =
                        "var(--mantine-color-gray-6)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <Icon size={20} />
                  </ActionIcon>
                );
              })}
            </Group>
          </Stack>
        </SimpleGrid>

        <Divider
          my="xl"
          style={{
            borderColor: "var(--mantine-color-dark-4)",
          }}
        />

        {/* Bottom Bar */}
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Text size="sm" c="dimmed">
            © {currentYear} Archenemy. All rights reserved.
          </Text>
          <Group gap="md">
            <Anchor
              href="/privacy"
              size="sm"
              c="dimmed"
              style={{ textDecoration: "none" }}
            >
              Privacy Policy
            </Anchor>
            <Anchor
              href="/terms"
              size="sm"
              c="dimmed"
              style={{ textDecoration: "none" }}
            >
              Terms of Service
            </Anchor>
            <Text size="xs" c="dimmed">
              Made with 💜 for MTG players
            </Text>
          </Group>
        </Group>
      </Container>
    </Box>
  );
};

export default Footer;
