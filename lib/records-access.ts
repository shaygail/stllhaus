import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const RECORDS_ACCESS_COOKIE = "stll_records_access";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function hasRecordsAccessPasswordConfigured(): boolean {
  return Boolean(process.env.RECORDS_ACCESS_PASSWORD?.trim());
}

export async function hasRecordsAccess(): Promise<boolean> {
  const expected = process.env.RECORDS_ACCESS_PASSWORD?.trim();
  if (!expected) {
    // Fail closed in production when the password env var is missing.
    return process.env.NODE_ENV !== "production";
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(RECORDS_ACCESS_COOKIE)?.value;
  if (!token) return false;
  return safeEqual(token, sha256(expected));
}

export async function setRecordsAccessCookie() {
  const expected = process.env.RECORDS_ACCESS_PASSWORD?.trim();
  if (!expected) return;
  const cookieStore = await cookies();
  cookieStore.set(RECORDS_ACCESS_COOKIE, sha256(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearRecordsAccessCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(RECORDS_ACCESS_COOKIE);
}

export function validateRecordsPassword(input: string): boolean {
  const expected = process.env.RECORDS_ACCESS_PASSWORD?.trim();
  if (!expected) return false;
  return safeEqual(input.trim(), expected);
}

export async function isRecordsAccessDenied(): Promise<boolean> {
  return !(await hasRecordsAccess());
}
