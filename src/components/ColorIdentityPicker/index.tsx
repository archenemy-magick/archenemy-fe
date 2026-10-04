"use client";

import { Group, UnstyledButton, Tooltip } from "@mantine/core";
import { COLOR_META, COLORLESS_META } from "~/lib/mtgColors";
import { MTG_COLORS, type MtgColor } from "~/types/recordedGame";

type ColorIdentityPickerProps = {
  value: MtgColor[];
  onChange: (colors: MtgColor[]) => void;
  size?: number;
  /**
   * Adds a Colorless pip. Callers decide what it means: in the record form
   * it is simply "no colors"; in stats filters it is its own filter.
   */
  colorless?: { selected: boolean; onSelect: () => void };
};

function pipStyle(
  meta: { fill: string; text: string },
  selected: boolean,
  size: number
): React.CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: size * 0.42,
    background: meta.fill,
    color: meta.text,
    border: selected
      ? "3px solid var(--mantine-color-yellow-5)"
      : "2px solid rgba(0,0,0,0.35)",
    opacity: selected ? 1 : 0.45,
    transform: selected ? "scale(1.05)" : "scale(1)",
    boxShadow: selected ? "0 0 0 2px rgba(255, 193, 7, 0.35)" : "none",
  };
}

export function ColorIdentityPicker({
  value,
  onChange,
  size = 32,
  colorless,
}: ColorIdentityPickerProps) {
  const toggle = (color: MtgColor) => {
    if (value.includes(color)) {
      onChange(value.filter((c) => c !== color));
    } else {
      onChange([...value, color]);
    }
  };

  return (
    <Group gap={6}>
      {MTG_COLORS.map((color) => {
        const selected = value.includes(color);
        const meta = COLOR_META[color];
        return (
          <Tooltip key={color} label={meta.name} withArrow>
            <UnstyledButton
              type="button"
              aria-pressed={selected}
              aria-label={meta.name}
              onClick={() => toggle(color)}
              style={pipStyle(meta, selected, size)}
            >
              {meta.label}
            </UnstyledButton>
          </Tooltip>
        );
      })}
      {colorless ? (
        <Tooltip label={COLORLESS_META.name} withArrow>
          <UnstyledButton
            type="button"
            aria-pressed={colorless.selected}
            aria-label={COLORLESS_META.name}
            onClick={colorless.onSelect}
            style={pipStyle(COLORLESS_META, colorless.selected, size)}
          >
            {COLORLESS_META.label}
          </UnstyledButton>
        </Tooltip>
      ) : null}
    </Group>
  );
}

export function ColorPips({
  colors,
  size = 18,
}: {
  colors: MtgColor[];
  size?: number;
}) {
  if (colors.length === 0) {
    return (
      <span
        aria-label="Colorless"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.55,
          fontWeight: 700,
          background: COLORLESS_META.fill,
          color: COLORLESS_META.text,
        }}
      >
        {COLORLESS_META.label}
      </span>
    );
  }

  return (
    <Group gap={4} wrap="nowrap">
      {colors.map((color) => {
        const meta = COLOR_META[color];
        return (
          <span
            key={color}
            aria-label={meta.name}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: size * 0.55,
              fontWeight: 800,
              background: meta.fill,
              color: meta.text,
              border: "1px solid rgba(0,0,0,0.25)",
            }}
          >
            {meta.label}
          </span>
        );
      })}
    </Group>
  );
}
