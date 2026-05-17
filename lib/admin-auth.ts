/** Shared admin API guard — uses `ADMIN_STATS_SECRET` (same key as stats / ordering admin). */

export function getAdminSecretFromBody(body: unknown): string {
  if (typeof body !== "object" || body === null || !("secret" in body)) return "";
  return String((body as { secret: unknown }).secret ?? "").trim();
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_STATS_SECRET?.trim());
}

export function verifyAdminSecret(secret: string): boolean {
  const adminSecret = process.env.ADMIN_STATS_SECRET?.trim();
  if (!adminSecret || !secret) return false;
  return secret === adminSecret;
}

export function adminNotConfiguredResponse() {
  return Response.json({ error: "admin_stats_not_configured" }, { status: 503 });
}

export function adminUnauthorizedResponse() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}
