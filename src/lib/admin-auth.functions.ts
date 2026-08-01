import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

/**
 * Lightweight credential check used by admin route unlock forms.
 * Returns { ok: true } when the password is valid; throws "Unauthorized" otherwise.
 *
 * On success it also mints a signed httpOnly session cookie so the /admin shell
 * itself can be gated on the server, not only in the browser.
 */
export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { mintAdminSession, ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL } =
      await import("./admin-auth.server");
    setCookie(ADMIN_SESSION_COOKIE, mintAdminSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_TTL,
    });
    return { ok: true as const };
  });

/**
 * Server-side check of the admin session cookie. Used by the /admin layout so
 * no admin shell is served to an unauthenticated request.
 */
export const checkAdminSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const { isValidAdminSession, ADMIN_SESSION_COOKIE } = await import(
      "./admin-auth.server"
    );
    return { ok: isValidAdminSession(getCookie(ADMIN_SESSION_COOKIE)) };
  },
);