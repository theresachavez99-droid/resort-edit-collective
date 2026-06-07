import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { absoluteUrl } from "@/lib/site";
import { YACHT_TO_LUNCH_LOOKS, type YachtLook, type YachtProduct } from "@/data/yachtToLunch";
import heroImage from "@/assets/looks/hero-yacht-editorial.jpg";
import referenceAsset from "@/assets/yacht-to-lunch-reference.asset.json";
import { trackOutbound } from "@/lib/utils";

const REFERENCE_URL = referenceAsset.url;
const PAGE_TITLE = "Yacht Day & Harbour Aperitivo — Portofino | Resort Edit | Dressed for the destination";
const PAGE_DESC =
  "Five complete looks for a yacht day on the Italian Riviera: arrival, on-water swim, beach club, golden-hour aperitivo, and evening yacht.";

export const Route = createFileRoute(
  "/destinations/portofino/day-1-yacht-harbour-aperitivo",
)({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:image", content: absoluteUrl(heroImage) },
      {
        property: "og:url",
        content: absoluteUrl("/destinations/portofino/day-1-yacht-harbour-aperitivo"),
      },
      { property: "og:type", content: "article" },
      { name: "twitter:image", content: absoluteUrl(heroImage) },
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
  const [refOpen, setRefOpen] = useState(false);

  const scrollToLook = (id: string) => {
    if (typeof window === "undefined") return;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-cream pb-24">
      {/* EDITORIAL HERO */}
      <section className="relative bg-ink text-ivory overflow-hidden">
        <div className="relative h-[200px] md:h-[300px] lg:h-[320px] w-full">
          <img
            src={heroImage}
            alt="Editorial yacht day in Portofino harbour at golden hour"
            className="absolute inset-0 h-full w-full object-cover"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/35 via-ink/10 to-transparent" />
          <div className="relative z-10 mx-auto max-w-[1280px] h-full px-6 md:px-12 flex flex-col justify-center">
            <Link
              to="/portofino"
              aria-label="Portofino · Day 1"
              className="eyebrow text-[0.55rem] md:text-[0.65rem] tracking-[0.45em] text-ivory/90 hover:text-gold-soft"
            >
              PORTOFINO · DAY 1
            </Link>
            <div className="mt-2 md:mt-3 max-w-xl md:max-w-2xl">
              <h1 className="font-display text-2xl md:text-4xl lg:text-5xl tracking-[0.02em] leading-[1.05] text-ivory">
                Yacht Day &amp; Harbour Aperitivo
              </h1>
              <p className="font-serif italic text-xs md:text-base text-ivory/90 mt-1.5 md:mt-2">
                Open water, tan lines &amp; hidden coves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LOOK 1–10 TABS (immediately under hero) */}
      <div className="bg-cream border-b border-gold/20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-4">
          <ul className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar justify-start md:justify-center">
            {YACHT_TO_LUNCH_LOOKS.map((l) => (
              <li key={`tab-${l.id}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => scrollToLook(l.id)}
                  className="eyebrow text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] px-4 py-2 rounded-full border border-ink/20 text-ink/75 hover:bg-ink hover:text-ivory hover:border-ink transition-colors whitespace-nowrap"
                >
                  LOOK {l.number}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* EDITORIAL INTRODUCTION */}
      <section className="mx-auto max-w-[860px] px-6 md:px-10 pt-16 md:pt-24 text-center">
        <span className="eyebrow text-gold tracking-[0.4em] text-[0.6rem] md:text-[0.7rem]">
          The Itinerary
        </span>
        <h2 className="font-display text-2xl md:text-4xl lg:text-5xl mt-4 tracking-[0.02em] text-ink leading-tight">
          Arrival to aperitivo, styled across five complete looks.
        </h2>
        <p className="font-serif italic text-ink/75 text-base md:text-xl mt-5 md:mt-6 leading-relaxed">
          A day on a private yacht in Portofino, edited from the moment you step onto teak through
          golden-hour spritzes on the piazzetta. Each look is a complete ecosystem — swim, layer,
          shoes, bag, jewels — sourced from the houses our muse actually wears.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-ink/55">
          {["Arrival", "Swim", "Yacht", "Lunch", "Harbour", "Aperitivo", "Sunset"].map((c, i, a) => (
            <span key={c} className="flex items-center gap-3">
              <span className="eyebrow text-[0.55rem] md:text-[0.65rem] tracking-[0.4em]">{c}</span>
              {i < a.length - 1 && <span className="text-gold/50">·</span>}
            </span>
          ))}
        </div>
      </section>

      {/* TEN EDITORIAL LOOKS */}
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 mt-16 md:mt-24 space-y-24 md:space-y-32">
        {YACHT_TO_LUNCH_LOOKS.map((look, idx) => (
          <LookEditorial
            key={look.id}
            look={look}
            reverse={idx % 2 === 1}
            eager={idx === 0}
          />
        ))}
      </div>

      {/* COLLAPSED REFERENCE BOARD */}
      <section className="mx-auto max-w-[1280px] px-6 md:px-10 mt-24">
        <button
          type="button"
          onClick={() => setRefOpen((v) => !v)}
          className="w-full border border-gold/30 bg-ivory px-5 py-4 flex items-center justify-between hover:border-gold transition-colors"
        >
          <span className="eyebrow text-[0.6rem] md:text-[0.65rem] tracking-[0.35em] text-ink/70">
            {refOpen ? "Hide" : "View"} Editorial Reference Board
          </span>
          <span className="eyebrow text-[0.65rem] tracking-[0.32em] text-gold">
            {refOpen ? "−" : "+"}
          </span>
        </button>
        {refOpen && (
          <a
            href={REFERENCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block border border-gold/20 bg-ivory overflow-hidden"
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
      <section className="mx-auto max-w-[1280px] px-6 md:px-10 mt-20 md:mt-24">
        <div className="border-t border-gold/30 pt-8 md:pt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/portofino"
            className="group block border border-ink/15 bg-ivory px-6 py-6 md:px-8 md:py-8 hover:border-gold transition-colors"
          >
            <span className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/55 flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Back
            </span>
            <span className="block font-display text-xl md:text-2xl tracking-[0.04em] mt-2 text-ink group-hover:text-gold transition-colors">
              All 5 Days in Portofino
            </span>
          </Link>
          <Link
            to="/portofino/day-2"
            className="group block border border-ink/15 bg-ivory px-6 py-6 md:px-8 md:py-8 hover:border-gold transition-colors md:text-right"
          >
            <span className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/55 flex items-center md:justify-end gap-2">
              Next Day <ArrowRight className="w-3 h-3" />
            </span>
            <span className="block font-display text-xl md:text-2xl tracking-[0.04em] mt-2 text-ink group-hover:text-gold transition-colors">
              Day 2 · Beach Club &amp; Long Lunches
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function LookEditorial({
  look,
  reverse,
  eager,
}: {
  look: YachtLook;
  reverse: boolean;
  eager: boolean;
}) {
  return (
    <article
      id={look.id}
      className="scroll-mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start"
    >
      {/* Editorial muse image */}
      <div
        className={`lg:col-span-7 ${
          reverse ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <div className="relative w-full aspect-[4/5] bg-ink/5 border border-gold/15 overflow-hidden">
          <img
            src={look.museImage}
            alt={`Look ${look.number}: ${look.title} — editorial muse`}
            width={1024}
            height={1280}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute top-4 left-4 eyebrow text-[0.55rem] md:text-[0.6rem] tracking-[0.35em] text-ivory bg-ink/60 backdrop-blur-sm px-3 py-1.5">
            {String(look.number).padStart(2, "0")} / 05
          </div>
        </div>
      </div>

      {/* Right column — story + shop */}
      <div
        className={`lg:col-span-5 lg:sticky lg:top-6 ${
          reverse ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <header className="border-b border-gold/30 pb-5">
          <span className="eyebrow text-gold tracking-[0.4em] text-[0.6rem] md:text-[0.65rem]">
            Look {String(look.number).padStart(2, "0")} / 05 · {look.chapter}
          </span>
          <h2 className="font-display text-2xl md:text-4xl mt-3 tracking-[0.02em] text-ink leading-tight">
            {look.title}
          </h2>
          <p className="font-serif italic text-ink/70 text-sm md:text-lg mt-2 leading-relaxed">
            {look.subtitle}
          </p>
        </header>
        <p className="font-serif text-ink/80 text-[0.95rem] md:text-base mt-5 leading-relaxed">
          {look.story}
        </p>

        <section className="mt-8">
          <h3 className="eyebrow text-ink tracking-[0.4em] text-[0.6rem] md:text-[0.65rem] flex items-center gap-3">
            <span>Shop the Look</span>
            <span className="flex-1 h-px bg-gold/30" />
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-3 md:gap-4">
            {look.products.map((p, i) => (
              <ProductCard
                key={`${look.id}-${p.brand}-${p.item}-${i}`}
                product={p}
                eager={eager && i < 2}
              />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

function ProductCard({
  product,
  eager = false,
}: {
  product: YachtProduct;
  eager?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = Boolean(product.imageUrl) && !imgFailed;
  return (
    <a
      href={product.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() =>
        trackOutbound({ brand: product.brand, item: product.item, href: product.href })
      }
      className="group flex flex-col bg-ivory border border-gold/15 hover:border-gold transition-colors"
    >
      <div className="relative aspect-[4/5] bg-cream overflow-hidden">
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={`${product.brand} ${product.item}`}
            width={800}
            height={1000}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => {
              console.warn(
                "[product image failed]",
                product.brand,
                product.item,
                product.imageUrl,
              );
              setImgFailed(true);
            }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cream via-ivory to-cream px-4 text-center gap-3">
            <span className="eyebrow text-[0.55rem] tracking-[0.35em] text-gold">
              {product.category}
            </span>
            <span className="font-display text-ink/85 text-base md:text-lg leading-tight">
              {product.brand}
            </span>
            <span className="eyebrow text-[0.55rem] tracking-[0.3em] text-ink/45">
              Tap to shop
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3 md:p-4">
        <div className="eyebrow text-ink text-[0.55rem] tracking-[0.35em]">
          {product.brand}
        </div>
        <div className="font-serif italic text-ink/90 text-[0.85rem] md:text-[0.9rem] leading-snug mt-1.5 line-clamp-2">
          {product.item}
        </div>
        {product.price && (
          <div className="font-serif text-gold text-[0.85rem] mt-1.5">{product.price}</div>
        )}
        <div className="mt-3 eyebrow text-[0.55rem] tracking-[0.35em] text-ink group-hover:bg-ink group-hover:text-ivory transition-colors text-center border border-ink/20 py-2">
          Shop →
        </div>
      </div>
    </a>
  );
}
