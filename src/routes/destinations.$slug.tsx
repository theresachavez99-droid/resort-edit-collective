import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { destinations, getDestination, destinationHref } from "@/data/destinations";

export const Route = createFileRoute("/destinations/$slug")({
  loader: ({ params }) => {
    const destination = getDestination(params.slug);
    if (!destination) throw notFound();
    return { destination };
  },
  head: ({ loaderData }) => {
    const d = loaderData?.destination;
    if (!d) return { meta: [{ title: "Destination — Resort Edit" }] };
    return {
      meta: [
        { title: `${d.name} — Resort Edit` },
        { name: "description", content: `${d.name}, ${d.country}: ${d.tagline}` },
        { property: "og:title", content: `${d.name} — Resort Edit` },
        { property: "og:description", content: d.tagline },
        { property: "og:image", content: d.image },
        { property: "og:url", content: `/destinations/${d.slug}` },
        { property: "og:type", content: "article" },
        { name: "twitter:image", content: d.image },
      ],
      links: [{ rel: "canonical", href: `/destinations/${d.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto px-6 py-32 text-center">
      <span className="eyebrow text-gold">Not found</span>
      <h1 className="font-display text-4xl mt-4">This destination hasn't been edited yet.</h1>
      <Link to="/destinations" className="eyebrow text-gold mt-8 inline-block">← Back to the Atlas</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="max-w-2xl mx-auto px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong.</h1>
      <button onClick={reset} className="eyebrow text-gold mt-8">Try again</button>
    </div>
  ),
  component: DestinationPage,
});

function DestinationPage() {
  const { destination: d } = Route.useLoaderData();
  const related = d.related
    .map((slug) => destinations.find((x) => x.slug === slug))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <article>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[460px]">
        <img src={d.image} alt={d.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/35" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-ivory px-6">
          <span className="eyebrow text-gold-soft">{d.region} · {d.country}</span>
          <h1 className="font-display text-5xl md:text-7xl mt-6 tracking-wide">{d.name}</h1>
          <p className="mt-6 font-serif italic text-xl md:text-2xl max-w-2xl">{d.tagline}</p>
        </div>
      </section>

      {/* Overview */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <span className="eyebrow text-gold">The Overview</span>
        <p className="font-serif text-xl md:text-2xl leading-relaxed text-ink mt-8 italic">
          {d.overview}
        </p>
        <div className="my-10 h-px w-16 bg-gold mx-auto" />
      </section>

      {/* What to wear + Shop edits */}
      <section className="mx-auto max-w-6xl px-6 pb-20 grid md:grid-cols-2 gap-16">
        <div>
          <span className="eyebrow text-gold">What to wear</span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">The packing list</h2>
          <ul className="mt-8 space-y-3">
            {d.whatToWear.map((item) => (
              <li key={item} className="font-serif text-lg text-ink/85 flex items-baseline gap-3">
                <span className="hairline" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="eyebrow text-gold">Shop the edits</span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">Curated to pack</h2>
          <div className="mt-8 flex flex-col gap-3">
            {d.shopEdits.map((e) => (
              <Link
                key={e.href}
                to={e.href}
                className="eyebrow border border-ink/20 px-5 py-4 hover:bg-ink hover:text-ivory transition-colors text-ink"
              >
                {e.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Itinerary */}
      <section className="bg-cream/60 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span className="eyebrow text-gold">The Itinerary</span>
            <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">A weekend in {d.name}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-10">
            {d.itinerary.map((it) => (
              <div key={it.day} className="border-l-2 border-gold pl-6">
                <span className="eyebrow text-gold">{it.day}</span>
                <p className="font-serif text-lg italic text-ink/85 mt-3">{it.plan}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dining */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <span className="eyebrow text-gold">Restaurants & Beach Clubs</span>
          <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">Where to eat & lounge</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {d.dining.map((dn) => (
            <div key={dn.name} className="border border-border/60 p-8 bg-card">
              <span className="eyebrow text-gold">{dn.type}</span>
              <h3 className="font-display text-2xl mt-3 tracking-wide">{dn.name}</h3>
              <p className="font-serif italic text-ink/75 mt-3">{dn.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-ink text-ivory py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <span className="eyebrow text-gold-soft">Related Destinations</span>
              <h2 className="font-display text-3xl md:text-4xl mt-4 tracking-wide">You might also love</h2>
            </div>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={r.href ?? "/destinations/$slug"}
                  params={r.href ? undefined : { slug: r.slug }}
                  className="group block"
                >
                  <div className="relative overflow-hidden aspect-[4/5]">
                    <img
                      src={r.image}
                      alt={r.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="eyebrow text-gold-soft">{r.region}</span>
                      <h3 className="font-display text-2xl mt-2 text-ivory">{r.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-14">
              <Link to="/destinations" className="eyebrow text-gold-soft hover:text-gold">
                ← Back to the Atlas
              </Link>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

// keep helper referenced for tree-shake friendliness
void destinationHref;