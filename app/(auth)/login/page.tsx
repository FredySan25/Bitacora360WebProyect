"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signInWithPassword } from "@/core/lib/auth";
import { BookIcon } from "@/core/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signInWithPassword(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/habits");
    router.refresh();
  }

  return (
    <div className="bg-notebook-lines relative flex min-h-screen items-center justify-center px-4 py-12">
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

        <div className="rounded-2xl border border-border bg-paper-elevated p-8 shadow-[0_1px_2px_rgba(43,36,24,0.06),0_8px_24px_rgba(43,36,24,0.06)]">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-muted">
            Entrada de acceso
          </p>
          <h2 className="mb-6 font-display text-xl font-semibold text-ink">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Contraseña
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-border bg-paper px-3 py-2 text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>

            {error && (
              <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent-hover">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-foreground transition hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-accent hover:text-accent-hover">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
