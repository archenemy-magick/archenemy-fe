// Add/update these fields in your ~/types file

import { CustomArchenemyCard } from "./customArchenemyCard";

export interface CustomArchenemyDeck {
  id: string;
  lang?: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deck_cards: CustomArchenemyCard[];
  is_public?: boolean;
  is_archived?: boolean;
  like_count?: number;
  view_count?: number;
  user_profile?: {
    username?: string;
    avatar_url?: string;
  };
}
