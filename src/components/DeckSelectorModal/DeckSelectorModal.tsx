import { Center, Grid, Modal } from "@mantine/core";
import CardSlot from "../common/CardSlot";

const DeckSelectorModal = ({ open, onClose }) => {
  return (
    <Modal opened={open} onClose={onClose}>
      <Grid>
        <Grid.Col span={12}>
          <Center>
            {/* TODO: replace this with the DeckCard component */}
            Test
            <CardSlot />
          </Center>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};

export default DeckSelectorModal;
