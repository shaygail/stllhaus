import { Resend } from "resend";

let client: Resend | null = null;

/** Lazy Resend client — avoids throwing at import time when `RESEND_API_KEY` is unset (e.g. CI build). */
export function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!client) {
    client = new Resend(key);
  }
  return client;
}
