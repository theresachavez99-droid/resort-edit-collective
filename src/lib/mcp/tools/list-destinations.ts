import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { anonSupabase } from "../anon-client";
import { rateLimited } from "../rate-limit";

export default defineTool({
  name: "list_destinations",
  title: "List destinations",
  description: "List every destination that has at least one published moment on Resort Edit.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const limited = rateLimited(ctx);
    if (limited) return limited;

    const supabase = anonSupabase();
    const { data, error } = await supabase
      .from("moments_public")
      .select("destination")
      .order("destination");
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const destinations = Array.from(new Set((data ?? []).map((r) => r.destination))).filter(Boolean);
    return {
      content: [{ type: "text", text: JSON.stringify(destinations, null, 2) }],
      structuredContent: { destinations },
    };
  },
});

// Suppress unused-import warning for callers that only reference the default export.
export const __schema = z.object({});