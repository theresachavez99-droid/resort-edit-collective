import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { portofinoLooks, resolveProductLink, type ShopItem, type Look } from "@/data/portofino";
import { trackOutbound } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site";
import heroYacht from "@/assets/look-yacht.jpg";
import heroBeach from "@/assets/look-beach.jpg";
import heroDayclub from "@/assets/look-dayclub.jpg";
import heroDinner from "@/assets/look-dinner.jpg";
import heroTown from "@/assets/look-town.jpg";
import expYacht from "@/assets/exp-yacht-charter.jpg";
import expHarbor from "@/assets/exp-harbor-golden.jpg";
import expCruise from "@/assets/exp-sunset-cruise.jpg";
import expCooking from "@/assets/exp-cooking-class.jpg";
import expWine from "@/assets/exp-wine-tasting.jpg";
import expAbbey from "@/assets/exp-san-fruttuoso.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelSplendidoMare from "@/assets/hotel-splendido-mare.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import d1a from "@/assets/edit-d1-a.jpg";
import d1b from "@/assets/edit-d1-b.jpg";
import d1c from "@/assets/edit-d1-c.jpg";
import d2a from "@/assets/edit-d2-a.jpg";
import d2b from "@/assets/edit-d2-b.jpg";
import d2c from "@/assets/edit-d2-c.jpg";
import d3a from "@/assets/edit-d3-a.jpg";
import d3b from "@/assets/edit-d3-b.jpg";
import d3c from "@/assets/edit-d3-c.jpg";
import d4a from "@/assets/edit-d4-a.jpg";
import d4b from "@/assets/edit-d4-b.jpg";
import d4c from "@/assets/edit-d4-c.jpg";
import d5a from "@/assets/edit-d5-a.jpg";
import d5b from "@/assets/edit-d5-b.jpg";
import d5c from "@/assets/edit-d5-c.jpg";

export type DaySlug = "day-1" | "day-2" | "day-3" | "day-4" | "day-5";

