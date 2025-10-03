import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CARDS_API,
  // baseURL: "https://api.scryfall.com",
  headers: {
    // "User-Agent": "ArchenemySelector/0.1",
    Accept: "*/*",
  },
});

export default class DeckApi {
  // constructor() {}
  // TODO: delete this so we're no exposing all decks
  static fetchAllArchenemyDecks = async () =>
    await instance
      .get("/decks/all")
      .then(({ data }) => data)
      .catch((e) => console.log("e", e));
}
