"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  getAuthErrorMessage,
  resendSignUpCode,
  signUpWithPassword,
  verifySignUpCode,
} from "@/core/lib/auth";
import { AuthCard } from "@/core/components/AuthCard";
import { FormAlert } from "@/core/components/FormAlert";
import { PasswordField } from "@/core/components/PasswordField";
import { SubmitButton } from "@/core/components/SubmitButton";
import { TextField } from "@/core/components/TextField";
import { MailIcon } from "@/core/components/icons";

// Each Supabase project picks its own email OTP length, anywhere from 6 to 10 digits
const CODE_MIN_LENGTH = 6;
const CODE_MAX_LENGTH = 10;

/** Second step of the signup: confirm the email with the code (or the link) we sent. */
function VerifyEmailCard({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const { error } = await verifySignUpCode(email, code);

    if (error) {
      setLoading(false);
      setError(getAuthErrorMessage(error));
      return;
    }

    // Keep the loading state while navigating away
    router.push("/today");
    router.refresh();
  }

  async function handleResend() {
    setError(null);
    setNotice(null);
    setResending(true);

    const { error } = await resendSignUpCode(email);

    setResending(false);

    if (error) {
      setError(getAuthErrorMessage(error));
      return;
    }

    setNotice("Te enviamos un código nuevo.");
  }

  return (
    <div className="rounded-2xl border border-border bg-paper-elevated p-6 text-center shadow-card sm:p-8">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
        <MailIcon className="h-6 w-6" />
      </span>
      <h2 className="font-display text-2xl font-semibold text-ink">Revisa tu email</h2>
      <p className="mt-2 text-sm text-ink-muted">
        Te enviamos un código y un enlace de confirmación a{" "}
        <strong className="font-medium text-ink">{email}</strong>. Escribe el código aquí
        o abre el enlace para activar tu cuenta.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 text-left">
        <TextField
          label="Código de verificación"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern={`[0-9]{${CODE_MIN_LENGTH},${CODE_MAX_LENGTH}}`}
          title="Escribe el código completo, tal como llegó en el correo."
          maxLength={CODE_MAX_LENGTH}
          required
          disabled={loading}
          className="text-center font-mono text-lg tracking-[0.3em]"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />

        {error && <FormAlert message={error} />}
        {notice && (
          <p role="status" className="text-sm text-ink-muted">
            {notice}
          </p>
        )}

        <SubmitButton loading={loading} loadingLabel="Confirmando...">
          Confirmar código
        </SubmitButton>
      </form>

      <p className="mt-4 text-xs text-ink-muted">
        ¿No te llegó? Revisa tu carpeta de spam o{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || loading}
          className="font-medium text-accent hover:text-accent-hover disabled:opacity-60"
        >
          {resending ? "Reenviando..." : "Reenviar código"}
        </button>
      </p>
      <p className="mt-2 text-xs text-ink-muted">
        ¿Ya confirmaste con el enlace?{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
          Ir a iniciar sesión
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await signUpWithPassword(email, password);

    if (error) {
      setLoading(false);
      setError(getAuthErrorMessage(error));
      return;
    }

    // Email confirmation is disabled in this environment: the account is ready
    if (data.session) {
      router.push("/today");
      router.refresh();
      return;
    }

    setLoading(false);
    setDone(true);
  }

  if (done) {
    return <VerifyEmailCard email={email} />;
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
