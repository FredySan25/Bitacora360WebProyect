"use client";

/**
 * Renders today's date in the viewer's own timezone (not the server's),
 * e.g. "martes, 29 de septiembre".
 */
export function CurrentDate({ className }: { className?: string }) {
  const formatted = new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <time suppressHydrationWarning className={`first-letter:uppercase ${className ?? ""}`}>
      {formatted}
    </time>
  );
}
