import { Metadata } from "next";
import { createServerSupabaseClient } from "~/lib/supabase/server";
import { notFound } from "next/navigation";
import ArticlePageClient from "./ArticlePageClient";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) {
    return {
      title: "Article Not Found | MagicSAK",
      description: "This article could not be found.",
    };
  }

  const title = article.meta_title || article.title;
  const description =
    article.meta_description ||
    article.excerpt ||
    `Read ${article.title} on MagicSAK - Your ultimate Archenemy deck building and strategy resource for Magic: The Gathering.`;
  const imageUrl =
    article.og_image_url ||
    article.featured_image ||
    "https://magicsak.com/og-default.png";
  const publishedTime = new Date(article.published_at).toISOString();
  const modifiedTime = new Date(article.updated_at).toISOString();

  return {
    title: `${title} | MagicSAK`,
    description,
    keywords: article.meta_keywords || [],
    authors: [{ name: "MagicSAK Team" }],

    openGraph: {
      title,
      description,
      type: "article",
      url: `https://magicsak.com/articles/${article.slug}`,
      siteName: "MagicSAK",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      publishedTime,
      modifiedTime,
      authors: ["MagicSAK Team"],
      tags: article.meta_keywords || [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },

    alternates: {
      canonical:
        article.canonical_url ||
        `https://magicsak.com/articles/${article.slug}`,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    other: {
      "article:published_time": publishedTime,
      "article:modified_time": modifiedTime,
      "article:author": "MagicSAK Team",
    },
  };
}

// Removed generateStaticParams - articles will be generated on-demand

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) {
    notFound();
  }

  // Increment view count (fire and forget)
  supabase
    .from("articles")
    .update({ view_count: (article.view_count || 0) + 1 })
    .eq("id", article.id)
    .then(() => {});
  // .catch(() => {});

  return <ArticlePageClient article={article} />;
}
