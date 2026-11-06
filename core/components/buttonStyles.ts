const base =
  "inline-flex items-center justify-center gap-2 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-55";

/** Main action of a form or a screen: solid ink. */
export const primaryButtonClassName = `${base} min-h-11 border-[1.5px] border-ink bg-ink px-5 text-[0.9375rem] font-bold text-paper hover:bg-ink/85`;

/** Secondary action: outlined in ink. */
export const outlineButtonClassName = `${base} w-fit min-h-10 border-[1.5px] border-ink px-4 text-sm font-bold text-ink hover:bg-ink/5`;

/** Low-emphasis text action (cancel, archive, ...). */
export const ghostButtonClassName = `${base} w-fit min-h-10 px-3 text-sm font-medium text-ink-muted hover:bg-ink/5 hover:text-ink`;

/** Destructive confirmation, as in the delete dialog. */
export const dangerButtonClassName = `${base} w-fit min-h-11 border-[1.5px] border-danger bg-danger px-5 text-[0.9375rem] font-bold text-paper hover:opacity-90`;

/** Square icon-only button; always pair it with an aria-label. */
export const iconButtonClassName =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-muted transition hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

/** A button that reads as a link: an underlined accent word. */
export const linkButtonClassName =
  "inline-flex min-h-10 w-fit items-center px-2 font-bold text-accent underline underline-offset-[3px] transition hover:text-accent-hover";
