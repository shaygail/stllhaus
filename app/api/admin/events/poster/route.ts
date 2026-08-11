import { authorizeAdminRequest } from "@/lib/admin-request-auth";
import { uploadMarketPoster } from "@/lib/market-poster-upload";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const auth = await authorizeAdminRequest(undefined);
  if (!auth.ok) return auth.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const file = formData.get("poster");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }

  const eventIdRaw = formData.get("eventId");
  const eventId = typeof eventIdRaw === "string" && eventIdRaw.trim() ? eventIdRaw.trim() : undefined;

  try {
    const url = await uploadMarketPoster(file, eventId);
    return NextResponse.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "upload_failed";
    if (msg === "missing_supabase_config") {
      return NextResponse.json(
        {
          error: "missing_supabase_config",
          detail: "Add Supabase keys to your server environment.",
        },
        { status: 503 }
      );
    }
    if (msg === "storage_bucket_missing") {
      return NextResponse.json(
        {
          error: "storage_bucket_missing",
          detail: "Run supabase/market_posters_storage.sql in the Supabase SQL editor to enable poster uploads.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
