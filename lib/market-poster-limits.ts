export const MAX_MARKET_POSTER_BYTES = 4 * 1024 * 1024;

export const MARKET_POSTER_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MARKET_POSTER_EXTENSION_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function posterSizeLabel(): string {
  return "4 MB";
}
