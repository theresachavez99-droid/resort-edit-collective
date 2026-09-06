import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Server functions for the Long Lunch Auto-Edit.
 *
 * All diagnostic / evaluation / simulation endpoints are admin-gated on the
 * signed httpOnly session cookie, exactly like the rest of the Studio. The
 * public read is separate and returns display fields only — never a price.
 */
async function assertAdmin() {
  const { isValidAdminSession, ADMIN_SESSION_COOKIE } = await import("./admin-auth.server");
  if (!isValidAdminSession(getCookie(ADMIN_SESSION_COOKIE))) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

export const getLongLunchAutoEditStatus = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();
  const { loadLongLunchDiagnostics } = await import("./long-lunch-auto-edit.server");
  return loadLongLunchDiagnostics();
});

export const runLongLunchAutoEdit = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ force: z.boolean().optional() }).parse(input ?? {}))
  .handler(async ({ data }) => {
    await assertAdmin();
    const { evaluateLongLunchAutoEdit } = await import("./long-lunch-auto-edit.server");
    return evaluateLongLunchAutoEdit({ force: data.force ?? false });
  });

export const simulateLongLunchSlot = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        slotProductId: z.string().uuid(),
        simulatedStatus: z.enum(["404", "sold_out", "needs_review"]).default("404"),
        active: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertAdmin();
    const { setSlotSimulation } = await import("./long-lunch-auto-edit.server");
    return setSlotSimulation(data);
  });

export const clearLongLunchSimulations = createServerFn({ method: "POST" }).handler(async () => {
  await assertAdmin();
  const { clearSimulations } = await import("./long-lunch-auto-edit.server");
  return clearSimulations();
});

/** Public, price-free read of the active complete Long Lunch look. */
export type PublicAutoEditRow = {
  slot: string;
  slotLabel: string;
  brand: string;
  productName: string;
  retailer: string | null;
  url: string;
};

export const getActiveAutoEditLook = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ lookKey: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }): Promise<{ rows: PublicAutoEditRow[] }> => {
    const { loadActiveAutoEditLook } = await import("./long-lunch-auto-edit.server");
    const version = await loadActiveAutoEditLook(data.lookKey);
    if (!version) return { rows: [] };
    const rows = (version.slots ?? [])
      .filter((s) => Boolean(s.url))
      .map((s) => ({
        slot: s.slot,
        slotLabel: s.slot_label,
        brand: s.brand,
        productName: s.product_name,
        retailer: s.retailer,
        url: s.url,
      }));
    return { rows };
  });
