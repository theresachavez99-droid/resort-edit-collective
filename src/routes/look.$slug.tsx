import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getPublishedLook, type PublishedLookProduct } from "@/lib/published-look.functions";

export const Route = createFileRoute("/look/$slug")({
  loader: async ({ params }) => {
    const res = await getPublishedLook({ data: { slug: params.slug } });
    if (!res.ok) throw notFound();
    return res.look;
  },
  head: ({ loaderData }) => {
    const l = loaderData;
    if (!l) return { meta: [{ title: "Look — Resort Edit" }] };
    const title = `${l.destination} · ${l.activity} — Resort Edit`;
    const desc = (l.why_it_works ?? `${l.dna_name} — a Resort Edit destination look for ${l.destination}.`).slice(0, 160);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(l.muse_image_url ? [{ property: "og:image", content: l.muse_image_url }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="min-h-screen bg-ivory text-ink flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-gold">Resort Edit</p>
        <h1 className="font-display text-3xl tracking-[0.12em] uppercase mt-3">Look not found</h1>
        <Link to="/" className="mt-6 inline-block text-sm underline">Return home</Link>
      </div>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-ivory text-ink flex items-center justify-center px-6">
      <p className="text-sm text-red-700">{(error as Error).message}</p>
    </main>
  ),
  component: LookPage,
});

function LookPage() {
  const look = Route.useLoaderData();
  const [showScores, setShowScores] = useState(false);

  return (
    <main className="min-h-screen bg-ivory text-ink">
      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] min-h-[80vh]">
        <div className="bg-cream/30 relative overflow-hidden">
          {look.muse_image_url ? (
            <img src={look.muse_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cream/60 to-ivory flex items-center justify-center text-ink/40 font-serif italic">
              Editorial muse forthcoming
            </div>
          )}
        </div>
        <div className="px-8 md:px-14 py-14 lg:py-20 flex flex-col justify-center max-w-2xl">
          <p className="text-[0.62rem] tracking-[0.34em] uppercase text-gold">Resort Edit · {look.destination}</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-[0.08em] uppercase mt-4 leading-[1.05]">
            {look.dna_name}
          </h1>
          <p className="font-serif italic text-ink/70 mt-4 text-lg">{look.mood}</p>
          <p className="text-sm text-ink/65 mt-2 uppercase tracking-[0.16em]">{look.activity}</p>
          {look.palette.length > 0 && (
            <p className="text-xs text-ink/50 mt-6 font-serif italic">
              Palette · {look.palette.join(" · ")}
            </p>
          )}
          <a
            href="#shop"
            className="mt-10 inline-block bg-ink text-ivory px-7 py-3.5 text-[0.7rem] tracking-[0.28em] uppercase w-fit"
          >
            Shop the Look
          </a>
        </div>
      </section>

      {/* SHOP THE LOOK */}
      <section id="shop" className="px-6 md:px-14 py-16 border-t border-ink/10">
        <SectionHeading kicker="The Outfit" title="Shop the Look" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {look.products.map((p) => (
            <ProductCard key={p.vault_id} product={p} />
          ))}
        </div>
      </section>

      {/* THE DETAILS */}
      <section className="px-6 md:px-14 py-16 border-t border-ink/10 bg-cream/20">
        <SectionHeading kicker="The Details" title="Why this look works" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-10 max-w-5xl">
          <Detail label="Why It Works" body={look.why_it_works} />
          <Detail
            label="Best For"
            bodyList={look.best_for}
          />
          <Detail label="Resort Edit Tip" body={look.resort_edit_tip} />
          <Detail label="Pack Instead Of" body={look.pack_instead_of} />
        </div>
      </section>

      {/* WHAT'S IN HER BAG */}
      {look.whats_in_her_bag.length > 0 && (
        <section className="px-6 md:px-14 py-16 border-t border-ink/10">
          <SectionHeading kicker="The Edit" title="What's in her bag?" />
          <p className="font-serif italic text-ink/60 mt-3 max-w-xl">
            Not a product dump — the actual contents of a wealthy traveler's tote on a {look.activity.toLowerCase()} in {look.destination}.
          </p>
          <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-5 max-w-5xl">
            {look.whats_in_her_bag.map((b, i) => (
              <li key={i} className="border-l border-ink/15 pl-4 py-1">
                <p className="font-display text-sm tracking-[0.06em] uppercase">{b.item}</p>
                <p className="font-serif italic text-ink/65 text-sm mt-1">{b.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* SCORING */}
      <section className="px-6 md:px-14 py-14 border-t border-ink/10 bg-cream/20">
        <button
          onClick={() => setShowScores((v) => !v)}
          className="text-[0.62rem] tracking-[0.3em] uppercase text-ink/65 hover:text-ink"
        >
          {showScores ? "Hide" : "Why we approved this look"} ·{" "}
          <span className="font-mono">{look.composite_score?.toFixed(1) ?? "—"}</span>/10
        </button>
        {showScores && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 max-w-3xl">
            {look.scoring.map((s) => (
              <div key={s.key} className="flex items-center gap-3 text-sm">
                <span className="w-48 text-ink/65">{s.label}</span>
                <div className="flex-1 h-1 bg-cream/60">
                  <div className="h-full bg-ink" style={{ width: `${((s.value ?? 0) / 10) * 100}%` }} />
                </div>
                <span className="font-mono text-ink/70 w-8 text-right">{s.value != null ? s.value.toFixed(0) : "—"}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SIMILAR LOOKS */}
      {look.similar.length > 0 && (
        <section className="px-6 md:px-14 py-16 border-t border-ink/10">
          <SectionHeading kicker="More from this destination" title={`Similar looks in ${look.destination}`} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">
            {look.similar.map((s) => (
              <Link
                key={s.slug}
                to="/look/$slug"
                params={{ slug: s.slug }}
                className="group block"
              >
                <div className="aspect-[3/4] bg-cream/40 overflow-hidden">
                  {s.muse_image_url ? (
                    <img src={s.muse_image_url} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/40 text-xs">No muse</div>
                  )}
                </div>
                <p className="mt-3 font-display text-sm tracking-[0.06em] uppercase">{s.activity}</p>
                <p className="text-[0.65rem] tracking-[0.22em] uppercase text-ink/55">Variant {s.variant}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="px-6 md:px-14 py-12 border-t border-ink/10 text-center">
        <p className="text-[0.6rem] tracking-[0.32em] uppercase text-gold">Resort Edit</p>
        <p className="font-serif italic text-ink/55 text-sm mt-2">Destination dressing, edited.</p>
      </footer>
    </main>
  );
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="text-[0.62rem] tracking-[0.3em] uppercase text-gold">{kicker}</p>
      <h2 className="font-display text-3xl md:text-4xl tracking-[0.1em] uppercase mt-3">{title}</h2>
    </div>
  );
}

function Detail({ label, body, bodyList }: { label: string; body?: string | null; bodyList?: string[] }) {
  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.3em] uppercase text-ink/55">{label}</p>
      {body ? (
        <p className="font-serif text-ink/85 mt-3 leading-relaxed text-[1.02rem]">{body}</p>
      ) : bodyList && bodyList.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {bodyList.map((b, i) => (
            <li key={i} className="font-serif text-ink/80 text-[1.02rem] before:content-['—'] before:mr-2 before:text-ink/40">
              {b}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-serif italic text-ink/45 mt-3">—</p>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: PublishedLookProduct }) {
  const [imgIdx, setImgIdx] = useState(0);
  // Image fallback chain: primary -> first replacement -> none
  const sources = [product.image_url, ...product.ai_replacements.map((r) => r.image_url)].filter(
    (x): x is string => !!x,
  );
  const currentImg = sources[imgIdx] ?? null;
  const [showAlts, setShowAlts] = useState(false);

  // URL fallback chain — primary, brand, category
  const fallbackUrls = [product.brand_fallback_url, product.category_fallback_url].filter(
    (x): x is string => !!x,
  );

  return (
    <article className="group">
      <a href={product.primary_url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-[3/4] bg-cream/30 overflow-hidden relative">
          {currentImg ? (
            <img
              src={currentImg}
              alt={`${product.brand} ${product.product_name}`}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
              onError={() => {
                if (imgIdx < sources.length - 1) setImgIdx(imgIdx + 1);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif italic text-ink/40 text-xs">
              {product.brand}
            </div>
          )}
          <span className="absolute top-2 left-2 text-[0.55rem] tracking-[0.2em] uppercase bg-ivory/90 px-1.5 py-0.5 text-ink/60">
            {product.slot_label}
          </span>
        </div>
      </a>
      <div className="mt-3 space-y-0.5">
        <p className="font-display text-sm tracking-[0.05em] uppercase">{product.brand}</p>
        <p className="font-serif italic text-ink/70 text-sm truncate">{product.product_name}</p>
        <div className="flex items-baseline justify-between gap-2 mt-1.5">
          <p className="text-[0.7rem] text-ink/55">{product.retailer ?? "—"}</p>
          <p className="font-mono text-sm text-ink/80">
            {product.price != null ? `${product.currency === "USD" || !product.currency ? "$" : product.currency + " "}${Math.round(product.price)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 text-[0.55rem] tracking-[0.18em] uppercase">
          <span
            className={`px-1.5 py-0.5 border ${product.has_backup ? "border-emerald-700 text-emerald-800" : "border-amber-700 text-amber-800"}`}
          >
            {product.has_backup ? "Backup ✓" : "No backup"}
          </span>
          {product.ai_replacements.length > 0 && (
            <button
              onClick={() => setShowAlts((v) => !v)}
              className="ml-auto text-ink/60 hover:text-ink underline-offset-2 hover:underline tracking-[0.18em]"
            >
              {showAlts ? "Hide" : "If this sells out"}
            </button>
          )}
        </div>

        {showAlts && (
          <div className="mt-3 border-t border-ink/10 pt-3 space-y-2">
            {product.ai_replacements.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 items-center text-xs hover:bg-cream/30 -mx-1 px-1 py-1"
              >
                {r.image_url ? (
                  <img src={r.image_url} alt="" className="w-10 h-12 object-cover bg-cream/40" loading="lazy" />
                ) : (
                  <div className="w-10 h-12 bg-cream/40" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-display tracking-[0.04em] truncate">{r.brand}</p>
                  <p className="font-serif italic text-ink/60 truncate">{r.product_name}</p>
                </div>
                <p className="font-mono text-ink/70">
                  {r.price != null ? `$${Math.round(r.price)}` : ""}
                </p>
              </a>
            ))}
            {fallbackUrls.length > 0 && (
              <div className="flex gap-3 text-[0.6rem] tracking-[0.18em] uppercase text-ink/55 pt-1">
                {product.brand_fallback_url && (
                  <a href={product.brand_fallback_url} target="_blank" rel="noopener noreferrer" className="underline">
                    Search {product.brand}
                  </a>
                )}
                {product.category_fallback_url && (
                  <a href={product.category_fallback_url} target="_blank" rel="noopener noreferrer" className="underline">
                    Browse category
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}