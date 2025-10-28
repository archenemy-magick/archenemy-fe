"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Text, Loader, Center } from "@mantine/core";
import ArticleEditor from "~/components/ArticleEditor";
import { createClient } from "~/lib/supabase/client";
import { Article } from "~/types/articles";

const supabase = createClient();

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Failed to load article:", error);
      } else {
        setArticle(data);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [params.id]);

  const handleSave = () => {
    router.push("/admin/articles");
  };

  if (loading) {
    return (
      <Container py="xl">
        <Center>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container py="xl">
        <Text size="xl">Article not found</Text>
      </Container>
    );
  }

  return <ArticleEditor existingArticle={article} onSave={handleSave} />;
}
