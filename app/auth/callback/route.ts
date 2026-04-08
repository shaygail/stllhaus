import { createClient } from "@/lib/supabase/server";
import { resolvePostLoginRedirect } from "@/lib/post-login-redirect";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");
  const supabase = await createClient();
  const successUrl = () => resolvePostLoginRedirect(request, next);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(successUrl());
    }
  }

  // Email magic links / confirmation links can arrive with token_hash + type.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (!error) {
      return NextResponse.redirect(successUrl());
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
