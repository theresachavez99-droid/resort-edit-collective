import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { anonSupabase } from "../anon-client";
import { rateLimited } from "../rate-limit";

export default defineTool({
  name: "list_moments",
  title: "List published moments",
  description:
    "List published editorial moments for a destination on Resort Edit. Returns slug, name, sequence, and hero image only.",
  inputSchema: {
    destination: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .optional()
      .describe("Destination slug (e.g. 'portofino'). Omit to list moments across all destinations."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ destination }, ctx) => {
    const limited = rateLimited(ctx);
    if (limited) return limited;

    const supabase = anonSupabase();
    let q = supabase
      .from("moments_public")
      .select("slug, name, destination, sequence, hero_image, published_at")
      .order("destination")
      .order("sequence");
    if (destination) q = q.eq("destination", destination.toLowerCase());

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const moments = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify(moments, null, 2) }],
      structuredContent: { moments },
    };
  },
});