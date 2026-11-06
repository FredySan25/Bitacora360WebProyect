import type { ReactNode } from "react";
import { sheetClassName } from "./surfaces";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
};

/** Sheet that frames the login/register forms. */
export function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <div className={`${sheetClassName} p-6 sm:p-8`}>
      <p className="text-sm text-ink-muted">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-none font-bold text-ink">{title}</h2>
      {description && <p className="mt-2 text-[0.9375rem] text-ink-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
