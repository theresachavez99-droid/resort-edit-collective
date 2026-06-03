import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { absoluteUrl } from "@/lib/site";
import { YACHT_TO_LUNCH_LOOKS, type YachtLook, type YachtProduct } from "@/data/yachtToLunch";
import referenceAsset from "@/assets/yacht-to-lunch-reference.asset.json";
import { trackOutbound } from "@/lib/utils";

const REFERENCE_URL = referenceAsset.url;
const PAGE_TITLE = "Yacht Day & Harbour Aperitivo — Portofino | Resort Edit";
const PAGE_DESC =
  "Ten complete looks for a yacht day on the Italian Riviera: open water, tan lines, hidden coves, and harbour aperitivo.";

export const Route = createFileRoute(
  "/destinations/portofino/day-1-yacht-harbour-aperitivo",
)({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:image", content: absoluteUrl(REFERENCE_URL) },
      {
        property: "og:url",
        content: absoluteUrl("/destinations/portofino/day-1-yacht-harbour-aperitivo"),
      },
      { property: "og:type", content: "article" },
      { name: "twitter:image", content: absoluteUrl(REFERENCE_URL) },
    ],
    links: [
      {
        rel: "canonical",
        href: absoluteUrl("/destinations/portofino/day-1-yacht-harbour-aperitivo"),
      },
    ],
  }),
  component: YachtToLunchPage,
});

