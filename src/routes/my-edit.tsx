import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { canRenderProductImage } from "@/lib/product-image-policy";
import {
  useMyEdit,
  removeLook,
  removeProduct,
  trackMyEditEvent,
  type SavedLook,
  type SavedProduct,
} from "@/lib/myEdit";

export const Route = createFileRoute("/my-edit")({
  head: () => ({
    meta: [
      { title: "My Edit — Your Personal Resort Edit" },
      {
        name: "description",
        content:
          "Your personal collection of Resort Edit destination looks. Save complete editorial looks and return whenever you're planning your next escape.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "My Edit — Resort Edit" },
      {
        property: "og:description",
        content: "Your personal Resort Edit — destination dressing, edited.",
      },
    ],
  }),
  component: MyEditPage,
});

type Tab = "looks" | "products";

function MyEditPage() {
  const { looks, products } = useMyEdit();
  const [tab, setTab] = useState<Tab>("looks");

  useEffect(() => {
    trackMyEditEvent("view_my_edit", {
      looks_count: looks.length,
      products_count: products.length,
    });
    // intentionally fire once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-12 md:pt-20 pb-8">
        <p className="eyebrow text-[0.62rem] tracking-[0.34em] text-gold">Resort Edit</p>
        <h1 className="font-display text-4xl md:text-6xl tracking-[0.04em] mt-3 leading-[1.04]">
          My Edit
        </h1>
        <p className="font-serif italic text-ink/70 mt-4 max-w-2xl text-[1.05rem]">
          Your personal Resort Edit — a private library of destination looks and the
          pieces you love.
        </p>

        <div className="mt-10 flex items-end gap-8 border-b border-ink/10">
          <TabButton active={tab === "looks"} onClick={() => setTab("looks")}>
            Looks{" "}
            <span className="ml-2 font-mono text-[0.8rem] text-ink/45">{looks.length}</span>
          </TabButton>
          <TabButton active={tab === "products"} onClick={() => setTab("products")}>
            Products{" "}
            <span className="ml-2 font-mono text-[0.8rem] text-ink/45">{products.length}</span>
          </TabButton>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-24">
        {tab === "looks" ? <LooksGrid looks={looks} /> : <ProductsGrid products={products} />}
      </section>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-3 eyebrow text-[0.7rem] tracking-[0.3em] uppercase transition-colors ${
        active
          ? "text-ink border-b-2 border-gold -mb-px"
          : "text-ink/50 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function LooksEmpty() {
  return (
    <div className="mt-16 md:mt-24 mx-auto max-w-2xl text-center">
      <Bookmark className="w-8 h-8 mx-auto text-gold/70" strokeWidth={1.5} />
      <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] mt-6">
        Your Edit is waiting.
      </h2>
      <p className="font-serif italic text-ink/70 mt-4 text-[1.05rem]">
        Save the looks you love and return to them whenever you're planning your
        next destination.
      </p>
      <Link
        to="/destinations"
        className="mt-8 inline-block bg-ink text-ivory px-7 py-3.5 eyebrow text-[0.7rem] tracking-[0.28em] uppercase hover:bg-gold transition-colors"
      >
        Explore Destinations
      </Link>
    </div>
  );
}

function LooksGrid({ looks }: { looks: SavedLook[] }) {
  if (looks.length === 0) return <LooksEmpty />;
  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
      {looks.map((l) => (
        <SavedLookCard key={l.id} look={l} />
      ))}
    </div>
  );
}

function SavedLookCard({ look }: { look: SavedLook }) {
  return (
    <article className="group flex flex-col bg-ivory border border-border/60">
      <a
        href={look.url}
        onClick={() =>
          trackMyEditEvent("view_saved_look", {
            look_id: look.id,
            destination: look.destination,
            activity: look.activity,
            source: "my_edit",
          })
        }
        className="block relative aspect-[4/5] overflow-hidden bg-cream/40"
      >
        {look.image && canRenderProductImage(look.image) ? (
          <img
            src={look.image}
            alt={look.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-serif italic text-ink/40">
            {look.destination}
          </div>
        )}
        <span className="absolute top-3 left-3 eyebrow text-[0.55rem] tracking-[0.3em] bg-ivory/95 text-ink px-2 py-1">
          {look.destination.toUpperCase()}
        </span>
      </a>
      <div className="p-5 flex flex-col flex-1">
        <p className="eyebrow text-[0.6rem] tracking-[0.28em] text-gold">{look.activity}</p>
        <h3 className="font-display text-xl tracking-[0.04em] text-ink leading-tight mt-2">
          {look.title}
        </h3>
        {look.description && (
          <p className="font-serif italic text-ink/70 text-[0.92rem] mt-2 leading-relaxed line-clamp-3 flex-1">
            {look.description}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-ink/10">
          <a
            href={look.url}
            onClick={() =>
              trackMyEditEvent("shop_this_look_from_my_edit", {
                look_id: look.id,
                destination: look.destination,
                activity: look.activity,
              })
            }
            className="eyebrow text-[0.62rem] tracking-[0.3em] text-ink border-b border-gold/60 hover:border-ink pb-0.5"
          >
            Shop This Look
          </a>
          <button
            type="button"
            onClick={() => removeLook(look.id, "my_edit")}
            aria-label="Remove from My Edit"
            className="inline-flex items-center gap-1.5 text-ink/45 hover:text-ink eyebrow text-[0.58rem] tracking-[0.26em]"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductsEmpty() {
  return (
    <div className="mt-16 md:mt-24 mx-auto max-w-xl text-center">
      <h2 className="font-display text-2xl md:text-3xl tracking-[0.04em]">
        No saved products yet.
      </h2>
      <p className="font-serif italic text-ink/70 mt-3">
        Individual pieces you save will appear here. Editorial looks remain the heart of
        your Edit.
      </p>
      <Link
        to="/destinations"
        className="mt-7 inline-block eyebrow text-[0.7rem] tracking-[0.28em] uppercase text-ink border-b border-gold/60 hover:border-ink pb-1"
      >
        Browse Destinations
      </Link>
    </div>
  );
}

function ProductsGrid({ products }: { products: SavedProduct[] }) {
  if (products.length === 0) return <ProductsEmpty />;
  return (
    <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
      {products.map((p) => {
        const showImage = !!p.image && canRenderProductImage(p.image);
        return (
        <article key={p.id} className="group flex flex-col">
          {showImage ? (
          <a
            href={p.url ?? "#"}
            target={p.url ? "_blank" : undefined}
            rel={p.url ? "noopener noreferrer" : undefined}
            onClick={() =>
              trackMyEditEvent("click_saved_product", {
                product_id: p.id,
                brand: p.brand,
              })
            }
            className="relative aspect-[3/4] bg-cream/40 overflow-hidden"
          >
            <img
              src={p.image!}
              alt={`${p.brand} ${p.name}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </a>
          ) : null}
          <p className="eyebrow tracking-[0.26em] text-[0.58rem] text-gold mt-3">
            {p.brand.toUpperCase()}
          </p>
          <p className="font-serif text-[0.95rem] text-ink leading-snug mt-1 line-clamp-2">
            {p.name}
          </p>
          {p.price && (
            <p className="font-serif text-[0.88rem] text-ink/70 mt-1">{p.price}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            {p.url ? (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackMyEditEvent("click_saved_product", {
                    product_id: p.id,
                    brand: p.brand,
                  })
                }
                className="eyebrow text-[0.58rem] tracking-[0.26em] text-ink border-b border-gold/60 hover:border-ink pb-0.5"
              >
                Shop
              </a>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => removeProduct(p.id, "my_edit")}
              aria-label="Remove product"
              className="text-ink/40 hover:text-ink"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </article>
        );
      })}
    </div>
  );
}