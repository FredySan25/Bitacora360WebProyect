import { BookIcon } from "@/core/components/icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-notebook-lines flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-paper-elevated text-accent">
            <BookIcon className="h-6 w-6" />
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Bitácora360
          </h1>
          <p className="text-sm text-ink-muted">
            Tu registro personal: hábitos, finanzas y watchlist.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
