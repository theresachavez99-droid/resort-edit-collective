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
import destPortofino from "@/assets/dest-portofino.jpg";
import destCapri from "@/assets/dest-capri.jpg";
import destIbiza from "@/assets/dest-ibiza.jpg";
import destSttropez from "@/assets/dest-sttropez.jpg";
import destMykonos from "@/assets/dest-mykonos.jpg";
import destPositano from "@/assets/dest-positano.jpg";
import lookBeach from "@/assets/look-beach.jpg";
import lookYacht from "@/assets/look-yacht.jpg";
import lookDinner from "@/assets/look-dinner.jpg";
import lookDayclub from "@/assets/look-dayclub.jpg";
import lookTown from "@/assets/look-town.jpg";
import { Bookmark, Share2 } from "lucide-react";
import { trackOutbound } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resort Edit — Destination guides. Styled beautifully." },
      { name: "description", content: "Curated itineraries, resort looks, hotels and experiences — designed for women who want to dress for the destination." },
      { property: "og:title", content: "Resort Edit — Destination guides. Styled beautifully." },
      { property: "og:description", content: "Curated itineraries, resort looks, hotels and experiences." },
      { property: "og:image", content: heroMuse },
    ],
  }),
  component: Index,
});

function Index() {
  const experiences = [
    { label: "Charter the Day", image: expYacht },
    { label: "Reserve Beach Clubs", image: expBeach },
    { label: "Plan Experiences", image: expTour },
    { label: "Stay Beautifully", image: expExperiences },
  ];
  const browseDestinations = [
    { name: "Portofino", image: destPortofino, href: "/portofino" },
    { name: "Capri", image: destCapri, href: "/destinations/capri" },
    { name: "Ibiza", image: destIbiza, href: "/destinations/ibiza" },
    { name: "Saint-Tropez", image: destSttropez, href: "/destinations/sttropez" },
    { name: "Mykonos", image: destMykonos, href: "/destinations" },
    { name: "Positano", image: destPositano, href: "/destinations" },
  ];
  const browseOccasions = [
    { name: "Beach Club", image: lookBeach },
    { name: "Yacht Day", image: lookYacht },
    { name: "Dinner Glam", image: lookDinner },
    { name: "Travel Day", image: expTour },
    { name: "Poolside", image: lookDayclub },
    { name: "Exploring Town", image: lookTown },
  ];
  return (
    <div className="bg-ivory">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 pt-4 md:pt-6 pb-10">
        {/* HERO */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center py-6 md:py-10">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted order-1">
            <img
              src={heroMuse}
              alt="Resort Edit muse on a Portofino terrace at golden hour"
              width={896}
              height={1216}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="order-2 text-left md:pl-4">
            <p className="eyebrow text-gold text-[0.7rem]">The Resort Edit</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.02em] mt-6 md:mt-8 text-ink leading-[1.02]">
              Destination guides.
              <br />
              <span className="italic font-serif text-gold">Styled beautifully.</span>
            </h1>
            <p className="mt-8 md:mt-10 font-serif text-base md:text-lg text-ink/70 leading-relaxed max-w-md">
              Curated itineraries, resort looks, hotels and experiences — designed
              for women who want to dress for the destination.
            </p>
            <div className="mt-10 md:mt-12 flex flex-wrap gap-4">
              <Link
                to="/destinations"
                className="inline-block bg-ink text-ivory eyebrow text-[0.7rem] tracking-[0.25em] px-7 py-4 hover:bg-gold transition-colors"
              >
                Browse Destinations →
              </Link>
              <Link
                to="/portofino"
                className="inline-block border border-ink text-ink eyebrow text-[0.7rem] tracking-[0.25em] px-7 py-4 hover:bg-ink hover:text-ivory transition-colors"
              >
                Shop the Looks →
              </Link>
            </div>
          </div>
        </section>

        {/* BROWSE BY DESTINATION */}
        <section className="mt-16 md:mt-24">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="eyebrow text-gold text-[0.7rem]">Browse</p>
              <h2 className="font-display text-2xl sm:text-3xl tracking-[0.04em] text-ink mt-2">
                By Destination
              </h2>
            </div>
            <Link to="/destinations" className="eyebrow text-[0.65rem] text-ink/60 hover:text-gold transition-colors hidden sm:inline">
              View All →
            </Link>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {browseDestinations.map((d) => (
              <li key={d.name}>
                <Link
                  to={d.href}
                  className="group block relative aspect-[3/4] overflow-hidden bg-ink"
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-ivory">
                    <h3 className="font-display text-base sm:text-lg tracking-wide">{d.name}</h3>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* BROWSE BY OCCASION */}
        <section className="mt-16 md:mt-20">
          <div className="mb-6">
            <p className="eyebrow text-gold text-[0.7rem]">Browse</p>
            <h2 className="font-display text-2xl sm:text-3xl tracking-[0.04em] text-ink mt-2">
              By Occasion
            </h2>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {browseOccasions.map((o) => (
              <li key={o.name}>
                <Link
                  to="/portofino"
                  className="group block relative aspect-[3/4] overflow-hidden bg-ink"
                >
                  <img
                    src={o.image}
                    alt={o.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-ivory">
                    <h3 className="font-display text-base sm:text-lg tracking-wide">{o.name}</h3>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* TRUST / POSITIONING BAND */}
        <section className="mt-16 md:mt-20 border-y border-border/60 py-6 text-center">
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
        <section className="mt-12 md:mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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
          className="mt-8 md:mt-10 block border border-gold/60 bg-card text-center py-4 px-4 hover:bg-gold/5 transition-colors"
        >
          <span className="eyebrow text-gold text-[0.65rem] sm:text-[0.75rem] tracking-[0.25em] uppercase">
            Explore Portofino Across Price Points &nbsp;→
          </span>
        </Link>

        <section className="mt-8 md:mt-10 bg-card grid grid-cols-1 md:grid-cols-3 gap-0">
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
        <section className="mt-16 md:mt-20 text-center">
          <h2 className="font-display text-2xl sm:text-3xl tracking-[0.08em] text-ink">
            PLAN YOUR PORTOFINO EXPERIENCE
          </h2>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
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
                <span className="absolute left-0 right-0 bottom-0 bg-gold text-ivory eyebrow text-[0.6rem] sm:text-[0.65rem] h-10 sm:h-11 px-3 flex items-center justify-center text-center whitespace-nowrap tracking-[0.22em]">
                  {exp.label} →
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* FOOTER BAR */}
        <Link
          to="/portofino"
          className="mt-10 md:mt-12 block bg-gold text-ivory text-center py-5 eyebrow hover:bg-ink transition-colors"
        >
          Explore Portofino &nbsp;→
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
