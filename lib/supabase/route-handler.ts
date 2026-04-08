import { createServerClient } from "@supabase/ssr";
import type { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Supabase client for Route Handlers where auth must set cookies on the **redirect response**.
 * Using `cookies()` from `next/headers` here often fails to persist the session after PKCE exchange.
 */
export function createSupabaseRouteHandlerClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}
