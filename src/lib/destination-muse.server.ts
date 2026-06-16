/**
 * Destination muse registry — Lilla (Portofino) etc.
 *
 * Read the locked muse for a destination so every candidate generated for
 * that destination uses the same identity reference. Falls back to null if
 * no muse is configured; callers must treat that as a hard gate failure
 * when the destination requires identity continuity (currently Portofino).
 */
export type DestinationMuse = {
  destination_slug: string;
  muse_name: string;
  reference_url: string;
  face_description: string;
  style_guardrails: string;
  allowed_variation: string;
};

export function destinationSlug(destination: string): string {
  return destination.toLowerCase().trim().replace(/\s+/g, "-");
}

export async function getDestinationMuse(
  destination: string,
): Promise<DestinationMuse | null> {
  const slug = destinationSlug(destination);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any)
    .from("destination_muses")
    .select("destination_slug, muse_name, reference_url, face_description, style_guardrails, allowed_variation")
    .eq("destination_slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as DestinationMuse;
}

/** Destinations that require muse continuity. Candidates in these
 *  destinations fail the gate when no destination muse is configured. */
const REQUIRED: Set<string> = new Set(["portofino"]);

export function destinationRequiresMuseContinuity(destination: string): boolean {
  return REQUIRED.has(destinationSlug(destination));
}