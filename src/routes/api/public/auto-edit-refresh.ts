/**
 * Scheduled sitewide Auto-Edit refresh.
 *
 *   POST /api/public/auto-edit-refresh
 *   Header: x-sweep-secret: <PRODUCT_HEALTH_SWEEP_SECRET>
 *   Body (optional): { generate?: boolean, limitMoments?: number }
 *
 * Idempotent per hour (job_key) and spend-bounded. With `generate: false`
 * (default) it costs nothing: it only re-audits which moments are launch-ready.
 * The caller is authenticated with a shared secret — the /api/public/ prefix
 * bypasses site auth, so this handler does its own verification.
 */
import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const bodySchema = z.object({
  generate: z.boolean().default(false),
  /** Live retailer stock recheck + durable repair of failing looks. */
  repair: z.boolean().default(true),
  limitMoments: z.number().int().min(1).max(6).default(2),
});

function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/auto-edit-refresh")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["PRODUCT_HEALTH_SWEEP_SECRET"];
        if (!expected) return new Response("Sweep secret not configured", { status: 503 });
        const provided = request.headers.get("x-sweep-secret") ?? "";
        if (!secretMatches(provided, expected)) return new Response("Unauthorized", { status: 401 });

        let parsed: z.infer<typeof bodySchema>;
        try {
          const raw = await request.text();
          parsed = bodySchema.parse(raw ? JSON.parse(raw) : {});
        } catch {
          return new Response("Invalid body", { status: 400 });
        }

        const { runJob, scheduledRefresh } = await import("@/lib/auto-edit-sitewide.server");
        const hour = new Date().toISOString().slice(0, 13);
        const outcome = await runJob(
          `auto-edit-refresh:${hour}:${parsed.generate ? "generate" : parsed.repair ? "repair" : "audit"}`,
          "auto_edit_refresh",
          async () => scheduledRefresh(parsed),
        );
        return Response.json(outcome, { status: outcome.status === "failed" ? 500 : 200 });
      },
    },
  },
});
