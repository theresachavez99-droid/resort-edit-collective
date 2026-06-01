import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { portofinoLooks, resolveProductLink, type ShopItem } from "@/data/portofino";
import { portofinoEdit, categoryLabels, type AccessoryCategory } from "@/data/portofinoEdit";
import {
  lookbook,
  LOOK_CATEGORY_ORDER,
  LOOK_CATEGORY_LABEL,
  type LookCategory,
} from "@/data/lookbook";
import { TIER_LABEL, TIER_SLUGS } from "@/lib/portofino-spec";

export const Route = createFileRoute("/admin/product-library")({
  head: () => ({
    meta: [
      { title: "Product Library — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProductLibraryPage,
});

type Row = {
  brand: string;
  item: string;
  price: string;
  image?: string;
  href: string | null;
  category: string;
  destination: string;
  day: string;
  look: string;
  tier: string;
  status: string;
  replaced?: boolean;
  not_available?: boolean;
  source: "portofino.ts" | "portofinoEdit.ts";
};

const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || "resortedit2026";
const STORAGE_KEY = "admin_product_library_unlocked";

function buildRows(): Row[] {
  const rows: Row[] = [];

  // Source 1: portofinoLooks (Shop the Look / itinerary)
  portofinoLooks.forEach((look) => {
    look.shop.forEach((it: ShopItem) => {
      rows.push({
        brand: it.brand,
        item: it.item,
        price: it.price,
        image: it.image,
        href: resolveProductLink(it),
        category: it.category || "—",
        destination: "Portofino",
        day: look.day,
        look: it.lookIndex ? `Look ${it.lookIndex}` : look.title,
        tier: "—",
        status: it.not_available
          ? "not_available"
          : (it.inventory_status ?? "in_stock"),
        replaced: it.replaced,
        not_available: it.not_available,
        source: "portofino.ts",
      });
    });
  });

  // Source 2: portofinoEdit (3-tier looks per day)
  portofinoEdit.forEach((day) => {
    day.looks.forEach((look) => {
      (Object.keys(look.tiers) as Array<keyof typeof look.tiers>).forEach((tier) => {
        look.tiers[tier].forEach((it) => {
          const cat = it.category as AccessoryCategory;
          rows.push({
            brand: it.brand,
            item: it.item,
            price: it.price,
            image: it.image,
            href: resolveProductLink(it),
            category: categoryLabels[cat] ?? String(cat),
            destination: "Portofino",
            day: day.day,
            look: `${look.id} — ${look.name}`,
            tier: String(tier),
            status: it.not_available
              ? "not_available"
              : (it.inventory_status ?? "in_stock"),
            replaced: it.replaced,
            not_available: it.not_available,
            source: "portofinoEdit.ts",
          });
        });
      });
    });
  });

  return rows;
}

function ProductLibraryPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pw === ADMIN_PASSWORD) {
              sessionStorage.setItem(STORAGE_KEY, "1");
              setUnlocked(true);
            } else {
              setError("Incorrect password.");
            }
          }}
          className="w-full max-w-sm space-y-4 bg-white border border-border/60 p-6 rounded-md"
        >
          <h1 className="font-serif text-xl">Product Library — Admin</h1>
          <p className="text-sm text-ink/70">Enter the admin password to view all sourced products.</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full border border-border/60 rounded px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full bg-ink text-ivory py-2 text-sm rounded hover:bg-ink/90"
          >
            Unlock
          </button>
          <p className="text-[0.65rem] text-ink/50">
            Default password is set via <code>VITE_ADMIN_PASSWORD</code>. Change it before publishing.
          </p>
        </form>
      </div>
    );
  }

  return <ProductLibraryTabs />;
}

