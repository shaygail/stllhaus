/**
 * OpenRouteService: geocode + driving-car directions (server-side only).
 * Sign up: https://openrouteservice.org/dev/#/signup
 */

export type DrivingDistanceResult =
  | { ok: true; meters: number }
  | { ok: false; status: string };

const GEOCODE_URL = "https://api.openrouteservice.org/geocode/search";
const DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

/** Pelias/ORS geocode GET: do not send Content-Type (some stacks reject GET + JSON Content-Type). */
const ORS_GEOCODE_HEADERS = (apiKey: string) =>
  ({
    Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
    Authorization: apiKey,
  }) as const;

const ORS_POST_HEADERS = (apiKey: string) =>
  ({
    Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
    "Content-Type": "application/json; charset=utf-8",
    Authorization: apiKey,
  }) as const;

export function normalizeOrsApiKey(apiKey: string): string {
  return apiKey.trim().replace(/^["']|["']$/g, "");
}

/** Rough NZ mainland bbox (lon, lat) — used to pick a sensible hit when country filter is off. */
function isInNzBbox(lon: number, lat: number): boolean {
  return lon >= 165 && lon <= 182 && lat >= -48 && lat <= -33;
}

/** Parse "lon,lat" or "lat,lon" for NZ-ish coordinates. */
export function parseOriginLonLat(input: string): { lon: number; lat: number } | null {
  const parts = input
    .trim()
    .split(",")
    .map((p) => parseFloat(p.trim()));
  if (parts.length !== 2 || !parts.every((n) => Number.isFinite(n))) return null;
  const [a, b] = parts;
  if (a >= -50 && a <= -30 && b >= 160 && b <= 185) {
    return { lon: b, lat: a };
  }
  if (b >= -50 && b <= -30 && a >= 160 && a <= 185) {
    return { lon: a, lat: b };
  }
  if (Math.abs(a) > 90) return { lon: a, lat: b };
  if (Math.abs(b) > 90) return { lon: b, lat: a };
  return { lon: a, lat: b };
}

function normalizeSearchText(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (/new zealand|aotearoa|nz\b/i.test(t)) return t;
  return `${t}, New Zealand`;
}

function pickCoordinates(
  data: { features?: Array<{ geometry?: { coordinates?: number[] } }> },
  requireNzBbox: boolean
): { lon: number; lat: number } | null {
  const features = data.features;
  if (!Array.isArray(features) || features.length === 0) return null;
  for (const f of features) {
    const coords = f.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    const lon = coords[0];
    const lat = coords[1];
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (requireNzBbox && !isInNzBbox(lon, lat)) continue;
    return { lon, lat };
  }
  return null;
}

async function geocodeSearchOnce(
  text: string,
  apiKey: string,
  opts: { boundaryCountry?: string }
): Promise<{ lon: number; lat: number } | null> {
  const key = normalizeOrsApiKey(apiKey);
  const params = new URLSearchParams({
    api_key: key,
    text,
    size: "8",
  });
  if (opts.boundaryCountry) {
    params.set("boundary.country", opts.boundaryCountry);
  }

  const res = await fetch(`${GEOCODE_URL}?${params.toString()}`, {
    headers: { ...ORS_GEOCODE_HEADERS(key) },
  });
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as {
    features?: Array<{ geometry?: { coordinates?: number[] } }>;
  };
  const withBoundary = Boolean(opts.boundaryCountry);
  return pickCoordinates(data, !withBoundary);
}

/** Forward geocode with NZ-first then global+NZ-bbox fallback (Pelias can miss under strict country). */
async function geocodeSearch(text: string, apiKey: string): Promise<{ lon: number; lat: number } | null> {
  const q = normalizeSearchText(text);
  let hit = await geocodeSearchOnce(q, apiKey, { boundaryCountry: "NZ" });
  if (hit) return hit;
  return geocodeSearchOnce(q, apiKey, {});
}

async function drivingDirectionsMeters(
  from: { lon: number; lat: number },
  to: { lon: number; lat: number },
  apiKey: string
): Promise<DrivingDistanceResult> {
  const key = normalizeOrsApiKey(apiKey);
  const coordinateBody = {
    coordinates: [
      [from.lon, from.lat],
      [to.lon, to.lat],
    ],
  };

  /** -1 = unlimited snap search (public ORS still caps search; helps “no routable point” on valid NZ addresses). */
  const attempts: Array<Record<string, unknown>> = [
    { ...coordinateBody, radiuses: [-1, -1] },
    { ...coordinateBody },
  ];

  for (let i = 0; i < attempts.length; i++) {
    const body = attempts[i];
    const res = await fetch(DIRECTIONS_URL, {
      method: "POST",
      headers: { ...ORS_POST_HEADERS(key) },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      if (i === attempts.length - 1) {
        return { ok: false, status: `http_${res.status}:${errText.slice(0, 120)}` };
      }
      continue;
    }
    const data = (await res.json()) as {
      error?: { code?: number; message?: string };
      routes?: Array<{ summary?: { distance?: number } }>;
    };
    if (data.error) {
      const msg = data.error.message || String(data.error.code ?? "ORS_ERROR");
      if (i < attempts.length - 1) continue;
      return { ok: false, status: msg };
    }
    const meters = data.routes?.[0]?.summary?.distance;
    if (typeof meters === "number" && meters >= 0) {
      return { ok: true, meters };
    }
  }
  return { ok: false, status: "NO_ROUTE" };
}

let cachedOrigin: { lon: number; lat: number } | null = null;

function looksLikeCoordinatePair(s: string): boolean {
  return /^[\d\s.,\-]+$/.test(s) && s.includes(",");
}

export async function resolveShopOriginLonLat(apiKey: string): Promise<{ lon: number; lat: number } | null> {
  if (cachedOrigin) return cachedOrigin;

  const lonEnv = process.env.DELIVERY_ORIGIN_LON?.trim();
  const latEnv = process.env.DELIVERY_ORIGIN_LAT?.trim();
  if (lonEnv && latEnv) {
    const lon = Number(lonEnv);
    const lat = Number(latEnv);
    if (Number.isFinite(lon) && Number.isFinite(lat)) {
      cachedOrigin = { lon, lat };
      return cachedOrigin;
    }
  }

  const coordsOnly = process.env.DELIVERY_ORIGIN_COORDS?.trim();
  if (coordsOnly) {
    const parsed = parseOriginLonLat(coordsOnly);
    if (parsed) {
      cachedOrigin = parsed;
      return cachedOrigin;
    }
    return null;
  }

  const originText = process.env.DELIVERY_DISTANCE_ORIGIN?.trim();
  if (!originText) return null;

  if (looksLikeCoordinatePair(originText)) {
    const parsed = parseOriginLonLat(originText);
    if (parsed) {
      cachedOrigin = parsed;
      return cachedOrigin;
    }
  }

  const g = await geocodeSearch(originText, apiKey);
  if (g) cachedOrigin = g;
  return g;
}

/**
 * Driving distance in metres from configured shop origin to customer address (both geocoded via ORS).
 */
export async function drivingDistanceMetersForDelivery(
  deliveryAddress: string,
  apiKey: string
): Promise<DrivingDistanceResult> {
  const key = normalizeOrsApiKey(apiKey);
  if (!key) {
    return { ok: false, status: "MISSING_API_KEY" };
  }
  const origin = await resolveShopOriginLonLat(key);
  if (!origin) {
    return { ok: false, status: "ORIGIN_NOT_CONFIGURED" };
  }
  const dest = await geocodeSearch(deliveryAddress, key);
  if (!dest) {
    return { ok: false, status: "GEOCODE_DEST_FAILED" };
  }
  return drivingDirectionsMeters(origin, dest, key);
}
