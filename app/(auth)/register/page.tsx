"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { signUpWithPassword } from "@/core/lib/auth";

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
      setError(error.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Revisa tu email</h1>
        <p className="text-sm">
          Te enviamos un enlace de confirmación a <strong>{email}</strong>.
          Confirma tu cuenta y luego{" "}
          <Link href="/login" className="underline">
            inicia sesión
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-black/20 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Contraseña</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-black/20 px-3 py-2"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
