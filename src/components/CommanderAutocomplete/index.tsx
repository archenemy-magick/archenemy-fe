"use client";

import { useEffect, useState } from "react";
import { Autocomplete, Loader } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { getColorIdentity, searchCommanderNames } from "~/lib/api/scryfall";
import type { MtgColor } from "~/types/recordedGame";

type CommanderAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called with the commander's color identity after a suggestion is picked. */
  onColorIdentity?: (colors: MtgColor[]) => void;
  /** Commanders from the user's own history, shown before Scryfall results. */
  recentCommanders?: string[];
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export function CommanderAutocomplete({
  value,
  onChange,
  onColorIdentity,
  recentCommanders = [],
  label = "Commander",
  placeholder = "Atraxa, Praetors' Voice",
  required,
}: CommanderAutocompleteProps) {
  const [debounced] = useDebouncedValue(value, 250);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    if (debounced.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchCommanderNames(debounced, controller.signal).then((names) => {
      if (controller.signal.aborted) return;
      setResults(names);
      setLoading(false);
    });
    return () => controller.abort();
  }, [debounced]);

  const needle = value.trim().toLowerCase();
  const recentMatches = recentCommanders.filter((name) =>
    name.toLowerCase().includes(needle)
  );
  const remote = results.filter((name) => !recentMatches.includes(name));

  const data = [
    ...(recentMatches.length > 0
      ? [{ group: "Played before", items: recentMatches.slice(0, 5) }]
      : []),
    ...(remote.length > 0 ? [{ group: "Commanders", items: remote }] : []),
  ];

  const handleSelect = async (name: string) => {
    if (!onColorIdentity) return;
    const colors = await getColorIdentity(name);
    if (colors) onColorIdentity(colors);
  };

  return (
    <Autocomplete
      label={label}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
      onOptionSubmit={handleSelect}
      data={data}
      filter={({ options }) => options}
      rightSection={loading ? <Loader size="xs" /> : null}
      comboboxProps={{ withinPortal: true }}
    />
  );
}