function ProductLibraryTabs() {
  const [tab, setTab] = useState<"catalog" | "issues" | "gap">("catalog");
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <nav className="sticky top-0 z-10 bg-ivory border-b border-border/60 px-6 lg:px-10 py-3 flex gap-2 text-xs">
        {(
          [
            ["catalog", "Catalog"],
            ["issues", "Issues"],
            ["gap", "Gap Report"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={
              "px-3 py-1.5 rounded uppercase tracking-wider " +
              (tab === k
                ? "bg-ink text-ivory"
                : "bg-white border border-border/60 hover:border-gold")
            }
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "catalog" && <ProductLibraryGrid />}
      {tab === "issues" && <IssuesView />}
      {tab === "gap" && <GapReport />}
    </div>
  );
}

function ProductLibraryGrid() {
  const rows = useMemo(buildRows, []);
  const [q, setQ] = useState("");
  const [day, setDay] = useState<string>("all");
  const [tier, setTier] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const days = useMemo(() => Array.from(new Set(rows.map((r) => r.day))).sort(), [rows]);
  const tiers = useMemo(() => Array.from(new Set(rows.map((r) => r.tier))).sort(), [rows]);
  const cats = useMemo(() => Array.from(new Set(rows.map((r) => r.category))).sort(), [rows]);
  const statuses = useMemo(() => Array.from(new Set(rows.map((r) => r.status))).sort(), [rows]);

  const filtered = rows.filter((r) => {
    if (day !== "all" && r.day !== day) return false;
    if (tier !== "all" && r.tier !== tier) return false;
    if (category !== "all" && r.category !== category) return false;
    if (status !== "all" && r.status !== status) return false;
    if (q) {
      const s = q.toLowerCase();
      if (
        !r.brand.toLowerCase().includes(s) &&
        !r.item.toLowerCase().includes(s) &&
        !(r.href ?? "").toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  const counts = {
    total: rows.length,
    withImage: rows.filter((r) => r.image).length,
    withLink: rows.filter((r) => r.href).length,
    notAvailable: rows.filter((r) => r.not_available).length,
  };

  return (
    <div className="min-h-screen bg-ivory text-ink p-6 lg:p-10">
      <header className="mb-6 space-y-2">
        <h1 className="font-serif text-3xl">Product Library</h1>
        <p className="text-sm text-ink/70">
          All products sourced into the live site, aggregated from{" "}
          <code>src/data/portofino.ts</code> and <code>src/data/portofinoEdit.ts</code>. No
          Firecrawl-cached data was found in this project — every entry shown below was hand-curated.
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-ink/70">
          <span><strong>{counts.total}</strong> total</span>
          <span><strong>{counts.withImage}</strong> with image</span>
          <span><strong>{counts.withLink}</strong> with affiliate link</span>
          <span><strong>{counts.notAvailable}</strong> marked “not available”</span>
          <span><strong>{filtered.length}</strong> matching filters</span>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brand, item, URL…"
          className="col-span-2 md:col-span-1 border border-border/60 rounded px-2 py-1 text-sm bg-white"
        />
        <Select label="Day" value={day} setValue={setDay} options={days} />
        <Select label="Tier" value={tier} setValue={setTier} options={tiers} />
        <Select label="Category" value={category} setValue={setCategory} options={cats} />
        <Select label="Status" value={status} setValue={setStatus} options={statuses} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((r, i) => (
          <div
            key={i}
            className="bg-white border border-border/60 rounded p-3 flex flex-col text-sm"
          >
            <div className="aspect-square w-full bg-cream border border-border/40 rounded mb-3 flex items-center justify-center overflow-hidden">
              {r.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.image}
                  alt={`${r.brand} ${r.item}`}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xs text-ink/40">no image</span>
              )}
            </div>
            <div className="space-y-1 flex-1">
              <div className="text-[0.6rem] uppercase tracking-wider text-ink/60">{r.brand}</div>
              <div className="font-serif leading-snug">{r.item}</div>
              <div className="text-gold font-serif">{r.price}</div>
              <div className="flex flex-wrap gap-1 text-[0.6rem] text-ink/60 pt-1">
                <Tag>{r.day}</Tag>
                {r.tier !== "—" && <Tag>{r.tier}</Tag>}
                <Tag>{r.category}</Tag>
                <Tag>{r.status}</Tag>
                {r.replaced && <Tag>updated</Tag>}
              </div>
              <div className="text-[0.6rem] text-ink/50 truncate" title={r.href ?? ""}>
                {r.href ?? "— no link —"}
              </div>
              <div className="text-[0.55rem] text-ink/40">{r.source} · {r.look}</div>
            </div>
            {r.href && (
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-3 inline-block text-center bg-ink text-ivory py-1.5 text-[0.7rem] uppercase tracking-wider rounded hover:bg-ink/90"
              >
                Open Product →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-ink/60">{label}</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 border border-border/60 rounded px-2 py-1 text-sm bg-white"
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-cream border border-border/40 px-1.5 py-px rounded">{children}</span>
  );
}