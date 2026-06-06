import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

/**
 * Lightweight credential check used by admin route unlock forms.
 * Returns { ok: true } when the password is valid; throws "Unauthorized" otherwise.
 */
export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    return { ok: true as const };
  });