export const DAY_META: Record<DaySlug, {
  dayKey: string;
  title: string;
  caption: string;
  hero: string;
  heroPos: string;
  editorial: { palette: string; silhouette: string; textures: string; mood: string };
  tagline: string;
  images: [string, string, string];
  lookTitles: [string, string, string];
  lookMoods: [string, string, string];
  inspired: [
    { palette: string; silhouette: string; textures: string; mood: string },
    { palette: string; silhouette: string; textures: string; mood: string },
    { palette: string; silhouette: string; textures: string; mood: string },
  ];
}> = {
  "day-1": {
    dayKey: "Day 1",
    title: "Day 1 · Yacht Day & Harbor Aperitivo",
    caption: "Open water, tan lines and hidden coves.",
    hero: heroYacht,
    heroPos: "50% 18%",
    editorial: {
      palette: "Marine navy, crisp white, raffia tan",
      silhouette: "Tailored shorts, halter knit, easy maxi",
      textures: "Crisp poplin, fine knit, woven raffia",
      mood: "Yacht-deck glamour with sun on your shoulders.",
    },
    tagline: "Blue-and-white yacht glamour with raffia textures.",
    images: [d1a, d1b, d1c],
    lookTitles: ["Harbor Hero", "Riviera Lunch", "Riviera Daywear"],
    lookMoods: [
      "Sun-drenched deck dressing for the slow cruise out of the bay.",
      "Italian Riviera lunch energy with effortless polish.",
      "Easy, sun-warmed pieces for the walk back into town.",
    ],
    inspired: [
      { palette: "Navy + ivory", silhouette: "Halter + tailored short", textures: "Poplin, fine knit", mood: "Deck-side polish" },
      { palette: "White on white", silhouette: "Easy midi", textures: "Linen, raffia", mood: "Harbor lunch" },
      { palette: "Cream + tan", silhouette: "Sun dress", textures: "Cotton voile, leather", mood: "Walk back to town" },
    ],
  },
  "day-2": {
    dayKey: "Day 2",
    title: "Day 2 · Beach Club Lunch",
    caption: "Slow mornings, long lunches, seaside glamour.",
    hero: heroBeach,
    heroPos: "50% 12%",
    editorial: {
      palette: "Sun-bleached ivory, lemon, soft sand",
      silhouette: "Crochet set, fluid maxi, breezy linen",
      textures: "Crochet, linen, sun-warmed cotton",
      mood: "Cabana ease, long lunches, salt in the air.",
    },
    tagline: "Sun-bleached cabana ease with linen and crochet.",
    images: [d2a, d2b, d2c],
    lookTitles: ["Cabana Statement", "Long-Lunch Linen", "Seaside Easy"],
    lookMoods: [
      "Beach-club polish for the cabana you booked weeks ago.",
      "Pressed linen and quiet luxury at the long table.",
      "Sandy-foot ease for the walk back to the hotel.",
    ],
    inspired: [
      { palette: "Ivory + lemon", silhouette: "Crochet set", textures: "Crochet, raffia", mood: "Cabana polish" },
      { palette: "Sand neutrals", silhouette: "Pressed linen maxi", textures: "Linen, leather", mood: "Long-lunch quiet luxury" },
      { palette: "White + tan", silhouette: "Easy slip", textures: "Cotton voile", mood: "Sandy-foot ease" },
    ],
  },
  "day-3": {
    dayKey: "Day 3",
    title: "Day 3 · Day Club & Shopping",
    caption: "Poolside ease, via Roma, Capri luxe.",
    hero: heroDayclub,
    heroPos: "50% 15%",
    editorial: {
      palette: "Soft neutrals, blush, gold accents",
      silhouette: "Slip dress, tailored short, knit set",
      textures: "Silk, fine knit, soft leather",
      mood: "Piazzetta polish, window-shopping in gold light.",
    },
    tagline: "Piazzetta polish in soft neutrals and gold light.",
    images: [d3a, d3b, d3c],
    lookTitles: ["Piazzetta Polish", "Via Roma Wander", "Aperitivo Casual"],
    lookMoods: [
      "Poolside-to-piazzetta polish with editorial restraint.",
      "Window-shopping the boutiques in soft, sun-bleached neutrals.",
      "Golden-hour aperitivo, low-key but considered.",
    ],
    inspired: [
      { palette: "Blush + gold", silhouette: "Silk slip", textures: "Silk, gold", mood: "Piazzetta polish" },
      { palette: "Sun-bleached neutrals", silhouette: "Knit set", textures: "Fine knit, leather", mood: "Via Roma wander" },
      { palette: "Cream + cognac", silhouette: "Tailored short", textures: "Cotton, leather", mood: "Aperitivo hour" },
    ],
  },
  "day-4": {
    dayKey: "Day 4",
    title: "Day 4 · Dinner & Sunset",
    caption: "Golden hour, candlelight, harbor glow.",
    hero: heroDinner,
    heroPos: "50% 22%",
    editorial: {
      palette: "Sunset orange, burnt amber, candle gold",
      silhouette: "Sculptural dress, fluid gown, cocktail midi",
      textures: "Satin, silk, fine knit",
      mood: "Harborfront glamour at golden hour.",
    },
    tagline: "Harbor glamour with warm sunset dressing.",
    images: [d4a, d4b, d4c],
    lookTitles: ["Sunset Showstopper", "Candlelit Cocktail", "Waterfront Dinner"],
    lookMoods: [
      "The dress everyone remembers, walking in at golden hour.",
      "Candlelit cocktail dressing, sculptural and quiet.",
      "Harborfront dinner — relaxed elegance, no effort visible.",
    ],
    inspired: [
      { palette: "Sunset orange", silhouette: "Fluid gown", textures: "Satin, silk", mood: "Golden-hour entrance" },
      { palette: "Amber + gold", silhouette: "Sculptural midi", textures: "Silk, metal", mood: "Candlelit cocktail" },
      { palette: "Warm neutral", silhouette: "Slip dress", textures: "Silk, fine knit", mood: "Harborfront ease" },
    ],
  },
  "day-5": {
    dayKey: "Day 5",
    title: "Day 5 · Espresso & A Long Last Lunch",
    caption: "Espresso rituals and one last long lunch.",
    hero: heroTown,
    heroPos: "50% 20%",
    editorial: {
      palette: "Espresso brown, cream, vintage gold",
      silhouette: "Easy trouser, breezy blouse, sun dress",
      textures: "Cotton, silk, leather",
      mood: "Slow Italian morning, espresso in hand.",
    },
    tagline: "Slow Italian mornings in espresso, cream and gold.",
    images: [d5a, d5b, d5c],
    lookTitles: ["Last-Day Luxe", "Market Morning", "Coastal Farewell"],
    lookMoods: [
      "Travel-day dressing that still photographs beautifully.",
      "Slow market morning, espresso in hand.",
      "One last lunch by the water before the boat home.",
    ],
    inspired: [
      { palette: "Cream + gold", silhouette: "Tailored set", textures: "Cotton, silk", mood: "Travel-day polish" },
      { palette: "Espresso + ivory", silhouette: "Breezy blouse + trouser", textures: "Cotton, leather", mood: "Slow market morning" },
      { palette: "Sun-bleached white", silhouette: "Easy sun dress", textures: "Linen, raffia", mood: "Last lunch by the water" },
    ],
  },
};

