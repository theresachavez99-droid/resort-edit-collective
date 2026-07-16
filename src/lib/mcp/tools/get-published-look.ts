import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { anonSupabase } from "../anon-client";
import { rateLimited } from "../rate-limit";

export default defineTool({
  name: "get_published_look",
  title: "Get published look",
  description: "Return one published founder look by id or slug (editorial fields only).",
  inputSchema: {
    id: z.string().uuid().optional().describe("Look UUID."),
    slug: z.string().trim().min(1).max(128).optional().describe("Look slug."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, slug }, ctx) => {
    const limited = rateLimited(ctx);
    if (limited) return limited;

    if (!id && !slug) {
      return { content: [{ type: "text", text: "Provide either 'id' or 'slug'." }], isError: true };
    }

    const supabase = anonSupabase();
    let q = supabase
      .from("founder_looks_public")
      .select(
        "id, slug, title, destination, moment, style_family, color_palette, hero_urls, editorial_dna, published_at",
      )
      .limit(1);
    if (id) q = q.eq("id", id);
    else if (slug) q = q.eq("slug", slug.toLowerCase());

    const { data, error } = await q.maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Look not found." }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { look: data },
    };
  },
});