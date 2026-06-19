/**
 * URL safety helpers — block javascript:, data:, blob:, vbscript:, file:
 * and anything else that is not plain http(s) before a URL touches a
 * product `href`, an outbound redirect, or the database.
 *
 * Use {@link isHttpUrl} as a Zod refinement at write time and
 * {@link safeHref} at render time to neutralise anything that slipped in
 * before this gate existed.
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Strict: returns true only for absolute http(s) URLs. */
export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  try {
    const u = new URL(value);
    return ALLOWED_PROTOCOLS.has(u.protocol);
  } catch {
    return false;
  }
}

/**
 * Render-time sanitiser. Returns the URL when it is a safe http(s) link,
 * otherwise `undefined` so the caller can omit the `href` (renders as
 * non-clickable) or fall back to a placeholder. Never returns a
 * `javascript:`, `data:`, `blob:`, `vbscript:`, `file:` or other
 * non-http(s) value.
 */
export function safeHref(value: unknown): string | undefined {
  return isHttpUrl(value) ? value : undefined;
}