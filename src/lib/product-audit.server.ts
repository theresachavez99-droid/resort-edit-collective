/**
 * Sitewide product audit (server-only).
 *
 * One reusable job that: (1) indexes every customer-facing shoppable product
 * URL on the site with all of its usage locations, (2) validates each URL
 * against the real retailer page, (3) classifies failures, (4) suppresses dead
 * links immediately by writing a non-active status, (5) auto-promotes the
 * highest-priority APPROVED backup only when that backup independently passes
 * validation, and (6) queues a ChatGPT styling request for any slot left
 * without a usable approved backup.
 *
 * It never invents a product, never promotes an unapproved candidate, and never
 * deletes a slot: a slot with nothing safe to show renders the tasteful
 * "Replacement in review" state instead.
 *
 * The same entry point backs the admin buttons today and a daily scheduled job
 * via `/api/public/product-audit` — see `AUDIT_SCHEDULER_NOTE`.
 */
import {
  isFailedStatus,
  routeForLookKey,
  type ProductStatus,
} from "./product-health";
import { verifyPdp, type PdpVerification } from "./pdp-verification.server";
import { enumerateRegistryLooks } from "./look-registry";

/** Documented scheduler entry point (no external cron required yet). */
export const AUDIT_SCHEDULER_NOTE =
  "POST /api/public/product-audit with header x-sweep-secret: $PRODUCT_HEALTH_SWEEP_SECRET. " +
  "Body: { destination?, moment?, lookKey?, limit?, autoGenerate? }. Safe to run daily.";

export type AuditScope = {
  destination?: string;
  moment?: string;
  lookKey?: string;
  limit?: number;
  /** Queue ChatGPT styling requests for slots with no usable approved backup. */
  autoGenerate?: boolean;
  triggeredBy?: string;
};

export type UsageLocation = {
  route: string;
  destination: string;
  moment: string;
  lookKey: string;
  lookTitle: string | null;
  lookKind: string;
  slot: string;
  productId: string;
  isPrimary: boolean;
  replacementPriority: number;
  source: string;
};

export type AuditFinding = {
  url: string;
  usages: UsageLocation[];
  status: ProductStatus;
  verdict: string;
  httpStatus: number | null;
  finalUrl: string | null;
  brand: string;
  productName: string;
  retailer: string | null;
  checks: string[];
};

export type AuditReport = {
  runId: string | null;
  urlsAudited: number;
  uniqueUrls: number;
  counts: Record<string, number>;
  autoPromoted: Array<{
    lookKey: string;
    slot: string;
    route: string;
    failedUrl: string;
    replacedWith: { brand: string; productName: string; url: string };
  }>;
  inReview: Array<{ lookKey: string; slot: string; route: string; reason: string }>;
  queuedForStyling: Array<{ lookKey: string; slot: string; route: string; candidates: number }>;
  stylingQueueErrors: string[];
  failures: AuditFinding[];
  inconclusiveDomains: string[];
  routesAffected: Array<{ route: string; failures: number }>;
};

type SlotRow = {
  id: string;
  destination: string;
  moment: string;
  look_key: string;
  look_kind: string;
  look_title: string | null;
  slot: string;
  brand: string;
  product_name: string;
  retailer: string | null;
  url: string | null;
  price: string | null;
  status: string;
  is_primary: boolean;
  replacement_priority: number;
  registry_source: string;
};

