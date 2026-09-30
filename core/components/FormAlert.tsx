/** Error message for forms, announced by screen readers when it appears. */
export function FormAlert({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-ink"
    >
      {message}
    </p>
  );
}
