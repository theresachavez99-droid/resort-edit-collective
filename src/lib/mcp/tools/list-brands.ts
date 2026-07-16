import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { anonSupabase } from "../anon-client";
import { rateLimited } from "../rate-limit";

export default defineTool({
  name: "list_brands",
  title: "List approved brands",
  description:
    "List brands in the Resort Edit approved brand registry, optionally filtered by suggested destination or activity.",
  inputSchema: {
    destination: z.string().trim().min(1).max(64).optional(),
    activity: z.string().trim().min(1).max(64).optional(),
    limit: z.number().int().min(1).max(500).optional().describe("Max results (default 200)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ destination, activity, limit }, ctx) => {
    const limited = rateLimited(ctx);
    if (limited) return limited;

    const supabase = anonSupabase();
    let q = supabase
      .from("brands_public")
      .select("brand, slug, suggested_tier, suggested_activities, suggested_destinations, channel_type")
      .order("brand")
      .limit(limit ?? 200);
    if (destination) q = q.contains("suggested_destinations", [destination.toLowerCase()]);
    if (activity) q = q.contains("suggested_activities", [activity.toLowerCase()]);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const brands = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify(brands, null, 2) }],
      structuredContent: { brands },
    };
  },
});