import { createClient } from "@/lib/supabase/server";
import {
  adminUnauthorizedResponse,
  getAdminSecretFromBody,
  verifyAdminSecret,
} from "@/lib/admin-auth";
import { isAdminUser } from "@/lib/admin-access";

export type AdminAuthResult =
  | { ok: true; method: "session" | "secret"; email?: string }
  | { ok: false; response: Response };

export async function authorizeAdminRequest(body?: unknown): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminUser(user)) {
    return { ok: true, method: "session", email: user?.email ?? undefined };
  }

  const secret = getAdminSecretFromBody(body);
  if (secret && verifyAdminSecret(secret)) {
    return { ok: true, method: "secret" };
  }

  return { ok: false, response: adminUnauthorizedResponse() };
}
