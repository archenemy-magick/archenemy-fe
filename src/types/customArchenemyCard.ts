export interface CustomArchenemyCard {
  id: string;
  name: string;
  lang: string;
  released_at: string;
  normal_image: string;
  large_image: string;
  border_crop_image: string;
  type_line: string;
  oracle_text: string;
  flavor_text?: string;
  reprint: boolean;
  set_id: string;
  set: string;
  set_name: string;
  rulings_uri: string;
  rarity: string;
  artist: string;
  artist_ids: string[];
}