function YachtToLunchPage() {
  const [activeId, setActiveId] = useState<string>(YACHT_TO_LUNCH_LOOKS[0].id);
  const [refOpen, setRefOpen] = useState(false);
  const activeIndex = YACHT_TO_LUNCH_LOOKS.findIndex((l) => l.id === activeId);
  const look = YACHT_TO_LUNCH_LOOKS[activeIndex];
  const nextLook = YACHT_TO_LUNCH_LOOKS[activeIndex + 1];
  const prevLook = YACHT_TO_LUNCH_LOOKS[activeIndex - 1];

  const selectLook = (id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document
          .getElementById("active-look")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <div className="bg-ivory pb-24">
      {/* HERO — compact on mobile */}
      <section className="relative bg-ink text-ivory">
        <div className="absolute inset-0 opacity-40">
          <img
            src={REFERENCE_URL}
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink/85" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-8 pt-6 md:pt-14 pb-6 md:pb-14">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="eyebrow text-[0.55rem] md:text-[0.6rem] tracking-[0.3em] text-ivory/70 flex flex-wrap items-center gap-2"
          >
            <Link to="/portofino" className="hover:text-gold-soft">
              Portofino
            </Link>
            <span aria-hidden>→</span>
            <span className="text-ivory/85">Day 1</span>
          </nav>

          <span className="eyebrow text-gold-soft tracking-[0.4em] mt-3 md:mt-8 inline-block text-[0.55rem] md:text-[0.65rem]">
            The Resort Edit · Day 1
          </span>
          <h1 className="font-display text-2xl md:text-6xl lg:text-7xl mt-2 md:mt-3 tracking-[0.04em] leading-[1.05] max-w-3xl">
            Yacht Day &amp; Harbour Aperitivo
          </h1>
          <p className="font-serif italic text-sm md:text-2xl text-ivory/85 mt-2 md:mt-4 max-w-2xl">
            Open water, tan lines &amp; hidden coves.
          </p>
          <p className="eyebrow text-[0.55rem] md:text-[0.6rem] tracking-[0.32em] text-ivory/70 mt-3">
            10 Looks · Tap a look below to shop
          </p>
        </div>
      </section>

      {/* STICKY LOOK NAV */}
      <div className="sticky top-0 z-40 bg-ivory/95 backdrop-blur border-b border-border/60">
        <div className="mx-auto max-w-[1200px] px-3 md:px-6">
          <ul className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-3">
            {YACHT_TO_LUNCH_LOOKS.map((l) => {
              const active = activeId === l.id;
              return (
                <li key={l.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => selectLook(l.id)}
                    className={`eyebrow text-[0.6rem] tracking-[0.25em] px-3 md:px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${
                      active
                        ? "bg-ink text-ivory border-ink"
                        : "bg-transparent text-ink/70 border-ink/15 hover:border-gold/60 hover:text-gold"
                    }`}
                  >
                    Look {l.number}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ACTIVE LOOK */}
      <section
        id="active-look"
        className="mx-auto max-w-[1200px] px-5 md:px-8 pt-6 md:pt-12 scroll-mt-20"
      >
        <LookView
          look={look}
          prev={prevLook}
          next={nextLook}
          onSelect={selectLook}
        />
      </section>

      {/* COLLAPSED REFERENCE BOARD */}
      <section className="mx-auto max-w-[1200px] px-5 md:px-8 mt-16">
        <button
          type="button"
          onClick={() => setRefOpen((v) => !v)}
          className="w-full border border-border/60 bg-cream/40 px-4 py-3 flex items-center justify-between hover:border-gold transition-colors"
        >
          <span className="eyebrow text-[0.6rem] tracking-[0.32em] text-ink/70">
            {refOpen ? "Hide" : "View"} Reference Board
          </span>
          <span className="eyebrow text-[0.6rem] tracking-[0.32em] text-gold">
            {refOpen ? "−" : "+"}
          </span>
        </button>
        {refOpen && (
          <a
            href={REFERENCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block border border-border/60 bg-cream/40 overflow-hidden"
          >
            <img
              src={REFERENCE_URL}
              alt="Yacht to Lunch — 10 looks reference board"
              className="w-full h-auto"
              loading="lazy"
            />
          </a>
        )}
      </section>

      {/* DAY NAV */}
      <section className="mx-auto max-w-[1200px] px-5 md:px-8 mt-20 md:mt-24">
        <div className="border-t border-border/60 pt-8 md:pt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/portofino"
            className="group block border border-border/60 px-5 py-5 md:px-6 md:py-6 hover:border-gold transition-colors"
          >
            <span className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/55 flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Back
            </span>
            <span className="block font-display text-xl md:text-2xl tracking-[0.05em] mt-2 text-ink group-hover:text-gold transition-colors">
              All 5 Days in Portofino
            </span>
          </Link>
          <Link
            to="/portofino/day-2"
            className="group block border border-border/60 px-5 py-5 md:px-6 md:py-6 hover:border-gold transition-colors md:text-right"
          >
            <span className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/55 flex items-center md:justify-end gap-2">
              Next Day <ArrowRight className="w-3 h-3" />
            </span>
            <span className="block font-display text-xl md:text-2xl tracking-[0.05em] mt-2 text-ink group-hover:text-gold transition-colors">
              Day 2 · Beach Club &amp; Long Lunches
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function LookView({
  look,
  prev,
  next,
  onSelect,
}: {
  look: YachtLook;
  prev?: YachtLook;
  next?: YachtLook;
  onSelect: (id: string) => void;
}) {
  const accessories = look.products.filter((p) =>
    /earring|necklace|cuff|bracelet|charm|sunglass|belt/i.test(p.category),
  );
  const hero = look.products.filter(
    (p) => !accessories.includes(p),
  );
  return (
    <article>
      {/* Large AI muse image (cropped from reference board) */}
      <div
        className="relative w-full aspect-[3/4] md:aspect-[4/5] bg-ink border border-border/60 overflow-hidden"
        aria-label={`${look.title} editorial muse`}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${REFERENCE_URL})`,
            backgroundSize: "500% 200%",
            backgroundPosition: look.refPos,
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute top-3 left-3 eyebrow text-[0.55rem] tracking-[0.32em] text-ivory bg-ink/70 px-2 py-1">
          Look {look.number} of {YACHT_TO_LUNCH_LOOKS.length}
        </div>
      </div>

      {/* Title + styling note */}
      <header className="mt-5 md:mt-7 border-b border-gold/40 pb-4">
        <span className="eyebrow text-gold tracking-[0.32em] text-[0.6rem]">
          Look {look.number}
        </span>
        <h2 className="font-display text-2xl md:text-4xl mt-2 tracking-[0.04em] text-ink leading-tight">
          Look {look.number}: {look.title}
        </h2>
        <p className="font-serif italic text-ink/70 text-sm md:text-lg mt-2">
          {look.subtitle}
        </p>
      </header>

      {/* Shop the Look */}
      <section className="mt-6">
        <h3 className="eyebrow text-ink tracking-[0.3em] text-[0.65rem]">
          Shop the Look
        </h3>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {hero.map((p) => (
            <ProductCard key={`${look.id}-${p.brand}-${p.item}`} product={p} />
          ))}
        </div>
      </section>

      {/* Complete the Edit */}
      {accessories.length > 0 && (
        <section className="mt-8">
          <h3 className="eyebrow text-ink tracking-[0.3em] text-[0.65rem]">
            Complete the Edit
          </h3>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {accessories.map((p) => (
              <ProductCard key={`${look.id}-acc-${p.brand}-${p.item}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Prev / Next look */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {prev ? (
          <button
            type="button"
            onClick={() => onSelect(prev.id)}
            className="group block border border-border/60 px-4 py-4 text-left hover:border-gold transition-colors"
          >
            <span className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/55 flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Previous
            </span>
            <span className="block font-serif text-ink group-hover:text-gold transition-colors mt-1 text-sm md:text-base">
              Look {prev.number}: {prev.title}
            </span>
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            type="button"
            onClick={() => onSelect(next.id)}
            className="group block border border-border/60 px-4 py-4 text-right hover:border-gold transition-colors col-start-2"
          >
            <span className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/55 flex items-center justify-end gap-2">
              Next Look <ArrowRight className="w-3 h-3" />
            </span>
            <span className="block font-serif text-ink group-hover:text-gold transition-colors mt-1 text-sm md:text-base">
              Look {next.number}: {next.title}
            </span>
          </button>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}

function ProductCard({ product }: { product: YachtProduct }) {
  return (
    <a
      href={product.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() =>
        trackOutbound({ brand: product.brand, item: product.item, href: product.href })
      }
      className="group flex flex-col bg-ivory border border-border/60 hover:border-gold transition-colors"
    >
      <div className="relative aspect-square bg-cream flex items-center justify-center px-3">
        <div className="text-center">
          <div
            aria-hidden
            className="mx-auto w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center font-serif text-gold text-lg"
          >
            {product.brand.charAt(0)}
          </div>
          <div className="eyebrow text-[0.5rem] tracking-[0.28em] text-ink/55 mt-2">
            {product.category}
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-3">
        <div className="eyebrow text-ink text-[0.55rem] tracking-[0.3em]">
          {product.brand}
        </div>
        <div className="font-serif italic text-ink/90 text-[0.82rem] leading-snug mt-1 line-clamp-2">
          {product.item}
        </div>
        {product.price && (
          <div className="font-serif text-gold text-[0.82rem] mt-1">{product.price}</div>
        )}
        <div className="mt-auto pt-2 eyebrow text-[0.55rem] tracking-[0.32em] text-ink group-hover:text-gold transition-colors text-center border border-ink/10 rounded mt-2 py-1.5">
          Shop →
        </div>
      </div>
    </a>
  );
}
