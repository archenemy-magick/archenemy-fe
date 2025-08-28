import { Center, Grid, Modal } from "@mantine/core";
import CardSlot from "../common/CardSlot";
import DeckCard from "../DeckCard/DeckCard";

const DeckSelectorModal = ({
  open,
  onClose,
  onSelectDeck,
}: {
  open: boolean;
  onClose: () => void;
  onSelectDeck?: (deckId: string) => void;
}) => {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      fullScreen
      closeButtonProps={{ hidden: true }}
    >
      <Grid>
        <Grid.Col span={12}>
          <Center>
            <DeckCard selectDeck={() => onSelectDeck?.("0")} />
          </Center>
        </Grid.Col>
      </Grid>
    </Modal>
  );
};

export default DeckSelectorModal;
