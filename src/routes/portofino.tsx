import { createFileRoute } from "@tanstack/react-router";
import { portofinoLooks, itinerary, travelTips } from "@/data/portofino";
import portofinoImg from "@/assets/dest-portofino.jpg";

export const Route = createFileRoute("/portofino")({
  head: () => ({
    meta: [
      { title: "5 Days in Portofino — A Style & Itinerary Guide | Resort Edit" },
      { name: "description", content: "Five complete resort looks and a five-day itinerary for Portofino — yacht days, beach cabanas, sunset dinners and quiet harbor mornings." },
      { property: "og:title", content: "5 Days in Portofino — Resort Edit" },
      { property: "og:description", content: "A luxury style and travel guide to the Italian Riviera." },
      { property: "og:image", content: portofinoImg },
    ],
  }),
  component: PortofinoPage,
});

function PortofinoPage() {
  return (
    <div>
      {/* HEADER */}
      <section className="text-center pt-24 pb-16 px-6 max-w-4xl mx-auto">
        <span className="eyebrow text-gold">Featured Edit</span>
        <h1 className="font-display text-5xl md:text-8xl mt-6 tracking-[0.05em] leading-[1]">5 Days in Portofino</h1>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="hairline" />
          <span className="eyebrow text-ink/60">A Style & Itinerary Guide</span>
          <span className="hairline" />
        </div>
        <p className="font-serif italic text-xl md:text-2xl text-ink/70 mt-10 leading-relaxed">
          Five days, five looks, and the quiet pleasures of the Italian Riviera — printed silks at sea, a long cabana lunch, a halter dress at dusk.
        </p>
      </section>

      {/* LOOKS */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-6 space-y-32">
          {portofinoLooks.map((look, idx) => {
            const reverse = idx % 2 === 1;
            return (
              <article
                key={look.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reverse ? "lg:[&>div:first-child]:order-2" : ""}`}
              >
                <div className="relative">
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    <img
                      src={look.image}
                      alt={`${look.title} editorial look`}
                      loading="lazy"
                      width={1024}
                      height={1408}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-4 -left-4 bg-gold text-ivory px-5 py-2 eyebrow">
                    {look.day}
                  </div>
                </div>

                <div>
                  <span className="eyebrow text-gold">Look No. 0{idx + 1}</span>
                  <h2 className="font-display text-4xl md:text-6xl mt-4 tracking-wide">{look.title}</h2>
                  <p className="font-serif italic text-lg text-ink/60 mt-3">{look.subtitle}</p>
                  <div className="my-6 h-px w-16 bg-gold" />
                  <p className="font-serif text-lg leading-relaxed text-ink/85">{look.caption}</p>

                  {/* Shop the Look */}
                  <div className="mt-10">
                    <span className="eyebrow text-ink">Shop the Look</span>
                    <ul className="mt-5 divide-y divide-border/70">
                      {look.shop.map((item) => (
                        <li key={item.item} className="py-3 flex items-baseline justify-between gap-4">
                          <div>
                            <div className="eyebrow text-ink/90">{item.brand}</div>
                            <div className="font-serif italic text-ink/70">{item.item}</div>
                          </div>
                          <div className="flex items-center gap-5 shrink-0">
                            <span className="font-serif text-ink/80">{item.price}</span>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="eyebrow text-gold hover:text-ink transition-colors"
                            >
                              Shop →
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Itinerary */}
                  <div className="mt-10 bg-ivory border border-border/60 p-6">
                    <span className="eyebrow text-gold">The Itinerary</span>
                    <p className="font-serif italic text-ink/80 mt-3 leading-relaxed">{look.itinerary}</p>
                    <a
                      href={look.experience.href}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="mt-6 inline-block eyebrow text-ivory bg-ink px-6 py-3 hover:bg-gold transition-colors"
                    >
                      {look.experience.label} →
                    </a>
                  </div>

                  {/* Book This Experience */}
                  <div className="mt-10">
                    <span className="eyebrow text-ink">Book This Experience</span>
                    <p className="font-serif italic text-ink/60 mt-2 text-sm">
                      Curated, bookable moments to complete the day.
                    </p>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {look.experiences.map((exp) => {
                        const href = exp.affiliate_link || exp.backup_link || "#";
                        return (
                          <a
                            key={exp.experience_name}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="group block bg-ivory border border-border/60 hover:border-gold transition-colors"
                          >
                            <div className="aspect-[4/3] overflow-hidden bg-muted">
                              <img
                                src={exp.experience_image}
                                alt={exp.experience_name}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>
                            <div className="p-4">
                              <span className="eyebrow text-gold text-[10px]">{exp.category}</span>
                              <h4 className="font-display text-base tracking-wide mt-2 leading-snug">
                                {exp.experience_name}
                              </h4>
                              <p className="font-serif italic text-ink/65 text-xs mt-2 leading-relaxed">
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
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ITINERARY & TIPS */}
      <section className="py-28">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <span className="eyebrow text-gold">The Plan</span>
            <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">5-Day Portofino Itinerary</h2>
            <ol className="mt-10 space-y-7">
              {itinerary.map((d) => (
                <li key={d.day} className="grid grid-cols-[80px_1fr] gap-5">
                  <span className="eyebrow text-gold pt-1">{d.day}</span>
                  <div>
                    <h3 className="font-display text-xl tracking-wide">{d.title}</h3>
                    <p className="font-serif italic text-ink/70 mt-1 text-sm leading-relaxed">{d.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <span className="eyebrow text-gold">The Notes</span>
            <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">Portofino Travel Tips</h2>
            <dl className="mt-10 space-y-6">
              {travelTips.map((t) => (
                <div key={t.title} className="border-l-2 border-gold pl-5">
                  <dt className="eyebrow text-ink">{t.title}</dt>
                  <dd className="font-serif italic text-ink/70 mt-2 leading-relaxed">{t.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* BOOK CTA */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="eyebrow text-gold">Make It Yours</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">Book the Portofino Experience</h2>
          <p className="font-serif italic text-ink/70 mt-5 text-lg">From a private yacht charter to a candlelit dinner at Splendido — every address in this edit, ready to reserve.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#" target="_blank" rel="noopener noreferrer sponsored" className="eyebrow text-ivory bg-ink px-7 py-4 hover:bg-gold transition-colors">Book Belmond Splendido</a>
            <a href="#" target="_blank" rel="noopener noreferrer sponsored" className="eyebrow text-ink border border-ink px-7 py-4 hover:bg-ink hover:text-ivory transition-colors">Reserve Experiences</a>
          </div>
        </div>
      </section>
    </div>
  );
}