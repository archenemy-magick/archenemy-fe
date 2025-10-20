"use client";

import { ActionIcon, Transition } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { IconArrowUp } from "@tabler/icons-react";

export function ScrollToTop() {
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <Transition
      mounted={scroll.y > 300}
      transition="slide-up"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color="pink"
          style={{
            ...styles,
            position: "fixed",
            bottom: 80,
            right: 20,
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
          onClick={() => scrollTo({ y: 0 })}
          aria-label="Scroll to top"
        >
          <IconArrowUp size={20} />
        </ActionIcon>
      )}
    </Transition>
  );
}
