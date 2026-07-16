import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { anonSupabase } from "../anon-client";
import { rateLimited } from "../rate-limit";

export default defineTool({
  name: "list_published_looks",
  title: "List published looks",
  description: "List published founder looks, optionally filtered by destination or moment slug.",
  inputSchema: {
    destination: z.string().trim().min(1).max(64).optional(),
    moment: z.string().trim().min(1).max(128).optional(),
    limit: z.number().int().min(1).max(100).optional().describe("Max results (default 25, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ destination, moment, limit }, ctx) => {
    const limited = rateLimited(ctx);
    if (limited) return limited;

    const supabase = anonSupabase();
    let q = supabase
      .from("founder_looks_public")
      .select("id, slug, title, destination, moment, style_family, published_at")
      .order("published_at", { ascending: false })
      .limit(limit ?? 25);
    if (destination) q = q.eq("destination", destination.toLowerCase());
    if (moment) q = q.eq("moment", moment.toLowerCase());

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const looks = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify(looks, null, 2) }],
      structuredContent: { looks },
    };
  },
});