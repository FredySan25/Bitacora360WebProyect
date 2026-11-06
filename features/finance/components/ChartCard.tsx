import type { ReactNode } from "react";
import { sectionHeadingClassName, sheetClassName } from "@/core/components/surfaces";

/** Titled sheet that frames one chart of the summary. */
export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={`${sheetClassName} p-5 md:p-6`}>
      <h2 className={`mb-4 ${sectionHeadingClassName}`}>{title}</h2>
      {children}
    </section>
  );
}
