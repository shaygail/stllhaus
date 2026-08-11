import { createBusinessLogsAdminClient } from "@/lib/business-logs";
import { timingSafeEqual } from "crypto";

/** Fixed staff admin email (e.g. admin@stllhaus.co). Also receives admin access when signed in. */
export function getAdminAccountEmail(): string | null {
  const email = process.env.ADMIN_ACCOUNT_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function getAdminAccountPassword(): string | null {
  const password = process.env.ADMIN_ACCOUNT_PASSWORD?.trim();
  return password || null;
}

export function isAdminAccountConfigured(): boolean {
  return Boolean(getAdminAccountEmail() && getAdminAccountPassword());
}

function safeSecretEqual(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyAdminAccountCredentials(email: string, password: string): boolean {
  if (!isAdminAccountConfigured()) return false;

  const expectedEmail = getAdminAccountEmail()!;
  const expectedPassword = getAdminAccountPassword()!;

  const normalizedEmail = email.trim().toLowerCase();
  if (!safeSecretEqual(normalizedEmail, expectedEmail)) return false;
  return safeSecretEqual(password, expectedPassword);
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) return null;

  const perPage = 1000;
  for (let page = 1; page <= 15; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error || !data) return null;

    const match = data.users.find((user) => (user.email ?? "").toLowerCase() === email);
    if (match?.id) return match.id;
    if (data.users.length < perPage) break;
  }

  return null;
}

/** Ensures the fixed admin account exists in Supabase Auth and matches the env password. */
export async function syncAdminSupabaseUser(): Promise<
  { ok: true } | { ok: false; error: "not_configured" | "missing_supabase_config" | "sync_failed" }
> {
  if (!isAdminAccountConfigured()) {
    return { ok: false, error: "not_configured" };
  }

  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    return { ok: false, error: "missing_supabase_config" };
  }

  const email = getAdminAccountEmail()!;
  const password = getAdminAccountPassword()!;
  const metadata = { is_admin: true, role: "admin" };

  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (!createError) {
    return { ok: true };
  }

  const alreadyExists =
    createError.message.toLowerCase().includes("already") ||
    createError.message.toLowerCase().includes("registered");

  if (!alreadyExists) {
    return { ok: false, error: "sync_failed" };
  }

  const userId = await findUserIdByEmail(email);
  if (!userId) {
    return { ok: false, error: "sync_failed" };
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (updateError) {
    return { ok: false, error: "sync_failed" };
  }

  return { ok: true };
}
