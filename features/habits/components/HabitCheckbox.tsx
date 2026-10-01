import { CheckIcon } from "@/core/components/icons";

type HabitCheckboxProps = {
  checked: boolean;
  /** Accessible name, e.g. the habit's name. */
  label: string;
  onToggle: () => void;
};

/** Round check toggle for marking a habit as done. */
export function HabitCheckbox({ checked, label, onToggle }: HabitCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition active:scale-95 ${
        checked
          ? "border-accent bg-accent text-accent-foreground"
          : "border-ink-muted/60 bg-paper text-transparent hover:border-accent"
      }`}
    >
      <CheckIcon className="h-4 w-4" strokeWidth={2.4} />
    </button>
  );
}
