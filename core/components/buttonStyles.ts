/** Secondary action: outlined, accent-colored. */
export const outlineButtonClassName =
  "inline-flex w-fit items-center gap-1.5 rounded-lg border border-accent/30 px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-60";

/** Low-emphasis text action (cancel, archive, ...). */
export const ghostButtonClassName =
  "inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60";

/** Square icon-only button; always pair it with an aria-label. */
export const iconButtonClassName =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";
