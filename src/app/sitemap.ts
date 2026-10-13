import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://magicsak.com";

// Rebuild hourly so new public decks and articles show up.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

// Pages anyone can open without an account. Signed-in-only pages (stats,
// game log, friends, /home, the deck builder, My Decks) are left out:
// crawlers would only be redirected to sign-in.
const STATIC_PAGES: Omit<Entry, "lastModified">[] = [
  { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
  { url: `${BASE_URL}/game`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${BASE_URL}/archenemy`, changeFrequency: "monthly", priority: 0.8 },
  {
    url: `${BASE_URL}/archenemy/decks/built-in`,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/archenemy/decks/public`,
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/archenemy/popular-cards`,
    changeFrequency: "weekly",
    priority: 0.7,
  },
  { url: `${BASE_URL}/articles`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/feedback`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE_URL}/signup`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
];

// Public decks and published articles. Uses the anon key, so it can only
// ever see what a signed-out visitor could. Failures just leave them out.
async function dynamicEntries(): Promise<Entry[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const [decks, articles] = await Promise.all([
    supabase
      .from("archenemy_decks")
      .select("id, updated_at")
      .eq("is_public", true)
      .eq("is_archived", false),
    supabase.from("published_articles").select("slug, updated_at"),
  ]);

  const entries: Entry[] = [];
  for (const deck of decks.data ?? []) {
    entries.push({
      url: `${BASE_URL}/archenemy/decks/${deck.id}`,
      lastModified: new Date(deck.updated_at),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }
  for (const article of articles.data ?? []) {
    entries.push({
      url: `${BASE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let dynamic: Entry[] = [];
  try {
    dynamic = await dynamicEntries();
  } catch {
    // Keep the static sitemap if Supabase is unreachable at build time.
  }
  return [
    ...STATIC_PAGES.map((page) => ({ ...page, lastModified: now })),
    ...dynamic,
  ];
}
