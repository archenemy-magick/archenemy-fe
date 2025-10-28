"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  Image,
  Badge,
  Group,
  Divider,
  Paper,
  Loader,
  Center,
} from "@mantine/core";
import ReactMarkdown from "react-markdown";
import { getArticleBySlug } from "~/lib/api/articles";
import { IconClock, IconEye } from "@tabler/icons-react";
import { Article, ArticleTag } from "~/types/articles";

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await getArticleBySlug(params.slug as string);
        setArticle(data);
      } catch (error) {
        console.error("Failed to load article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.slug]);

  if (loading) {
    return (
      <Container py="xl">
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container py="xl">
        <Stack align="center" gap="md">
          <Text size="xl" fw={600}>
            Article not found
          </Text>
          <Text c="dimmed">
            This article may have been removed or doesn&apos;t exist
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Featured Image */}
        {article.featured_image && (
          <Image
            src={article.featured_image}
            radius="md"
            alt={article.title}
            style={{ maxHeight: 500, objectFit: "cover" }}
          />
        )}

        {/* Title */}
        <div>
          <Title order={1} size="2.5rem" style={{ lineHeight: 1.2 }}>
            {article.title}
          </Title>
          {article.subtitle && (
            <Text size="xl" c="dimmed" mt="md">
              {article.subtitle}
            </Text>
          )}
        </div>

        {/* Meta Info */}
        <Group gap="md">
          <Group gap="xs">
            <IconClock size={16} />
            <Text size="sm" c="dimmed">
              {article.published_at &&
                new Date(article.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </Text>
          </Group>
          <Group gap="xs">
            <IconEye size={16} />
            <Text size="sm" c="dimmed">
              {article.view_count} views
            </Text>
          </Group>
        </Group>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <Group gap="xs">
            {article.tags.map((tag: ArticleTag) => (
              <Badge key={tag.tag_id} variant="light" size="lg">
                {tag.tag?.name}
              </Badge>
            ))}
          </Group>
        )}

        <Divider />

        {/* Article Content */}
        <div className="article-content">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* Linked Cards Section */}
        {article.article_cards && article.article_cards.length > 0 && (
          <>
            <Divider label="Featured Cards" labelPosition="center" my="xl" />
            <Paper p="md" withBorder>
              <Text size="sm" c="dimmed">
                This article references {article.article_cards.length} card(s)
                from the Archenemy format
              </Text>
            </Paper>
          </>
        )}

        {/* Linked Decks Section */}
        {article.article_decks && article.article_decks.length > 0 && (
          <>
            <Divider label="Featured Decks" labelPosition="center" my="xl" />
            <Paper p="md" withBorder>
              <Text size="sm" c="dimmed">
                This article references {article.article_decks.length} deck(s)
              </Text>
            </Paper>
          </>
        )}

        {/* Comments Section (Optional - for future) */}
        <Divider my="xl" />
        <Paper p="md" withBorder>
          <Text c="dimmed" size="sm">
            Comments coming soon...
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}
