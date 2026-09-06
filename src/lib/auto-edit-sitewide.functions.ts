import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Admin-gated server functions for the sitewide Portofino Auto-Edit.
 * Every endpoint here requires a valid signed Studio session cookie.
 */
async function assertAdmin() {
  const { isValidAdminSession, ADMIN_SESSION_COOKIE } = await import("./admin-auth.server");
  if (!isValidAdminSession(getCookie(ADMIN_SESSION_COOKIE))) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

export const getPortofinoLaunchAudit = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();
  const { auditMoments } = await import("./auto-edit-sitewide.server");
  return auditMoments();
});

export const generatePortofinoVersion = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        momentSlug: z.string().min(2).max(60),
        lookKey: z.string().min(3).max(160).optional(),
        withHero: z.boolean().default(true),
        activateIfClean: z.boolean().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await assertAdmin();
    const { generateMomentVersion } = await import("./auto-edit-sitewide.server");
    return generateMomentVersion(data);
  });

export const activatePortofinoVersion = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ versionId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await assertAdmin();
    const { activateVersion } = await import("./auto-edit-sitewide.server");
    return activateVersion(data.versionId);
  });

export const rollbackPortofinoLook = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ lookKey: z.string().min(3).max(160) }).parse(input))
  .handler(async ({ data }) => {
    await assertAdmin();
    const { rollbackLook } = await import("./auto-edit-sitewide.server");
    return rollbackLook(data.lookKey);
  });
