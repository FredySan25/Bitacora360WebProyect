"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { getAuthErrorMessage, signInWithPassword } from "@/core/lib/auth";
import { AuthCard } from "@/core/components/AuthCard";
import { FormAlert } from "@/core/components/FormAlert";
import { PasswordField } from "@/core/components/PasswordField";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";

/** Shown when /auth/confirm rejects the link from the confirmation email. */
function ConfirmationLinkNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("error") !== "confirmation_link") return null;

  return (
    <FormAlert message="Ese enlace de confirmación ya no es válido o ya se usó. Si ya confirmaste tu cuenta, inicia sesión." />
  );
}

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

    if (error) {
      setLoading(false);
      setError(getAuthErrorMessage(error));
      return;
    }

    // Keep the loading state while navigating away
    router.push("/today");
    router.refresh();
  }

  return (
    <>
      <AuthCard eyebrow="Entrada de acceso" title="Iniciar sesión">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordField
            label="Contraseña"
            autoComplete="current-password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? (
            <FormAlert message={error} />
          ) : (
            <Suspense>
              <ConfirmationLinkNotice />
            </Suspense>
          )}

          <div className="mt-2 flex flex-col">
            <SubmitButton loading={loading} loadingLabel="Entrando...">
              Entrar
            </SubmitButton>
          </div>
        </form>
      </AuthCard>

      <p className="mt-6 text-center text-sm text-ink-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-accent hover:text-accent-hover">
          Regístrate
        </Link>
      </p>
    </>
  );
}
