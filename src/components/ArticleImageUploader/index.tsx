// Image Upload Component for Article Editor
// Add to ~/components/ArticleImageUploader.tsx

"use client";

import {
  Button,
  Group,
  Stack,
  Image,
  Text,
  Paper,
  Grid,
  ActionIcon,
  Modal,
  TextInput,
  Tooltip,
  FileInput,
  Progress,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState, useRef } from "react";
import { notifications } from "@mantine/notifications";
import {
  IconUpload,
  IconTrash,
  IconCopy,
  IconPhoto,
  IconX,
} from "@tabler/icons-react";
import {
  uploadArticleImage,
  deleteArticleImage,
  getUserImages,
  generateImageMarkdown,
  ArticleImage,
} from "~/lib/api/articleImages";

interface ArticleImageUploaderProps {
  articleId?: string;
  onImageInsert: (markdown: string) => void;
}

export default function ArticleImageUploader({
  articleId,
  onImageInsert,
}: ArticleImageUploaderProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [images, setImages] = useState<ArticleImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    try {
      const data = await getUserImages();
      setImages(data);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load images",
        color: "red",
      });
    }
  };

  const handleOpen = () => {
    loadImages();
    open();
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      notifications.show({
        title: "Invalid file",
        message: "Please select an image file",
        color: "red",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: "File too large",
        message: "Image must be smaller than 5MB",
        color: "red",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (Supabase doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const { url, record } = await uploadArticleImage(file, articleId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      notifications.show({
        title: "Image uploaded",
        message: "Your image has been uploaded successfully",
        color: "green",
      });

      // Add to list
      setImages((prev) => [record, ...prev]);

      // Reset
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      notifications.show({
        title: "Upload failed",
        message: "Failed to upload image",
        color: "red",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteArticleImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      notifications.show({
        message: "Image deleted",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete image",
        color: "red",
      });
    }
  };

  const handleInsertImage = (image: ArticleImage) => {
    const markdown = generateImageMarkdown(
      image.public_url,
      image.alt_text || image.file_name
    );
    onImageInsert(markdown);
    close();
    notifications.show({
      message: "Image markdown inserted",
      color: "green",
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    notifications.show({
      message: "URL copied to clipboard",
      color: "green",
    });
  };

  return (
    <>
      <Button
        leftSection={<IconPhoto size={16} />}
        onClick={handleOpen}
        variant="light"
      >
        Add Image
      </Button>

      <Modal opened={opened} onClose={close} title="Article Images" size="xl">
        <Stack gap="md">
          {/* Upload Section */}
          <Paper p="md" withBorder>
            <Stack gap="md">
              <FileInput
                label="Upload Image"
                placeholder="Click to select image"
                accept="image/*"
                leftSection={<IconUpload size={16} />}
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {uploading && (
                <Progress value={uploadProgress} size="sm" animated />
              )}
              <Text size="xs" c="dimmed">
                Supported: JPG, PNG, GIF, WebP (max 5MB)
              </Text>
            </Stack>
          </Paper>

          {/* Image Library */}
          <div>
            <Text fw={600} mb="md">
              Your Images ({images.length})
            </Text>
            {images.length === 0 ? (
              <Paper p="xl" withBorder>
                <Text c="dimmed" ta="center">
                  No images uploaded yet
                </Text>
              </Paper>
            ) : (
              <Grid>
                {images.map((image) => (
                  <Grid.Col key={image.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Paper p="xs" withBorder style={{ position: "relative" }}>
                      <Stack gap="xs">
                        <div
                          style={{
                            position: "relative",
                            aspectRatio: "16/9",
                            overflow: "hidden",
                            borderRadius: "4px",
                          }}
                        >
                          <Image
                            src={image.public_url}
                            alt={image.alt_text || image.file_name}
                            fit="cover"
                            style={{ width: "100%", height: "100%" }}
                          />
                        </div>

                        <Text size="xs" lineClamp={1}>
                          {image.file_name}
                        </Text>

                        <Group gap="xs">
                          <Tooltip label="Insert into article">
                            <Button
                              size="xs"
                              variant="light"
                              onClick={() => handleInsertImage(image)}
                              fullWidth
                            >
                              Insert
                            </Button>
                          </Tooltip>

                          <Tooltip label="Copy URL">
                            <ActionIcon
                              size="lg"
                              variant="light"
                              onClick={() => handleCopyUrl(image.public_url)}
                            >
                              <IconCopy size={16} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Delete image">
                            <ActionIcon
                              size="lg"
                              variant="light"
                              color="red"
                              onClick={() => handleDelete(image.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </div>
        </Stack>
      </Modal>
    </>
  );
}
