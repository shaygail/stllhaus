import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  const k = t.slice(0, i).trim();
  const v = t.slice(i + 1).trim();
  if (!process.env[k]) process.env[k] = v;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const WEEKEND = {
  startDate: "2026-08-29",
  endDate: "2026-08-30",
  label: "This weekend",
};

const { data, error } = await supabase.from("ordering_settings").select("settings").eq("id", 1).maybeSingle();
if (error) {
  console.error(error.message);
  process.exit(1);
}

const current =
  data?.settings && typeof data.settings === "object" ? { ...data.settings } : {};

const existingRanges = Array.isArray(current.closedDateRanges) ? current.closedDateRanges : [];
const withoutWeekend = existingRanges.filter(
  (r) => !(r && r.startDate === WEEKEND.startDate && r.endDate === WEEKEND.endDate)
);

const next = {
  ...current,
  snacksAllowedOnClosedDates: true,
  closedDateRanges: [...withoutWeekend, WEEKEND].sort((a, b) =>
    String(a.startDate).localeCompare(String(b.startDate))
  ),
};

const { error: saveErr } = await supabase.from("ordering_settings").upsert(
  { id: 1, settings: next, updated_at: new Date().toISOString() },
  { onConflict: "id" }
);

if (saveErr) {
  console.error(saveErr.message);
  process.exit(1);
}

console.log("Updated ordering settings for this weekend:");
console.log(`  Closed: ${WEEKEND.startDate} → ${WEEKEND.endDate} (${WEEKEND.label})`);
console.log("  Snacks allowed on closed dates: true");
console.log("  Drinks blocked; siomai still orderable.");
