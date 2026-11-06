"use client";

import { useSyncExternalStore } from "react";
import { todayKey, type DateKey } from "../lib/dates";

// Nothing to subscribe to: the day is read once, when the page loads.
const subscribe = () => () => {};
const getServerToday = () => null;

/**
 * Today's key in the viewer's own timezone, or null while rendering on the
 * server, whose clock (UTC when deployed) can already be on another day.
 */
export function useClientToday(): DateKey | null {
  return useSyncExternalStore(subscribe, todayKey, getServerToday);
}
