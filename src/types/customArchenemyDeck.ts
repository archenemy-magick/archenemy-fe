import { CustomArchenemyCard } from "./customArchenemyCard";

export interface CustomArchenemyDeck {
  id: string;
  name: string;
  lang: string;
  // normal_image: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  deck_cards: CustomArchenemyCard[];
  description: string;
  is_archived: boolean;
  is_public: boolean;
  like_count?: number;
}
