import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Track an outbound affiliate / retailer click.
 * No-ops cleanly when analytics aren't loaded — links still work natively.
 */
export function trackOutbound(payload: {
  brand?: string;
  item?: string;
  href: string | null | undefined;
  tier?: string;
  category?: string;
}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    dataLayer?: Array<Record<string, unknown>>;
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
    gtag?: (...args: unknown[]) => void;
  };
  try {
    w.dataLayer?.push({ event: "outbound_click", ...payload });
    w.plausible?.("Outbound: Product", { props: payload });
    w.gtag?.("event", "outbound_click", payload);
  } catch {
    /* analytics is best-effort */
  }
}
