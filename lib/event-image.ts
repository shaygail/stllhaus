/** Local `/public` path or absolute Supabase (or other) URL. */
export function isAbsoluteImageUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

export function eventImageForSchema(image: string, siteUrl: string): string {
  if (isAbsoluteImageUrl(image)) return image;
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${image.startsWith("/") ? image : `/${image}`}`;
}
