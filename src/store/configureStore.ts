import { cardsSlice } from "./reducers";

import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    cards: cardsSlice.reducer,
  },
});

export default store;
