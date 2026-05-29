import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { portofinoLooks, itinerary, travelTips } from "@/data/portofino";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <Hero />
      <SnapshotBar />
      <StickyNav />
      <section className="bg-ivory">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 space-y-28 md:space-y-36">
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