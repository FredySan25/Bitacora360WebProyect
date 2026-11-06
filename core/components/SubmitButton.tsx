import type { ReactNode } from "react";
import { primaryButtonClassName } from "./buttonStyles";

type SubmitButtonProps = {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
};

/** Primary form submit button with a loading spinner. */
export function SubmitButton({ loading, loadingLabel, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className={`${primaryButtonClassName} active:scale-[0.99] motion-reduce:active:scale-100`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        />
      )}
      {loading ? loadingLabel : children}
    </button>
  );
}
