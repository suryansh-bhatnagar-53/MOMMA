// In-memory sliding-window rate limiter for server functions. Works on a single server
// (local dev, one Render instance); it resets on restart and is not shared between instances.

const hits = new Map<string, number[]>();
const DAY_MS = 24 * 60 * 60 * 1000;

// Records a hit and returns true if `key` has made fewer than `limit` calls in the last `windowMs`.
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  const ok = recent.length < limit;
  if (ok) recent.push(now);
  hits.set(key, recent);
  // Drop keys idle for a day so memory doesn't grow with every visitor.
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < DAY_MS)) hits.delete(k);
  return ok;
}
