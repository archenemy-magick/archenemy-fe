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
  Accordion,
  Badge,
  useCombobox,
  Pill,
  PillsInput,
} from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import {
  createArticle,
  updateArticle,
  publishArticle,
} from "~/lib/api/articles";
import ReactMarkdown from "react-markdown";
import {
  IconEye,
  IconEdit,
  IconDeviceFloppy,
  IconSeo,
  IconPhoto,
} from "@tabler/icons-react";
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

  // SEO fields
  const [metaTitle, setMetaTitle] = useState(existingArticle?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(
    existingArticle?.meta_description || ""
  );
  const [metaKeywords, setMetaKeywords] = useState<string[]>(
    existingArticle?.meta_keywords || []
  );
  const [ogImageUrl, setOgImageUrl] = useState(
    existingArticle?.og_image_url || ""
  );
  const [canonicalUrl, setCanonicalUrl] = useState(
    existingArticle?.canonical_url || ""
  );

  const [saving, setSaving] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-populate meta title if it's empty
    if (!metaTitle && value) {
      setMetaTitle(value);
    }
    if (!existingArticle) {
      const newSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(newSlug);
    }
  };

  // Calculate read time from content
  const calculateReadTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Calculate word count
  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
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
      const articleData = {
        title,
        subtitle,
        slug,
        excerpt,
        content,
        featured_image: featuredImage,
        status,
        meta_title: metaTitle || title,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
        og_image_url: ogImageUrl || featuredImage,
        canonical_url: canonicalUrl,
        read_time: calculateReadTime(content),
      };

      if (existingArticle) {
        await updateArticle(existingArticle.id, articleData);
        notifications.show({
          title: "Article updated",
          message: "Your changes have been saved",
          color: "green",
        });
      } else {
        await createArticle(articleData);
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

  const [keywordInput, setKeywordInput] = useState("");
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

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
              placeholder="Short description (shown in article list and search results)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.currentTarget.value)}
              minRows={2}
              // maxRows={4}
              description={`${excerpt.length}/200 characters`}
              maxLength={200}
            />

            <TextInput
              label="Featured Image URL"
              placeholder="https://..."
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.currentTarget.value)}
              description="Main image shown at the top of the article"
            />
          </Stack>
        </Paper>

        {/* SEO Section - Collapsible */}
        <Accordion variant="contained">
          <Accordion.Item value="seo">
            <Accordion.Control icon={<IconSeo size={20} />}>
              <Group gap="xs">
                <Text fw={500}>SEO & Social Media</Text>
                <Badge size="sm" variant="light" color="blue">
                  Optional but Recommended
                </Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <TextInput
                  label="Meta Title"
                  placeholder={title || "Leave blank to use article title"}
                  description={`${
                    metaTitle?.length || 0
                  }/60 characters (shown in search results)`}
                  maxLength={60}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.currentTarget.value)}
                />

                <Textarea
                  label="Meta Description"
                  placeholder="A compelling description that appears in search results"
                  description={`${metaDescription?.length || 0}/160 characters`}
                  maxLength={160}
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.currentTarget.value)}
                />

                <PillsInput
                  label="Keywords"
                  description="Type keyword and press Enter (e.g., 'archenemy mtg', 'scheme deck')"
                >
                  <Pill.Group>
                    {metaKeywords.map((keyword) => (
                      <Pill
                        key={keyword}
                        withRemoveButton
                        onRemove={() =>
                          setMetaKeywords(
                            metaKeywords.filter((k) => k !== keyword)
                          )
                        }
                      >
                        {keyword}
                      </Pill>
                    ))}
                    <PillsInput.Field
                      placeholder="Add keywords..."
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        console.log(
                          "e.key:",
                          e.key,
                          "keywordInput:",
                          keywordInput
                        );

                        if (e.key === "Enter" && keywordInput.trim()) {
                          e.preventDefault();
                          const newKeyword = keywordInput.toLowerCase().trim();
                          if (!metaKeywords.includes(newKeyword)) {
                            setMetaKeywords([...metaKeywords, newKeyword]);
                          }
                          setKeywordInput("");
                        }
                        if (
                          e.key === "Backspace" &&
                          keywordInput === "" &&
                          metaKeywords.length > 0
                        ) {
                          setMetaKeywords(metaKeywords.slice(0, -1));
                        }
                      }}
                    />
                  </Pill.Group>
                </PillsInput>

                <TextInput
                  label="Open Graph Image URL"
                  placeholder="https://magicsak.com/images/article-og-image.jpg"
                  description="Image shown when shared on social media (1200x630px recommended, will use featured image if blank)"
                  leftSection={<IconPhoto size={16} />}
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.currentTarget.value)}
                />

                <TextInput
                  label="Canonical URL"
                  placeholder="https://magicsak.com/articles/your-article-slug"
                  description="Leave blank to auto-generate (only needed if republishing from another site)"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.currentTarget.value)}
                />

                <Paper p="sm" withBorder bg="var(--mantine-color-blue-light)">
                  <Text size="sm" fw={500} mb="xs">
                    SEO Tips:
                  </Text>
                  <Text size="xs" c="dimmed">
                    • Meta title should include your main keyword
                    <br />
                    • Meta description should be compelling and include keywords
                    <br />
                    • Use 3-5 relevant keywords
                    <br />• OG image makes your article look great when shared
                  </Text>
                </Paper>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

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
              resize="vertical"
              styles={{
                input: {
                  fontFamily: "monospace",
                  fontSize: "14px",
                },
              }}
            />

            {/* Article Stats */}
            <Group gap="md" mt="xs">
              <Badge variant="light">
                {calculateReadTime(content)} min read
              </Badge>
              <Badge variant="light">{getWordCount(content)} words</Badge>
              {getWordCount(content) < 300 && (
                <Badge variant="light" color="orange">
                  Aim for 800+ words for SEO
                </Badge>
              )}
            </Group>

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
                {excerpt && (
                  <Text size="lg" c="dimmed" fs="italic">
                    {excerpt}
                  </Text>
                )}
                <Group gap="md">
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      {calculateReadTime(content)} min read
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      {getWordCount(content)} words
                    </Text>
                  </Group>
                </Group>
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
