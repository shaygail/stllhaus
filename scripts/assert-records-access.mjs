#!/usr/bin/env node
/**
 * Ensures business records stay password-protected in Vercel production.
 */
import { exit } from "node:process";

const isVercelProduction =
  process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";

if (isVercelProduction && !process.env.RECORDS_ACCESS_PASSWORD?.trim()) {
  console.error(
    "\n[assert-records-access] RECORDS_ACCESS_PASSWORD is required on Vercel production.\n" +
      "Add it in Vercel → stllhaus project → Settings → Environment Variables.\n"
  );
  exit(1);
}

console.log("[assert-records-access] OK — records access guard verified.");
