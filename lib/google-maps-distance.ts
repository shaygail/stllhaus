/**
 * Google Distance Matrix API (server-side only).
 * Enable "Distance Matrix API" for your key in Google Cloud Console.
 */

export type DrivingDistanceResult =
  | { ok: true; meters: number }
  | { ok: false; status: string };

export async function drivingDistanceMeters(
  origin: string,
  destination: string,
  apiKey: string
): Promise<DrivingDistanceResult> {
  const params = new URLSearchParams({
    origins: origin,
    destinations: destination,
    units: "metric",
    key: apiKey,
  });
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    return { ok: false, status: `http_${res.status}` };
  }
  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    rows?: Array<{ elements?: Array<{ status: string; distance?: { value: number } }> }>;
  };
  if (data.status !== "OK") {
    return { ok: false, status: data.error_message || data.status };
  }
  const el = data.rows?.[0]?.elements?.[0];
  if (!el) {
    return { ok: false, status: "NO_ELEMENTS" };
  }
  if (el.status !== "OK") {
    return { ok: false, status: el.status };
  }
  const meters = el.distance?.value;
  if (typeof meters !== "number" || meters < 0) {
    return { ok: false, status: "NO_DISTANCE" };
  }
  return { ok: true, meters };
}
