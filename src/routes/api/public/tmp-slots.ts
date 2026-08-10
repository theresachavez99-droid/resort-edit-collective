import { createFileRoute } from "@tanstack/react-router";
import { getShopSlots } from "@/lib/shop-slots.functions";

export const Route = createFileRoute("/api/public/tmp-slots")({
  server: { handlers: { GET: async () => {
    try {
      const r = await getShopSlots({ data: { lookKey: "portofino/long-lunch" } });
      return Response.json(r);
    } catch (e) {
      return Response.json({ err: String(e) }, { status: 500 });
    }
  } } },
});
