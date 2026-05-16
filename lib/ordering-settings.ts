/** Store ordering schedule and admin toggles (NZ local hours by default). */

export type DayHours = {
  openTime: string;
  closeTime: string;
};

export type OrderingSettings = {
  /** Master switch — when false, no online ordering at all. */
  orderingEnabled: boolean;
  /** When closed (by hours or force), block add-to-cart unless pre-order is on. */
  blockOrdersWhenClosed: boolean;
  /** When closed, allow cart + checkout with pickup at or after next open time. */
  preOrderWhenClosed: boolean;
  /** Ignore hours and treat as closed (e.g. holiday). */
  forceClosed: boolean;
  /** Ignore hours and treat as open (override). */
  forceOpen: boolean;
  /** IANA timezone, e.g. Pacific/Auckland */
  timezone: string;
  /** Mon–Fri vs Sat–Sun hours; when false, uses {@link singleHours} only. */
  useWeekdayWeekendSchedule: boolean;
  /** Mon–Fri (days 1–5). */
  weekdayHours: DayHours;
  /** Sat–Sun (days 0, 6). */
  weekendHours: DayHours;
  /** Used when {@link useWeekdayWeekendSchedule} is false. */
  singleHours: DayHours;
  /** Days with no service: 0 = Sunday … 6 = Saturday */
  closedDays: number[];
  /** @deprecated Use singleHours — kept for older saved JSON. */
  openTime?: string;
  /** @deprecated Use singleHours — kept for older saved JSON. */
  closeTime?: string;
};

export type OrderingStatus = {
  status: "open" | "closed" | "disabled";
  canAddToCart: boolean;
  isPreOrderOnly: boolean;
  opensAtLabel: string | null;
  closesAtLabel: string | null;
  /** Local datetime for pickup minimum (no timezone suffix). */
  nextOpenAt: string | null;
  message: string;
};

const DEFAULT_TIMEZONE = "Pacific/Auckland";

const DEFAULT_WEEKDAY: DayHours = { openTime: "17:30", closeTime: "21:00" };
const DEFAULT_WEEKEND: DayHours = { openTime: "11:00", closeTime: "21:00" };

function envBool(key: string, fallback: boolean): boolean {
  const v = process.env[key]?.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return fallback;
}

function envTime(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  if (!v) return fallback;
  const m = v.match(/^(\d{1,2}):(\d{2})/);
  return m ? normalizeHm(`${m[1]}:${m[2]}`) : fallback;
}

function envClosedDays(): number[] {
  const raw = process.env.ORDERING_CLOSED_DAYS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 6);
}

export function defaultOrderingSettings(): OrderingSettings {
  const single: DayHours = {
    openTime: envTime("ORDERING_OPEN_TIME", DEFAULT_WEEKEND.openTime),
    closeTime: envTime("ORDERING_CLOSE_TIME", DEFAULT_WEEKEND.closeTime),
  };
  return {
    orderingEnabled: envBool("ORDERING_ENABLED", true),
    blockOrdersWhenClosed: envBool("ORDERING_BLOCK_WHEN_CLOSED", true),
    preOrderWhenClosed: envBool("ORDERING_PREORDER_WHEN_CLOSED", true),
    forceClosed: envBool("ORDERING_FORCE_CLOSED", false),
    forceOpen: envBool("ORDERING_FORCE_OPEN", false),
    timezone: process.env.ORDERING_TIMEZONE?.trim() || DEFAULT_TIMEZONE,
    useWeekdayWeekendSchedule: envBool("ORDERING_USE_WEEKDAY_WEEKEND", true),
    weekdayHours: {
      openTime: envTime("ORDERING_WEEKDAY_OPEN", DEFAULT_WEEKDAY.openTime),
      closeTime: envTime("ORDERING_WEEKDAY_CLOSE", DEFAULT_WEEKDAY.closeTime),
    },
    weekendHours: {
      openTime: envTime("ORDERING_WEEKEND_OPEN", DEFAULT_WEEKEND.openTime),
      closeTime: envTime("ORDERING_WEEKEND_CLOSE", DEFAULT_WEEKEND.closeTime),
    },
    singleHours: single,
    closedDays: envClosedDays(),
  };
}

export function normalizeHm(hm: string): string {
  const [h, m] = hm.split(":");
  return `${String(parseInt(h ?? "0", 10)).padStart(2, "0")}:${String(parseInt(m ?? "0", 10)).padStart(2, "0")}`;
}

function parseHmToMinutes(hm: string): number {
  const [h, m] = hm.split(":").map((x) => parseInt(x, 10));
  return (h ?? 0) * 60 + (m ?? 0);
}

function normalizeDayHours(raw: unknown, fallback: DayHours): DayHours {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const parseHmField = (v: unknown, fb: string) => {
    if (typeof v !== "string") return fb;
    const m = v.trim().match(/^(\d{1,2}):(\d{2})/);
    return m ? normalizeHm(`${m[1]}:${m[2]}`) : fb;
  };
  return {
    openTime: parseHmField(r.openTime, fallback.openTime),
    closeTime: parseHmField(r.closeTime, fallback.closeTime),
  };
}

