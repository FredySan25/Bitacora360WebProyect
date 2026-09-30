"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getAuthErrorMessage, signUpWithPassword } from "@/core/lib/auth";
import { AuthCard } from "@/core/components/AuthCard";
import { FormAlert } from "@/core/components/FormAlert";
import { PasswordField } from "@/core/components/PasswordField";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";
import { MailIcon } from "@/core/components/icons";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signUpWithPassword(email, password);

    setLoading(false);

    if (error) {
      setError(getAuthErrorMessage(error));
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-paper-elevated p-6 text-center shadow-card sm:p-8">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <MailIcon className="h-6 w-6" />
        </span>
        <h2 className="font-display text-2xl font-semibold text-ink">Revisa tu email</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Te enviamos un enlace de confirmación a{" "}
          <strong className="font-medium text-ink">{email}</strong>. Confírmalo para
          activar tu cuenta.
        </p>
        <Link
          href="/login"
          className="mt-6 flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-foreground transition hover:bg-accent-hover"
        >
          Ir a iniciar sesión
        </Link>
        <p className="mt-4 text-xs text-ink-muted">
          ¿No te llegó? Revisa tu carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <>
      <AuthCard
        eyebrow="Nueva bitácora"
        title="Crear cuenta"
        description="Empieza a registrar tus hábitos, finanzas y lo que quieres ver."
      >
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
            autoComplete="new-password"
            hint="Mínimo 6 caracteres."
            required
            minLength={6}
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <FormAlert message={error} />}

          <div className="mt-2 flex flex-col">
            <SubmitButton loading={loading} loadingLabel="Creando cuenta...">
              Crear cuenta
            </SubmitButton>
          </div>
        </form>
      </AuthCard>

      <p className="mt-6 text-center text-sm text-ink-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
