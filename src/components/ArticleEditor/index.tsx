"use client";

import {
  Container,
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  Paper,
  Title,
  Text,
  Tabs,
} from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import {
  createArticle,
  updateArticle,
  publishArticle,
} from "~/lib/api/articles";
import ReactMarkdown from "react-markdown";
import { IconEye, IconEdit, IconDeviceFloppy } from "@tabler/icons-react";
import ArticleImageUploader from "~/components/ArticleImageUploader";
import { Article } from "~/types/articles";

interface ArticleEditorProps {
  existingArticle?: Article;
  onSave?: () => void;
}

export default function ArticleEditor({
  existingArticle,
  onSave,
}: ArticleEditorProps) {
  const [title, setTitle] = useState(existingArticle?.title || "");
  const [subtitle, setSubtitle] = useState(existingArticle?.subtitle || "");
  const [slug, setSlug] = useState(existingArticle?.slug || "");
  const [excerpt, setExcerpt] = useState(existingArticle?.excerpt || "");
  const [content, setContent] = useState(existingArticle?.content || "");
  const [featuredImage, setFeaturedImage] = useState(
    existingArticle?.featured_image || ""
  );
  const [status, setStatus] = useState(existingArticle?.status || "draft");
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!existingArticle) {
      const newSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(newSlug);
    }
  };

  const handleSave = async () => {
    if (!title || !slug || !content) {
      notifications.show({
        title: "Missing fields",
        message: "Please fill in title, slug, and content",
        color: "red",
      });
      return;
    }

    setSaving(true);
    try {
      if (existingArticle) {
        await updateArticle(existingArticle.id, {
          title,
          subtitle,
          slug,
          excerpt,
          content,
          featured_image: featuredImage,
          status,
        });
        notifications.show({
          title: "Article updated",
          message: "Your changes have been saved",
          color: "green",
        });
      } else {
        await createArticle({
          title,
          subtitle,
          slug,
          excerpt,
          content,
          featured_image: featuredImage,
          status,
        });
        notifications.show({
          title: "Article created",
          message: "Your article has been created as a draft",
          color: "green",
        });
      }
      onSave?.();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to save article",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!existingArticle?.id) {
      notifications.show({
        message: "Please save as draft first",
        color: "orange",
      });
      return;
    }

    setSaving(true);
    try {
      await publishArticle(existingArticle.id);
      notifications.show({
        title: "Article published",
        message: "Your article is now live!",
        color: "green",
      });
      onSave?.();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to publish article",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  // Insert image markdown at cursor position
  const handleImageInsert = (markdown: string) => {
    // Get the textarea element
    const textarea = document.querySelector(
      'textarea[placeholder*="Write your article"]'
    ) as HTMLTextAreaElement;
    if (!textarea) {
      setContent(content + "\n\n" + markdown);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      content.substring(0, start) + markdown + content.substring(end);

    setContent(newContent);

    // Set cursor after inserted markdown
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + markdown.length,
        start + markdown.length
      );
    }, 0);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>
            {existingArticle ? "Edit Article" : "New Article"}
          </Title>
          <Group>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
              loading={saving}
              variant="light"
            >
              Save Draft
            </Button>
            {existingArticle && status !== "published" && (
              <Button onClick={handlePublish} loading={saving} color="green">
                Publish
              </Button>
            )}
          </Group>
        </Group>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <TextInput
              label="Title"
              placeholder="Article title"
              value={title}
              onChange={(e) => handleTitleChange(e.currentTarget.value)}
              required
              size="lg"
            />

            <TextInput
              label="Subtitle"
              placeholder="Optional subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.currentTarget.value)}
            />

            <TextInput
              label="URL Slug"
              placeholder="article-url-slug"
              value={slug}
              onChange={(e) => setSlug(e.currentTarget.value)}
              required
              description="This will be the URL: /articles/{slug}"
            />

            <Textarea
              label="Excerpt"
              placeholder="Short description (shown in article list)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.currentTarget.value)}
              minRows={2}
              maxRows={4}
            />

            <TextInput
              label="Featured Image URL"
              placeholder="https://..."
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.currentTarget.value)}
            />
          </Stack>
        </Paper>

        <Tabs defaultValue="edit">
          <Tabs.List>
            <Tabs.Tab value="edit" leftSection={<IconEdit size={16} />}>
              Edit
            </Tabs.Tab>
            <Tabs.Tab value="preview" leftSection={<IconEye size={16} />}>
              Preview
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="edit" pt="md">
            {/* Image Upload Button */}
            <Group mb="md">
              <ArticleImageUploader
                articleId={existingArticle?.id}
                onImageInsert={handleImageInsert}
              />
              <Text size="sm" c="dimmed">
                Upload images and insert them into your article
              </Text>
            </Group>

            <Textarea
              placeholder="Write your article in Markdown..."
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              minRows={20}
              styles={{
                input: {
                  fontFamily: "monospace",
                  fontSize: "14px",
                },
              }}
            />
            <Stack gap="xs" mt="xs">
              <Text size="xs" c="dimmed">
                Supports Markdown: **bold**, *italic*, [links](url), # headers,
                etc.
              </Text>
              <Text size="xs" c="dimmed">
                Images: ![alt text](image-url) or use the &quot;Add Image&quot;
                button above
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="preview" pt="md">
            <Paper p="xl" withBorder>
              <Stack gap="md">
                {featuredImage && (
                  <img
                    src={featuredImage}
                    alt={title}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                )}
                <Title order={1}>{title || "Article Title"}</Title>
                {subtitle && (
                  <Text size="xl" c="dimmed">
                    {subtitle}
                  </Text>
                )}
                <div className="article-content">
                  <ReactMarkdown>{content || "*No content yet*"}</ReactMarkdown>
                </div>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
