import type { ToolContext } from "@lovable.dev/mcp-js";

/**
 * In-memory sliding-window rate limiter. Per-worker-instance only (the Worker
 * runtime is stateless across cold starts and horizontally scaled), which is
 * appropriate as best-effort throttling for a public read-only surface — not
 * a security control. Keyed by client IP when available, otherwise by a
 * bucket name so at least a global cap applies.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60; // 60 requests per IP per minute
const GLOBAL_MAX_PER_WINDOW = 600; // 600 requests total per minute per worker instance

const hits = new Map<string, number[]>();

function prune(list: number[], now: number): number[] {
  const cutoff = now - WINDOW_MS;
  let i = 0;
  while (i < list.length && list[i] < cutoff) i += 1;
  return i === 0 ? list : list.slice(i);
}

function clientIp(ctx: ToolContext): string {
  const req = (ctx as unknown as { request?: Request }).request;
  if (!req) return "unknown";
  const fwd = req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip");
  return fwd || "unknown";
}

export function checkRateLimit(ctx: ToolContext): { ok: true } | { ok: false; message: string } {
  const now = Date.now();
  const ip = clientIp(ctx);

  const perIpKey = `ip:${ip}`;
  const perIp = prune(hits.get(perIpKey) ?? [], now);
  if (perIp.length >= MAX_PER_WINDOW) {
    return { ok: false, message: `Rate limit exceeded (${MAX_PER_WINDOW}/min). Slow down and try again.` };
  }
  perIp.push(now);
  hits.set(perIpKey, perIp);

  const globalKey = "global";
  const global = prune(hits.get(globalKey) ?? [], now);
  if (global.length >= GLOBAL_MAX_PER_WINDOW) {
    return { ok: false, message: "Server is busy. Try again in a minute." };
  }
  global.push(now);
  hits.set(globalKey, global);

  // Occasional map cleanup so unused IPs don't accumulate.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      const pruned = prune(v, now);
      if (pruned.length === 0) hits.delete(k);
      else hits.set(k, pruned);
    }
  }

  return { ok: true };
}

export function rateLimited(ctx: ToolContext) {
  const gate = checkRateLimit(ctx);
  if (gate.ok) return null;
  return {
    content: [{ type: "text" as const, text: gate.message }],
    isError: true,
  };
}