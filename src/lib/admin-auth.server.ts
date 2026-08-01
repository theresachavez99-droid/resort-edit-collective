/**
 * Admin password gate — SERVER ONLY.
 * Reads ADMIN_PASSWORD from process.env. Never imported by client code.
 * The .server.ts suffix prevents bundling into client output.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export function requireAdmin(password: string | undefined): void {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD not configured on server");
  }
  if (!password || password !== expected) {
    throw new Error("Unauthorized");
  }
}

/** Name of the httpOnly cookie carrying the signed admin session. */
export const ADMIN_SESSION_COOKIE = "re_admin";

/** Session lifetime in seconds (8h — one working session). */
export const ADMIN_SESSION_TTL = 60 * 60 * 8;

function sign(payload: string): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD not configured on server");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Mints an opaque `<expiresAt>.<hmac>` token. The signing key is the admin
 * password itself, so rotating the password invalidates every live session.
 */
export function mintAdminSession(): string {
  const expiresAt = String(Date.now() + ADMIN_SESSION_TTL * 1000);
  return `${expiresAt}.${sign(expiresAt)}`;
}

/** True when the token is well-formed, correctly signed, and unexpired. */
export function isValidAdminSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expiresAt, mac] = token.split(".");
  if (!expiresAt || !mac || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Date.now()) return false;
  let expected: string;
  try {
    expected = sign(expiresAt);
  } catch {
    return false;
  }
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Guard for destructive setup utilities (seeds, migrations, backfills).
 *
 * These rewrite editorial tables and exist for standing up a new destination,
 * not for day-to-day use, so they are blocked on production deployments unless
 * an operator explicitly sets ADMIN_ALLOW_SEEDS=true.
 */
export function requireSeedEnvironment(): void {
  const isProduction = process.env.NODE_ENV === "production";
  const allowed = process.env.ADMIN_ALLOW_SEEDS === "true";
  if (isProduction && !allowed) {
    throw new Error(
      "Seed and migration utilities are disabled on production. Set ADMIN_ALLOW_SEEDS=true to run them deliberately.",
    );
  }
}