/** A sheet of the logbook: forms, lists and cards sit on one. */
export const sheetClassName = "rounded-sheet border border-border bg-paper-elevated";

/** A sheet that holds a list: one row per item, separated by a rule. */
export const listSheetClassName = `divide-y divide-rule ${sheetClassName}`;

/** Empty state of a list: a dashed outline around a short message. */
export const emptyStateClassName =
  "rounded-sheet border-[1.5px] border-dashed border-rule px-4 py-6 text-center text-ink-muted";

/** Heading (h2) of a section of a page. */
export const sectionHeadingClassName =
  "font-display text-2xl font-bold leading-tight text-ink md:text-[1.75rem]";

/** A section heading ruled in ink, for a section that is not on a sheet. */
export const ruledHeadingClassName = `${sectionHeadingClassName} border-b-2 border-ink pb-2`;

/** Heading (h3) of an item inside a section: a goal, a workout. */
export const itemHeadingClassName = "font-display text-2xl font-bold leading-tight text-ink";

/** Small label over a value or a field group. */
export const labelClassName = "text-sm text-ink-muted";

/**
 * A row of tabs, scrolling sideways on a phone. The rule under it is an inset
 * shadow, so the active tab's underline covers it without poking out of the
 * row (which would make it scroll vertically too).
 */
export const tabRowClassName =
  "flex max-w-full gap-1 overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_var(--rule)]";

/** The row of section tabs under a page title (Diario / Progreso / Gym, ...). */
export const tabListClassName = `mb-8 ${tabRowClassName}`;

/** One tab, a link or a label that wraps its radio; the current one is underlined in ink. */
export function tabClassName(active: boolean): string {
  return `relative shrink-0 border-b-[3px] px-3.5 py-2.5 text-[0.9375rem] transition has-focus-visible:outline-2 has-focus-visible:-outline-offset-4 has-focus-visible:outline-accent ${
    active
      ? "border-ink font-bold text-ink"
      : "border-transparent text-ink-muted hover:border-rule hover:text-ink"
  }`;
}

/** A row of headline figures under an ink rule (summary cards, habit stats). */
export const figureRowClassName =
  "grid grid-cols-2 border-t-2 border-b border-ink border-b-rule sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]";

/** One cell of a figure row: label, big figure and an optional detail. */
export const figureCellClassName =
  "flex min-w-0 flex-col gap-0.5 border-rule py-4 pr-4 sm:border-l sm:pl-5 sm:first:border-l-0 sm:first:pl-0";

/** The big figure of a figure cell. */
export const figureValueClassName =
  "font-display text-[2.5rem] leading-[1.05] font-bold text-ink tabular-nums";

/** A segmented choice (Gasto / Ingreso, Todo / Películas / ...): radios inked in when chosen. */
export const segmentGroupClassName =
  "inline-flex max-w-full flex-wrap overflow-hidden rounded-lg border-[1.5px] border-ink";

/** One option of a segmented choice; it wraps its radio. */
export function segmentClassName(selected: boolean): string {
  return `relative px-4 py-2.5 text-[0.9375rem] transition has-focus-visible:outline-2 has-focus-visible:-outline-offset-4 has-focus-visible:outline-accent ${
    selected ? "bg-ink font-bold text-paper" : "text-ink hover:bg-ink/5"
  }`;
}
