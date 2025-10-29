"use client";

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
} from "@mantine/core";
import ReactMarkdown from "react-markdown";
import { IconClock, IconEye, IconBookmark } from "@tabler/icons-react";
import { Article, ArticleTag } from "~/types/articles";
import rehypeRaw from "rehype-raw";

interface ArticlePageClientProps {
  article: Article;
}

export default function ArticlePageClient({ article }: ArticlePageClientProps) {
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

        {/* Excerpt */}
        {article.excerpt && (
          <Text size="lg" c="dimmed" fs="italic">
            {article.excerpt}
          </Text>
        )}

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
          {article.read_time && (
            <Group gap="xs">
              <IconBookmark size={16} />
              <Text size="sm" c="dimmed">
                {article.read_time} min read
              </Text>
            </Group>
          )}
          <Group gap="xs">
            <IconEye size={16} />
            <Text size="sm" c="dimmed">
              {article.view_count || 0} views
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
        <div
          className="article-content"
          style={{
            fontSize: "1.1rem",
            lineHeight: 1.8,
          }}
        >
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              // Customize markdown rendering
              h1: ({ children }) => (
                <Title order={1} mt="xl" mb="md">
                  {children}
                </Title>
              ),
              h2: ({ children }) => (
                <Title order={2} mt="xl" mb="md">
                  {children}
                </Title>
              ),
              h3: ({ children }) => (
                <Title order={3} mt="lg" mb="sm">
                  {children}
                </Title>
              ),
              p: ({ children }) => (
                <Text mb="md" style={{ lineHeight: 1.8 }}>
                  {children}
                </Text>
              ),
              img: ({ src, alt }) => {
                // Parse alt text for size hints like "Card Name|300"
                const parts = alt?.split("|") || [];
                const actualAlt = parts[0]?.trim() || "";
                const widthStr = parts[1]?.trim();
                const width = widthStr ? parseInt(widthStr) : 400;

                return (
                  <span
                    style={{
                      display: "block",
                      textAlign: "center",
                      margin: "1.5rem 0",
                    }}
                  >
                    <Image
                      src={src || ""}
                      alt={actualAlt}
                      radius="md"
                      style={{
                        maxWidth: `${width}px`,
                        width: "100%",
                        height: "auto",
                        display: "inline-block",
                      }}
                    />
                  </span>
                );
              },
              div: ({ node, className, children, ...props }) => {
                // Check for custom class name
                if (className === "card-text-layout") {
                  return (
                    <div
                      style={{
                        display: "flex",
                        gap: "1.5rem",
                        alignItems: "flex-start",
                        margin: "2rem 0",
                        flexWrap: "wrap",
                      }}
                    >
                      {children}
                    </div>
                  );
                }
                return (
                  <div className={className} {...props}>
                    {children}
                  </div>
                );
              },
            }}
          >
            {article.content}
          </ReactMarkdown>
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

        {/* Back to Articles Link */}
        <Group justify="center" mt="xl">
          <Text
            component="a"
            href="/articles"
            c="blue"
            size="sm"
            style={{ cursor: "pointer", textDecoration: "underline" }}
          >
            ← Back to all articles
          </Text>
        </Group>
      </Stack>
    </Container>
  );
}
