/**
 * Sitewide product-audit endpoint — the documented scheduler entry point.
 *
 * Secret-gated and safe to run daily. It suppresses dead links, promotes only
 * already-approved backups that pass independent validation, and queues styling
 * requests. It never publishes an unapproved product.
 *
 *   POST /api/public/product-audit
 *   Header: x-sweep-secret: <PRODUCT_HEALTH_SWEEP_SECRET>
 *   Body (optional): { destination?, moment?, lookKey?, limit?, autoGenerate? }
 */
import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const bodySchema = z.object({
  destination: z.string().max(80).optional(),
  moment: z.string().max(80).optional(),
  lookKey: z.string().max(200).optional(),
  limit: z.number().int().min(1).max(1000).default(1000),
  autoGenerate: z.boolean().default(true),
});

function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/product-audit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["PRODUCT_HEALTH_SWEEP_SECRET"];
        if (!expected) return new Response("Audit secret not configured", { status: 503 });
        const provided = request.headers.get("x-sweep-secret") ?? "";
        if (!secretMatches(provided, expected)) return new Response("Unauthorized", { status: 401 });

        let parsed: z.infer<typeof bodySchema>;
        try {
          const raw = await request.text();
          parsed = bodySchema.parse(raw ? JSON.parse(raw) : {});
        } catch {
          return new Response("Invalid body", { status: 400 });
        }

        const { runSiteProductAudit } = await import("@/lib/product-audit.server");
        try {
          const report = await runSiteProductAudit({
            ...(parsed.destination ? { destination: parsed.destination } : {}),
            ...(parsed.moment ? { moment: parsed.moment } : {}),
            ...(parsed.lookKey ? { lookKey: parsed.lookKey } : {}),
            limit: parsed.limit,
            autoGenerate: parsed.autoGenerate,
            triggeredBy: "scheduler",
          });
          return Response.json({ ok: true, report });
        } catch (err) {
          console.error("[product-audit] failed", err);
          return new Response("Audit failed", { status: 500 });
        }
      },
    },
  },
});
