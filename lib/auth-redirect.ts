/**
 * Base URL for Supabase `emailRedirectTo` (magic link + email confirmation).
 * - Local / LAN: always use the browser origin so links match how you opened the app.
 * - Production: prefer NEXT_PUBLIC_APP_URL so the link matches your canonical Vercel/custom domain.
 */
export function getClientAuthRedirectBaseUrl(): string {
  if (typeof window === "undefined") return "";

  const { hostname } = window.location;
  const isLocalOrLan =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^192\.168\.\d+\.\d+$/.test(hostname) ||
    /^10\.\d+\.\d+\.\d+$/.test(hostname);

  if (isLocalOrLan) return window.location.origin;

  const env = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (env) return env;

  return window.location.origin;
}
