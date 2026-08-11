import type { User } from "@supabase/supabase-js";
import { getAdminAccountEmail } from "@/lib/admin-account";

/** Comma-separated staff emails in ADMIN_EMAILS (case-insensitive). */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim();
  const fromList = raw
    ? raw
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const fixedAdmin = getAdminAccountEmail();
  if (fixedAdmin && !fromList.includes(fixedAdmin)) {
    return [...fromList, fixedAdmin];
  }

  return fromList;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return getAdminEmails().includes(normalized);
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (isAdminEmail(user.email)) return true;
  const meta = user.user_metadata ?? {};
  return meta.is_admin === true || meta.role === "admin";
}
