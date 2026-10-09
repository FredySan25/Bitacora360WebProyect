import type { ReactNode } from "react";

/** Titled card that frames one chart of the summary. */
export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-paper-elevated p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}
