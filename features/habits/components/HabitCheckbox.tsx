import { CheckIcon } from "@/core/components/icons";

type HabitCheckboxProps = {
  checked: boolean;
  /** Accessible name, e.g. the habit's name. */
  label: string;
  onToggle: () => void;
};

/** Square check toggle for marking a habit as done; inked in when done. */
export function HabitCheckbox({ checked, label, onToggle }: HabitCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition active:scale-95 motion-reduce:active:scale-100 ${
        checked
          ? "border-ink bg-ink text-paper"
          : "border-ink-muted bg-transparent text-transparent hover:border-ink"
      }`}
    >
      <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
    </button>
  );
}
