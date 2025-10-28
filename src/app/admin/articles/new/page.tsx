"use client";

import { useRouter } from "next/navigation";
import ArticleEditor from "~/components/ArticleEditor";

export default function NewArticlePage() {
  const router = useRouter();

  const handleSave = () => {
    // Redirect to articles list after save
    router.push("/admin/articles");
  };

  return <ArticleEditor onSave={handleSave} />;
}
