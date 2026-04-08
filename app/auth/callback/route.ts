import { resolvePostLoginRedirect } from "@/lib/post-login-redirect";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next");

  const redirectUrl = resolvePostLoginRedirect(request, next);
  const errorUrl = `${url.origin}/auth/auth-code-error`;

  if (code) {
    const response = NextResponse.redirect(redirectUrl);
    const supabase = createSupabaseRouteHandlerClient(request, response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
  }

  if (tokenHash && type) {
    const response = NextResponse.redirect(redirectUrl);
    const supabase = createSupabaseRouteHandlerClient(request, response);
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      // Supabase sends e.g. signup, email, magiclink — cast for the client typings
      type: type as "signup" | "email" | "magiclink" | "recovery" | "invite" | "email_change",
    });
    if (!error) return response;
  }

  return NextResponse.redirect(errorUrl);
}
