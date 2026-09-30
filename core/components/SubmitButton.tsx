import type { ReactNode } from "react";

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
      className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-foreground transition hover:bg-accent-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {loading ? loadingLabel : children}
    </button>
  );
}
