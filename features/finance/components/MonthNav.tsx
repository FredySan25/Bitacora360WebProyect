import { ghostButtonClassName, iconButtonClassName } from "@/core/components/buttonStyles";
import { ChevronLeftIcon, ChevronRightIcon } from "@/core/components/icons";
import { addMonths, formatMonth, type MonthKey } from "@/core/lib/dates";

type MonthNavProps = {
  month: MonthKey;
  /** The current month: the latest one that can be shown. */
  thisMonth: MonthKey;
  onChange: (month: MonthKey) => void;
};

/** Steps one month back or forward, never past the current one. */
export function MonthNav({ month, thisMonth, onChange }: MonthNavProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        aria-label="Mes anterior"
        onClick={() => onChange(addMonths(month, -1))}
        className={iconButtonClassName}
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <p
        aria-live="polite"
        className="min-w-44 text-center font-display text-xl font-semibold leading-tight text-ink first-letter:uppercase"
      >
        {formatMonth(month)}
      </p>
      <button
        type="button"
        aria-label="Mes siguiente"
        disabled={month >= thisMonth}
        onClick={() => onChange(addMonths(month, 1))}
        className={iconButtonClassName}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
      {month !== thisMonth && (
        <button type="button" onClick={() => onChange(thisMonth)} className={ghostButtonClassName}>
          Mes actual
        </button>
      )}
    </div>
  );
}
