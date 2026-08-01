import { useMemo, useState } from "react";

/**
 * v4.6 — Visual Collection Board
 *
 * Editorial merchandising board used in Editorial Review surfaces.
 * Renders the entire collection as a 3x2 grid of editorial collages
 * built from the retailer product photography already discovered by
 * the Stylist Engine — no AI/Firecrawl/Gemini calls are made here.
 *
 * The Board is the destination-agnostic primary review surface:
 *   1. Quick editorial flags (visual repetition)
 *   2. Collection summary metrics
 *   3. Six look collages (Hero look highlighted)
 *   4. Per-product hover info + Founder actions
 */

export type BoardSlot = {
  id?: string;
  slot: string;
  brand: string | null;
  productName: string | null;
  retailer: string | null;
  url: string | null;
  image: string | null;
  editorialScore?: number | null;
  constructionScore?: number | null;
  approvalLevel?: string | null;
  locked?: boolean;
};

export type BoardLook = {
  key: string | number;
  index: number;
  title: string;
  subtitle?: string | null;
  rhythmRoleLabel?: string | null;
  isHero?: boolean;
  status?: string | null;
  slots: BoardSlot[];
};

export type BoardSummary = {
  collectionName?: string | null;
  destination?: string | null;
  activity?: string | null;
  editorialDiversity?: number | null;
  visualRepetition?: number | null;
  brandDominance?: number | null;
  accessoryRotation?: number | null;
  luxuryPerception?: number | null;
  memorability?: number | null;
  heroLabel?: string | null;
};

export type BoardActions = {
  onApproveLook?: (look: BoardLook) => void;
  onRejectLook?: (look: BoardLook) => void;
  onRegenerateLook?: (look: BoardLook) => void;
  onFeatureLook?: (look: BoardLook) => void;
  onViewLook?: (look: BoardLook) => void;
  onReplaceProduct?: (look: BoardLook, slot: BoardSlot) => void;
  onLockProduct?: (look: BoardLook, slot: BoardSlot, next: boolean) => void;
  onOpenRetailer?: (slot: BoardSlot) => void;
};

// ── Slot ordering: Swim/dress → cover-up → shoes → bag → jewelry → sunglasses → hat ──
const SLOT_ORDER = [
  "swimsuit",
  "swim",
  "one-piece",
  "bikini",
  "dress",
  "kaftan",
  "cover-up",
  "coverup",
  "shoes",
  "sandals",
  "footwear",
  "bag",
  "tote",
  "clutch",
  "jewelry",
  "earrings",
  "necklace",
  "sunglasses",
  "hat",
];
function slotRank(slot: string): number {
  const k = slot.toLowerCase();
  const i = SLOT_ORDER.findIndex((s) => k.includes(s));
  return i === -1 ? 99 : i;
}

// ── Visual repetition flags computed purely from existing candidate data ──
function computeFlags(looks: BoardLook[]): string[] {
  const flags: string[] = [];
  // group by slot, then count token signatures
  const bySlot = new Map<string, BoardSlot[]>();
  for (const l of looks) {
    for (const s of l.slots) {
      if (!s.brand && !s.productName) continue;
      const key = s.slot.toLowerCase();
      if (!bySlot.has(key)) bySlot.set(key, []);
      bySlot.get(key)!.push(s);
    }
  }
  const tokenize = (s: BoardSlot) =>
    `${s.brand ?? ""} ${s.productName ?? ""}`.toLowerCase();
  const has = (txt: string, words: string[]) =>
    words.some((w) => new RegExp(`\\b${w}\\b`, "i").test(txt));

  for (const [slotKey, items] of bySlot.entries()) {
    if (items.length < 2) continue;
    // Material/silhouette repetition heuristics by slot family.
    const checks: Array<{ label: string; match: (t: string) => boolean }> = [];
    if (/bag|tote|clutch/.test(slotKey)) {
      checks.push({ label: "raffia bags", match: (t) => has(t, ["raffia", "straw"]) });
      checks.push({ label: "crochet bags", match: (t) => has(t, ["crochet", "macrame"]) });
    }
    if (/swim|bikini|one-piece/.test(slotKey)) {
      checks.push({ label: "black swimsuits", match: (t) => has(t, ["black"]) });
      checks.push({ label: "white swimsuits", match: (t) => has(t, ["white", "ivory"]) });
    }
    if (/shoe|sandal|footwear/.test(slotKey)) {
      checks.push({ label: "flat sandals", match: (t) => has(t, ["sandal", "slide", "thong"]) });
      checks.push({ label: "espadrilles", match: (t) => has(t, ["espadrille"]) });
    }
    if (/sunglasses/.test(slotKey)) {
      checks.push({ label: "cat-eye sunglasses", match: (t) => has(t, ["cat", "cat-eye"]) });
      checks.push({ label: "oversize sunglasses", match: (t) => has(t, ["oversize", "oversized"]) });
    }
    if (/dress|kaftan|coverup|cover-up/.test(slotKey)) {
      checks.push({ label: "white cover-ups", match: (t) => has(t, ["white", "ivory"]) });
      checks.push({ label: "linen dresses", match: (t) => has(t, ["linen"]) });
    }
    for (const c of checks) {
      const hits = items.filter((s) => c.match(tokenize(s))).length;
      if (hits >= 3) {
        flags.push(`${hits} nearly identical ${c.label} across the collection.`);
      }
    }
    // Same-brand domination per slot
    const brandCounts = new Map<string, number>();
    for (const s of items) {
      const b = (s.brand ?? "").toLowerCase();
      if (!b) continue;
      brandCounts.set(b, (brandCounts.get(b) ?? 0) + 1);
    }
    for (const [b, n] of brandCounts.entries()) {
      if (n >= 3) {
        flags.push(`${n} ${slotKey} from the same brand (${b}).`);
      }
    }
  }
  return flags;
}

