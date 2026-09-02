/**
 * Preview-only staging flag.
 *
 * Founder-approved editorial changes are sometimes staged in code before the
 * production hostname is allowed to show them. This module is the ONE place
 * that decides whether a staged block may render: on the Lovable preview
 * host (or localhost) it is on, on the live production hostname it is off,
 * with an explicit env override for a single-line atomic enable after
 * approval (`VITE_PREVIEW_STAGING=on`).
 *
 * Enabling after approval is one small change: set `VITE_PREVIEW_STAGING=on`
 * (or return `true` from {@link previewStagingDefault}) and deploy.
 */
import { useEffect, useState } from "react";

/** True for the Lovable preview/dev hosts and local development. */
export function isPreviewHostname(hostname: string | null | undefined): boolean {
  const host = (hostname ?? "").trim().toLowerCase();
  if (!host) return false;
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) return true;
  if (host.startsWith("id-preview--")) return true;
  if (host.endsWith("-dev.lovable.app")) return true;
  if (host.endsWith(".lovableproject.com")) return true;
  return false;
}

/** Explicit override: "on" forces staging everywhere, "off" disables it. */
export function previewStagingOverride(): boolean | null {
  const raw =
    typeof import.meta !== "undefined"
      ? (import.meta as { env?: Record<string, string | undefined> }).env?.[
          "VITE_PREVIEW_STAGING"
        ]
      : undefined;
  if (raw === "on") return true;
  if (raw === "off") return false;
  return null;
}

/** Pure resolution used by both the hook and the tests. */
export function previewStagingDefault(hostname: string | null | undefined): boolean {
  const override = previewStagingOverride();
  if (override !== null) return override;
  return isPreviewHostname(hostname);
}

/**
 * React hook. Resolves after hydration so SSR output for the production
 * hostname never contains staged markup (and never hydration-mismatches).
 */
export function usePreviewStaging(): boolean {
  const [staging, setStaging] = useState(false);
  useEffect(() => {
    const v = previewStagingDefault(window.location.hostname);
    console.log("[staging]", window.location.hostname, v);
    setStaging(v);
  }, []);
  return staging;
}
