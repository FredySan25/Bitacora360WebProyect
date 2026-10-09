import { useId, type SelectHTMLAttributes } from "react";
import { inputClassName } from "./TextField";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

/** Labeled select; the options go in as children. */
export function SelectField({ label, className, children, ...selectProps }: SelectFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select id={id} className={`${inputClassName} ${className ?? ""}`} {...selectProps}>
        {children}
      </select>
    </div>
  );
}
