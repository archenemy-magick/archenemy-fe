// Article API functions (FIXED)
// Replace ~/lib/api/articles.ts with this

import { ArticleTag } from "~/types/articles";
import { createClient } from "../supabase/client";

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt?: string;
  author_id: string;
  featured_image?: string;
  status: "draft" | "published" | "archived";
  published_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  meta_description?: string;
  meta_keywords?: string[];
  author_email?: string;
  comment_count?: number;
  tags?: ArticleTag[];
}

const supabase = createClient();

/**
 * Get all published articles
 */
export async function getPublishedArticles() {
  const { data, error } = await supabase
    .from("published_articles")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data as Article[];
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string) {
  // First, get the article
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (articleError) throw articleError;

  // Get tags separately
  const { data: tagRelations, error: tagsError } = await supabase
    .from("article_tag_relations")
    .select(
      `
      tag:article_tags (
        id,
        name,
        slug
      )
    `
    )
    .eq("article_id", article.id);

  if (!tagsError && tagRelations) {
    article.tags = tagRelations;
  }

  // Get linked card IDs (just the IDs, no join to archenemy_cards)
  const { data: cardLinks, error: cardsError } = await supabase
    .from("article_cards")
    .select("card_id")
    .eq("article_id", article.id);

  if (!cardsError && cardLinks) {
    article.article_cards = cardLinks;
  }

  // Get linked deck IDs (just the IDs, no join to archenemy_decks)
  const { data: deckLinks, error: decksError } = await supabase
    .from("article_decks")
    .select("deck_id")
    .eq("article_id", article.id);

  if (!decksError && deckLinks) {
    article.article_decks = deckLinks;
  }

  // Increment view count
  await supabase.rpc("increment_article_views", { article_slug: slug });

  return article;
}

/**
 * Get articles by tag
 */
export async function getArticlesByTag(tagSlug: string) {
  // Get tag first
  const { data: tag, error: tagError } = await supabase
    .from("article_tags")
    .select("id")
    .eq("slug", tagSlug)
    .single();

  if (tagError) throw tagError;

  // Get article IDs with this tag
  const { data: relations, error: relError } = await supabase
    .from("article_tag_relations")
    .select("article_id")
    .eq("tag_id", tag.id);

  if (relError) throw relError;

  const articleIds = relations.map((r) => r.article_id);

  // Get articles
  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .in("id", articleIds)
    .order("published_at", { ascending: false });

  if (articlesError) throw articlesError;
  return articles;
}

/**
 * Get articles related to a card
 */
export async function getArticlesByCard(cardId: string) {
  // Get article IDs that reference this card
  const { data: links, error: linksError } = await supabase
    .from("article_cards")
    .select("article_id")
    .eq("card_id", cardId);

  if (linksError) throw linksError;

  if (links.length === 0) return [];

  const articleIds = links.map((l) => l.article_id);

  // Get articles
  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .in("id", articleIds)
    .order("published_at", { ascending: false });

  if (articlesError) throw articlesError;
  return articles;
}

/**
 * Get articles related to a deck
 */
export async function getArticlesByDeck(deckId: string) {
  // Get article IDs that reference this deck
  const { data: links, error: linksError } = await supabase
    .from("article_decks")
    .select("article_id")
    .eq("deck_id", deckId);

  if (linksError) throw linksError;

  if (links.length === 0) return [];

  const articleIds = links.map((l) => l.article_id);

  // Get articles
  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .in("id", articleIds)
    .order("published_at", { ascending: false });

  if (articlesError) throw articlesError;
  return articles;
}

/**
 * Search articles
 */
export async function searchArticles(query: string) {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .or(
      `title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`
    )
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get user's articles (for author dashboard)
 */
export async function getUserArticles() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Create a new article
 */
export async function createArticle(article: Partial<Article>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("articles")
    .insert({
      ...article,
      author_id: user.id,
      status: article.status || "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an article
 */
export async function updateArticle(id: string, updates: Partial<Article>) {
  const { data, error } = await supabase
    .from("articles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Publish an article
 */
export async function publishArticle(id: string) {
  return updateArticle(id, {
    status: "published",
    published_at: new Date().toISOString(),
  } as Article);
}

/**
 * Delete an article
 */
export async function deleteArticle(id: string) {
  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Get all tags
 */
export async function getAllTags() {
  const { data, error } = await supabase
    .from("article_tags")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

/**
 * Add tags to an article
 */
export async function addTagsToArticle(articleId: string, tagIds: string[]) {
  const relations = tagIds.map((tagId) => ({
    article_id: articleId,
    tag_id: tagId,
  }));

  const { error } = await supabase
    .from("article_tag_relations")
    .insert(relations);

  if (error) throw error;
}

/**
 * Link cards to an article
 */
export async function linkCardsToArticle(articleId: string, cardIds: string[]) {
  const relations = cardIds.map((cardId) => ({
    article_id: articleId,
    card_id: cardId,
  }));

  const { error } = await supabase.from("article_cards").insert(relations);

  if (error) throw error;
}

/**
 * Link decks to an article
 */
export async function linkDecksToArticle(articleId: string, deckIds: string[]) {
  const relations = deckIds.map((deckId) => ({
    article_id: articleId,
    deck_id: deckId,
  }));

  const { error } = await supabase.from("article_decks").insert(relations);

  if (error) throw error;
}

/**
 * Get comments for an article
 */
export async function getArticleComments(articleId: string) {
  const { data, error } = await supabase
    .from("article_comments")
    .select(
      `
      *,
      user:auth.users (email)
    `
    )
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Add a comment to an article
 */
export async function addArticleComment(articleId: string, content: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("article_comments")
    .insert({
      article_id: articleId,
      user_id: user.id,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
