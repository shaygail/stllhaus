const DEFAULT_PATH = "/account";

/** Only allow same-site path redirects (open-redirect safe). */
function sanitizeNext(next: string | null): string {
  if (!next) return DEFAULT_PATH;
  const t = next.trim();
  if (!t) return DEFAULT_PATH;
  if (!t.startsWith("/") || t.startsWith("//")) return DEFAULT_PATH;
  return t;
}

/**
 * Where to send the user after a successful auth callback.
 * - Development: always the current request origin (localhost / LAN).
 * - Production: prefers NEXT_PUBLIC_APP_URL so links match your real domain (e.g. https://stllhaus.co/account).
 */
export function resolvePostLoginRedirect(request: Request, nextParam: string | null): string {
  const path = sanitizeNext(nextParam);
  const origin = new URL(request.url).origin;
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const useCanonical = process.env.NODE_ENV === "production" && Boolean(envBase);
  const base = useCanonical ? envBase! : origin;
  return `${base}${path}`;
}
