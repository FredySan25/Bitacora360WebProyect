import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export const inputClassName =
  "w-full rounded-lg border border-border bg-paper px-3 py-2.5 text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  /** Extra content rendered inside the input box, on the right (e.g. a toggle button). */
  trailing?: ReactNode;
};

/** Labeled input with an optional hint below it. */
export function TextField({ label, hint, trailing, className, ...inputProps }: TextFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-describedby={hintId}
          className={`${inputClassName} ${trailing ? "pr-11" : ""} ${className ?? ""}`}
          {...inputProps}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
