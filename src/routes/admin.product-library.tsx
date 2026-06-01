import { useMemo, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  scrapeProductUrl,
  listSourcedProducts,
  updateSourcedProductStatus,
  deleteSourcedProduct,
} from "@/lib/firecrawl.functions";
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
  issueFlags?: string[];
  source: "portofino.ts" | "portofinoEdit.ts";
};

const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || "resortedit2026";
const STORAGE_KEY = "admin_product_library_unlocked";
const APPROVED_RETAILER_DOMAINS = [
  "farfetch.com", "mytheresa.com", "net-a-porter.com", "shopbop.com", "revolve.com",
  "nordstrom.com", "saksfifthavenue.com", "bloomingdales.com", "neimanmarcus.com", "ssense.com",
  "aninebing.com", "biankina.com", "davidyurman.com", "dragondiffusion.com", "hereustudio.com",
  "jenniferfisherjewelry.com", "kendrascott.com", "krewe.com", "monicavinader.com", "us.aguabyaguabendita.com",
  "us.loropiana.com", "vancleefarpels.com",
];

function isApprovedRetailer(href: string | null): boolean {
  if (!href) return false;
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    return APPROVED_RETAILER_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function productQualityFlags(row: Omit<Row, "issueFlags">): string[] {
  const flags: string[] = [];
  const issue = urlIssue(row.href);
  if (issue?.includes("placeholder")) flags.push("missing affiliate URL");
  else if (issue?.includes("homepage")) flags.push("generic homepage URL");
  else if (issue) flags.push("broken URL");
  if (!row.image) flags.push("broken image");
  if (row.not_available || row.status === "unavailable" || row.status === "not_available") flags.push("unavailable");
  if (row.href && !isApprovedRetailer(row.href)) flags.push("non-approved retailer link");
  if (flags.length && !row.replaced) flags.push("needs replacement");
  if (row.replaced) flags.push("approved replacement");
  return Array.from(new Set(flags));
}

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

  return rows.map((row) => ({ ...row, issueFlags: productQualityFlags(row) }));
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
  const [tab, setTab] = useState<"catalog" | "issues" | "gap" | "sourcing">("catalog");
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <nav className="sticky top-0 z-10 bg-ivory border-b border-border/60 px-6 lg:px-10 py-3 flex gap-2 text-xs">
        {(
          [
            ["catalog", "Catalog"],
            ["issues", "Issues"],
            ["gap", "Gap Report"],
            ["sourcing", "Sourcing (Firecrawl)"],
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
      {tab === "catalog" && <ProductLibraryGrid onReplace={() => setTab("sourcing")} />}
      {tab === "issues" && <IssuesView onReplace={() => setTab("sourcing")} />}
      {tab === "gap" && <GapReport />}
      {tab === "sourcing" && <SourcingView />}
    </div>
  );
}

function ProductLibraryGrid({ onReplace }: { onReplace: () => void }) {
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
                {r.issueFlags?.map((flag) => <Tag key={flag}>{flag}</Tag>)}
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
            {r.issueFlags?.some((flag) => flag === "needs replacement" || flag === "broken image" || flag === "broken URL" || flag === "missing affiliate URL") && (
              <button
                type="button"
                onClick={onReplace}
                className="mt-2 inline-block text-center border border-gold text-ink py-1.5 text-[0.7rem] uppercase tracking-wider rounded hover:bg-cream"
              >
                Replace Product
              </button>
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

// ──────────────────────────────────────────────────────────────
// Issues view — flag every problem product in raw curated data
// ──────────────────────────────────────────────────────────────
const BAD_URL_RE = /^#|^\s*$|javascript:/i;
function urlIssue(href: string | null | undefined): string | null {
  if (!href || BAD_URL_RE.test(href)) return "missing or placeholder URL (#)";
  try {
    const u = new URL(href);
    if (u.pathname === "/" || u.pathname === "") return "homepage link (no product path)";
    return null;
  } catch {
    return "invalid URL";
  }
}

type Issue = {
  brand: string;
  item: string;
  source: string;
  location: string;
  problems: string[];
  href: string | null;
  image?: string;
};

function buildIssues(): Issue[] {
  const issues: Issue[] = [];

  portofinoLooks.forEach((look) => {
    look.shop.forEach((it: ShopItem) => {
      const problems: string[] = [];
      const u = urlIssue(it.href);
      if (u) problems.push(u);
      if (!it.image) problems.push("missing image");
      if (it.not_available) problems.push("marked not_available");
      if (it.inventory_status === "unavailable") problems.push("inventory unavailable");
      if (!it.category) problems.push("no category tag");
      if (problems.length) {
        issues.push({
          brand: it.brand,
          item: it.item,
          source: "portofino.ts",
          location: `${look.day} · ${look.title}`,
          problems,
          href: it.href ?? null,
          image: it.image,
        });
      }
    });
  });

  portofinoEdit.forEach((day) => {
    day.looks.forEach((look) => {
      (Object.keys(look.tiers) as Array<keyof typeof look.tiers>).forEach((tier) => {
        look.tiers[tier].forEach((it) => {
          const problems: string[] = [];
          const u = urlIssue(it.href);
          if (u) problems.push(u);
          if (!it.image) problems.push("missing image");
          if (it.not_available) problems.push("marked not_available");
          if (problems.length) {
            issues.push({
              brand: it.brand,
              item: it.item,
              source: "portofinoEdit.ts",
              location: `${day.day} · ${look.name} · ${String(tier)}`,
              problems,
              href: it.href ?? null,
              image: it.image,
            });
          }
        });
      });
    });
  });

  return issues;
}

function IssuesView() {
  const issues = useMemo(buildIssues, []);
  const byProblem = useMemo(() => {
    const map = new Map<string, number>();
    issues.forEach((i) => i.problems.forEach((p) => map.set(p, (map.get(p) ?? 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [issues]);

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-serif text-3xl mb-2">Issues</h1>
      <p className="text-sm text-ink/70 mb-4">
        Every curated product flagged with at least one problem. These items either
        fall back to the styling-note placeholder on View Full Look pages, or
        render with a broken image / generic link.
      </p>
      <div className="flex flex-wrap gap-3 text-xs mb-6">
        {byProblem.map(([p, n]) => (
          <span
            key={p}
            className="bg-white border border-border/60 px-2 py-1 rounded"
          >
            <strong>{n}</strong> · {p}
          </span>
        ))}
        <span className="px-2 py-1 bg-ink text-ivory rounded">
          <strong>{issues.length}</strong> total flagged
        </span>
      </div>
      <div className="overflow-auto bg-white border border-border/60 rounded">
        <table className="w-full text-xs">
          <thead className="bg-cream text-left">
            <tr>
              <th className="p-2">Brand</th>
              <th className="p-2">Item</th>
              <th className="p-2">Location</th>
              <th className="p-2">Source</th>
              <th className="p-2">Problems</th>
              <th className="p-2">URL</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((i, idx) => (
              <tr key={idx} className="border-t border-border/40 align-top">
                <td className="p-2 font-medium">{i.brand}</td>
                <td className="p-2">{i.item}</td>
                <td className="p-2 text-ink/70">{i.location}</td>
                <td className="p-2 text-ink/60">{i.source}</td>
                <td className="p-2">
                  {i.problems.map((p) => (
                    <span
                      key={p}
                      className="inline-block bg-red-50 text-red-700 border border-red-200 px-1.5 py-px rounded mr-1 mb-1"
                    >
                      {p}
                    </span>
                  ))}
                </td>
                <td className="p-2 text-ink/50 truncate max-w-[260px]" title={i.href ?? ""}>
                  {i.href ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Gap Report — what View Full Look pages actually render
// ──────────────────────────────────────────────────────────────
function GapReport() {
  type Slot = {
    day: string;
    look: string;
    tier: string;
    category: LookCategory;
    state: "mapped" | "placeholder";
    brand?: string;
    item?: string;
    url?: string | null;
  };

  const slots: Slot[] = useMemo(() => {
    const out: Slot[] = [];
    lookbook.forEach((look) => {
      TIER_SLUGS.forEach((t) => {
        const products = look.tiers[t].products;
        LOOK_CATEGORY_ORDER.forEach((cat) => {
          const p = products[cat];
          out.push({
            day: look.day,
            look: look.lookLabel + " — " + look.title,
            tier: TIER_LABEL[t],
            category: cat,
            state: p.isPlaceholder ? "placeholder" : "mapped",
            brand: p.isPlaceholder ? undefined : p.brand,
            item: p.isPlaceholder ? undefined : p.title,
            url: p.url,
          });
        });
      });
    });
    return out;
  }, []);

  const total = slots.length;
  const mapped = slots.filter((s) => s.state === "mapped").length;
  const placeholders = total - mapped;

  const byCategory = useMemo(() => {
    const m: Record<string, { mapped: number; placeholder: number }> = {};
    slots.forEach((s) => {
      m[s.category] ??= { mapped: 0, placeholder: 0 };
      m[s.category][s.state]++;
    });
    return m;
  }, [slots]);

  const byTier = useMemo(() => {
    const m: Record<string, { mapped: number; placeholder: number }> = {};
    slots.forEach((s) => {
      m[s.tier] ??= { mapped: 0, placeholder: 0 };
      m[s.tier][s.state]++;
    });
    return m;
  }, [slots]);

  const gaps = slots.filter((s) => s.state === "placeholder");

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <header>
        <h1 className="font-serif text-3xl">Gap Report</h1>
        <p className="text-sm text-ink/70 mt-2 max-w-3xl">
          What the live <code>/portofino/day-N/look-X</code> pages actually render today,
          slot-by-slot. Each look has 7 required categories × 3 tiers = 21 slots, across
          15 looks (5 days × 3 looks) = <strong>{total} total slots</strong>. Anything
          marked "placeholder" needs Firecrawl sourcing of an exact affiliate product URL
          + thumbnail.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat label="Mapped to real product" value={mapped} sub={`${Math.round((mapped / total) * 100)}%`} good />
        <Stat label="Placeholder slots (need sourcing)" value={placeholders} sub={`${Math.round((placeholders / total) * 100)}%`} />
        <Stat label="Total slots in View Full Look" value={total} />
      </section>

      <section>
        <h2 className="font-serif text-xl mb-2">Gap by category</h2>
        <Breakdown data={byCategory} labelMap={LOOK_CATEGORY_LABEL} />
      </section>

      <section>
        <h2 className="font-serif text-xl mb-2">Gap by tier</h2>
        <Breakdown data={byTier} />
      </section>

      <section>
        <h2 className="font-serif text-xl mb-2">
          Missing slots ({gaps.length}) — Firecrawl sourcing queue
        </h2>
        <p className="text-xs text-ink/60 mb-3">
          Each row below describes a product to source. Use the rules from{" "}
          <code>mem/features/look-build-rules.md</code> (approved affiliate priority,
          exact product URL, image from same retailer).
        </p>
        <div className="overflow-auto bg-white border border-border/60 rounded">
          <table className="w-full text-xs">
            <thead className="bg-cream text-left">
              <tr>
                <th className="p-2">Day</th>
                <th className="p-2">Look</th>
                <th className="p-2">Tier</th>
                <th className="p-2">Category needed</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((g, i) => (
                <tr key={i} className="border-t border-border/40">
                  <td className="p-2">{g.day}</td>
                  <td className="p-2">{g.look}</td>
                  <td className="p-2">{g.tier}</td>
                  <td className="p-2 font-medium">{LOOK_CATEGORY_LABEL[g.category]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-2">Mapped slots ({mapped})</h2>
        <div className="overflow-auto bg-white border border-border/60 rounded">
          <table className="w-full text-xs">
            <thead className="bg-cream text-left">
              <tr>
                <th className="p-2">Day</th>
                <th className="p-2">Look</th>
                <th className="p-2">Tier</th>
                <th className="p-2">Category</th>
                <th className="p-2">Brand</th>
                <th className="p-2">Item</th>
                <th className="p-2">URL</th>
              </tr>
            </thead>
            <tbody>
              {slots
                .filter((s) => s.state === "mapped")
                .map((s, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="p-2">{s.day}</td>
                    <td className="p-2">{s.look}</td>
                    <td className="p-2">{s.tier}</td>
                    <td className="p-2">{LOOK_CATEGORY_LABEL[s.category]}</td>
                    <td className="p-2">{s.brand}</td>
                    <td className="p-2">{s.item}</td>
                    <td className="p-2 text-ink/50 truncate max-w-[220px]" title={s.url ?? ""}>
                      {s.url ?? "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub, good }: { label: string; value: number; sub?: string; good?: boolean }) {
  return (
    <div className={"bg-white border rounded p-4 " + (good ? "border-green-300" : "border-border/60")}>
      <div className="text-xs text-ink/60">{label}</div>
      <div className="font-serif text-3xl mt-1">{value}</div>
      {sub && <div className="text-xs text-ink/50">{sub}</div>}
    </div>
  );
}

function Breakdown({
  data,
  labelMap,
}: {
  data: Record<string, { mapped: number; placeholder: number }>;
  labelMap?: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {Object.entries(data).map(([k, v]) => {
        const total = v.mapped + v.placeholder;
        const pct = total === 0 ? 0 : Math.round((v.mapped / total) * 100);
        return (
          <div key={k} className="bg-white border border-border/60 rounded p-3 text-xs">
            <div className="font-medium">{labelMap?.[k] ?? k}</div>
            <div className="text-ink/60 mt-1">
              {v.mapped} mapped · {v.placeholder} gaps
            </div>
            <div className="h-1.5 bg-cream rounded mt-2 overflow-hidden">
              <div className="h-full bg-gold" style={{ width: pct + "%" }} />
            </div>
            <div className="text-ink/50 mt-1">{pct}% filled</div>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sourcing — Firecrawl pipeline (Mode A: specific URLs only)
// ──────────────────────────────────────────────────────────────

const SLOT_CATEGORIES = [
  "outfit",
  "shoes",
  "bag",
  "jewelry",
  "earrings",
  "necklace",
  "bracelet",
  "ring",
  "sunglasses",
  "hairDetail",
  "layer",
];

function SourcingView() {
  const qc = useQueryClient();
  const listFn = useServerFn(listSourcedProducts);
  const scrapeFn = useServerFn(scrapeProductUrl);
  const updateFn = useServerFn(updateSourcedProductStatus);
  const delFn = useServerFn(deleteSourcedProduct);

  const { data, isLoading } = useQuery({
    queryKey: ["sourced_products"],
    queryFn: () => listFn(),
    refetchInterval: 5000,
  });

  const scrape = useMutation({
    mutationFn: (input: {
      url: string;
      day?: number;
      look?: number;
      slot_category?: string;
      affiliate_url?: string;
      notes?: string;
    }) => scrapeFn({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sourced_products"] }),
  });

  const update = useMutation({
    mutationFn: (input: { id: string; status: any; notes?: string }) =>
      updateFn({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sourced_products"] }),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sourced_products"] }),
  });

  const [form, setForm] = useState({
    url: "",
    day: "",
    look: "",
    slot_category: "",
    affiliate_url: "",
    notes: "",
  });

  const rows = data?.ok ? data.rows : [];
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r: any) => {
      c[r.status] = (c[r.status] ?? 0) + 1;
    });
    return c;
  }, [rows]);

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl mb-2">Sourcing — Firecrawl</h1>
        <p className="text-sm text-ink/70 max-w-3xl">
          Mode A only: paste a specific product URL from an approved retailer. The page
          is scraped server-side, structured data is stored in the staging queue, and
          nothing reaches the live View Full Look pages until you click <strong>Promote</strong>.
          Live page promotion currently means: mark approved here, then paste the JSON
          into <code>src/data/portofinoEdit.ts</code> (or <code>src/data/portofino.ts</code>)
          in your next release.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.url) return;
          scrape.mutate({
            url: form.url.trim(),
            day: form.day ? Number(form.day) : undefined,
            look: form.look ? Number(form.look) : undefined,
            slot_category: form.slot_category || undefined,
            affiliate_url: form.affiliate_url.trim() || undefined,
            notes: form.notes.trim() || undefined,
          });
          setForm({ ...form, url: "", affiliate_url: "", notes: "" });
        }}
        className="bg-white border border-border/60 rounded p-4 grid grid-cols-1 md:grid-cols-6 gap-3 text-sm"
      >
        <input
          required
          type="url"
          placeholder="Product URL (https://...)"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="md:col-span-3 border border-border/60 rounded px-2 py-1.5"
        />
        <input
          type="number"
          min={1}
          max={5}
          placeholder="Day"
          value={form.day}
          onChange={(e) => setForm({ ...form, day: e.target.value })}
          className="border border-border/60 rounded px-2 py-1.5"
        />
        <input
          type="number"
          min={1}
          max={5}
          placeholder="Look"
          value={form.look}
          onChange={(e) => setForm({ ...form, look: e.target.value })}
          className="border border-border/60 rounded px-2 py-1.5"
        />
        <select
          value={form.slot_category}
          onChange={(e) => setForm({ ...form, slot_category: e.target.value })}
          className="border border-border/60 rounded px-2 py-1.5"
        >
          <option value="">Slot category…</option>
          {SLOT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="url"
          placeholder="Affiliate URL (optional, defaults to source URL)"
          value={form.affiliate_url}
          onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })}
          className="md:col-span-3 border border-border/60 rounded px-2 py-1.5"
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="md:col-span-2 border border-border/60 rounded px-2 py-1.5"
        />
        <button
          type="submit"
          disabled={scrape.isPending || !form.url}
          className="bg-ink text-ivory rounded px-3 py-1.5 uppercase tracking-wider text-xs disabled:opacity-50"
        >
          {scrape.isPending ? "Scraping…" : "Scrape →"}
        </button>
        {scrape.data && !scrape.data.ok && (
          <p className="md:col-span-6 text-xs text-red-600">
            Error: {scrape.data.error}
          </p>
        )}
      </form>

      <div className="flex flex-wrap gap-3 text-xs">
        {["queued", "scraped", "approved", "promoted", "failed", "rejected"].map((s) => (
          <span key={s} className="bg-white border border-border/60 px-2 py-1 rounded">
            <strong>{counts[s] ?? 0}</strong> · {s}
          </span>
        ))}
        {isLoading && <span className="text-ink/50">loading…</span>}
      </div>

      <div className="overflow-auto bg-white border border-border/60 rounded">
        <table className="w-full text-xs">
          <thead className="bg-cream text-left">
            <tr>
              <th className="p-2">Status</th>
              <th className="p-2">Image</th>
              <th className="p-2">Brand / Product</th>
              <th className="p-2">Price</th>
              <th className="p-2">Slot</th>
              <th className="p-2">URL</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t border-border/40 align-top">
                <td className="p-2">
                  <span
                    className={
                      "px-1.5 py-0.5 rounded text-[0.65rem] uppercase tracking-wider " +
                      (r.status === "scraped"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : r.status === "failed"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : r.status === "promoted"
                            ? "bg-gold/20 text-ink border border-gold"
                            : "bg-cream border border-border/40")
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-2">
                  {r.image_url ? (
                    <img
                      src={r.image_url}
                      alt=""
                      className="w-12 h-12 object-contain bg-cream rounded"
                    />
                  ) : (
                    <span className="text-ink/40">—</span>
                  )}
                </td>
                <td className="p-2">
                  <div className="font-medium">{r.brand ?? "—"}</div>
                  <div className="text-ink/70">{r.product_name ?? "—"}</div>
                  {r.notes && <div className="text-[0.65rem] text-red-600">{r.notes}</div>}
                </td>
                <td className="p-2 text-gold">
                  {r.price ? `${r.currency ?? ""} ${r.price}` : "—"}
                </td>
                <td className="p-2 text-ink/70">
                  {r.day ? `D${r.day}` : "—"}
                  {r.look ? ` · L${r.look}` : ""}
                  <div className="text-[0.65rem]">{r.slot_category ?? "—"}</div>
                </td>
                <td className="p-2 text-ink/60 truncate max-w-[220px]">
                  <a
                    href={r.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    title={r.source_url}
                  >
                    {r.retailer_domain}
                  </a>
                </td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {r.status === "scraped" && (
                      <button
                        onClick={() =>
                          update.mutate({ id: r.id, status: "approved" })
                        }
                        className="bg-ink text-ivory px-2 py-1 rounded text-[0.65rem] uppercase tracking-wider"
                      >
                        Approve
                      </button>
                    )}
                    {r.status === "approved" && (
                      <button
                        onClick={() =>
                          update.mutate({ id: r.id, status: "promoted" })
                        }
                        className="bg-gold text-ink px-2 py-1 rounded text-[0.65rem] uppercase tracking-wider"
                      >
                        Mark Promoted
                      </button>
                    )}
                    <button
                      onClick={() =>
                        update.mutate({ id: r.id, status: "rejected" })
                      }
                      className="border border-border/60 px-2 py-1 rounded text-[0.65rem] uppercase tracking-wider"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this row?")) del.mutate(r.id);
                      }}
                      className="text-red-600 px-2 py-1 text-[0.65rem] uppercase tracking-wider"
                    >
                      ×
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-ink/50">
                  No scraped products yet. Paste a URL above to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}