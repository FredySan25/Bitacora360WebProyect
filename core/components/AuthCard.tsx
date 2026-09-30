import type { ReactNode } from "react";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
};

/** Card that frames the login/register forms. */
export function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-paper-elevated p-6 shadow-card sm:p-8">
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-accent">
        {eyebrow}
      </p>
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
