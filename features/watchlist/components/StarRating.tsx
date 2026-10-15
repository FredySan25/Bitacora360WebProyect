"use client";

import { useId, useState } from "react";
import { ghostButtonClassName } from "@/core/components/buttonStyles";
import { StarIcon } from "@/core/components/icons";
import { MAX_RATING } from "../constants";

const STARS = Array.from({ length: MAX_RATING }, (_, i) => i + 1);

function starsLabel(stars: number): string {
  return stars === 1 ? "1 estrella" : `${stars} estrellas`;
}

type StarRatingProps = {
  /** Names the group; shown above the stars unless `hideLabel`. */
  label: string;
  hideLabel?: boolean;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

/**
 * One to five whole stars as a radio group, so it works with the keyboard and
 * reads as "3 estrellas". "Quitar" clears the rating.
 */
export function StarRating({ label, hideLabel, value, onChange, disabled }: StarRatingProps) {
  const name = useId();
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value ?? 0;

  return (
    <fieldset disabled={disabled}>
      <legend className={hideLabel ? "sr-only" : "mb-1.5 text-sm font-medium text-ink"}>
        {label}
      </legend>
      <div className="flex items-center gap-2">
        <div className="flex" onMouseLeave={() => setHovered(null)}>
          {STARS.map((stars) => (
            <label
              key={stars}
              onMouseEnter={() => setHovered(stars)}
              className="cursor-pointer rounded p-0.5 has-focus-visible:outline-2 has-focus-visible:outline-accent has-disabled:cursor-not-allowed"
            >
              <input
                type="radio"
                name={name}
                value={stars}
                checked={value === stars}
                onChange={() => onChange(stars)}
                className="sr-only"
              />
              <StarIcon
                className={`h-6 w-6 transition-colors ${
                  stars <= shown ? "text-warning" : "text-ink-muted/40"
                }`}
                fill={stars <= shown ? "currentColor" : "none"}
              />
              <span className="sr-only">{starsLabel(stars)}</span>
            </label>
          ))}
        </div>
        {value !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Quitar calificación"
            className={ghostButtonClassName}
          >
            Quitar
          </button>
        )}
      </div>
    </fieldset>
  );
}
