import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();
const MAX_KEYS = 40_000;

/** Destination suggestions: burst-friendly but caps sustained abuse (Places API cost). */
export const SUGGESTIONS_LIMIT = 60;
export const SUGGESTIONS_WINDOW_MS = 60_000;

/** Trip generation: protects OpenAI cost per authenticated user. */
export const GENERATE_TRIP_LIMIT = 12;
export const GENERATE_TRIP_WINDOW_MS = 60 * 60 * 1000;

function pruneExpired(now: number) {
  if (store.size <= MAX_KEYS) return;
  for (const [k, b] of store) {
    if (b.resetAt < now) store.delete(k);
  }
}

/**
 * Fixed-window counter (in-memory). Fine for single-node / low traffic; use Redis (e.g. Upstash)
 * in production if you run many serverless instances.
 */
export function rateLimitAllow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let b = store.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    store.set(key, b);
  }
  if (b.count >= limit) return false;
  b.count += 1;
  pruneExpired(now);
  return true;
}

/** Client IP for anonymous rate limits (best-effort behind proxies). */
export async function getClientIpKey(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}
