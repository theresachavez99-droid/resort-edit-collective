/**
 * Sitewide product-health sweep endpoint.
 *
 * Callable now with a shared secret; ready to be wired to a daily scheduled job
 * later without code changes. Read-only for the public site: it records
 * availability and (optionally) generates AI replacement candidates for review.
 * It never promotes or publishes a product.
 *
 *   POST /api/public/product-health-sweep
 *   Header: x-sweep-secret: <PRODUCT_HEALTH_SWEEP_SECRET>
 *   Body (optional): { destination?, moment?, limit?, autoGenerate? }
 */
import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const bodySchema = z.object({
  destination: z.string().max(80).optional(),
  moment: z.string().max(80).optional(),
  limit: z.number().int().min(1).max(500).default(200),
  autoGenerate: z.boolean().default(false),
});

function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/product-health-sweep")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["PRODUCT_HEALTH_SWEEP_SECRET"];
        if (!expected) {
          return new Response("Sweep secret not configured", { status: 503 });
        }
        const provided = request.headers.get("x-sweep-secret") ?? "";
        if (!secretMatches(provided, expected)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let parsed: z.infer<typeof bodySchema>;
        try {
          const raw = await request.text();
          parsed = bodySchema.parse(raw ? JSON.parse(raw) : {});
        } catch {
          return new Response("Invalid body", { status: 400 });
        }

        const { sweepProductHealth } = await import("@/lib/product-health-sweep.server");
        try {
          const result = await sweepProductHealth({
            ...(parsed.destination ? { destination: parsed.destination } : {}),
            ...(parsed.moment ? { moment: parsed.moment } : {}),
            limit: parsed.limit,
            autoGenerate: parsed.autoGenerate,
          });
          return Response.json({ ok: true, ...result });
        } catch (err) {
          console.error("[product-health-sweep] failed", err);
          return new Response("Sweep failed", { status: 500 });
        }
      },
    },
  },
});