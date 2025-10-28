"use client";

import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Image,
  Grid,
  Button,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPublishedArticles, Article } from "~/lib/api/articles";
import { IconClock, IconEye, IconArrowRight } from "@tabler/icons-react";

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // TODO: remember to go through here and look for commented out code once articles work

  // useEffect(() => {
  //   const fetchArticles = async () => {
  //     try {
  //       const data = await getPublishedArticles();
  //       setArticles(data);
  //     } catch (error) {
  //       console.error("Failed to load articles:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchArticles();
  // }, []);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Text>Loading articles...</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Articles & Guides</Title>
          <Text c="dimmed" size="lg">
            Strategy guides, card analysis, and deck techs
          </Text>
        </div>

        {articles.length === 0 ? (
          <Card p="xl" withBorder>
            <Stack align="center">
              <Text size="lg" c="dimmed">
                No articles yet
              </Text>
            </Stack>
          </Card>
        ) : (
          <Grid>
            {articles.map((article) => (
              <Grid.Col key={article.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onClick={() => router.push(`/articles/${article.slug}`)}
                  className="card-hover"
                >
                  <Card.Section>
                    {article.featured_image ? (
                      <Image
                        src={article.featured_image}
                        height={200}
                        alt={article.title}
                        fit="cover"
                      />
                    ) : (
                      <div
                        style={{
                          height: 200,
                          background:
                            "linear-gradient(135deg, var(--mantine-color-violet-6), var(--mantine-color-pink-6))",
                        }}
                      />
                    )}
                  </Card.Section>

                  <Stack gap="md" mt="md">
                    <div>
                      {/* {article.tags && article.tags.length > 0 && (
                        <Group gap="xs" mb="xs">
                          {article.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} size="sm" variant="light">
                              {tag}
                            </Badge>
                          ))}
                        </Group>
                      )} */}
                      <Title order={3} lineClamp={2}>
                        {article.title}
                      </Title>
                      {article.subtitle && (
                        <Text size="sm" c="dimmed" mt="xs" lineClamp={1}>
                          {article.subtitle}
                        </Text>
                      )}
                    </div>

                    {article.excerpt && (
                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {article.excerpt}
                      </Text>
                    )}

                    <Group justify="space-between" mt="auto">
                      <Group gap="xs">
                        <IconClock size={14} />
                        <Text size="xs" c="dimmed">
                          {new Date(article.published_at!).toLocaleDateString()}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <IconEye size={14} />
                        <Text size="xs" c="dimmed">
                          {article.view_count}
                        </Text>
                      </Group>
                    </Group>

                    <Button
                      variant="light"
                      rightSection={<IconArrowRight size={16} />}
                      fullWidth
                    >
                      Read Article
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
