/**
 * Admin password gate — SERVER ONLY.
 * Reads ADMIN_PASSWORD from process.env. Never imported by client code.
 * The .server.ts suffix prevents bundling into client output.
 */
export function requireAdmin(password: string | undefined): void {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD not configured on server");
  }
  if (!password || password !== expected) {
    throw new Error("Unauthorized");
  }
}