export function isWeekendDay(dayOfWeek: number): boolean {
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/** Hours that apply on a given calendar day (0 = Sun … 6 = Sat). */
export function hoursForDayOfWeek(settings: OrderingSettings, dayOfWeek: number): DayHours {
  if (settings.useWeekdayWeekendSchedule) {
    return isWeekendDay(dayOfWeek) ? settings.weekendHours : settings.weekdayHours;
  }
  return settings.singleHours;
}

export function hoursForDate(date: Date, settings: OrderingSettings): DayHours {
  return hoursForDayOfWeek(settings, localDayOfWeek(date, settings.timezone));
}

export function localDayOfWeek(date: Date, timeZone: string): number {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wd] ?? 0;
}

export function localDateKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function localMinutesSinceMidnight(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-NZ", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return h * 60 + m;
}

export function formatTimeLabel(hm: string, timeZone: string): string {
  const [h, mi] = hm.split(":").map((x) => parseInt(x, 10));
  const d = new Date();
  d.setHours(h ?? 0, mi ?? 0, 0, 0);
  return new Intl.DateTimeFormat("en-NZ", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function isClosedDay(date: Date, settings: OrderingSettings): boolean {
  return settings.closedDays.includes(localDayOfWeek(date, settings.timezone));
}

function isWithinHours(nowMin: number, hours: DayHours): boolean {
  const openMin = parseHmToMinutes(hours.openTime);
  const closeMin = parseHmToMinutes(hours.closeTime);
  if (closeMin <= openMin) {
    return nowMin >= openMin || nowMin < closeMin;
  }
  return nowMin >= openMin && nowMin < closeMin;
}

/** Whether the store is accepting orders right now (within hours, not a closed day). */
export function isWithinOpenHours(date: Date, settings: OrderingSettings): boolean {
  if (isClosedDay(date, settings)) return false;
  const nowMin = localMinutesSinceMidnight(date, settings.timezone);
  return isWithinHours(nowMin, hoursForDate(date, settings));
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map((x) => parseInt(x, 10));
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Next local open slot as `YYYY-MM-DDTHH:mm` (for pickup minimum). */
export function computeNextOpenAt(settings: OrderingSettings, now = new Date()): string | null {
  const tz = settings.timezone;
  const startKey = localDateKey(now, tz);

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const key = dayOffset === 0 ? startKey : addDaysToDateKey(startKey, dayOffset);
    const probe = new Date(`${key}T12:00:00`);
    if (isClosedDay(probe, settings)) continue;

    const hours = hoursForDate(probe, settings);
    const openMin = parseHmToMinutes(hours.openTime);
    const closeMin = parseHmToMinutes(hours.closeTime);
    const nowMin = dayOffset === 0 ? localMinutesSinceMidnight(now, tz) : -1;

    if (dayOffset === 0 && nowMin < openMin) {
      return `${key}T${hours.openTime}`;
    }
    if (dayOffset > 0) {
      return `${key}T${hours.openTime}`;
    }
    if (dayOffset === 0 && nowMin >= closeMin && closeMin > openMin) {
      continue;
    }
  }

  const fallback = hoursForDate(now, settings);
  return `${startKey}T${fallback.openTime}`;
}

export function mergeOrderingSettings(partial: unknown): OrderingSettings {
  const base = defaultOrderingSettings();
  if (!partial || typeof partial !== "object") return base;
  const p = partial as Record<string, unknown>;

  const closedDays = Array.isArray(p.closedDays)
    ? p.closedDays
        .map((d) => (typeof d === "number" ? d : parseInt(String(d), 10)))
        .filter((n) => Number.isFinite(n) && n >= 0 && n <= 6)
    : base.closedDays;

  const parseHmField = (v: unknown, fallback: string) => {
    if (typeof v !== "string") return fallback;
    const m = v.trim().match(/^(\d{1,2}):(\d{2})/);
    return m ? normalizeHm(`${m[1]}:${m[2]}`) : fallback;
  };

  const legacySingle: DayHours = {
    openTime: parseHmField(p.openTime, base.singleHours.openTime),
    closeTime: parseHmField(p.closeTime, base.singleHours.closeTime),
  };

  const useWeekdayWeekendSchedule =
    typeof p.useWeekdayWeekendSchedule === "boolean"
      ? p.useWeekdayWeekendSchedule
      : base.useWeekdayWeekendSchedule;

  return {
    orderingEnabled: typeof p.orderingEnabled === "boolean" ? p.orderingEnabled : base.orderingEnabled,
    blockOrdersWhenClosed:
      typeof p.blockOrdersWhenClosed === "boolean" ? p.blockOrdersWhenClosed : base.blockOrdersWhenClosed,
    preOrderWhenClosed:
      typeof p.preOrderWhenClosed === "boolean" ? p.preOrderWhenClosed : base.preOrderWhenClosed,
    forceClosed: typeof p.forceClosed === "boolean" ? p.forceClosed : base.forceClosed,
    forceOpen: typeof p.forceOpen === "boolean" ? p.forceOpen : base.forceOpen,
    timezone: typeof p.timezone === "string" && p.timezone.trim() ? p.timezone.trim() : base.timezone,
    useWeekdayWeekendSchedule,
    weekdayHours: normalizeDayHours(p.weekdayHours, base.weekdayHours),
    weekendHours: normalizeDayHours(p.weekendHours, base.weekendHours),
    singleHours: normalizeDayHours(p.singleHours, legacySingle),
    closedDays,
  };
}

export function computeOrderingStatus(settings: OrderingSettings, now = new Date()): OrderingStatus {
  const tz = settings.timezone;
  const todayHours = hoursForDate(now, settings);
  const opensAtLabel = formatTimeLabel(todayHours.openTime, tz);
  const closesAtLabel = formatTimeLabel(todayHours.closeTime, tz);
  const nextOpenAt = computeNextOpenAt(settings, now);

  if (!settings.orderingEnabled) {
    return {
      status: "disabled",
      canAddToCart: false,
      isPreOrderOnly: false,
      opensAtLabel,
      closesAtLabel,
      nextOpenAt,
      message: "Online ordering is temporarily unavailable. Please check back soon.",
    };
  }

  const physicallyOpen =
    settings.forceOpen || (!settings.forceClosed && isWithinOpenHours(now, settings));

  if (physicallyOpen) {
    return {
      status: "open",
      canAddToCart: true,
      isPreOrderOnly: false,
      opensAtLabel,
      closesAtLabel,
      nextOpenAt,
      message: `We're open until ${closesAtLabel}.`,
    };
  }

  const canPreOrder = settings.preOrderWhenClosed;
  const canAddToCart = !settings.blockOrdersWhenClosed || canPreOrder;

  const nowMin = localMinutesSinceMidnight(now, tz);
  const openMin = parseHmToMinutes(todayHours.openTime);
  const closeMin = parseHmToMinutes(todayHours.closeTime);
  const closedToday = isClosedDay(now, settings);
  const beforeOpen = !closedToday && nowMin < openMin;
  const afterClose = !closedToday && closeMin > openMin && nowMin >= closeMin;

  const nextOpenLabel =
    nextOpenAt != null
      ? formatTimeLabel(nextOpenAt.split("T")[1] ?? todayHours.openTime, tz)
      : opensAtLabel;

  let message: string;
  if (!canAddToCart) {
    message = closedToday
      ? `We're closed today. We open at ${nextOpenLabel} on our next open day.`
      : afterClose
        ? `We're closed for today. We open at ${nextOpenLabel} on our next open day.`
        : `We're closed. We open at ${opensAtLabel}.`;
  } else if (canPreOrder && beforeOpen) {
    message = `We're not open yet — we open at ${opensAtLabel}. You can pre-order below and choose a pickup time after we open.`;
  } else if (canPreOrder) {
    message = `We're closed right now. Pre-orders are welcome — choose a pickup time when we're open.`;
  } else {
    message = `We're closed. We open at ${opensAtLabel}.`;
  }

  return {
    status: "closed",
    canAddToCart,
    isPreOrderOnly: canAddToCart && canPreOrder,
    opensAtLabel,
    closesAtLabel,
    nextOpenAt,
    message,
  };
}

/** Server checkout: pickup slot must be at or after store open when pre-ordering while closed. */
export function isPickupSlotAllowed(
  pickupTimeLocal: string,
  settings: OrderingSettings,
  now = new Date()
): { ok: true } | { ok: false; detail: string } {
  const status = computeOrderingStatus(settings, now);
  if (status.status === "disabled") {
    return { ok: false, detail: "Online ordering is currently unavailable." };
  }
  if (status.status === "open") {
    return { ok: true };
  }
  if (!status.isPreOrderOnly && status.status === "closed") {
    return { ok: false, detail: status.message };
  }

  const slotMs = Date.parse(pickupTimeLocal);
  if (Number.isNaN(slotMs)) {
    return { ok: false, detail: "Invalid pickup time." };
  }

  const nextOpen = status.nextOpenAt;
  if (!nextOpen) {
    return { ok: false, detail: "Could not determine the next open time." };
  }
  const minMs = Date.parse(nextOpen);
  if (Number.isNaN(minMs)) {
    return { ok: false, detail: "Could not determine the next open time." };
  }
  if (slotMs < minMs - 60_000) {
    const label = status.opensAtLabel ?? nextOpen.split("T")[1] ?? "opening";
    return {
      ok: false,
      detail: `Pre-orders must be for ${label} or later, when we open.`,
    };
  }

  return { ok: true };
}
