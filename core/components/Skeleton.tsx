import type { ReactNode } from "react";
import {
  figureCellClassName,
  figureRowClassName,
  listSheetClassName,
  sheetClassName,
} from "./surfaces";

type SkeletonProps = { className?: string };

/** A placeholder block that pulses while data loads (still when the user asks for less motion). */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`rounded-sm bg-ink/10 motion-safe:animate-pulse ${className}`} />;
}

type LoadingStateProps = {
  /** What is loading, for screen readers: "Cargando tus hábitos...". */
  label: string;
  className?: string;
  children: ReactNode;
};

/**
 * Loading state of a view: a skeleton shaped like what is coming. The skeleton
 * is hidden from screen readers, which read the label instead. It holds no
 * controls, so a button showing up means the data arrived.
 */
export function LoadingState({ label, className = "", children }: LoadingStateProps) {
  return (
    <div aria-busy="true">
      <p className="sr-only">{label}</p>
      <div aria-hidden="true" className={className}>
        {children}
      </div>
    </div>
  );
}

/** A section heading ruled in ink, as `ruledHeadingClassName` draws it. */
export function SkeletonHeading({ className = "w-44" }: SkeletonProps) {
  return (
    <div className="border-b-2 border-rule pb-2">
      <Skeleton className={`h-7 ${className}`} />
    </div>
  );
}

/** A button or a row of controls (month selector, day selector). */
export function SkeletonControl({ className = "w-44" }: SkeletonProps) {
  return <Skeleton className={`h-11 rounded-lg ${className}`} />;
}

/** A row of headline figures, as `figureRowClassName` draws it. */
export function SkeletonFigureRow({ cells }: { cells: number }) {
  return (
    <div className={figureRowClassName}>
      {Array.from({ length: cells }, (_, i) => (
        <div key={i} className={`${figureCellClassName} gap-2`}>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-3.5 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Rows of text on a sheet: a list of habits, transactions or budgets. */
export function SkeletonList({ rows, withBar = false }: { rows: number; withBar?: boolean }) {
  return (
    <div className={`${listSheetClassName} px-5`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 py-4">
          <div className="flex items-center gap-3.5">
            <Skeleton className="h-6 w-6 shrink-0 rounded-md" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className={`h-4 ${i % 2 === 0 ? "w-2/5" : "w-1/2"}`} />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
          {withBar && <Skeleton className="h-2.5 w-full" />}
        </div>
      ))}
    </div>
  );
}

/** A sheet with a title and a body: a chart, a card or a form. */
export function SkeletonSheet({ className = "h-40" }: SkeletonProps) {
  return (
    <div className={`${sheetClassName} flex flex-col gap-4 p-5 md:p-6`}>
      <Skeleton className="h-6 w-48" />
      <Skeleton className={`w-full ${className}`} />
    </div>
  );
}

/** Short lines of text, the last one shorter. */
export function SkeletonLines({ lines }: { lines: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? "w-3/5" : "w-full"}`} />
      ))}
    </div>
  );
}

/** A page heading while a route loads, as `PageHeader` draws it. */
export function SkeletonPageHeader() {
  return (
    <div className="mb-8 flex flex-col gap-3">
      <Skeleton className="h-12 w-64 max-w-full md:h-16 md:w-80" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}
