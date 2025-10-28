// src/types/article.ts

export type ArticleStatus = "draft" | "published" | "archived";

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown content
  excerpt: string | null;
  featured_image: string | null;
  author_id: string;
  status: ArticleStatus;
  published_at: string | null; // ISO datetime string
  created_at: string;
  updated_at: string;
  view_count: number;
  subtitle: string;

  // Relations (if you're joining these)
  author?: {
    id: string;
    email: string;
    username?: string;
  };
  tags?: ArticleTag[];
  article_cards?: ArticleCard[];
  article_decks?: ArticleDeck[];
}

// For article tags (many-to-many)
export interface ArticleTag {
  article_id: string;
  tag_id: string;
  tag?: Tag;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// For linking articles to cards
export interface ArticleCard {
  article_id: string;
  card_id: string;
  card?: {
    id: string;
    name: string;
    // ... other card fields
  };
}

// For linking articles to decks
export interface ArticleDeck {
  article_id: string;
  deck_id: string;
  deck?: {
    id: string;
    name: string;
    // ... other deck fields
  };
}

// For creating/updating articles
export interface CreateArticleInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  status?: ArticleStatus;
  tag_ids?: string[];
  card_ids?: string[];
  deck_ids?: string[];
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
  id: string;
}

// For article images table
export interface ArticleImage {
  id: string;
  article_id: string;
  storage_path: string;
  url: string;
  alt_text: string | null;
  created_at: string;
}
