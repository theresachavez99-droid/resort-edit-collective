/**
 * EDITORIAL CLOSET — public module.
 *
 * Sits beneath the complete-look section and ABOVE "More Resort Edit Looks".
 * Shows 3 quiet alternatives for the moment's hero product, with a restrained
 * CTA into a private-stylist drawer holding up to 12 approved options.
 *
 * It never adds a look: the page still publishes exactly 1 Hero Look and at
 * most 2 More Resort Edit Looks. Only approved, verified options can appear —
 * the server view enforces that; this component renders text-first and never
 * hotlinks retailer imagery.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getMomentCloset, trackClosetEvent } from "@/lib/editorial-closet.functions";
import {
  availabilityLabel,
  CLOSET_CTA_LABEL,
  CLOSET_EVENTS,
  CLOSET_MAX_CANDIDATES,
  CLOSET_VISIBLE_COUNT,
  closetContextLabel,
  type ClosetPublicCandidate,
} from "@/lib/editorial-closet";
import { canRenderProductImage } from "@/lib/product-image-policy";
import { isPublishableProductUrl } from "@/lib/shop-url-policy";

function AlternativeCard({
  item,
  momentSlug,
  onTrack,
}: {
  item: ClosetPublicCandidate;
  momentSlug: string;
  onTrack: (type: string, item: ClosetPublicCandidate) => void;
}) {
  const showImage = Boolean(item.imageUrl) && canRenderProductImage(item.imageUrl ?? "");
  return (
    <a
      href={item.productUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => {
        onTrack(CLOSET_EVENTS.cardClick, item);
        onTrack(CLOSET_EVENTS.retailerClick, item);
      }}
      className="group flex flex-col bg-ivory border border-border/40 hover:border-gold/60 transition-colors duration-300"
      data-moment={momentSlug}
    >
      {showImage && (
        <div className="relative aspect-[4/5] overflow-hidden bg-cream/60">
          <img
            src={item.imageUrl ?? ""}
            alt={`${item.brand} ${item.productName}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      )}
      <div className="p-5 md:p-6 flex flex-col gap-2">
        {item.rationaleTag && (
          <span className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold">
            {item.rationaleTag}
          </span>
        )}
        <span className="eyebrow text-[0.6rem] tracking-[0.26em] text-ink/60">{item.brand}</span>
        <h4 className="font-display text-[1.05rem] md:text-[1.15rem] tracking-[0.03em] text-ink leading-[1.2]">
          {item.productName}
        </h4>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.72rem] text-ink/65">
          {item.price && <span className="font-serif text-[0.9rem] text-ink">{item.price}</span>}
          {item.retailer && (
            <span className="eyebrow tracking-[0.22em] text-[0.55rem]">{item.retailer}</span>
          )}
        </div>
        {item.editorialRationale && (
          <p className="font-serif italic text-[0.9rem] text-ink/75 leading-relaxed">
            {item.editorialRationale}
          </p>
        )}
        <span className="text-[0.6rem] tracking-[0.2em] uppercase text-ink/45">
          {availabilityLabel(item.availability)}
        </span>
        <span className="eyebrow text-[0.6rem] tracking-[0.28em] text-ink group-hover:text-gold transition-colors">
          SHOP THIS OPTION →
        </span>
      </div>
    </a>
  );
}

export function EditorialClosetSection({
  momentSlug,
  momentName,
  heroCategory,
}: {
  momentSlug: string;
  momentName: string;
  /** Hero product category, used only for the fallback contextual label. */
  heroCategory?: string | null;
}) {
  const fetchCloset = useServerFn(getMomentCloset);
  const track = useServerFn(trackClosetEvent);
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["editorial-closet", momentSlug],
    queryFn: () => fetchCloset({ data: { moment: momentSlug } }),
    staleTime: 5 * 60 * 1000,
  });

  // Final client-side guard: a search/category/homepage URL never renders as a
  // shoppable link, even if it somehow reached an approved row.
  const candidates = useMemo(
    () =>
      (data?.candidates ?? [])
        .filter((c) => isPublishableProductUrl(c.productUrl))
        .slice(0, CLOSET_MAX_CANDIDATES),
    [data],
  );

  const onTrack = (type: string, item?: ClosetPublicCandidate) => {
    void track({
      data: {
        eventType: type as never,
        candidateId: item?.id ?? null,
        destination: "Portofino",
        moment: momentSlug,
        retailer: item?.retailer ?? null,
      },
    }).catch(() => undefined);
  };

  if (!data?.enabled || candidates.length === 0) return null;

  const label =
    candidates[0]?.contextLabel ??
    closetContextLabel({ category: heroCategory ?? candidates[0]?.category, momentName });
  const visible = candidates.slice(0, CLOSET_VISIBLE_COUNT);
  const hasMore = candidates.length > visible.length;

  return (
    <section
      id="editorial-closet"
      className="bg-ivory border-t border-border/40 scroll-mt-16"
      aria-label={label}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 md:py-10">
        <div className="max-w-2xl mb-6">
          <span className="eyebrow text-[0.6rem] tracking-[0.34em] text-gold">ANOTHER WAY</span>
          <h3 className="font-display text-2xl md:text-[2rem] tracking-[0.04em] text-ink mt-2 leading-[1.1]">
            {label}
          </h3>
          <p className="font-serif italic text-[0.95rem] text-ink/70 mt-2 leading-relaxed">
            A few quieter alternatives we would also wear for this moment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
          {visible.map((item) => (
            <AlternativeCard
              key={item.id}
              item={item}
              momentSlug={momentSlug}
              onTrack={onTrack}
            />
          ))}
        </div>

        {hasMore && (
          <div className="pt-6">
            <button
              type="button"
              onClick={() => {
                setOpen(true);
                onTrack(CLOSET_EVENTS.drawerOpen);
              }}
              className="inline-flex items-center gap-3 eyebrow text-[0.65rem] tracking-[0.32em] text-ink border border-ink/30 hover:border-gold hover:text-gold transition-colors duration-300 px-6 py-3"
            >
              {CLOSET_CTA_LABEL} →
            </button>
          </div>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl bg-ivory overflow-y-auto border-l border-border/50"
        >
          <SheetHeader className="text-left">
            <span className="eyebrow text-[0.6rem] tracking-[0.34em] text-gold">
              THE EDITORIAL CLOSET
            </span>
            <SheetTitle className="font-display text-2xl tracking-[0.04em] text-ink">
              {label}
            </SheetTitle>
            <p className="font-serif italic text-[0.9rem] text-ink/70 leading-relaxed">
              {momentName} — every option here is Resort Edit approved and checked live at the
              retailer.
            </p>
          </SheetHeader>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 pb-10">
            {candidates.map((item) => (
              <AlternativeCard
                key={item.id}
                item={item}
                momentSlug={momentSlug}
                onTrack={onTrack}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

export default EditorialClosetSection;