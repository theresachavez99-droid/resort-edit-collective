import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { portofinoLooks, itinerary, travelTips, whereToStay } from "@/data/portofino";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import portofinoImg from "@/assets/dest-portofino.jpg";
import stillLife from "@/assets/portofino-stilllife.jpg";
import lookA from "@/assets/edit-d2-a.jpg";
import lookB from "@/assets/edit-d4-a.jpg";
import lookC from "@/assets/edit-d1-a.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";
import { Anchor, Umbrella, Camera, Compass } from "lucide-react";
import yachtImg from "@/assets/look-yacht.jpg";
import beachImg from "@/assets/look-beach.jpg";
import dayclubImg from "@/assets/look-dayclub.jpg";
import dinnerImg from "@/assets/look-dinner.jpg";
import townImg from "@/assets/look-town.jpg";

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

const STATS = [
  { label: "Best For", value: "Coastal Glamour" },
  { label: "Best Season", value: "May – September" },
  { label: "Vibe", value: "Italian Riviera" },
  { label: "Trip Length", value: "5 Days" },
  { label: "Edits Available", value: "5 Looks" },
];

const SNAPSHOT = {
  tripLength: "4 – 6 days",
  styleKeywords: ["Silk caftans", "Linen sets", "Gold hoops", "Espadrilles"],
  aesthetic: "Pastel palazzi, harbor whites, sun-bleached gold.",
  essentials: ["Swim cover-up", "Sandals for cobblestones", "Wrap dress", "Statement sunglasses"],
  vibe: "Italian Riviera Glamour · Harbor Aperitivos · Coastal Escapes",
};

const TIPS: Record<string, { kind: string; text: string }> = {
  "Day 1": { kind: "Resort Edit Tip", text: "Charter from Marina di Portofino — request a 10am cast-off to beat the day-trip crowd." },
  "Day 2": { kind: "Reservations Needed", text: "La Fontelina cabanas book out months ahead in July & August. Email, don't call." },
  "Day 3": { kind: "What Locals Wear", text: "Via Roma after 6pm is a parade. Trade flats for a low heel and a silk slip." },
  "Day 4": { kind: "Best Photo Spot", text: "The terrace at La Terrazza, twenty minutes before sunset. Ask for table 4." },
  "Day 5": { kind: "Cabana Advice", text: "Catch the 9:15 boat to San Fruttuoso — quieter than any later crossing." },
};

const TIER_LABEL: Record<string, string> = {
  "Signature Experience": "Designer",
  "Elevated Find": "Mid-Luxe",
  "Riviera Find": "Riviera Finds",
};

const DAY_SLUGS = portofinoLooks.map((l) => l.day.toLowerCase().replace(" ", "-"));

function splitItinerary(text: string): { morning: string; afternoon: string; evening: string } {
  const parts = text
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const third = Math.max(1, Math.ceil(parts.length / 3));
  const morning = parts.slice(0, third).join(". ");
  const afternoon = parts.slice(third, third * 2).join(". ");
  const evening = parts.slice(third * 2).join(". ");
  return {
    morning: morning ? morning + (morning.endsWith(".") ? "" : ".") : "",
    afternoon: afternoon ? afternoon + (afternoon.endsWith(".") ? "" : ".") : "",
    evening: evening ? evening + (evening.endsWith(".") ? "" : ".") : "",
  };
}

type TierKey = "Designer" | "Mid-Luxe" | "Riviera Finds";

function bucketShop(shop: ReturnType<typeof Number> extends never ? never : (typeof portofinoLooks)[number]["shop"]) {
  const buckets: Record<TierKey, typeof shop> = {
    Designer: [],
    "Mid-Luxe": [],
    "Riviera Finds": [],
  };
  shop.forEach((item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
    if (price >= 500) buckets.Designer.push(item);
    else if (price >= 200) buckets["Mid-Luxe"].push(item);
    else buckets["Riviera Finds"].push(item);
  });
  return buckets;
}

function PortofinoPage() {
  return (
    <div>
      <EditorialHero />
      <FiveDayGrid />
      <ShopTheLooks />
      <WhereToStay />
      <BookExperience />
      <StickyNav />
      <section className="bg-ivory">
        <div id="long-form" className="mx-auto max-w-7xl px-6 py-20 md:py-28 space-y-28 md:space-y-36">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow text-gold">The Long-Form Edit</span>
            <h2 className="font-display text-4xl md:text-5xl mt-3 tracking-wide">Day by day, in full.</h2>
            <p className="font-serif italic text-ink/65 mt-4 leading-relaxed">
              Five chapters. Every look, every reservation, every shoppable detail.
            </p>
          </div>
          {portofinoLooks.map((look, idx) => (
            <DayModule key={look.day} look={look} idx={idx} />
          ))}
        </div>
      </section>
      <GuideTabs />
      <JoinTheEdit />
    </div>
  );
}

