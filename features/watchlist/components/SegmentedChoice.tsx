"use client";

import { useId } from "react";

type SegmentedChoiceProps<T extends string> = {
  /** Names the group; shown above the pills unless `hideLegend`. */
  legend: string;
  hideLegend?: boolean;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

/** A row of pills that behaves as a radio group: one option is always picked. */
export function SegmentedChoice<T extends string>({
  legend,
  hideLegend,
  options,
  value,
  onChange,
  disabled,
}: SegmentedChoiceProps<T>) {
  const name = useId();

  return (
    <fieldset disabled={disabled}>
      <legend className={hideLegend ? "sr-only" : "mb-1.5 text-sm font-medium text-ink"}>
        {legend}
      </legend>
      <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-paper p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={`relative shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
              value === option.value
                ? "bg-accent/10 text-accent"
                : "text-ink-muted hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {/* Covers the whole pill, so a click anywhere on it lands on the radio */}
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
