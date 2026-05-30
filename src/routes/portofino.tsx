import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { portofinoLooks } from "@/data/portofino";
import portofinoImg from "@/assets/dest-portofino.jpg";
import { absoluteUrl } from "@/lib/site";
import d1a from "@/assets/edit-d1-a.jpg";
import d1b from "@/assets/edit-d1-b.jpg";
import d1c from "@/assets/edit-d1-c.jpg";
import d2a from "@/assets/edit-d2-a.jpg";
import d3a from "@/assets/edit-d3-a.jpg";
import d4a from "@/assets/edit-d4-a.jpg";
import d5a from "@/assets/edit-d5-a.jpg";

export const Route = createFileRoute("/portofino")({
  head: () => ({
    meta: [
      { title: "5 Days in Portofino — A Style & Itinerary Guide | Resort Edit" },
      { name: "description", content: "Five complete resort looks and a five-day itinerary for Portofino — yacht days, beach cabanas, sunset dinners and quiet harbor mornings." },
      { property: "og:title", content: "5 Days in Portofino — Resort Edit" },
      { property: "og:description", content: "A luxury style and travel guide to the Italian Riviera." },
      { property: "og:image", content: absoluteUrl(portofinoImg) },
      { property: "og:url", content: absoluteUrl("/portofino") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino") }],
  }),
  component: PortofinoPage,
});

function PortofinoPage() {
  const allExperiences = portofinoLooks.flatMap((l) => l.experiences);

  const dayNav: Array<{
    slug: string;
    label: string;
    title: string;
    caption: string;
    image: string;
  }> = [
    { slug: "day-1", label: "Day 1", title: "Yacht Day & Harbor Aperitivo", caption: "Open water, tan lines and hidden coves.", image: d1a },
    { slug: "day-2", label: "Day 2", title: "Beach Club Lunch", caption: "Slow mornings, long lunches, seaside glamour.", image: d2a },
    { slug: "day-3", label: "Day 3", title: "Day Club & Shopping", caption: "Poolside ease, via Roma, Capri luxe.", image: d3a },
    { slug: "day-4", label: "Day 4", title: "Dinner & Sunset", caption: "Golden hour, candlelight, harbor glow.", image: d4a },
    { slug: "day-5", label: "Day 5", title: "Espresso & A Long Last Lunch", caption: "Espresso rituals and one last long lunch.", image: d5a },
  ];

  const day1Previews = [
    { n: 1, title: "Harbor Hero", caption: "Designer · yacht-day polish.", image: d1a },
    { n: 2, title: "Riviera Lunch", caption: "Mid-luxe · harborfront aperitivo.", image: d1b },
    { n: 3, title: "Riviera Daywear", caption: "Riviera finds · effortless ease.", image: d1c },
  ];

  return (
    <div>
      {/* HERO — Editorial full-bleed */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-ink">
        <img
          src={portofinoImg}
          alt="Portofino harbor — editorial hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/55" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-12 md:pb-16 text-ivory">
          <span className="eyebrow text-ivory/80 tracking-[0.4em]">The Resort Edit · Portofino</span>
          <h1 className="font-display text-5xl md:text-7xl mt-5 tracking-[0.05em] leading-[1]">
            5 Days in Portofino
          </h1>
          <p className="font-serif italic text-base md:text-xl text-ivory/85 mt-4 max-w-2xl leading-relaxed">
            Curated destination dressing for the Italian Riviera.
          </p>
        </div>
      </section>

      {/* FIVE DAYS, THREE WAYS + Day nav + Day 1 preview */}
      <section className="bg-ivory pt-12 md:pt-14 pb-14 md:pb-16">
        <div className="mx-auto max-w-3xl px-6 text-center mb-8 md:mb-10">
          <span className="eyebrow text-gold">The Wardrobe</span>
          <h2 className="font-display text-3xl md:text-5xl mt-3 tracking-[0.05em]">
            Five Days, Three Ways
          </h2>
          <div className="mx-auto my-4 h-px w-12 bg-gold" />
          <p className="font-serif italic text-base md:text-lg text-ink/65 leading-relaxed">
            Three shoppable looks per day: Designer / Mid-Luxe / Riviera Finds.
          </p>
        </div>

        {/* Horizontal day pill navigation */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {dayNav.map((d) => (
              <Link
                key={d.slug}
                to="/portofino/day-{$day}"
                params={{ day: d.slug.replace("day-", "") }}
                className="eyebrow tracking-[0.3em] text-[0.65rem] px-5 py-3 border border-ink/20 text-ink hover:bg-ink hover:text-ivory transition-colors"
                title={d.title}
              >
                {d.label.toUpperCase()}
              </Link>
            ))}
          </div>
          <p className="text-center font-serif italic text-ink/55 text-sm mt-4">
            Showing Day 1 · Yacht Day & Harbor Aperitivo — open water, tan lines and hidden coves.
          </p>
        </div>

        {/* Featured Preview Strip — Day 1 looks */}
        <div className="mx-auto max-w-6xl px-6 mt-10 md:mt-12">
          <div className="hidden md:grid grid-cols-3 gap-5">
            {day1Previews.map((p) => (
              <Link
                key={p.n}
                to="/portofino/day-{$day}"
                params={{ day: "1" }}
                className="group block bg-ivory border border-border/60 hover:border-gold transition-colors"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img src={p.image} alt={`Day 1 Look ${p.n} — ${p.title}`} loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute top-3 left-3 bg-ivory/95 text-ink eyebrow px-2.5 py-1 tracking-[0.3em] text-[0.55rem]">
                    LOOK {p.n}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-xl tracking-wide leading-snug">{p.title}</h3>
                  <p className="font-serif italic text-ink/65 text-sm mt-1.5 leading-relaxed">{p.caption}</p>
                  <span className="mt-3 inline-block eyebrow text-[0.6rem] tracking-[0.35em] text-ink group-hover:text-gold transition-colors">
                    View Look →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {/* Mobile horizontal scroll */}
          <div className="md:hidden -mx-6 px-6 overflow-x-auto">
            <div className="flex gap-4 snap-x snap-mandatory">
              {day1Previews.map((p) => (
                <Link
                  key={p.n}
                  to="/portofino/day-{$day}"
                  params={{ day: "1" }}
                  className="snap-start shrink-0 w-[78%] bg-ivory border border-border/60"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <img src={p.image} alt={`Day 1 Look ${p.n}`} loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute top-3 left-3 bg-ivory/95 text-ink eyebrow px-2.5 py-1 tracking-[0.3em] text-[0.55rem]">
                      LOOK {p.n}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg tracking-wide">{p.title}</h3>
                    <p className="font-serif italic text-ink/65 text-sm mt-1.5">{p.caption}</p>
                    <span className="mt-3 inline-block eyebrow text-[0.6rem] tracking-[0.35em] text-ink">View Look →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY PRICE TIER */}
      <section className="bg-cream py-24 md:py-28 border-y border-border/40">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="eyebrow text-gold">Shop By Price Point</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            Explore This Edit Across Price Points
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Same aesthetic. Different investment. Three styling pathways across designer, mid-luxe, and Riviera finds.
          </p>
          <Link
            to="/portofino-edit"
            className="mt-10 inline-block eyebrow text-ivory bg-ink px-8 py-4 hover:bg-gold transition-colors"
          >
            Open The Price-Point Edit →
          </Link>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center mb-16">
          <span className="eyebrow text-gold">The Experiences</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            Bookable Moments
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Curated by day — yacht charters, cliffside cabanas, candlelit dinners.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allExperiences.map((exp) => {
            const href = exp.affiliate_link || exp.backup_link || "#";
            return (
              <a
                key={exp.experience_name}
                href={href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group block bg-ivory border border-border/60 hover:border-gold transition-colors"
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={exp.experience_image}
                    alt={exp.experience_name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="eyebrow text-gold text-[10px]">{exp.price_tier}</span>
                  <h4 className="font-display text-lg tracking-wide mt-2 leading-snug">
                    {exp.experience_name}
                  </h4>
                  <p className="font-serif italic text-ink/65 text-sm mt-2 leading-relaxed">
                    {exp.experience_description}
                  </p>
                  <span className="mt-4 inline-block eyebrow text-[10px] text-ink group-hover:text-gold transition-colors">
                    Book This Experience →
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* HOTELS */}
      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center mb-16">
          <span className="eyebrow text-gold">Where To Stay</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            The Hotels
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Three addresses on the promontory — each one a different way to wake up in Portofino.
          </p>
        </div>
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Belmond Hotel Splendido",
              tier: "Iconic",
              note: "Pastel-pink cliffside legend with the most photographed pool in the Riviera.",
              href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
            },
            {
              name: "Splendido Mare, A Belmond Hotel",
              tier: "Harborfront",
              note: "Right on the piazzetta — wake to the boats, dine on the waterfront.",
              href: "https://www.belmond.com/hotels/europe/italy/portofino/splendido-mare/",
            },
            {
              name: "Eight Hotel Portofino",
              tier: "Boutique",
              note: "Quietly elegant, walkable to everything, a more intimate alternative.",
              href: "https://www.eighthotelportofino.com/",
            },
          ].map((h) => (
            <a
              key={h.name}
              href={h.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group block bg-ivory border border-border/60 hover:border-gold transition-colors p-7"
            >
              <span className="eyebrow text-gold text-[10px]">{h.tier}</span>
              <h3 className="font-display text-2xl tracking-wide mt-3 leading-snug">{h.name}</h3>
              <p className="font-serif italic text-ink/70 mt-4 leading-relaxed">{h.note}</p>
              <span className="mt-6 inline-block eyebrow text-[10px] text-ink group-hover:text-gold transition-colors">
                Reserve →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <span className="eyebrow text-gold">The Newsletter</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
            New Edits, Quietly Delivered
          </h2>
          <div className="mx-auto my-6 h-px w-16 bg-gold" />
          <p className="font-serif italic text-lg text-ink/65 leading-relaxed">
            Resort edits, packing lists, and destination notes — sent only when there's something worth wearing.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 bg-ivory border border-border/60 px-5 py-4 font-serif italic text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="eyebrow text-ivory bg-ink px-7 py-4 hover:bg-gold transition-colors cursor-pointer"
            >
              Subscribe →
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

