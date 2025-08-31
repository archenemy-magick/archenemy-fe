import { ScryfallCard } from "@scryfall/api-types";

const mockScryfallScheme: ScryfallCard.Scheme = {
  object: "card",
  id: "9aca80a4-8973-412c-8f9e-7f66cf51bef5",
  oracle_id: "63de6d28-4b75-4f48-aee1-e15c355fb7b2",
  multiverse_ids: [675219],
  tcgplayer_id: 577851,
  name: "Chaos Is My Plaything",
  lang: "en",
  released_at: "2024-09-27",
  uri: "https://api.scryfall.com/cards/9aca80a4-8973-412c-8f9e-7f66cf51bef5",
  scryfall_uri:
    "https://scryfall.com/card/dsc/329/chaos-is-my-plaything?utm_source=api",
  layout: "scheme",
  highres_image: true,
  image_status: "highres_scan",
  image_uris: {
    small:
      "https://cards.scryfall.io/small/front/9/a/9aca80a4-8973-412c-8f9e-7f66cf51bef5.jpg?1726285603",
    normal:
      "https://cards.scryfall.io/normal/front/9/a/9aca80a4-8973-412c-8f9e-7f66cf51bef5.jpg?1726285603",
    large:
      "https://cards.scryfall.io/large/front/9/a/9aca80a4-8973-412c-8f9e-7f66cf51bef5.jpg?1726285603",
    png: "https://cards.scryfall.io/png/front/9/a/9aca80a4-8973-412c-8f9e-7f66cf51bef5.png?1726285603",
    art_crop:
      "https://cards.scryfall.io/art_crop/front/9/a/9aca80a4-8973-412c-8f9e-7f66cf51bef5.jpg?1726285603",
    border_crop:
      "https://cards.scryfall.io/border_crop/front/9/a/9aca80a4-8973-412c-8f9e-7f66cf51bef5.jpg?1726285603",
  },
  mana_cost: "",
  cmc: 0,
  type_line: "Scheme",
  oracle_text:
    "When you set this scheme in motion, for each opponent, exile target permanent that player controls. Then each player reveals cards from the top of their library until they reveal a permanent card, puts it onto the battlefield, and puts the rest on the bottom of their library in a random order.",
  colors: [],
  color_identity: [],
  keywords: [],
  legalities: {
    standard: "not_legal",
    future: "not_legal",
    historic: "not_legal",
    timeless: "not_legal",
    gladiator: "not_legal",
    pioneer: "not_legal",
    modern: "not_legal",
    legacy: "not_legal",
    pauper: "not_legal",
    vintage: "not_legal",
    penny: "not_legal",
    commander: "not_legal",
    oathbreaker: "not_legal",
    brawl: "not_legal",
    alchemy: "not_legal",
    paupercommander: "not_legal",
    duel: "not_legal",
    oldschool: "not_legal",
    premodern: "not_legal",
    predh: "not_legal",
    explorer: "not_legal",
    historicbrawl: "not_legal",
  },
  games: ["paper"],
  reserved: false,
  foil: false,
  nonfoil: true,
  finishes: ["nonfoil"],
  oversized: true,
  promo: false,
  reprint: false,
  variation: false,
  set_id: "4c822528-83c3-42c7-8708-dd1d37166819",
  set: "dsc",
  set_name: "Duskmourn: House of Horror Commander",
  set_type: "commander",
  set_uri: "https://api.scryfall.com/sets/4c822528-83c3-42c7-8708-dd1d37166819",
  set_search_uri:
    "https://api.scryfall.com/cards/search?order=set&q=e%3Adsc&unique=prints",
  scryfall_set_uri: "https://scryfall.com/sets/dsc?utm_source=api",
  rulings_uri:
    "https://api.scryfall.com/cards/9aca80a4-8973-412c-8f9e-7f66cf51bef5/rulings",
  prints_search_uri:
    "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A63de6d28-4b75-4f48-aee1-e15c355fb7b2&unique=prints",
  collector_number: "329",
  digital: false,
  rarity: "common",
  card_back_id: "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
  artist: "Alix Branwyn",
  artist_ids: ["4f0a0e38-d74c-4e0b-ad91-fecccb1afa5d"],
  illustration_id: "472e04d3-49e9-42bd-b491-48b322bb62e8",
  border_color: "black",
  frame: "2015",
  full_art: false,
  textless: false,
  booster: false,
  story_spotlight: false,
  prices: {
    usd: "0.23",
    usd_foil: null,
    usd_etched: null,
    eur: null,
    eur_foil: null,
    tix: null,
  },
  related_uris: {
    gatherer:
      "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=675219&printed=false",
    tcgplayer_infinite_articles:
      "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DChaos%2BIs%2BMy%2BPlaything",
    tcgplayer_infinite_decks:
      "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DChaos%2BIs%2BMy%2BPlaything",
    edhrec: "https://edhrec.com/route/?cc=Chaos+Is+My+Plaything",
  },
  purchase_uris: {
    tcgplayer:
      "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F577851%3Fpage%3D1",
    cardmarket:
      "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Chaos+Is+My+Plaything&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
    cardhoarder:
      "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Chaos+Is+My+Plaything&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall",
  },
};

export { mockScryfallScheme };
