import { AlertIcon } from "./icons";

/** Error message for forms, announced by screen readers when it appears. */
export function FormAlert({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border-[1.5px] border-danger bg-paper-elevated px-3.5 py-3 text-[0.9375rem] text-ink"
    >
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
      <span>{message}</span>
    </p>
  );
}
