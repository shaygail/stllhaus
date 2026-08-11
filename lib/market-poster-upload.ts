import { createBusinessLogsAdminClient } from "@/lib/business-logs";
import {
  MARKET_POSTER_EXTENSION_TYPES,
  MAX_MARKET_POSTER_BYTES,
  posterSizeLabel,
} from "@/lib/market-poster-limits";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export const MARKET_POSTER_BUCKET = "market-posters";
export { MAX_MARKET_POSTER_BYTES };

const ALLOWED_TYPES = new Set(Object.values(MARKET_POSTER_EXTENSION_TYPES));

function extensionFromName(name: string): string | null {
  const match = name.trim().toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

function resolveContentType(file: File): string | null {
  if (file.type && ALLOWED_TYPES.has(file.type)) {
    return file.type;
  }
  const ext = extensionFromName(file.name);
  if (!ext) return null;
  return MARKET_POSTER_EXTENSION_TYPES[ext] ?? null;
}

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

function isBucketMissingMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("bucket") && (lower.includes("not found") || lower.includes("does not exist"));
}

async function ensureMarketPosterBucket(supabase: SupabaseClient): Promise<void> {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    if (isBucketMissingMessage(listError.message)) {
      throw new Error("storage_bucket_missing");
    }
    throw new Error(listError.message);
  }

  if (buckets?.some((bucket) => bucket.name === MARKET_POSTER_BUCKET || bucket.id === MARKET_POSTER_BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(MARKET_POSTER_BUCKET, {
    public: true,
    fileSizeLimit: MAX_MARKET_POSTER_BYTES,
    allowedMimeTypes: [...ALLOWED_TYPES],
  });

  if (createError) {
    if (createError.message.toLowerCase().includes("already exists")) return;
    if (isBucketMissingMessage(createError.message)) {
      throw new Error("storage_bucket_missing");
    }
    throw new Error(createError.message);
  }
}

export function buildMarketPosterObjectPath(file: File, eventId?: string): { objectPath: string; contentType: string } {
  const contentType = resolveContentType(file);
  if (!contentType) {
    throw new Error(
      `Use a JPG, PNG, WebP, or GIF image (${posterSizeLabel()} max). iPhone HEIC photos are not supported.`
    );
  }

  const ext = extensionForType(contentType);
  const prefix = eventId ? `events/${eventId}` : "events/new";
  const objectPath = `${prefix}/${Date.now()}-${sanitizeBaseName(file.name)}-${randomUUID().slice(0, 8)}.${ext}`;
  return { objectPath, contentType };
}

export function validateMarketPosterFile(file: File): string | null {
  const contentType = resolveContentType(file);
  if (!contentType) {
    return `Use a JPG, PNG, WebP, or GIF image (${posterSizeLabel()} max). iPhone HEIC photos are not supported — choose “Most Compatible” in Settings → Camera, or export as JPEG first.`;
  }
  if (file.size > MAX_MARKET_POSTER_BYTES) {
    return `Image must be ${posterSizeLabel()} or smaller.`;
  }
  if (file.size === 0) {
    return "The uploaded file is empty. Try choosing the image again.";
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

  await ensureMarketPosterBucket(supabase);

  const { objectPath, contentType } = buildMarketPosterObjectPath(file, eventId);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(MARKET_POSTER_BUCKET).upload(objectPath, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    if (isBucketMissingMessage(error.message)) {
      throw new Error("storage_bucket_missing");
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(MARKET_POSTER_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}
