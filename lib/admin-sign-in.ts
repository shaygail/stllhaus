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

function isInvalidCredentials(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("invalid login credentials") || lower.includes("invalid credentials");
}

/** Sync admin user in Supabase Auth and create a browser session cookie. */
export async function establishAdminSession(
  passwordFromForm: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = getAdminAccountEmail();
  const envPassword = getAdminAccountPassword();
  if (!email || !envPassword) {
    return { ok: false, error: "Team sign-in is not configured on the server." };
  }

  const password = passwordFromForm.trim();
  const supabase = await createClient();

  let { error } = await supabase.auth.signInWithPassword({ email, password });

  // If the typed password fails, sync Supabase to the server env password and retry once.
  if (error && isInvalidCredentials(error.message)) {
    const sync = await syncAdminSupabaseUser();
    if (!sync.ok) {
      return {
        ok: false,
        error:
          sync.error === "missing_supabase_config"
            ? "Supabase service role key is required for team sign-in."
            : "Could not sync the admin account. Try again.",
      };
    }

    if (password !== envPassword) {
      const retry = await supabase.auth.signInWithPassword({ email, password: envPassword });
      error = retry.error;
    }
  }

  if (error) {
    return {
      ok: false,
      error: isInvalidCredentials(error.message)
        ? "Incorrect team email or password."
        : error.message || "Could not sign in. Check Supabase Auth email/password settings.",
    };
  }

  return { ok: true };
}
