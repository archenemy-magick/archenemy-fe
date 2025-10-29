"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Title,
  Button,
  Stack,
  Group,
  Table,
  Badge,
  ActionIcon,
  Text,
  Paper,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import { getUserArticles, deleteArticle } from "~/lib/api/articles";
import { notifications } from "@mantine/notifications";
import { Article } from "~/types/articles";

export default function AdminArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const data = await getUserArticles();
      setArticles(data);
    } catch (error) {
      console.error("Failed to load articles:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load articles",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteArticle(id);
      notifications.show({
        message: "Article deleted",
        color: "green",
      });
      fetchArticles();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete article",
        color: "red",
      });
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={1}>Manage Articles</Title>
            <Text c="dimmed" size="sm">
              Create and manage your articles
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => router.push("/admin/articles/new")}
            gradient={{ from: "violet", to: "pink", deg: 45 }}
            variant="gradient"
          >
            New Article
          </Button>
        </Group>

        {loading ? (
          <Text>Loading articles...</Text>
        ) : articles.length === 0 ? (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <Text size="lg" c="dimmed">
                No articles yet
              </Text>
              <Text size="sm" c="dimmed">
                Create your first article to get started
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push("/admin/articles/new")}
              >
                Create Article
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Paper withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Views</Table.Th>
                  <Table.Th>Updated</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {articles.map((article) => (
                  <Table.Tr key={article.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{article.title}</Text>
                        {article.subtitle && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {article.subtitle}
                          </Text>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          article.status === "published"
                            ? "green"
                            : article.status === "draft"
                            ? "yellow"
                            : "gray"
                        }
                        variant="light"
                      >
                        {article.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{article.view_count || 0}</Table.Td>
                    <Table.Td>
                      {new Date(article.updated_at).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {article.status === "published" && (
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() =>
                              router.push(`/articles/${article.slug}`)
                            }
                            title="View published article"
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        )}
                        <ActionIcon
                          variant="light"
                          color="violet"
                          onClick={() =>
                            router.push(`/admin/articles/${article.id}`)
                          }
                          title="Edit article"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() =>
                            handleDelete(article.id, article.title)
                          }
                          title="Delete article"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
