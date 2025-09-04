"use client";
import { Box } from "@mantine/core";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "~/store";
import { fetchAllArchenemyCards } from "~/store/thunks";

const DeckBuilder = () => {
  const dispatch = useDispatch<AppDispatch>();
  // TODO: display all fetched cards, then maybe have a dropdown for selecting specific sets
  // Create Redux slice
  // Create card cards with checkbox or something
  // Title input
  // Notes input?
  // Save button
  // Save in local state for now, but soon save in DB
  // Display decks on deck list page
  const { cardPool } = useSelector((state: RootState) => state.deckBuilder);
  console.log("cardPool", cardPool);

  useEffect(() => {
    if (cardPool.length === 0) {
      // TODO: in the future, unless they choose the default deck, we can display only their deck
      dispatch(fetchAllArchenemyCards());
    }
  }, [dispatch, cardPool.length]);

  return <Box></Box>;
};

export default DeckBuilder;