const DAY_OVERVIEW = [
  { day: "DAY 1", title: "YACHT DAY &\nHARBOUR APERITIVO", caption: "Open water, hidden coves, and a night in Portofino.", image: "look-yacht" },
  { day: "DAY 2", title: "BEACH CLUB &\nLONG LUNCHES", caption: "Slow mornings, seafood lunches, seaside glamour.", image: "look-beach" },
  { day: "DAY 3", title: "POOL CLUB &\nSHOPPING", caption: "Poolside ease, via Roma, Capresi luxe.", image: "look-dayclub" },
  { day: "DAY 4", title: "SUNSET COCKTAILS\n& DINNER WITH A VIEW", caption: "Golden hour, candlelight, harbor glow.", image: "look-dinner" },
  { day: "DAY 5", title: "MARKET STROLLS &\nCOASTAL GOODBYES", caption: "Quiet rituals and a long last lunch.", image: "look-town" },
];

const DAY_IMG: Record<string, string> = {
  "look-yacht": yachtImg,
  "look-beach": beachImg,
  "look-dayclub": dayclubImg,
  "look-dinner": dinnerImg,
  "look-town": townImg,
};

function EditorialHero() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-7xl px-6 pt-6 md:pt-8 pb-10 md:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              <img
                src={portofinoImg}
                alt="Portofino harbor, woman in printed resort wear"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="lg:pt-10">
            <span className="eyebrow text-gold text-[11px] tracking-[0.3em]">
              A Style &amp; Itinerary Guide
            </span>
            <h1 className="font-display mt-6 leading-[0.92] tracking-[0.01em]">
              <span className="block text-4xl md:text-5xl text-ink">5 DAYS IN</span>
              <span className="block text-6xl md:text-8xl lg:text-[8.5rem] text-ink mt-1">
                PORTOFINO
              </span>
              <span className="font-script text-gold text-5xl md:text-7xl lg:text-[5.5rem] block mt-2 leading-[0.95]">
                La Dolce Vita
              </span>
            </h1>
            <p className="mt-10 font-sans uppercase tracking-[0.18em] text-ink text-sm md:text-base font-semibold leading-relaxed max-w-md">
              Luxury labels. Riviera finds.<br />Resort style across price points.
            </p>
            <p className="mt-5 font-serif text-ink/70 text-base md:text-lg leading-relaxed max-w-md">
              Curated from international resort favorites, quiet luxury labels, and vacation brands we love.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-ink/65 eyebrow text-[10px]">
              <span>Zimmermann</span><span className="text-ink/30">·</span>
              <span>Johanna Ortiz</span><span className="text-ink/30">·</span>
              <span>Sir</span><span className="text-ink/30">·</span>
              <span>Faithfull the Brand</span><span className="text-ink/30">·</span>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FiveDayGrid() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-7xl px-4 md:px-6 pb-10 md:pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {DAY_OVERVIEW.map((d, i) => (
            <a
              key={d.day}
              href={`#${DAY_SLUGS[i]}`}
              className="group block text-center bg-ivory border border-ink/15 hover:border-gold transition-colors pt-5 pb-6 px-4"
            >
              <div className="eyebrow text-ink text-[10px] tracking-[0.3em]">{d.day}</div>
              <h3 className="mt-3 font-sans font-semibold text-ink text-[12px] md:text-[13px] leading-snug tracking-[0.14em] uppercase whitespace-pre-line min-h-[2.6rem]">
                {d.title}
              </h3>
              <div className="mt-4 relative aspect-[3/4] overflow-hidden bg-parchment">
                <img
                  src={DAY_IMG[d.image]}
                  alt={d.title.replace(/\n/g, " ")}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mt-4 font-serif italic text-ink/75 text-sm leading-relaxed">
                {d.caption}
              </p>
              <span className="mt-4 inline-block eyebrow text-gold text-[10px] border-b border-gold pb-0.5 group-hover:text-ink group-hover:border-ink transition-colors">
                Explore the Look →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const SHOP_LOOKS = [
  { id: "A", name: "Lemon Print Set", image: lookA, href: "#day-2" },
  { id: "B", name: "Lace Chic", image: lookB, href: "#day-4" },
  { id: "C", name: "Blue Majolica Set", image: lookC, href: "#day-1" },
];

function ShopTheLooks() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-20 md:py-28">
        <div className="text-center mb-14 md:mb-20">
          <span className="eyebrow text-gold tracking-[0.32em]">Shoppable Editorial</span>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-ink mt-5 leading-[0.95]">
            Shop The Looks
          </h2>
          <p className="font-script text-gold text-4xl md:text-5xl mt-3 leading-none">
            three signature edits
          </p>
          <div className="mt-7 h-px w-24 bg-gold mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {SHOP_LOOKS.map((look) => (
            <a
              key={look.id}
              href={look.href}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-parchment">
                <img
                  src={look.image}
                  alt={`Look ${look.id} — ${look.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-0 left-0 bg-ink text-gold-soft eyebrow text-[11px] px-5 py-3 tracking-[0.32em]">
                  Look {look.id}
                </div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="font-display text-3xl md:text-4xl text-ink tracking-wide leading-tight">
                  {look.name}
                </h3>
                <span className="mt-4 inline-block eyebrow text-gold text-[11px] border-b border-gold pb-1 group-hover:text-ink group-hover:border-ink transition-colors">
                  Shop the Look →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const HOTEL_IMG: Record<string, string> = {
  splendido: hotelSplendido,
  eight: hotelEight,
  piccolo: hotelPiccolo,
};

function WhereToStay() {
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-20 md:py-28">
        <div className="text-center mb-14">
          <span className="eyebrow text-gold tracking-[0.32em]">The Address Book</span>
          <h2 className="font-display text-5xl md:text-7xl text-ink mt-5 leading-[0.95]">Where To Stay</h2>
          <div className="mt-6 h-px w-24 bg-gold mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {whereToStay.map((h) => (
            <article key={h.hotel_name} className="bg-ivory border border-ink/10 hover:border-gold transition-colors flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden bg-parchment">
                <img
                  src={HOTEL_IMG[h.image_url] ?? portofinoImg}
                  alt={h.hotel_name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6 md:p-7 flex flex-col flex-1">
                <div className="eyebrow text-gold text-[10px] tracking-[0.32em]">{h.destination}</div>
                <h3 className="font-display text-2xl md:text-3xl text-ink mt-3 leading-tight">{h.hotel_name}</h3>
                <p className="font-serif italic text-ink/75 text-[15px] mt-3 leading-relaxed flex-1">{h.description}</p>
                <a
                  href={h.affiliate_link || h.booking_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="mt-5 inline-block eyebrow text-gold text-[11px] border-b border-gold pb-1 hover:text-ink hover:border-ink transition-colors self-start"
                >
                  Book This Stay →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookExperience() {
  const ctas = [
    { icon: Anchor, label: "Book a Yacht", href: "#day-1" },
    { icon: Umbrella, label: "Reserve a Beach Club", href: "#day-2" },
    { icon: Camera, label: "Book a Tour", href: "#day-5" },
    { icon: Compass, label: "View Experiences", href: "#travel-guide" },
  ];
  return (
    <section className="bg-ink text-ivory">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-14 md:py-16">
        <div className="text-center">
          <span className="eyebrow text-gold tracking-[0.32em]">Reserve Your Stay</span>
          <h2 className="font-display text-4xl md:text-5xl text-ivory mt-4 leading-tight">
            Book Your Portofino Experience
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {ctas.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="bg-gold text-ink hover:bg-ivory transition-colors py-6 px-4 flex items-center justify-center gap-3 eyebrow text-[11px] tracking-[0.2em]"
            >
              <c.icon className="h-5 w-5" />
              <span>{c.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
        <img
          src={portofinoImg}
          alt="Portofino harbor at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/20 to-ink/70" />
        <div className="relative h-full flex flex-col items-center justify-end text-center text-ivory px-6 pb-14 md:pb-20">
          <span className="eyebrow text-gold-soft">Destination Guide</span>
          <h1 className="font-display text-5xl md:text-8xl lg:text-9xl mt-5 tracking-[0.04em] leading-[0.95]">
            5 Days in Portofino
          </h1>
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gold-soft/60" />
            <span className="eyebrow text-ivory/80">Italian Riviera</span>
            <span className="h-px w-12 bg-gold-soft/60" />
          </div>
          <p className="font-serif italic text-lg md:text-2xl text-ivory/85 mt-8 max-w-2xl leading-relaxed">
            Curated escapes, destination-inspired style, and places worth dressing for.
          </p>
        </div>
      </div>
      <div className="bg-ink text-ivory">
        <div className="mx-auto max-w-7xl px-6 py-6 md:py-7 grid grid-cols-2 md:grid-cols-5 gap-y-5 gap-x-6 text-center divide-y md:divide-y-0 md:divide-x divide-ivory/10">
          {STATS.map((s) => (
            <div key={s.label} className="px-2 pt-5 md:pt-0">
              <div className="eyebrow text-gold-soft text-[10px]">{s.label}</div>
              <div className="font-serif italic text-base md:text-lg text-ivory mt-2">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SnapshotBar() {
  return (
    <section className="bg-cream/80 border-y border-ink/10">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-10 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10 items-start">
        <SnapshotCell label="Trip Length" value={SNAPSHOT.tripLength} />
        <SnapshotCell label="Signature Aesthetic" value={SNAPSHOT.aesthetic} italic />
        <div>
          <div className="eyebrow text-gold text-[10px]">Style Keywords</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {SNAPSHOT.styleKeywords.map((k) => (
              <span key={k} className="font-serif text-xs italic px-3 py-1 border border-ink/15 text-ink/75">{k}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="eyebrow text-gold text-[10px]">Packing Essentials</div>
          <ul className="mt-2 font-serif italic text-ink/75 text-sm space-y-1">
            {SNAPSHOT.essentials.map((e) => (
              <li key={e}>· {e}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-6 -mt-2 text-center">
        <p className="eyebrow text-ink/55 text-[10px] tracking-[0.3em]">{SNAPSHOT.vibe}</p>
      </div>
    </section>
  );
}

function SnapshotCell({ label, value, italic }: { label: string; value: string; italic?: boolean }) {
  return (
    <div>
      <div className="eyebrow text-gold text-[10px]">{label}</div>
      <p className={`mt-2 text-ink/80 ${italic ? "font-serif italic" : "font-serif"} text-base leading-relaxed`}>{value}</p>
    </div>
  );
}

function StickyNav() {
  return (
    <nav className="sticky top-[64px] z-30 bg-ivory/95 backdrop-blur border-b border-ink/10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
          {portofinoLooks.map((l, i) => (
            <a
              key={l.day}
              href={`#${DAY_SLUGS[i]}`}
              className="shrink-0 eyebrow text-[10px] px-4 py-2 border border-ink/20 text-ink/80 hover:bg-ink hover:text-ivory transition-colors whitespace-nowrap"
            >
              {l.day}
            </a>
          ))}
          <a
            href="#travel-guide"
            className="shrink-0 eyebrow text-[10px] px-4 py-2 border border-gold text-gold hover:bg-gold hover:text-ivory transition-colors whitespace-nowrap"
          >
            Travel Tips
          </a>
        </div>
      </div>
    </nav>
  );
}

