import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
};

/** Standard page heading: small uppercase label, serif title, optional description. */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      {eyebrow && (
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        {title}
      </h1>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
    </header>
  );
}
