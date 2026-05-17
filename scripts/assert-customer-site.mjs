#!/usr/bin/env node
/**
 * Fails CI/build if this repo looks like the POS app or is missing customer routes.
 * Prevents accidentally deploying stllhaus-pos to the stllhaus.co Vercel project.
 */
import { existsSync } from "node:fs";
import { exit } from "node:process";

const requiredPaths = [
  "app/menu/page.tsx",
  "app/gallery/page.tsx",
  "app/checkout/page.tsx",
  "app/page.tsx",
];

const posOnlyPaths = [
  "app/menu-management",
  "app/(pos)",
  "app/dashboard",
];

const errors = [];

for (const p of requiredPaths) {
  if (!existsSync(p)) errors.push(`Missing customer route: ${p}`);
}

for (const p of posOnlyPaths) {
  if (existsSync(p)) errors.push(`POS-only path must not exist in customer repo: ${p}`);
}

if (errors.length > 0) {
  console.error("\n[assert-customer-site] This is the CUSTOMER website repo, not stllhaus-pos.\n");
  for (const e of errors) console.error(`  • ${e}`);
  console.error(
    "\nDeploy POS from github.com/shaygail/stllhaus-pos → Vercel project stllhaus-pos only.\n" +
      "Deploy this repo → Vercel project stllhaus (stllhaus.co).\n"
  );
  exit(1);
}

console.log("[assert-customer-site] OK — customer ordering site structure verified.");
