import { createBusinessLogsAdminClient } from "@/lib/business-logs";
import { randomUUID } from "crypto";

export const MARKET_POSTER_BUCKET = "market-posters";
export const MAX_MARKET_POSTER_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionForType(type: string): string {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

function sanitizeBaseName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim().toLowerCase();
  const slug = base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug.slice(0, 48) || "poster";
}

export function validateMarketPosterFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Use a JPG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_MARKET_POSTER_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

export async function uploadMarketPoster(file: File, eventId?: string): Promise<string> {
  const validationError = validateMarketPosterFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    throw new Error("missing_supabase_config");
  }

  const ext = extensionForType(file.type);
  const prefix = eventId ? `events/${eventId}` : "events/new";
  const objectPath = `${prefix}/${Date.now()}-${sanitizeBaseName(file.name)}-${randomUUID().slice(0, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(MARKET_POSTER_BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    if (error.message.toLowerCase().includes("bucket")) {
      throw new Error("storage_bucket_missing");
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(MARKET_POSTER_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}
