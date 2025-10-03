export interface CustomArchenemyCard {
  id: string;
  name: string;
  lang: string;
  releasedAt: string;
  normalImage: string;
  largeImage: string;
  borderCropImage: string;
  typeLine: string;
  oracleText: string;
  flavorText?: string;
  reprint: boolean;
  setId: string;
  set: string;
  setName: string;
  rulingsUri: string;
  rarity: string;
  artist: string;
  artistIds: string[];
}
