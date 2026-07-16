import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { anonSupabase } from "../anon-client";
import { rateLimited } from "../rate-limit";

export default defineTool({
  name: "get_moment",
  title: "Get published moment",
  description:
    "Return the published editorial narrative, hero media, and (if published) the featured look for one moment on a destination.",
  inputSchema: {
    destination: z.string().trim().min(1).max(64).describe("Destination slug, e.g. 'portofino'."),
    slug: z.string().trim().min(1).max(128).describe("Moment slug, e.g. 'arrival-day'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ destination, slug }, ctx) => {
    const limited = rateLimited(ctx);
    if (limited) return limited;

    const supabase = anonSupabase();

    const { data: moment, error: momentErr } = await supabase
      .from("moments_public")
      .select("id, destination, slug, name, sequence, hero_image, copy, published_at")
      .eq("destination", destination.toLowerCase())
      .eq("slug", slug.toLowerCase())
      .maybeSingle();
    if (momentErr) return { content: [{ type: "text", text: momentErr.message }], isError: true };
    if (!moment) {
      return {
        content: [{ type: "text", text: `No published moment '${slug}' for destination '${destination}'.` }],
        isError: true,
      };
    }

    const { data: looks } = await supabase
      .from("founder_looks_public")
      .select("id, slug, title, style_family, color_palette, hero_urls, editorial_dna, published_at")
      .eq("destination", destination.toLowerCase())
      .eq("moment", slug.toLowerCase())
      .order("published_at", { ascending: false })
      .limit(1);

    const payload = { moment, featured_look: looks?.[0] ?? null };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});