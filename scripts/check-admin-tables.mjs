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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const tables = ["ordering_settings", "market_events"];
let ok = true;

for (const table of tables) {
  const { error } = await supabase.from(table).select("*").limit(1);
  if (error) {
    ok = false;
    console.log(`✗ ${table}: ${error.message}`);
  } else {
    console.log(`✓ ${table}: ready`);
  }
}

if (!ok) {
  console.log("\nRun supabase/admin_setup.sql in Supabase → SQL Editor, then re-run this script.");
  process.exit(1);
}

console.log("\nAdmin tables are ready. Saves from /admin/ordering and /account/events should work.");
