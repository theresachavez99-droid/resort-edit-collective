import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/resort-edit-logo.png";
import stillLife from "@/assets/portofino-stilllife.jpg";
import { portofinoLooks, itinerary, travelTips } from "@/data/portofino";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resort Edit — 5 Days in Portofino" },
      { name: "description", content: "A style & itinerary guide to five days in Portofino. Shop the looks, book the experiences." },
      { property: "og:title", content: "Resort Edit — 5 Days in Portofino" },
      { property: "og:description", content: "Curated escapes. Inspired by you." },
      { property: "og:image", content: logo },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-ivory">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 pt-10 md:pt-16 pb-10">
        {/* MASTHEAD */}
        <header className="text-center">
          <img src={logo} alt="Resort Edit — Curated Escapes. Inspired By You." className="mx-auto w-[280px] sm:w-[360px] md:w-[440px] h-auto" />
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl tracking-[0.08em] mt-6 text-ink">
            5 DAYS IN PORTOFINO
          </h1>
          <p className="eyebrow text-gold mt-4">A Style &amp; Itinerary Guide</p>
        </header>

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
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={look.image}
                  alt={`${look.title} look`}
                  loading="lazy"
                  width={832}
                  height={1216}
                  className="h-full w-full object-cover"
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
                <ul className="space-y-3">
                  {look.shop.map((item) => (
                    <li key={item.item}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex gap-2 group"
                      >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-cream border border-border/60 flex items-center justify-center">
                          <span className="eyebrow text-[0.5rem] text-gold">edit</span>
                        </div>
                        <div className="text-left leading-tight">
                          <div className="eyebrow text-[0.55rem] text-ink group-hover:text-gold transition-colors">
                            {item.brand}
                          </div>
                          <div className="font-serif text-[0.78rem] text-ink/80 mt-0.5">{item.item}</div>
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

        {/* FOOTER BAR */}
        <Link
          to="/portofino"
          className="mt-6 block bg-gold text-ivory text-center py-5 eyebrow hover:bg-ink transition-colors"
        >
          Shop All Looks &amp; Itinerary Details &nbsp;·&nbsp; Link in Bio
        </Link>
      </div>
    </div>
  );
}
