"use client";

import { useId } from "react";
import {
  segmentClassName,
  segmentGroupClassName,
  tabClassName,
  tabRowClassName,
} from "@/core/components/surfaces";

type SegmentedChoiceProps<T extends string> = {
  /** Names the group; shown above the pills unless `hideLegend`. */
  legend: string;
  hideLegend?: boolean;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  /** "tabs" for a filter over a whole screen, so it reads like the section tabs. */
  look?: "segments" | "tabs";
};

/** A row of options that behaves as a radio group: one option is always picked. */
export function SegmentedChoice<T extends string>({
  legend,
  hideLegend,
  options,
  value,
  onChange,
  disabled,
  look = "segments",
}: SegmentedChoiceProps<T>) {
  const name = useId();
  const optionClassName = look === "tabs" ? tabClassName : segmentClassName;

  return (
    <fieldset disabled={disabled}>
      <legend className={hideLegend ? "sr-only" : "mb-1.5 text-sm font-bold text-ink"}>
        {legend}
      </legend>
      <div className={look === "tabs" ? tabRowClassName : segmentGroupClassName}>
        {options.map((option) => (
          <label
            key={option.value}
            className={optionClassName(value === option.value)}
          >
            {/* Covers the whole option, so a click anywhere on it lands on the radio */}
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
