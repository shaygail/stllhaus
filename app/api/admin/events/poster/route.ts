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
  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        error: "missing_file",
        detail: "No image was received. If the photo is very large, wait for compression to finish and try again.",
      },
      { status: 400 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json(
      {
        error: "empty_file",
        detail: "The upload arrived empty — often caused by a photo that is too large. Try a smaller JPG or PNG.",
      },
      { status: 400 }
    );
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
          detail:
            "Poster storage is not set up. Run supabase/admin_setup.sql in the Supabase SQL Editor (includes the market-posters bucket), then try again.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg, detail: msg }, { status: 400 });
  }
}