function DayModule({ look, idx }: { look: (typeof portofinoLooks)[number]; idx: number }) {
  const pattern = idx % 3; // 0 = image left, 1 = image right, 2 = full-width
  const split = splitItinerary(look.itinerary);
  const tip = TIPS[look.day];
  const slug = DAY_SLUGS[idx];

  return (
    <article id={slug} className="scroll-mt-32">
      {pattern === 2 ? (
        <FullWidthLayout look={look} idx={idx} split={split} tip={tip} />
      ) : (
        <SplitLayout look={look} idx={idx} split={split} tip={tip} reverse={pattern === 1} />
      )}
    </article>
  );
}

function DayHeader({ look, idx }: { look: (typeof portofinoLooks)[number]; idx: number }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="eyebrow text-gold">{look.day}</span>
        <span className="h-px w-10 bg-gold/50" />
        <span className="eyebrow text-ink/50 text-[10px]">Chapter 0{idx + 1}</span>
      </div>
      <h2 className="font-display text-4xl md:text-6xl mt-5 tracking-wide leading-[1.05]">{look.title}</h2>
      <p className="font-serif italic text-lg md:text-xl text-ink/65 mt-4">{look.subtitle}</p>
    </div>
  );
}

function DayBody({
  look,
  split,
  tip,
}: {
  look: (typeof portofinoLooks)[number];
  split: ReturnType<typeof splitItinerary>;
  tip?: { kind: string; text: string };
}) {
  return (
    <div className="space-y-10">
      <p className="font-serif text-lg leading-relaxed text-ink/85">{look.caption}</p>

      {/* Morning / Afternoon / Evening */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-y border-ink/10 divide-y sm:divide-y-0 sm:divide-x divide-ink/10">
        {(["Morning", "Afternoon", "Evening"] as const).map((slot) => {
          const text = slot === "Morning" ? split.morning : slot === "Afternoon" ? split.afternoon : split.evening;
          if (!text) return null;
          return (
            <div key={slot} className="py-5 px-1 sm:px-5 first:pl-0 last:pr-0">
              <div className="eyebrow text-gold text-[10px]">{slot}</div>
              <p className="font-serif italic text-ink/75 text-sm mt-2 leading-relaxed">{text}</p>
            </div>
          );
        })}
      </div>

      {tip && <TipBox kind={tip.kind} text={tip.text} />}

      <ShopTheLook shop={look.shop} />
    </div>
  );
}

function SplitLayout({
  look,
  idx,
  split,
  tip,
  reverse,
}: {
  look: (typeof portofinoLooks)[number];
  idx: number;
  split: ReturnType<typeof splitItinerary>;
  tip?: { kind: string; text: string };
  reverse?: boolean;
}) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start ${reverse ? "lg:[&>div:first-child]:order-2" : ""}`}>
      <div className="lg:col-span-7">
        <div className="relative aspect-[4/5] lg:aspect-[5/6] overflow-hidden bg-muted">
          <img
            src={look.image}
            alt={`${look.title} editorial`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute top-5 left-5 bg-ivory/95 text-ink px-4 py-2 eyebrow text-[10px]">
            {look.day}
          </div>
        </div>
      </div>
      <div className="lg:col-span-5 lg:pt-6">
        <DayHeader look={look} idx={idx} />
        <div className="mt-8">
          <DayBody look={look} split={split} tip={tip} />
        </div>
      </div>
    </div>
  );
}

function FullWidthLayout({
  look,
  idx,
  split,
  tip,
}: {
  look: (typeof portofinoLooks)[number];
  idx: number;
  split: ReturnType<typeof splitItinerary>;
  tip?: { kind: string; text: string };
}) {
  return (
    <div>
      <div className="relative aspect-[21/9] overflow-hidden bg-muted">
        <img
          src={look.image}
          alt={`${look.title} editorial`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-ivory">
          <span className="eyebrow text-gold-soft">{look.day}</span>
          <h2 className="font-display text-3xl md:text-6xl mt-2 tracking-wide max-w-3xl leading-[1.05]">{look.title}</h2>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <span className="eyebrow text-gold">Chapter 0{idx + 1}</span>
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <p className="font-serif italic text-xl text-ink/70 mt-5 leading-relaxed">{look.subtitle}</p>
        </div>
        <div className="lg:col-span-7">
          <DayBody look={look} split={split} tip={tip} />
        </div>
      </div>
    </div>
  );
}

function TipBox({ kind, text }: { kind: string; text: string }) {
  return (
    <aside className="relative bg-ink text-ivory p-6 md:p-8 border-l-4 border-gold">
      <div className="eyebrow text-gold-soft text-[10px]">{kind}</div>
      <p className="font-serif italic text-ivory/90 mt-3 leading-relaxed text-base md:text-lg">{text}</p>
    </aside>
  );
}

function ShopTheLook({ shop }: { shop: (typeof portofinoLooks)[number]["shop"] }) {
  const buckets = bucketShop(shop);
  const tiers = (Object.keys(buckets) as TierKey[]).filter((t) => buckets[t].length > 0);
  const [active, setActive] = useState<TierKey>(tiers[0] ?? "Designer");
  const visible = (buckets[active] ?? []).slice(0, 4);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow text-gold text-[10px]">Shop the Look</div>
          <h3 className="font-display text-2xl md:text-3xl mt-2 tracking-wide">Wear it your way</h3>
        </div>
        <div className="flex gap-2">
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`eyebrow text-[10px] px-3 py-2 border transition-colors ${
                active === t ? "bg-ink text-ivory border-ink" : "border-ink/20 text-ink/70 hover:border-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
        {visible.map((item) => (
          <a
            key={item.item}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group block bg-ivory"
          >
            <div className="aspect-[3/4] overflow-hidden bg-cream">
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-cream to-ivory">
                <span className="font-display text-xl tracking-widest text-ink/30 text-center px-3 leading-snug">
                  {item.brand.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="pt-4 pb-2">
              <div className="eyebrow text-ink/90 text-[10px]">{item.brand}</div>
              <div className="font-serif italic text-ink/75 text-sm mt-1 leading-snug">{item.item}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-serif text-ink">{item.price}</span>
                <span className="eyebrow text-gold text-[10px] group-hover:text-ink transition-colors">Shop →</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function GuideTabs() {
  const allDining = portofinoLooks.flatMap((l) =>
    l.experiences
      .filter((e) => ["beach club", "wine tasting", "nightlife", "cooking class"].includes(e.category))
      .map((e) => ({ day: l.day, ...e })),
  );

  return (
    <section id="travel-guide" className="bg-cream/60 py-20 md:py-24 scroll-mt-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <span className="eyebrow text-gold">The Travel Guide</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 tracking-wide">Everything else you'll need</h2>
        </div>

        <Tabs defaultValue="itinerary" className="mt-12">
          <TabsList className="mx-auto flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0">
            {[
              { v: "itinerary", l: "Itinerary" },
              { v: "restaurants", l: "Restaurants" },
              { v: "tips", l: "Travel Tips" },
              { v: "packing", l: "Packing Guide" },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="eyebrow text-[11px] px-5 py-3 border border-ink/20 data-[state=active]:bg-ink data-[state=active]:text-ivory data-[state=active]:border-ink rounded-none bg-transparent"
              >
                {t.l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="itinerary" className="mt-10">
            <ol className="grid md:grid-cols-2 gap-6">
              {itinerary.map((d) => (
                <li key={d.day} className="bg-ivory p-6 border border-ink/10">
                  <span className="eyebrow text-gold text-[10px]">{d.day}</span>
                  <h3 className="font-display text-2xl tracking-wide mt-2">{d.title}</h3>
                  <p className="font-serif italic text-ink/70 mt-2 leading-relaxed">{d.text}</p>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="restaurants" className="mt-10">
            <div className="grid md:grid-cols-2 gap-5">
              {allDining.map((e) => (
                <a
                  key={e.experience_name}
                  href={e.affiliate_link || e.backup_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="group bg-ivory p-6 border border-ink/10 hover:border-gold transition-colors block"
                >
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-gold text-[10px]">{TIER_LABEL[e.price_tier] ?? e.price_tier}</span>
                    <span className="eyebrow text-ink/40 text-[10px]">{e.day}</span>
                  </div>
                  <h3 className="font-display text-xl tracking-wide mt-3 leading-snug">{e.experience_name}</h3>
                  <p className="font-serif italic text-ink/70 mt-2 text-sm leading-relaxed">{e.experience_description}</p>
                  <span className="mt-4 inline-block eyebrow text-[10px] text-ink group-hover:text-gold">Reserve →</span>
                </a>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="mt-10">
            <dl className="grid md:grid-cols-2 gap-6">
              {travelTips.map((t) => (
                <div key={t.title} className="bg-ivory p-6 border-l-2 border-gold">
                  <dt className="eyebrow text-ink text-[11px]">{t.title}</dt>
                  <dd className="font-serif italic text-ink/75 mt-2 leading-relaxed">{t.text}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>

          <TabsContent value="packing" className="mt-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-ivory p-6 border border-ink/10">
                <span className="eyebrow text-gold text-[10px]">Wardrobe</span>
                <ul className="mt-4 font-serif italic text-ink/80 space-y-2">
                  {SNAPSHOT.styleKeywords.map((k) => (
                    <li key={k}>· {k}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-ivory p-6 border border-ink/10">
                <span className="eyebrow text-gold text-[10px]">Essentials</span>
                <ul className="mt-4 font-serif italic text-ink/80 space-y-2">
                  {SNAPSHOT.essentials.map((k) => (
                    <li key={k}>· {k}</li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function JoinTheEdit() {
  return (
    <section className="bg-ink text-ivory py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="eyebrow text-gold-soft">Join the Edit</span>
        <h2 className="font-display text-4xl md:text-5xl mt-4 tracking-wide">
          Get the next destination before everyone else.
        </h2>
        <p className="font-serif italic text-ivory/75 mt-5 text-lg leading-relaxed">
          Destination-inspired style, resort edits, and curated escapes delivered first.
        </p>
        <form className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            required
            placeholder="Your email"
            className="flex-1 bg-transparent border border-ivory/30 px-4 py-3 font-serif italic text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="eyebrow text-ink bg-gold px-6 py-3 hover:bg-ivory transition-colors"
          >
            Join the Edit
          </button>
        </form>
      </div>
    </section>
  );
}