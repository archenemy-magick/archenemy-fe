import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CARDS_API,
  // baseURL: "https://api.scryfall.com",
  headers: {
    // "User-Agent": "ArchenemySelector/0.1",
    Accept: "*/*",
  },
});

// TODO: extend this so it doesn't need the whole URL every time
export default class CardApi {
  // constructor() {}
  static fetchAllArchenemyCards = async () =>
    await instance
      .post("/cards/archenemy")
      .then(({ data }) => data)
      .catch((e) => console.log("e", e));
}
