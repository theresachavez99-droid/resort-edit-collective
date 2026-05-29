import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import stillLife from "@/assets/portofino-stilllife.jpg";
import heroMuse from "@/assets/hero-muse-portofino.jpg";
import { portofinoLooks, itinerary, travelTips, whereToStay, resolveProductLink } from "@/data/portofino";
import expYacht from "@/assets/exp-yacht.jpg";
import expBeach from "@/assets/exp-beachclub.jpg";
import expTour from "@/assets/exp-tour.jpg";
import expExperiences from "@/assets/exp-experiences.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";
import { Bookmark, Share2 } from "lucide-react";
import { trackOutbound } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resort Edit — 5 Days in Portofino" },
      { name: "description", content: "A style & itinerary guide to five days in Portofino. Shop the looks, book the experiences." },
      { property: "og:title", content: "Resort Edit — 5 Days in Portofino" },
      { property: "og:description", content: "Curated escapes. Styled your way." },
      { property: "og:image", content: heroMuse },
    ],
  }),
  component: Index,
});

function Index() {
  const experiences = [
    { label: "Book a Yacht", image: expYacht },
    { label: "Reserve a Beach Club", image: expBeach },
    { label: "Book a Tour", image: expTour },
    { label: "View Experiences", image: expExperiences },
  ];
  return (
    <div className="bg-ivory">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 pt-4 md:pt-6 pb-10">
        {/* HERO */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted order-1">
            <img
              src={heroMuse}
              alt="Resort Edit muse on a Portofino terrace at golden hour"
              width={896}
              height={1216}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="order-2 text-left md:pl-2">
            <p className="eyebrow text-gold text-[0.7rem]">A Style &amp; Itinerary Guide</p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl tracking-[0.06em] mt-4 text-ink leading-[0.95]">
              5 DAYS IN
              <br />
              PORTOFINO
            </h1>
            <p className="font-serif italic text-3xl md:text-4xl text-gold mt-5">La Dolce Vita</p>
            <p className="mt-6 font-display text-lg md:text-xl tracking-[0.02em] text-ink leading-snug">
              Luxury labels. Destination style. Resort fashion across price points.
            </p>
            <p className="mt-4 font-serif italic text-ink/65 text-base leading-relaxed max-w-md">
              Curated from international resort favorites, iconic labels, and
              destination brands we love.
            </p>
          </div>
        </section>

        {/* TRUST / POSITIONING BAND */}
        <section className="mt-10 border-y border-border/60 py-6 text-center">
          <p className="eyebrow text-[0.6rem] text-ink/55 max-w-2xl mx-auto leading-relaxed">
            Zimmermann <span className="text-gold">·</span> Johanna Ortiz{" "}
            <span className="text-gold">·</span> SIR <span className="text-gold">·</span>{" "}
            Farm Rio <span className="text-gold">·</span> Melissa Odabash{" "}
            <span className="text-gold">·</span>{" "}
            <Link to="/brands" className="text-gold hover:underline">
              more
            </Link>
          </p>
        </section>

        {/* 5-DAY GRID */}
        <section className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {portofinoLooks.map((look, i) => (
            <article key={look.title} className="bg-card flex flex-col">
              {/* Day banner */}
              <div className="bg-gold text-ivory text-center py-2.5 px-2">
                <div className="eyebrow text-[0.6rem] sm:text-[0.65rem]">Day {i + 1}</div>
                <div className="eyebrow text-[0.6rem] sm:text-[0.65rem] mt-0.5">{look.title}</div>
              </div>
              {/* Image */}
              <div className="aspect-[2/5] overflow-hidden bg-muted">
                <img
                  src={look.image}
                  alt={`${look.title} look`}
                  loading="lazy"
                  width={832}
                  height={1216}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              {/* Caption */}
              <div className="px-3 pt-4 pb-3 text-center">
                <p className="eyebrow text-[0.55rem] sm:text-[0.6rem] text-ink leading-relaxed">
                  {look.subtitle}
                </p>
              </div>
              {/* Shop the look */}
              <div className="px-3 pb-5 mt-1">
                <div className="text-center mb-3">
                  <span className="eyebrow text-gold text-[0.6rem]">Shop the Look</span>
                  <div className="mx-auto mt-1 h-px w-8 bg-gold/60" />
                </div>
                <ul className="space-y-4">
                  {look.shop
                    .filter((item) => resolveProductLink(item) !== null)
                    .map((item) => (
                    <li key={item.item}>
                      <a
                        href={resolveProductLink(item) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={() =>
                          trackOutbound({
                            brand: item.brand,
                            item: item.item,
                            href: resolveProductLink(item),
                          })
                        }
                        className="block group rounded-sm -mx-1 px-1 py-1.5 transition-colors hover:bg-gold/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
                      >
                        <div className="text-left leading-tight">
                          <div className="eyebrow text-[0.55rem] text-ink group-hover:text-gold transition-colors flex items-center gap-1.5">
                            <span>{item.brand}</span>
                            {item.replaced && (
                              <span className="eyebrow text-[0.5rem] tracking-[0.2em] text-gold border border-gold/50 px-1 py-px">
                                Updated
                              </span>
                            )}
                          </div>
                          <div className="font-serif text-[0.82rem] text-ink/85 mt-1">{item.item}</div>
                          <div className="font-serif text-[0.78rem] text-gold mt-0.5">{item.price}</div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        {/* BOTTOM CARD: ITINERARY + TIPS + IMAGE */}
        <Link
          to="/portofino-edit"
          className="mt-6 block border border-gold/60 bg-card text-center py-4 px-4 hover:bg-gold/5 transition-colors"
        >
          <span className="eyebrow text-gold text-[0.65rem] sm:text-[0.75rem] tracking-[0.25em] uppercase">
            Explore This Resort Edit Across Price Points &nbsp;→
          </span>
        </Link>

        <section className="mt-6 bg-card grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Itinerary */}
          <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-border/60">
            <h3 className="font-display text-xl sm:text-2xl tracking-wide">5-Day Portofino Itinerary</h3>
            <ul className="mt-5 space-y-4">
              {itinerary.map((it) => (
                <li key={it.day} className="flex gap-3">
                  <span className="eyebrow text-gold w-10 shrink-0 pt-1">{it.day}</span>
                  <div>
                    <div className="eyebrow text-[0.6rem] text-ink">{it.title}</div>
                    <p className="font-serif text-[0.85rem] text-ink/70 leading-snug mt-1">{it.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Tips */}
          <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-border/60">
            <h3 className="font-display text-xl sm:text-2xl tracking-wide">Portofino Travel Tips</h3>
            <ul className="mt-5 space-y-4">
              {travelTips.map((tip) => (
                <li key={tip.title}>
                  <div className="eyebrow text-[0.6rem] text-ink">{tip.title}</div>
                  <p className="font-serif text-[0.85rem] text-ink/70 leading-snug mt-1">{tip.text}</p>
                </li>
              ))}
            </ul>
          </div>
          {/* Image */}
          <div className="relative min-h-[280px] md:min-h-0">
            <img
              src={stillLife}
              alt="Portofino harbor still life"
              loading="lazy"
              width={1280}
              height={896}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </section>

        {/* WHERE TO STAY */}
        <WhereToStay />

        {/* BOOK YOUR PORTOFINO EXPERIENCE */}
        <section className="mt-10 text-center">
          <h2 className="font-display text-2xl sm:text-3xl tracking-[0.08em] text-ink">
            BOOK YOUR PORTOFINO EXPERIENCE
          </h2>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {experiences.map((exp) => (
              <a
                key={exp.label}
                href="#"
                target="_blank"
                rel="noreferrer noopener"
                className="relative block aspect-[4/3] overflow-hidden group"
              >
                <img
                  src={exp.image}
                  alt={exp.label}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-ink/10 group-hover:bg-ink/0 transition-colors" />
                <span className="absolute left-0 right-0 bottom-0 bg-gold text-ivory eyebrow text-[0.6rem] sm:text-[0.65rem] h-9 sm:h-10 px-3 flex items-center justify-center text-center whitespace-nowrap">
                  {exp.label}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* FOOTER BAR */}
        <Link
          to="/portofino"
          className="mt-6 block bg-gold text-ivory text-center py-5 eyebrow hover:bg-ink transition-colors"
        >
          Explore the Full Portofino Edit &nbsp;→
        </Link>

        <p className="mt-6 text-center eyebrow text-[0.55rem] text-ink/50">
          Prices are subject to change. Links may earn a small commission at no extra cost to you.
        </p>
      </div>
    </div>
  );
}

const hotelImages: Record<string, string> = {
  splendido: hotelSplendido,
  eight: hotelEight,
  piccolo: hotelPiccolo,
};

function WhereToStay() {
  const share = async (name: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: name, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  return (
    <section className="mt-10">
      <div className="text-center">
        <h2 className="font-display text-2xl sm:text-3xl tracking-[0.08em] text-ink">
          WHERE TO STAY
        </h2>
        <p className="mt-2 font-serif italic text-sm text-ink/60">
          A curated trio of stays — from cliffside icon to intimate hideaway.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {whereToStay.map((h) => {
          const href = h.affiliate_link || h.booking_link || h.backup_link || "#";
          return (
            <article
              key={h.hotel_name}
              className="group bg-card border border-border/60 flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={hotelImages[h.image_url] ?? h.image_url}
                  alt={h.hotel_name}
                  loading="lazy"
                  width={1280}
                  height={896}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    aria-label={`Save ${h.hotel_name}`}
                    className="h-8 w-8 grid place-items-center bg-card/85 backdrop-blur-sm border border-border/60 text-ink/70 hover:text-ink transition-colors"
                  >
                    <Bookmark size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => share(h.hotel_name)}
                    aria-label={`Share ${h.hotel_name}`}
                    className="h-8 w-8 grid place-items-center bg-card/85 backdrop-blur-sm border border-border/60 text-ink/70 hover:text-ink transition-colors"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <div className="eyebrow text-[0.6rem] text-gold">{h.destination}</div>
                <h3 className="mt-2 font-display text-lg sm:text-xl tracking-wide text-ink">
                  {h.hotel_name}
                </h3>
                <p className="mt-2 font-serif text-[0.9rem] text-ink/70 leading-relaxed">
                  {h.description}
                </p>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener sponsored"
                  data-hotel={h.hotel_name}
                  className="mt-5 inline-block text-center border border-ink/80 py-3 px-4 eyebrow text-[0.7rem] tracking-[0.22em] text-ink hover:bg-ink hover:text-card transition-colors"
                >
                  Book This Stay &nbsp;→
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
