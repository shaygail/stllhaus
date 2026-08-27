export type MarketEvent = {
  id: string;
  name: string;
  /** Display date, e.g. "Saturday 15 August" */
  dateLabel: string;
  /** ISO 8601 date or datetime for schema.org */
  startDate: string;
  endDate?: string;
  location: string;
  description: string;
  image?: string;
  imageAlt?: string;
  published?: boolean;
};

export type MarketEventRow = {
  id: string;
  slug: string;
  name: string;
  date_label: string;
  start_date: string;
  end_date: string | null;
  location: string;
  description: string;
  image_path: string | null;
  image_alt: string | null;
  published: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type MarketEventInput = {
  id?: string;
  name: string;
  date: string;
  startTime: string;
  endTime?: string;
  location: string;
  description: string;
  imagePath?: string;
  imageAlt?: string;
  published: boolean;
};

const NZ_TIMEZONE = "Pacific/Auckland";

export function formatEventDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: NZ_TIMEZONE,
  }).format(new Date(isoDate));
}

export function buildNzDateTimeIso(date: string, time: string): string {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${normalizedTime}+12:00`;
}

export function slugifyEvent(name: string, date: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${date}`;
}

export function rowToMarketEvent(row: MarketEventRow): MarketEvent {
  return {
    id: row.slug || row.id,
    name: row.name,
    dateLabel: row.date_label,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    location: row.location,
    description: row.description,
    image: row.image_path ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    published: row.published,
  };
}

export function inputToRowPayload(input: MarketEventInput): Omit<MarketEventRow, "id" | "created_at" | "updated_at"> {
  const startDate = buildNzDateTimeIso(input.date, input.startTime);
  const endDate = input.endTime ? buildNzDateTimeIso(input.date, input.endTime) : null;

  return {
    slug: slugifyEvent(input.name, input.date),
    name: input.name.trim(),
    date_label: formatEventDateLabel(startDate),
    start_date: startDate,
    end_date: endDate,
    location: input.location.trim(),
    description: input.description.trim(),
    image_path: input.imagePath?.trim() || null,
    image_alt: input.imageAlt?.trim() || null,
    published: input.published,
    sort_order: 0,
  };
}

export function rowToFormValues(row: MarketEventRow): MarketEventInput {
  const start = new Date(row.start_date);
  const end = row.end_date ? new Date(row.end_date) : null;

  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: NZ_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: NZ_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateParts = dateFormatter.formatToParts(start);
  const year = dateParts.find((p) => p.type === "year")?.value ?? "";
  const month = dateParts.find((p) => p.type === "month")?.value ?? "";
  const day = dateParts.find((p) => p.type === "day")?.value ?? "";

  return {
    id: row.id,
    name: row.name,
    date: `${year}-${month}-${day}`,
    startTime: timeFormatter.format(start),
    endTime: end ? timeFormatter.format(end) : "",
    location: row.location,
    description: row.description,
    imagePath: row.image_path ?? "",
    imageAlt: row.image_alt ?? "",
    published: row.published,
  };
}

export function isEventUpcoming(row: MarketEventRow, now = new Date()): boolean {
  const endOrStart = row.end_date ?? row.start_date;
  return new Date(endOrStart) >= now;
}

export function isEventPast(row: MarketEventRow, now = new Date()): boolean {
  return !isEventUpcoming(row, now);
}
