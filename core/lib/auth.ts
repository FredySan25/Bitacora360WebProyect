import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/core/lib/supabase-client";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email o contraseña incorrectos.",
  email_not_confirmed: "Aún no confirmas tu email. Revisa tu bandeja de entrada.",
  user_already_exists: "Ya existe una cuenta con ese email.",
  email_exists: "Ya existe una cuenta con ese email.",
  weak_password: "La contraseña es muy débil. Usa al menos 6 caracteres.",
  email_address_invalid: "Ese email no es válido.",
  validation_failed: "Revisa que el email y la contraseña estén bien escritos.",
  signup_disabled: "El registro de cuentas nuevas está deshabilitado.",
  otp_expired: "El código es incorrecto o ya expiró. Revísalo o pide uno nuevo.",
  over_request_rate_limit: "Demasiados intentos. Espera un momento y vuelve a intentar.",
  over_email_send_rate_limit:
    "Se enviaron demasiados emails. Espera unos minutos y vuelve a intentar.",
};

/** Maps a Supabase auth error to a user-facing message in Spanish. */
export function getAuthErrorMessage(error: AuthError): string {
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  // Network failures surface as status 0 (AuthRetryableFetchError)
  if (error.status === 0) {
    return "No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.";
  }
  return "Algo salió mal. Intenta de nuevo.";
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signUp({ email, password });
}

/** Confirms a new account with the code from the confirmation email and starts the session. */
export async function verifySignUpCode(email: string, code: string) {
  const supabase = createClient();
  return supabase.auth.verifyOtp({ email, token: code, type: "email" });
}

/** Sends the confirmation email (link + code) again. */
export async function resendSignUpCode(email: string) {
  const supabase = createClient();
  return supabase.auth.resend({ type: "signup", email });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}
