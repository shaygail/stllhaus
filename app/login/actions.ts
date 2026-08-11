"use server";

import { verifyAdminAccountCredentials } from "@/lib/admin-account";
import { establishAdminSession, sanitizeAdminNextPath } from "@/lib/admin-sign-in";
import { redirect } from "next/navigation";

export type AdminSignInState = {
  error?: string;
} | null;

export async function adminSignInAction(
  _prevState: AdminSignInState,
  formData: FormData
): Promise<AdminSignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeAdminNextPath(String(formData.get("next") ?? "/account"));

  if (!email || !password) {
    return { error: "Enter team email and password." };
  }

  if (!verifyAdminAccountCredentials(email, password)) {
    return { error: "Incorrect team email or password." };
  }

  const session = await establishAdminSession();
  if (!session.ok) {
    return { error: session.error };
  }

  redirect(next);
}
