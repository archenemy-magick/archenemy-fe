import { CustomArchenemyCard } from "./customArchenemyCard";

export interface CustomArchenemyDeck {
  id: string;
  name: string;
  lang: string;
  // normalImage: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  deckCards: CustomArchenemyCard[];
  description: string;
  isArchived: boolean;
  isPublic: boolean;
}
