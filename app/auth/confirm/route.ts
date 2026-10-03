import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/core/lib/supabase-server";

function redirectTo(request: NextRequest, pathname: string, search = "") {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  return NextResponse.redirect(url);
}

/**
 * Landing route for the link in the confirmation email: exchanges the
 * token_hash for a session (stored in cookies) and sends the user into the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return redirectTo(request, "/today");
  }

  // The link is single-use: if the account was already confirmed with the code
  // in this browser, the session exists and the user can go straight in.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return redirectTo(request, "/today");

  return redirectTo(request, "/login", "?error=confirmation_link");
}
