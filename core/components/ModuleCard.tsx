import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "./icons";

type ModuleCardProps = {
  title: string;
  icon: ReactNode;
  href: string;
  children: ReactNode;
};

/** Summary card shell that each module uses on the Today page. */
export function ModuleCard({ title, icon, href, children }: ModuleCardProps) {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-paper-elevated p-5 shadow-[0_1px_2px_rgba(43,36,24,0.05)]">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <span className="h-[18px] w-[18px]">{icon}</span>
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            {title}
          </h2>
        </div>
        <Link
          href={href}
          aria-label={`Ir a ${title}`}
          className="rounded-md p-1 text-ink-muted transition hover:bg-ink/5 hover:text-ink"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

type ModuleCardEmptyProps = {
  message: string;
  actionLabel: string;
  actionHref: string;
};

/** Empty state for a ModuleCard: short message plus a call to action. */
export function ModuleCardEmpty({ message, actionLabel, actionHref }: ModuleCardEmptyProps) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-4">
      <p className="font-display text-lg leading-snug text-ink">{message}</p>
      <Link
        href={actionHref}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-accent/30 px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/10"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
