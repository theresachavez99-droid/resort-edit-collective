import { queryOptions, useQuery } from "@tanstack/react-query";
import { getShopSlots, type PublicShopSlot } from "@/lib/shop-slots.functions";
import { safeHref } from "@/lib/safe-url";
import { trackOutbound } from "@/lib/utils";

export const shopSlotsQuery = (lookKey: string) =>
  queryOptions({
    queryKey: ["shop-slots", lookKey],
    queryFn: () => getShopSlots({ data: { lookKey } }),
  });

/**
 * "The Resort Edit" itemization — the exact-outfit list for a moment, rendered
 * ONLY from `public_shop_slot_display` (status = 'active'). No hardcoded
 * registry, no prices, ever. Slots with no active row simply do not exist here;
 * a look with no active rows renders nothing at all.
 */
const THE_LOOK = new Set([
  "corset", "top", "blouse", "shirt", "tee", "t-shirt",
  "vest", "waistcoat", "pant", "pants", "trouser", "trousers", "skirt",
  "dress", "gown", "jumpsuit", "romper", "reference dress",
  "swimsuit", "bikini", "bikini top", "bikini bottom", "one-piece", "swim",
  "jacket", "blazer", "coat", "cardigan", "sweater", "knit", "hero",
]);
const JEWELRY = new Set(["earrings", "necklace", "bracelet", "jewelry", "cuff", "anklet"]);
const FINISHING_ORDER = [
  "shoe", "shoes", "sandal", "sandals", "bag", "clutch", "tote", "pouch",
  "sunglasses", "hat", "scarf", "belt", "coverup", "cover-up", "cover up",
];
const JEWELRY_ORDER = ["necklace", "earrings", "bracelet", "cuff", "anklet", "jewelry"];

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

function groupSlots(rows: PublicShopSlot[]) {
  const look: PublicShopSlot[] = [];
  const finishing: PublicShopSlot[] = [];
  const jewelry: PublicShopSlot[] = [];
  for (const r of rows) {
    const c = norm(r.slot) || norm(r.slot_label);
    if (JEWELRY.has(c)) jewelry.push(r);
    else if (THE_LOOK.has(c)) look.push(r);
    else finishing.push(r);
  }
  const rank = (order: string[]) => (r: PublicShopSlot) => {
    const i = order.indexOf(norm(r.slot) || norm(r.slot_label));
    return i === -1 ? order.length : i;
  };
  // Primary rows lead each chapter; the rest keep the editorial slot order.
  const primaryFirst = (a: PublicShopSlot, b: PublicShopSlot) =>
    Number(b.is_primary ?? false) - Number(a.is_primary ?? false);
  look.sort(primaryFirst);
  finishing.sort((a, b) => primaryFirst(a, b) || rank(FINISHING_ORDER)(a) - rank(FINISHING_ORDER)(b));
  jewelry.sort((a, b) => primaryFirst(a, b) || rank(JEWELRY_ORDER)(a) - rank(JEWELRY_ORDER)(b));
  return [
    { key: "look", label: "THE LOOK", items: look },
    { key: "finishing", label: "FINISHING TOUCHES", items: finishing },
    { key: "jewelry", label: "JEWELRY", items: jewelry },
  ].filter((c) => c.items.length > 0);
}

function SlotRow({ row }: { row: PublicShopSlot }) {
  const href = row.url && row.url !== "#" ? safeHref(row.url) : undefined;
  const name = row.product_name ?? "";
  const inner = (
    <div>
      {row.brand && (
        <div className="font-serif italic text-[0.88rem] text-ink/55 leading-snug">{row.brand}</div>
      )}
      <div className="font-display text-[1.1rem] md:text-[1.15rem] leading-snug text-ink group-hover:text-gold transition-colors duration-300 mt-1">
        {name || row.brand}
      </div>
      {href && (
        <div className="eyebrow text-[0.62rem] tracking-[0.32em] text-gold/80 mt-2 group-hover:text-gold transition-colors duration-300">
          VIEW PRODUCT →
        </div>
      )}
    </div>
  );
  return (
    <li className="[&:not(:first-child)]:mt-3.5">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={() => trackOutbound({ brand: row.brand ?? "", item: name, href, ...(row.slot ? { category: row.slot } : {}) })}
          className="group block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
        >
          {inner}
        </a>
      ) : (
        <div className="opacity-70">{inner}</div>
      )}
    </li>
  );
}

export function ResortEditItemization({ lookKey }: { lookKey: string }) {
  const { data } = useQuery(shopSlotsQuery(lookKey));
  const rows = (data?.slots ?? []).filter((r) => r.brand || r.product_name);
  if (rows.length === 0) return null;
  const chapters = groupSlots(rows);

  return (
    <div className="pt-2">
      <div className="pt-4 border-t border-border/40">
        <span className="eyebrow text-[0.6rem] tracking-[0.34em] text-gold">THE EDIT</span>
        <h3 className="font-display text-2xl md:text-[1.75rem] tracking-[0.04em] text-ink mt-2 leading-[1.1]">
          The Resort Edit
        </h3>
        <p className="font-serif italic text-[0.95rem] text-ink/70 mt-2 leading-relaxed max-w-prose">
          The pieces we would choose to wear this moment — matched to the photograph, from the designers we return to season after season.
        </p>
      </div>
      <div className="mt-2">
        {chapters.map((chapter, ci) => (
          <section key={chapter.key} className={ci === 0 ? "mt-6" : "mt-11 md:mt-12"}>
            <h4 className="eyebrow text-[0.64rem] tracking-[0.38em] text-ink/45 mb-5">
              {chapter.label}
            </h4>
            <ul>
              {chapter.items.map((r, i) => (
                <SlotRow key={`${r.slot}-${r.product_name}-${i}`} row={r} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
