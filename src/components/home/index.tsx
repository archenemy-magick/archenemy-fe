"use client";
// import { fetchSingleCard, test } from "~/store/actions/cards";
// TODO: figure out absolute imports
import CardCard from "../common/CardCard";
import { Box, Button, Grid, Title, Stack } from "@mantine/core";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllArchenemyCards,
  chooseSingleCard,
  abandonScheme,
} from "src/store/reducers";
import { Carousel } from "@mantine/carousel";
import type { RootState } from "~/store";
import type { AppDispatch } from "~/store/configureStore";

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();

  const currentCard = useSelector(
    (state: RootState) => state.cards.currentCard
  );
  const previousCards = useSelector(
    (state: RootState) => state.cards.previousCards
  );
  const ongoingCards = useSelector(
    (state: RootState) => state.cards.ongoingCards
  );

  useEffect(() => {
    dispatch(fetchAllArchenemyCards());
  }, []);

  useEffect(() => {
    console.log("currentCard", currentCard);
  }, [currentCard]);

  return (
    <Grid>
      <Grid.Col span={4}>
        <CardCard imageUrl={currentCard?.image_uris?.normal} />
        <Button mt="md" onClick={() => dispatch(chooseSingleCard())}>
          Play {previousCards.length > 0 ? "New" : "A"} Scheme
        </Button>
      </Grid.Col>
      <Grid.Col span={8}>
        <Stack>
          <Box>
            <Title order={3}>Ongoing Schemes</Title>
            {ongoingCards.map((card, index) => (
              <CardCard
                key={card.id}
                imageUrl={card.image_uris?.normal}
                buttonText="Abandon Scheme"
                onButtonClick={() => dispatch(abandonScheme({ index }))}
              />
            ))}
          </Box>
          <Box>
            <div>
              <Title order={3}>Previous Schemes</Title>
              <Carousel
                slideSize="200px"
                // height={200}
                slideGap="none"
                controlsOffset="sm"
                controlSize={26}
                withControls
                withIndicators={false}
                orientation="horizontal"
              >
                {previousCards.map((card) => (
                  <Carousel.Slide key={card.id}>
                    <CardCard imageUrl={card.image_uris?.normal} />
                    {/* <Image src={card.image_uris?.small} /> */}
                  </Carousel.Slide>
                ))}
              </Carousel>
            </div>
          </Box>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};

export default Home;
