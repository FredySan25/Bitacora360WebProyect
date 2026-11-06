import Link from "next/link";
import type { ReactNode } from "react";
import { iconButtonClassName } from "./buttonStyles";
import { ArrowRightIcon } from "./icons";
import { sectionHeadingClassName, sheetClassName } from "./surfaces";

type ModuleCardProps = {
  title: string;
  href: string;
  /** On a sheet of its own; otherwise the section sits on the page under an ink rule. */
  framed?: boolean;
  children: ReactNode;
};

/** A module's entry on the Today page: its title, a link to the module and its summary. */
export function ModuleCard({ title, href, framed = false, children }: ModuleCardProps) {
  return (
    <section
      className={`flex flex-col gap-4 ${framed ? `${sheetClassName} px-5 pt-5 pb-4 md:px-7 md:pt-7` : ""}`}
    >
      <header
        className={`flex items-center gap-3 ${framed ? "" : "border-b-2 border-ink pb-1.5"}`}
      >
        <h2 className={`flex-1 ${sectionHeadingClassName}`}>{title}</h2>
        <Link href={href} aria-label={`Ir a ${title}`} className={iconButtonClassName}>
          <ArrowRightIcon className="h-5 w-5" />
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
      <p className="font-display text-xl leading-snug text-ink">{message}</p>
      <Link
        href={actionHref}
        className="w-fit font-bold text-accent underline underline-offset-[3px] hover:text-accent-hover"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
