"use client";

import { useSyncExternalStore } from "react";

const formatter = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

// Nothing to subscribe to: the date is read once, when the page loads.
const subscribe = () => () => {};
const getClientDate = () => formatter.format(new Date());
// Non-breaking space, so the line keeps its height until the date shows up.
const getServerDate = () => " ";

/**
 * Renders today's date in the viewer's own timezone (not the server's),
 * e.g. "martes, 29 de septiembre". The server renders a placeholder and the
 * browser fills in the date: the server's clock (UTC when deployed) can
 * already be on the next day.
 */
export function CurrentDate({ className }: { className?: string }) {
  const formatted = useSyncExternalStore(subscribe, getClientDate, getServerDate);

  return <time className={`first-letter:uppercase ${className ?? ""}`}>{formatted}</time>;
}