/** Map an independent verification result onto an audit status. */
export function statusFromVerification(v: PdpVerification): ProductStatus {
  switch (v.verdict) {
    case "verified_live":
      return "active";
    case "rejected_404":
      return "404";
    case "rejected_sold_out":
      return "sold_out";
    case "rejected_not_http_url":
    case "rejected_not_exact_pdp":
    case "rejected_redirects_to_non_pdp":
      return "non_product_url";
    case "rejected_product_mismatch":
      return "title_mismatch";
    case "rejected_unreachable":
      return "blocked_or_inconclusive";
    default:
      // unverified_http_403 / 429 / 5xx / bot challenge — never a product failure.
      return v.status === "unverified" ? "blocked_or_inconclusive" : "unavailable";
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

/**
 * Index every shoppable product URL currently stored for the site, with each
 * place it is used. Identical URLs are deduplicated, every usage preserved.
 */
export async function indexSiteProducts(scope: AuditScope = {}): Promise<{
  rows: SlotRow[];
  byUrl: Map<string, { row: SlotRow; usages: UsageLocation[] }>;
  unsourcedRegistrySlots: Array<{ lookKey: string; slot: string; route: string }>;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let q = supabaseAdmin
    .from("shop_slot_products")
    .select(
      "id,destination,moment,look_key,look_kind,look_title,slot,brand,product_name,retailer,url,price,status,is_primary,replacement_priority,registry_source",
    )
    .not("url", "is", null)
    .order("look_key", { ascending: true })
    .limit(scope.limit ?? 1000);
  if (scope.destination) q = q.eq("destination", scope.destination);
  if (scope.moment) q = q.eq("moment", scope.moment);
  if (scope.lookKey) q = q.eq("look_key", scope.lookKey);
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as SlotRow[];
  const byUrl = new Map<string, { row: SlotRow; usages: UsageLocation[] }>();
  for (const row of rows) {
    if (!row.url) continue;
    const usage: UsageLocation = {
      route: routeForLookKey(row.look_key),
      destination: row.destination,
      moment: row.moment,
      lookKey: row.look_key,
      lookTitle: row.look_title,
      lookKind: row.look_kind,
      slot: row.slot,
      productId: row.id,
      isPrimary: row.is_primary,
      replacementPriority: row.replacement_priority,
      source: row.registry_source,
    };
    const entry = byUrl.get(row.url);
    if (entry) entry.usages.push(usage);
    else byUrl.set(row.url, { row, usages: [usage] });
  }

  // Editorial slots that never had an exact PDP: surfaced so the audit reports
  // real coverage instead of pretending the site is fully sourced.
  const unsourcedRegistrySlots: Array<{ lookKey: string; slot: string; route: string }> = [];
  for (const look of enumerateRegistryLooks({
    ...(scope.destination ? { destination: scope.destination } : {}),
    ...(scope.moment ? { moment: scope.moment } : {}),
    ...(scope.lookKey ? { lookKey: scope.lookKey } : {}),
  })) {
    for (const slot of look.slots) {
      if (slot.publishable) continue;
      unsourcedRegistrySlots.push({
        lookKey: look.lookKey,
        slot: slot.slot,
        route: routeForLookKey(look.lookKey),
      });
    }
  }

  return { rows, byUrl, unsourcedRegistrySlots };
}

async function logEvent(input: {
  runId: string | null;
  slotProductId?: string | null;
  candidateId?: string | null;
  destination?: string | null;
  moment?: string | null;
  lookKey: string;
  slot: string;
  eventType: string;
  actor?: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  fromUrl?: string | null;
  toUrl?: string | null;
  detail?: Record<string, unknown>;
}): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("product_audit_events").insert({
    run_id: input.runId,
    slot_product_id: input.slotProductId ?? null,
    candidate_id: input.candidateId ?? null,
    destination: input.destination ?? null,
    moment: input.moment ?? null,
    look_key: input.lookKey,
    slot: input.slot,
    event_type: input.eventType,
    actor: input.actor ?? "system",
    from_status: input.fromStatus ?? null,
    to_status: input.toStatus ?? null,
    from_url: input.fromUrl ?? null,
    to_url: input.toUrl ?? null,
    detail: (input.detail ?? {}) as never,
  });
}

/** Public helper so manual admin decisions land in the same audit log. */
export async function recordAuditEvent(input: Parameters<typeof logEvent>[0]): Promise<void> {
  await logEvent(input);
}

/**
 * Run the audit. Every write is a suppression, a status record, or a promotion
 * of an already-approved and independently re-validated backup.
 */
export async function runSiteProductAudit(scope: AuditScope = {}): Promise<AuditReport> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { rows, byUrl, unsourcedRegistrySlots } = await indexSiteProducts(scope);

  const { data: runRow } = await supabaseAdmin
    .from("product_audit_runs")
    .insert({
      scope: scope.lookKey ? "look" : scope.moment ? "moment" : scope.destination ? "destination" : "sitewide",
      destination: scope.destination ?? null,
      moment: scope.moment ?? null,
      look_key: scope.lookKey ?? null,
      triggered_by: scope.triggeredBy ?? "admin",
    })
    .select("id")
    .single();
  const runId = runRow?.id ?? null;

  const report: AuditReport = {
    runId,
    urlsAudited: 0,
    uniqueUrls: byUrl.size,
    counts: {},
    autoPromoted: [],
    inReview: [],
    queuedForStyling: [],
    stylingQueueErrors: [],
    failures: [],
    inconclusiveDomains: [],
    routesAffected: [],
  };

  // ── 1/2. Validate every unique URL, then record the verdict on every usage.
  const verdictByUrl = new Map<string, PdpVerification>();
  const statusByProductId = new Map<string, ProductStatus>();

  for (const [url, { row, usages }] of byUrl) {
    const verification = await verifyPdp({
      url,
      brand: row.brand,
      productName: row.product_name,
    });
    verdictByUrl.set(url, verification);
    const status = statusFromVerification(verification);
    report.urlsAudited += 1;
    report.counts[status] = (report.counts[status] ?? 0) + 1;

    const now = new Date().toISOString();
    for (const usage of usages) {
      statusByProductId.set(usage.productId, status);
      const previous = rows.find((r) => r.id === usage.productId)?.status ?? null;
      await supabaseAdmin
        .from("shop_slot_products")
        .update({
          status,
          last_checked_at: now,
          last_http_status: verification.httpStatus,
          last_final_url: verification.finalUrl,
          last_audit_verdict: verification.verdict,
          last_audit_detail: verification as unknown as never,
          ...(status === "active" ? { last_seen_available_at: now } : {}),
        })
        .eq("id", usage.productId);

      if (previous !== status) {
        await logEvent({
          runId,
          slotProductId: usage.productId,
          destination: usage.destination,
          moment: usage.moment,
          lookKey: usage.lookKey,
          slot: usage.slot,
          eventType: status === "active" ? "audit_recovered" : "audit_suppressed",
          fromStatus: previous,
          toStatus: status,
          fromUrl: url,
          detail: { verdict: verification.verdict, checks: verification.checks },
        });
      }
    }

    if (status !== "active") {
      report.failures.push({
        url,
        usages,
        status,
        verdict: verification.verdict,
        httpStatus: verification.httpStatus,
        finalUrl: verification.finalUrl,
        brand: row.brand,
        productName: row.product_name,
        retailer: row.retailer,
        checks: verification.checks,
      });
    }
    if (status === "blocked_or_inconclusive" && !report.inconclusiveDomains.includes(hostOf(url))) {
      report.inconclusiveDomains.push(hostOf(url));
    }
  }

  // ── 3. Safe replacement: promote an approved, re-validated backup or leave
  //       the slot in the "Replacement in review" state.
  const slotGroups = new Map<string, SlotRow[]>();
  for (const row of rows) {
    const key = `${row.look_key}::${row.slot}`;
    slotGroups.set(key, [...(slotGroups.get(key) ?? []), row]);
  }

  for (const [key, group] of slotGroups) {
    const primary = group.find((r) => r.is_primary);
    if (!primary) continue;
    const primaryStatus = statusByProductId.get(primary.id) ?? primary.status;
    if (!isFailedStatus(primaryStatus)) continue;

    const lookKey = primary.look_key;
    const slot = primary.slot;
    const route = routeForLookKey(lookKey);

    const backups = group
      .filter((r) => !r.is_primary)
      .sort((a, b) => a.replacement_priority - b.replacement_priority);

    let promoted = false;
    for (const backup of backups) {
      if (!backup.url) continue;
      // Approved backups are the only rows that ever reach this table, but the
      // backup must ALSO pass validation independently before it goes public.
      const check =
        verdictByUrl.get(backup.url) ??
        (await verifyPdp({ url: backup.url, brand: backup.brand, productName: backup.product_name }));
      const backupStatus = statusFromVerification(check);
      if (backupStatus !== "active") continue;

      await supabaseAdmin
        .from("shop_slot_products")
        .update({ is_primary: false, replacement_priority: Math.max(1, backups.length) })
        .eq("id", primary.id);
      await supabaseAdmin
        .from("shop_slot_products")
        .update({ is_primary: true, replacement_priority: 0, status: "active" })
        .eq("id", backup.id);

      report.autoPromoted.push({
        lookKey,
        slot,
        route,
        failedUrl: primary.url ?? "",
        replacedWith: { brand: backup.brand, productName: backup.product_name, url: backup.url },
      });
      await logEvent({
        runId,
        slotProductId: backup.id,
        destination: primary.destination,
        moment: primary.moment,
        lookKey,
        slot,
        eventType: "auto_promoted_approved_backup",
        fromStatus: primaryStatus,
        toStatus: "active",
        fromUrl: primary.url,
        toUrl: backup.url,
        detail: { verdict: check.verdict },
      });
      promoted = true;
      break;
    }

    if (promoted) continue;

    report.inReview.push({
      lookKey,
      slot,
      route,
      reason: `primary ${primaryStatus} and no approved backup passed validation`,
    });
    await logEvent({
      runId,
      slotProductId: primary.id,
      destination: primary.destination,
      moment: primary.moment,
      lookKey,
      slot,
      eventType: "replacement_in_review",
      fromStatus: primaryStatus,
      toStatus: primaryStatus,
      fromUrl: primary.url,
    });

    // ── 4. ChatGPT styling queue for the failed slot.
    if (scope.autoGenerate !== false) {
      try {
        const { generateCandidatesForSlotProduct } = await import("./ai-replacement.server");
        const out = await generateCandidatesForSlotProduct(primary.id);
        report.queuedForStyling.push({ lookKey, slot, route, candidates: out.candidates.length });
        await logEvent({
          runId,
          slotProductId: primary.id,
          destination: primary.destination,
          moment: primary.moment,
          lookKey,
          slot,
          eventType: "styling_requested",
          detail: { candidates: out.candidates.length },
        });
      } catch (err) {
        report.stylingQueueErrors.push(
          `${key}: ${err instanceof Error ? err.message : "styling request failed"}`,
        );
      }
    }
  }

  // Unsourced editorial slots are review work, not silent gaps.
  for (const s of unsourcedRegistrySlots) {
    report.inReview.push({ ...s, reason: "editorial slot has no exact PDP yet" });
  }

  const routeCounts = new Map<string, number>();
  for (const f of report.failures) {
    for (const u of f.usages) routeCounts.set(u.route, (routeCounts.get(u.route) ?? 0) + 1);
  }
  report.routesAffected = [...routeCounts.entries()]
    .map(([route, failures]) => ({ route, failures }))
    .sort((a, b) => b.failures - a.failures);

  if (runId) {
    await supabaseAdmin
      .from("product_audit_runs")
      .update({
        urls_audited: report.urlsAudited,
        unique_urls: report.uniqueUrls,
        counts: report.counts as never,
        auto_promoted: report.autoPromoted.length,
        awaiting_styling: report.queuedForStyling.length + report.inReview.length,
        report: report as unknown as never,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
  }

  return report;
}