function pctScore(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  // accept both 0–1 and 0–100 scales
  const v = n > 1 ? n : n * 100;
  return `${Math.round(v)}`;
}

export function VisualCollectionBoard({
  looks,
  summary,
  warnings = [],
  actions = {},
}: {
  looks: BoardLook[];
  summary?: BoardSummary;
  warnings?: string[];
  actions?: BoardActions;
}) {
  const ordered = useMemo(() => {
    return looks.map((l) => ({
      ...l,
      slots: [...l.slots].sort((a, b) => slotRank(a.slot) - slotRank(b.slot)),
    }));
  }, [looks]);

  const visualFlags = useMemo(() => computeFlags(ordered), [ordered]);
  const allFlags = [...visualFlags, ...warnings];

  return (
    <section className="border border-stone-300 rounded-lg bg-stone-50/60 p-5 space-y-5">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="uppercase tracking-widest text-[10px] text-stone-500">
            Visual Collection Board · v4.6
          </p>
          <h2 className="font-serif text-2xl">
            {summary?.collectionName ?? "Editorial review board"}
          </h2>
          {(summary?.destination || summary?.activity) && (
            <p className="text-xs text-stone-500">
              {summary?.destination}
              {summary?.activity ? ` · ${summary.activity}` : ""}
              {summary?.heroLabel ? ` · Hero: ${summary.heroLabel}` : ""}
            </p>
          )}
        </div>
        <SummaryStrip summary={summary} />
      </header>

      {allFlags.length > 0 && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs space-y-1">
          <p className="font-semibold text-amber-900 uppercase tracking-widest text-[10px]">
            Editorial flags ({allFlags.length})
          </p>
          <ul className="list-disc pl-5 text-amber-900">
            {allFlags.slice(0, 12).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {ordered.map((look) => (
          <LookCard key={look.key} look={look} actions={actions} />
        ))}
      </div>

      <p className="text-[11px] text-stone-500 italic">
        Review the board first — luxury, destination, hero strength, visual
        rhythm. Drill into individual products only after the collection passes
        this glance.
      </p>
    </section>
  );
}

function SummaryStrip({ summary }: { summary?: BoardSummary }) {
  if (!summary) return null;
  const items: Array<{ label: string; value: string }> = [
    { label: "Diversity", value: pctScore(summary.editorialDiversity) },
    { label: "Repetition", value: pctScore(summary.visualRepetition) },
    { label: "Dominance", value: pctScore(summary.brandDominance) },
    { label: "Rotation", value: pctScore(summary.accessoryRotation) },
    { label: "Luxury", value: pctScore(summary.luxuryPerception) },
    { label: "Memorability", value: pctScore(summary.memorability) },
  ];
  return (
    <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-widest text-stone-600">
      {items.map((i) => (
        <div key={i.label} className="bg-white border rounded px-2 py-1">
          <span className="text-stone-400">{i.label}</span>
          <span className="ml-1 font-semibold text-stone-800">{i.value}</span>
        </div>
      ))}
    </div>
  );
}

function LookCard({
  look,
  actions,
}: {
  look: BoardLook;
  actions: BoardActions;
}) {
  const hero = !!look.isHero;
  return (
    <article
      className={`relative rounded-lg overflow-hidden bg-white transition ${
        hero
          ? "ring-2 ring-amber-500 shadow-lg md:scale-[1.015]"
          : "border border-stone-200"
      }`}
    >
      {hero && (
        <span className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-[10px] uppercase tracking-widest px-2 py-0.5 rounded shadow">
          Hero Look
        </span>
      )}
      <Collage look={look} actions={actions} />
      <div className="p-3 space-y-2 border-t">
        <div className="flex items-baseline justify-between gap-2">
          <p className="uppercase tracking-widest text-[10px] text-stone-500">
            Look {look.index + 1}
            {look.rhythmRoleLabel ? ` · ${look.rhythmRoleLabel}` : ""}
          </p>
          {look.status && (
            <span
              className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded ${
                look.status === "approved"
                  ? "bg-emerald-100 text-emerald-800"
                  : look.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-stone-100 text-stone-700"
              }`}
            >
              {look.status}
            </span>
          )}
        </div>
        <h3 className="font-serif text-lg leading-tight">{look.title}</h3>
        {look.subtitle && (
          <p className="text-xs italic text-stone-600 line-clamp-2">
            {look.subtitle}
          </p>
        )}
        <LookActions look={look} actions={actions} />
      </div>
    </article>
  );
}

function LookActions({
  look,
  actions,
}: {
  look: BoardLook;
  actions: BoardActions;
}) {
  const btn = "text-[11px] border rounded px-2 py-1 hover:bg-stone-100";
  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {actions.onApproveLook && (
        <button className={btn} onClick={() => actions.onApproveLook!(look)}>
          Approve
        </button>
      )}
      {actions.onRejectLook && (
        <button className={btn} onClick={() => actions.onRejectLook!(look)}>
          Reject
        </button>
      )}
      {actions.onRegenerateLook && (
        <button className={btn} onClick={() => actions.onRegenerateLook!(look)}>
          Regenerate
        </button>
      )}
      {actions.onFeatureLook && (
        <button className={btn} onClick={() => actions.onFeatureLook!(look)}>
          Feature
        </button>
      )}
      {actions.onViewLook && (
        <button
          className={`${btn} bg-stone-900 text-white border-stone-900 hover:bg-stone-700`}
          onClick={() => actions.onViewLook!(look)}
        >
          View details
        </button>
      )}
    </div>
  );
}

// ── Collage: editorial 2-column layout with hero swim/dress on left ──
function Collage({
  look,
  actions,
}: {
  look: BoardLook;
  actions: BoardActions;
}) {
  const slots = look.slots;
  // First slot (swim/dress) becomes hero tile; remaining laid out beside.
  const [heroSlot, ...rest] = slots;
  return (
    <div className="bg-stone-100 aspect-[4/5] grid grid-cols-3 grid-rows-3 gap-px">
      {heroSlot && (
        <ProductTile
          slot={heroSlot}
          actions={actions}
          look={look}
          className="col-span-2 row-span-3"
        />
      )}
      {rest.slice(0, 6).map((s, i) => (
        <ProductTile
          key={s.id ?? `${look.key}-${i}`}
          slot={s}
          actions={actions}
          look={look}
        />
      ))}
      {/* fill empty cells so grid stays 3x3 visually */}
      {Array.from({
        length: Math.max(0, 3 - Math.min(rest.length, 6)),
      }).map((_, i) => (
        <div key={`empty-${i}`} className="bg-stone-50" />
      ))}
    </div>
  );
}

function ProductTile({
  slot,
  look,
  actions,
  className = "",
}: {
  slot: BoardSlot;
  look: BoardLook;
  actions: BoardActions;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  const hasImage = !!slot.image;
  return (
    <div
      className={`relative bg-stone-200 overflow-hidden group ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hasImage ? (
        <img
          src={slot.image!}
          alt={slot.productName ?? slot.slot}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 text-[10px] uppercase tracking-widest p-2 text-center">
          <span>{slot.slot}</span>
          <span className="text-[9px] mt-1 text-stone-400">no image</span>
        </div>
      )}
      <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded">
        {slot.slot}
      </div>
      {slot.locked && (
        <div className="absolute top-1 right-1 bg-stone-900/80 text-white text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded">
          Locked
        </div>
      )}
      {(hover || !hasImage) && (
        <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white p-2 text-[10px] space-y-0.5 opacity-0 group-hover:opacity-100 transition">
          <p className="font-semibold truncate">{slot.brand ?? "—"}</p>
          <p className="truncate">{slot.productName ?? "—"}</p>
          <p className="text-stone-300 truncate">
            {slot.retailer ?? ""}
            {slot.approvalLevel ? ` · ${slot.approvalLevel}` : ""}
          </p>
          <p className="text-stone-300">
            ed {slot.editorialScore?.toFixed?.(2) ?? "—"} · cn{" "}
            {slot.constructionScore?.toFixed?.(2) ?? "—"}
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {actions.onOpenRetailer && slot.url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onOpenRetailer!(slot);
                }}
                className="bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded text-[10px]"
              >
                Retailer
              </button>
            )}
            {actions.onReplaceProduct && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onReplaceProduct!(look, slot);
                }}
                className="bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded text-[10px]"
              >
                Replace
              </button>
            )}
            {actions.onLockProduct && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onLockProduct!(look, slot, !slot.locked);
                }}
                className="bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded text-[10px]"
              >
                {slot.locked ? "Unlock" : "Lock"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}