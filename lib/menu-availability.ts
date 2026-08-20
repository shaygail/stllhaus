const DEFAULT_POS_API = "https://stllhaus-pos-production.up.railway.app";
const DROP_TOKENS = new Set(["pcs", "pc", "pieces"]);

function posApiBase(): string {
  const raw = (
    process.env.STLLHAUS_POS_API_URL ??
    process.env.BACKEND_URL ??
    process.env.POS_API_URL ??
    DEFAULT_POS_API
  ).trim();
  return raw.replace(/\/+$/, "").replace(/\/orders$/i, "");
}

export function availabilityKey(name: string): string {
  const parts = name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((part) => part && !DROP_TOKENS.has(part));
  return parts.join(" ");
}

function extraKeys(key: string): string[] {
  const extras = new Set<string>([key]);
  extras.add(key.replace(/\band\b/g, " ").replace(/\s+/g, " ").trim());
  extras.add(key.replace(/\bsea salt\b/g, "seasalt"));
  extras.add(key.replace(/\bseasalt\b/g, "sea salt"));
  extras.add(key.replace(/\bcoldbrew\b/g, "cold brew"));
  extras.add(key.replace(/\bcold brew\b/g, "coldbrew"));
  extras.add(key.replace(/\b(regular|large)\b/g, " ").replace(/\s+/g, " ").trim());
  return [...extras].filter(Boolean);
}

export function expandAvailabilityKeys(nameOrKey: string): string[] {
  const base = availabilityKey(nameOrKey);
  return extraKeys(base);
}

export function soldOutKeySet(keys: string[], names: string[] = []): Set<string> {
  const out = new Set<string>();
  for (const value of [...keys, ...names]) {
    for (const key of expandAvailabilityKeys(value)) out.add(key);
  }
  return out;
}

export function itemIsSoldOut(name: string, soldOutKeys: Set<string>): boolean {
  return expandAvailabilityKeys(name).some((key) => soldOutKeys.has(key));
}

export function stripSizeSuffix(name: string): string {
  return name.replace(/\s*\((?:regular|large)[^)]*\)\s*$/i, "").trim();
}

export function checkoutLineIsSoldOut(lineName: string, soldOutKeys: Set<string>): boolean {
  const name = lineName.trim();
  if (!name) return false;
  if (/^delivery\b/i.test(name)) return false;
  if (/^sip\s*(&|and)\s*bite/i.test(name)) {
    if (itemIsSoldOut("Sip & Bite", soldOutKeys)) return true;
    const drink = stripSizeSuffix(name.replace(/^sip\s*(&|and)\s*bite\s*[—–-]\s*/i, ""));
    return drink ? itemIsSoldOut(drink, soldOutKeys) : false;
  }
  return itemIsSoldOut(stripSizeSuffix(name), soldOutKeys);
}

export type SoldOutPayload = {
  names: string[];
  keys: string[];
};

export async function fetchSoldOutFromPos(): Promise<SoldOutPayload> {
  const res = await fetch(`${posApiBase()}/menu-sold-out`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`sold-out ${res.status}`);
  }
  const json = (await res.json()) as Partial<SoldOutPayload>;
  return {
    names: Array.isArray(json.names) ? json.names.filter((row) => typeof row === "string") : [],
    keys: Array.isArray(json.keys) ? json.keys.filter((row) => typeof row === "string") : [],
  };
}
