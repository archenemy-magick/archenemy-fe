import { CustomArchenemyCard } from "./customArchenemyCard";

export type SupabaseDeckResponse = {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  is_archived: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  lang?: string;
  like_count?: number;
  profiles?: {
    username: string;
  };
  deck_cards: {
    archenemy_cards: CustomArchenemyCard | null;
  }[];
};
