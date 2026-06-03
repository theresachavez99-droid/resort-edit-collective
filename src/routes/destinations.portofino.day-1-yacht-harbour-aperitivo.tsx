import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const [activeLook, setActiveLook] = useState<string>(YACHT_TO_LUNCH_LOOKS[0].id);

  // Update active tab based on scroll position.
  useEffect(() => {
    const sections = YACHT_TO_LUNCH_LOOKS.map((l) =>
      document.getElementById(l.id),
    ).filter((el): el is HTMLElement => Boolean(el));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveLook(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="bg-ivory pb-24">
      {/* HERO */}
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
        <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-8 pt-10 md:pt-14 pb-10 md:pb-16">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="eyebrow text-[0.6rem] tracking-[0.3em] text-ivory/70 flex flex-wrap items-center gap-2"
          >
            <Link to="/portofino" className="hover:text-gold-soft">
              Portofino
            </Link>
            <span aria-hidden>→</span>
            <span className="text-ivory/85">Day 1</span>
            <span aria-hidden>→</span>
            <span className="text-gold-soft">Yacht Day &amp; Harbour Aperitivo</span>
          </nav>

          <span className="eyebrow text-gold-soft tracking-[0.4em] mt-6 md:mt-8 inline-block">
            The Resort Edit · Day 1
          </span>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mt-3 tracking-[0.04em] leading-[1.02] max-w-3xl">
            Yacht Day &amp; Harbour Aperitivo
          </h1>
          <p className="font-serif italic text-lg md:text-2xl text-ivory/85 mt-4 max-w-2xl">
            Open water, tan lines &amp; hidden coves.
          </p>
          <p className="eyebrow text-[0.6rem] tracking-[0.32em] text-ivory/70 mt-5">
            10 looks · Feminine silhouettes · Visible swim · Collectible accessories
          </p>
        </div>
      </section>

      {/* STICKY LOOK NAV */}
      <div className="sticky top-0 z-40 bg-ivory/95 backdrop-blur border-b border-border/60">
        <div className="mx-auto max-w-[1200px] px-3 md:px-6">
          <ul className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-3">
            {YACHT_TO_LUNCH_LOOKS.map((l) => {
              const active = activeLook === l.id;
              return (
                <li key={l.id} className="shrink-0">
                  <a
                    href={`#${l.id}`}
                    onClick={() => setActiveLook(l.id)}
                    className={`eyebrow text-[0.6rem] tracking-[0.25em] px-3 md:px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${
                      active
                        ? "bg-ink text-ivory border-ink"
                        : "bg-transparent text-ink/70 border-ink/15 hover:border-gold/60 hover:text-gold"
                    }`}
                  >
                    Look {l.number}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* REFERENCE BOARD */}
      <section className="mx-auto max-w-[1200px] px-5 md:px-8 pt-10 md:pt-14">
        <div className="text-center">
          <span className="eyebrow text-gold tracking-[0.32em] text-[0.6rem]">
            The Reference Board
          </span>
          <h2 className="font-display text-2xl md:text-3xl mt-3 tracking-[0.04em]">
            10 Looks for the Mediterranean
          </h2>
        </div>
        <a
          href={REFERENCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block border border-border/60 bg-cream/40 overflow-hidden group"
        >
          <img
            src={REFERENCE_URL}
            alt="Yacht to Lunch — 10 looks reference board"
            className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.01]"
            loading="lazy"
          />
        </a>
      </section>

      {/* LOOKS */}
      <section className="mx-auto max-w-[1200px] px-5 md:px-8 mt-12 md:mt-16 space-y-16 md:space-y-24">
        {YACHT_TO_LUNCH_LOOKS.map((look, idx) => (
          <LookBlock
            key={look.id}
            look={look}
            prev={YACHT_TO_LUNCH_LOOKS[idx - 1]}
            next={YACHT_TO_LUNCH_LOOKS[idx + 1]}
          />
        ))}
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

function LookBlock({
  look,
  prev,
  next,
}: {
  look: YachtLook;
  prev?: YachtLook;
  next?: YachtLook;
}) {
  return (
    <article id={look.id} className="scroll-mt-24">
      <header className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-6 items-end border-b border-gold/40 pb-4">
        <div>
          <span className="eyebrow text-gold tracking-[0.32em] text-[0.6rem]">
            Look {look.number}
          </span>
          <h2 className="font-display text-3xl md:text-5xl mt-2 tracking-[0.04em] text-ink leading-tight">
            {look.title}
          </h2>
          <p className="font-serif italic text-ink/65 text-base md:text-lg mt-2 max-w-2xl">
            {look.subtitle}
          </p>
        </div>
        <div className="eyebrow text-[0.55rem] tracking-[0.3em] text-ink/45">
          {look.products.length} pieces
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,360px)_1fr] gap-6 md:gap-10 mt-6 md:mt-8">
        {/* HERO — cropped from the reference board */}
        <div
          className="relative aspect-[3/4] bg-ink border border-border/60 overflow-hidden"
          aria-label={`${look.title} editorial reference`}
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
          <div className="absolute top-2 left-2 eyebrow text-[0.55rem] tracking-[0.32em] text-ivory bg-ink/65 px-2 py-1">
            Look {look.number}
          </div>
        </div>

        {/* PRODUCTS */}
        <div>
          <div
            className="flex gap-3 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4 overflow-x-auto md:overflow-visible no-scrollbar -mx-5 px-5 md:mx-0 md:px-0"
          >
            {look.products.map((p) => (
              <ProductTile key={`${look.id}-${p.brand}-${p.item}`} product={p} />
            ))}
          </div>

          {/* Look navigation */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {prev ? (
              <a
                href={`#${prev.id}`}
                className="eyebrow text-[0.6rem] tracking-[0.28em] text-ink/65 hover:text-gold inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" /> Look {prev.number}
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a
                href={`#${next.id}`}
                className="eyebrow text-[0.6rem] tracking-[0.28em] text-ink/65 hover:text-gold inline-flex items-center gap-2"
              >
                Look {next.number} <ArrowRight className="w-3 h-3" />
              </a>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductTile({ product }: { product: YachtProduct }) {
  return (
    <a
      href={product.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() =>
        trackOutbound({ brand: product.brand, item: product.item, href: product.href })
      }
      className="group shrink-0 w-[150px] md:w-auto flex flex-col bg-ivory border border-border/60 hover:border-gold transition-colors"
    >
      <div className="relative aspect-square bg-cream flex items-center justify-center px-3">
        <div className="text-center">
          <div
            aria-hidden
            className="mx-auto w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center font-serif text-gold text-base"
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
        <div className="font-serif text-gold text-[0.82rem] mt-1">{product.price}</div>
        <div className="mt-auto pt-2 eyebrow text-[0.55rem] tracking-[0.32em] text-ink group-hover:text-gold transition-colors">
          Shop →
        </div>
      </div>
    </a>
  );
}
