import { verifyAdminEmail, isAdminAccountConfigured } from "@/lib/admin-account";
import { establishAdminSession, sanitizeAdminNextPath } from "@/lib/admin-sign-in";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  if (!isAdminAccountConfigured()) {
    return NextResponse.json({ error: "admin_account_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email ?? "").trim()
      : "";
  const password =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as { password: unknown }).password ?? "")
      : "";
  const nextPath = sanitizeAdminNextPath(
    typeof body === "object" && body !== null && "next" in body
      ? String((body as { next: unknown }).next ?? "/account")
      : "/account"
  );

  if (!email || !password) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 400 });
  }

  if (!verifyAdminEmail(email)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const session = await establishAdminSession(password);
  if (!session.ok) {
    return NextResponse.json({ error: "sign_in_failed", detail: session.error }, { status: 500 });
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