const DAY_ORDER: DaySlug[] = ["day-1", "day-2", "day-3", "day-4", "day-5"];

function isDaySlug(s: string): s is DaySlug {
  return (DAY_ORDER as string[]).includes(s);
}

export const Route = createFileRoute("/portofino/day-{$day}")({
  beforeLoad: ({ params }) => {
    if (!isDaySlug(`day-${params.day}`)) throw notFound();
  },
  head: ({ params }) => {
    const slug = `day-${params.day}` as DaySlug;
    const meta = DAY_META[slug];
    const title = meta
      ? `${meta.title} — 5 Days in Portofino | Resort Edit`
      : "Portofino | Resort Edit";
    const description = meta?.caption ?? "5 Days in Portofino — Resort Edit.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: absoluteUrl(portofinoImg) },
        { property: "og:url", content: absoluteUrl(`/portofino/${slug}`) },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(`/portofino/${slug}`) }],
    };
  },
  component: PortofinoDayPage,
});

function PortofinoDayPage() {
  const { day } = Route.useParams();
  const slug = `day-${day}` as DaySlug;
  const meta = DAY_META[slug];
  const look = portofinoLooks.find((l) => l.day === meta.dayKey);
  if (!look) throw notFound();

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-ink">
        <img
          src={meta.hero}
          alt={meta.title}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: meta.heroPos }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/65" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-14 md:pb-20 text-ivory">
          <span className="eyebrow text-ivory/80 tracking-[0.4em]">The Resort Edit · Portofino</span>
          <h1 className="font-display text-4xl md:text-6xl mt-6 tracking-[0.04em] leading-[1.05] max-w-4xl">
            {meta.title}
          </h1>
          <div className="mx-auto my-6 h-px w-16 bg-gold/80" />
          <p className="font-serif italic text-lg md:text-xl text-ivory/85 max-w-2xl leading-relaxed">
            {meta.caption}
          </p>
        </div>
      </section>

      {/* EDITORIAL REFERENCE CARD */}
      <EditorialReferenceCard
        image={meta.hero}
        imagePos={meta.heroPos}
        dayKey={meta.dayKey}
        tagline={meta.tagline}
        palette={meta.editorial.palette}
        silhouette={meta.editorial.silhouette}
        textures={meta.editorial.textures}
      />

      {/* LOOK MODULES */}
      <section className="bg-ivory pt-16 md:pt-20 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl px-6 space-y-32 md:space-y-40">
          {[0, 1, 2].map((i) => (
            <LookModule
              key={i}
              look={look}
              index={i as 0 | 1 | 2}
              image={meta.images[i]}
              title={meta.lookTitles[i]}
              mood={meta.lookMoods[i]}
              dayLabel={meta.dayKey}
              inspired={meta.inspired[i]}
              referenceImage={meta.hero}
              referencePos={meta.heroPos}
            />
          ))}
        </div>
      </section>

      {/* DAY NAVIGATION */}
      <section className="bg-cream border-y border-border/40 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="eyebrow text-gold tracking-[0.4em]">Continue The Edit</span>
          <div className="mx-auto my-6 h-px w-12 bg-gold" />
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {DAY_ORDER.filter((d) => d !== slug).map((d, idx) => {
              const m = DAY_META[d];
              const isNext = DAY_ORDER.indexOf(d) === DAY_ORDER.indexOf(slug) + 1;
              return (
                <Link
                  key={d}
                  to="/portofino/day-{$day}"
                  params={{ day: d.replace("day-", "") }}
                  className="group inline-flex flex-col items-center"
                >
                  <span className="eyebrow text-[0.6rem] tracking-[0.4em] text-ink/55 group-hover:text-gold transition-colors">
                    {isNext ? "Continue to" : "View"}
                  </span>
                  <span className="font-display text-xl md:text-2xl tracking-wide mt-2 text-ink group-hover:text-gold transition-colors">
                    {m.dayKey}
                    {idx === 0 && isNext ? " →" : ""}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function LookModule({
  look,
  index,
  image,
  title,
  mood,
  dayLabel,
  inspired,
  referenceImage,
  referencePos,
}: {
  look: Look;
  index: 0 | 1 | 2;
  image: string;
  title: string;
  mood: string;
  dayLabel: string;
  inspired: { palette: string; silhouette: string; textures: string; mood: string };
  referenceImage: string;
  referencePos: string;
}) {
  // Live items: real affiliate URLs OR explicit not_available placeholders.
  const liveItems = look.shop.filter(
    (i) => i.not_available || resolveProductLink(i) !== null,
  );
  const lookNum = (index + 1) as 1 | 2 | 3;
  const tagged = liveItems.filter((i) => i.lookIndex === lookNum);

  // Fallback: price-tier split for any day not yet explicitly tagged.
  const parsePrice = (p: string) => Number(p.replace(/[^0-9.]/g, "")) || 0;
  const untagged = liveItems.filter((i) => !i.lookIndex);
  const sortedDesc = [...untagged].sort(
    (a, b) => parsePrice(b.price) - parsePrice(a.price),
  );
  const third = Math.ceil(sortedDesc.length / 3) || 1;
  const fallback: ShopItem[][] = [
    sortedDesc.slice(0, third),
    sortedDesc.slice(third, third * 2),
    sortedDesc.slice(third * 2),
  ];
  const items: ShopItem[] = tagged.length ? tagged : (fallback[index] ?? []);

  return (
    <article>
      <header className="mb-8 md:mb-10">
        <span className="eyebrow text-gold tracking-[0.4em] text-[0.65rem]">
          {dayLabel.toUpperCase()} · LOOK {lookNum}
        </span>
        <h3 className="font-display text-3xl md:text-4xl tracking-[0.04em] mt-4">
          {title}
        </h3>
        <p className="font-serif italic text-base md:text-lg text-ink/65 mt-3 max-w-2xl leading-relaxed">
          {mood}
        </p>
        <div className="mt-5 h-px w-12 bg-gold" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 lg:gap-12 items-start">
        {/* LEFT 40% — model image */}
        <div className="lg:col-span-4">
          <div className="relative overflow-hidden bg-muted aspect-[3/4] lg:sticky lg:top-6">
            <img
              src={image}
              alt={`${dayLabel} ${title}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-ivory/95 text-ink eyebrow px-3 py-1.5 tracking-[0.3em] text-[0.55rem]">
              {dayLabel} · Look {lookNum}
            </div>
            {/* Inspired-By thumbnail — top-right */}
            <div className="absolute top-3 right-3 flex flex-col items-end">
              <span className="eyebrow text-[0.5rem] tracking-[0.32em] text-ivory bg-ink/70 px-2 py-1 mb-1">
                Inspired By
              </span>
              <div className="relative w-14 h-14 md:w-16 md:h-16 overflow-hidden border-2 border-ivory shadow-lg bg-muted">
                <img
                  src={referenceImage}
                  alt="Editorial reference"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: referencePos }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 60% — cues + product grid */}
        <div className="lg:col-span-6">
          <div className="border border-gold/30 bg-cream/60 p-4 mb-6">
            <div className="eyebrow text-gold text-[0.55rem] tracking-[0.35em]">Inspired By</div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-serif text-[0.78rem] text-ink/75 leading-snug">
              <div><span className="text-ink/50">Palette · </span>{inspired.palette}</div>
              <div><span className="text-ink/50">Silhouette · </span>{inspired.silhouette}</div>
              <div><span className="text-ink/50">Textures · </span>{inspired.textures}</div>
              <div><span className="text-ink/50">Mood · </span>{inspired.mood}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {items.map((item, k) => (
              <ProductCardCompact key={`${item.brand}-${item.item}-${k}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function CueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 items-baseline">
      <dt className="eyebrow text-gold text-[0.6rem] tracking-[0.35em]">{label}</dt>
      <dd className="font-serif text-ink/80 text-base leading-relaxed">{value}</dd>
    </div>
  );
}

function EditorialReferenceCard({
  image,
  imagePos,
  dayKey,
  tagline,
  palette,
  silhouette,
  textures,
}: {
  image: string;
  imagePos: string;
  dayKey: string;
  tagline: string;
  palette: string;
  silhouette: string;
  textures: string;
}) {
  return (
    <section className="bg-cream border-y border-border/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 md:gap-14 items-center">
          <figure className="relative aspect-[4/5] overflow-hidden bg-muted">
            <img
              src={image}
              alt={`${dayKey} editorial reference`}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: imagePos }}
            />
            <figcaption className="absolute top-4 left-4 bg-ivory/95 text-ink eyebrow px-3 py-1.5 tracking-[0.3em] text-[0.55rem]">
              {dayKey} · Reference
            </figcaption>
          </figure>
          <div>
            <span className="eyebrow text-gold tracking-[0.42em] text-[0.7rem]">
              Editorial Reference
            </span>
            <h2 className="font-display text-3xl md:text-5xl mt-5 tracking-[0.04em] leading-[1.05]">
              Three Ways To Wear The Mood
            </h2>
            <div className="mt-5 h-px w-16 bg-gold" />
            <p className="font-serif italic text-xl md:text-2xl text-ink/80 leading-relaxed mt-6 max-w-xl">
              {tagline}
            </p>
            <dl className="mt-8 space-y-4 border-t border-border/60 pt-6 max-w-xl">
              <CueRow label="Palette" value={palette} />
              <CueRow label="Silhouette" value={silhouette} />
              <CueRow label="Textures" value={textures} />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCardCompact({ item }: { item: ShopItem }) {
  if (item.not_available) {
    return (
      <div
        className="group flex flex-col bg-ivory border border-border/60 h-full"
        aria-disabled="true"
      >
        <div className="relative aspect-square overflow-hidden bg-cream flex items-center justify-center px-3 text-center">
          {item.category && (
            <span className="absolute top-2 left-2 eyebrow text-[0.5rem] tracking-[0.3em] text-gold/80">
              {item.category}
            </span>
          )}
          <span className="font-serif italic text-ink/60 text-[0.72rem] leading-snug">
            {item.brand} — {item.item}
          </span>
        </div>
        <div className="flex flex-col flex-1 p-3">
          {item.category && (
            <div className="eyebrow text-ink/50 text-[0.5rem] tracking-[0.3em]">
              {item.category}
            </div>
          )}
          <div className="eyebrow text-ink text-[0.5rem] tracking-[0.3em] mt-1">
            {item.brand}
          </div>
          <div className="font-serif italic text-ink/85 text-[0.82rem] leading-snug mt-1">
            {item.item}
          </div>
          <div className="mt-auto pt-3">
            <span className="eyebrow text-[0.55rem] tracking-[0.35em] text-ink/55">
              Not available through approved affiliate partners
            </span>
          </div>
        </div>
      </div>
    );
  }

  const href = resolveProductLink(item)!;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackOutbound({ brand: item.brand, item: item.item, href })}
      className="group flex flex-col bg-ivory border border-border/60 hover:border-gold transition-colors h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-cream flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={`${item.brand} ${item.item}`}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-3">
            <span className="eyebrow text-[0.5rem] tracking-[0.3em] text-gold/80 mb-1.5">
              {item.brand}
            </span>
            <span className="font-serif italic text-ink/60 text-[0.72rem] leading-snug">
              {item.item}
            </span>
          </div>
        )}
        {item.replaced && (
          <span className="absolute top-1.5 left-1.5 eyebrow text-[0.5rem] tracking-[0.2em] text-gold bg-ivory/90 border border-gold/50 px-1 py-px">
            Updated
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3">
        {item.category && (
          <div className="eyebrow text-gold text-[0.5rem] tracking-[0.3em] mb-1">
            {item.category}
          </div>
        )}
        <div className="eyebrow text-ink text-[0.5rem] tracking-[0.3em]">
          {item.brand}
        </div>
        <div className="font-serif italic text-ink/90 text-[0.85rem] leading-snug mt-1">
          {item.item}
        </div>
        <div className="font-serif text-gold text-[0.85rem] mt-1">
          {item.price}
        </div>
        <div className="mt-auto pt-3">
          <span className="eyebrow text-[0.55rem] tracking-[0.35em] text-ink group-hover:text-gold transition-colors">
            Shop →
          </span>
        </div>
      </div>
    </a>
  );
}