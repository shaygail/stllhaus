import {
  getAdminAccountEmail,
  getAdminAccountPassword,
  syncAdminSupabaseUser,
} from "@/lib/admin-account";
import { createClient } from "@/lib/supabase/server";

export function sanitizeAdminNextPath(raw: string | undefined): string {
  const next = (raw ?? "/account").trim();
  if (!next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

/** Sync admin user in Supabase Auth and create a browser session cookie. */
export async function establishAdminSession(): Promise<{ ok: true } | { ok: false; error: string }> {
  const sync = await syncAdminSupabaseUser();
  if (!sync.ok) {
    return {
      ok: false,
      error:
        sync.error === "missing_supabase_config"
          ? "Supabase service role key is required for team sign-in."
          : sync.error === "not_configured"
            ? "Team sign-in is not configured on the server."
            : "Could not sync the admin account. Try again.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: getAdminAccountEmail()!,
    password: getAdminAccountPassword()!,
  });

  if (error) {
    return {
      ok: false,
      error: error.message || "Could not sign in. Check Supabase Auth email/password settings.",
    };
  }

  return { ok: true };
}
