/**
 * Canonical site origin for links inside emails (no trailing slash).
 * Prefer NEXT_PUBLIC_APP_URL; fall back to NEXT_PUBLIC_BASE_URL for older configs.
 */
export function publicSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    "";
  const base = raw.replace(/\/$/, "");
  return base || "http://localhost:3000";
}
