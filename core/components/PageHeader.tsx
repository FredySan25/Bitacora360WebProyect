import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: string;
  description?: ReactNode;
  /** Shown beside the title from md up, below it on a phone (e.g. the year rose). */
  aside?: ReactNode;
};

/** Standard page heading: a small line on top, the highlighted title and an optional description. */
export function PageHeader({ eyebrow, title, description, aside }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-center gap-x-14 gap-y-8">
      <div className="flex min-w-0 flex-[1_1_22rem] flex-col gap-1.5">
        {eyebrow && <p className="text-base text-ink-muted">{eyebrow}</p>}
        <h1 className="font-display text-5xl leading-[0.95] font-bold text-ink md:text-[4rem]">
          <span className="highlight-mark">{title}</span>
        </h1>
        {description && <p className="mt-1 text-[1.0625rem] text-ink-muted">{description}</p>}
      </div>
      {aside}
    </header>
  );
}
