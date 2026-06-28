import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listFounderLooks,
  getFounderLook,
  saveFounderLook,
  publishFounderLook,
  seedPoolLoungingValidationLook,
  recordValidationRun,
  refreshFounderLookHeroImages,
} from "@/lib/founder-looks.functions";
import { generateYachtDayCollection } from "@/lib/stylist-engine.functions";
import {
  classifyProductSource,
  inferJewelrySubSlot,
} from "@/lib/source-classification";
import {
  submitFounderProductFeedback,
  FEEDBACK_REASONS,
  type FeedbackReasonCode,
} from "@/lib/founder-feedback.functions";
import { analyzeFounderLookDuplicates } from "@/lib/editorial-memory.functions";

export const Route = createFileRoute("/admin/founder-looks")({
  head: () => ({
    meta: [
      { title: "Founder Look Builder — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: FounderLooksPage,
});

const STORAGE_KEY = "admin_founder_pw";
type Tab = "list" | "builder" | "validate";

function FounderLooksPage() {
  const [pw, setPw] = useState<string>(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(STORAGE_KEY) ?? "",
  );
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const verify = useServerFn(verifyAdmin);

  async function tryAuth(p: string) {
    const r = await verify({ data: { password: p } });
    if (r?.ok) {
      setAuthed(true);
      window.localStorage.setItem(STORAGE_KEY, p);
    } else alert("Incorrect password");
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md py-24 px-6">
        <h1 className="text-2xl font-light mb-4">Founder Look Builder</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full border px-3 py-2"
          placeholder="Admin password"
        />
        <button onClick={() => tryAuth(pw)} className="mt-3 w-full bg-black text-white py-2">
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-3xl font-light tracking-wide">Founder Look Builder</h1>
        <a href="/admin" className="text-sm text-neutral-500 underline">
          ← Admin
        </a>
      </div>
      <nav className="flex gap-6 border-b mb-6">
        {(["list", "builder", "validate"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm uppercase tracking-wider ${tab === t ? "border-b-2 border-black" : "text-neutral-500"}`}
          >
            {t === "list" ? "Looks" : t === "builder" ? "Edit" : "Blind A/B"}
          </button>
        ))}
      </nav>
      {tab === "list" && (
        <ListTab
          pw={pw}
          onEdit={(id) => {
            setEditingId(id);
            setTab("builder");
          }}
          onValidate={(id) => {
            setValidatingId(id);
            setTab("validate");
          }}
          onNew={() => {
            setEditingId(null);
            setTab("builder");
          }}
        />
      )}
      {tab === "builder" && <BuilderTab pw={pw} id={editingId} />}
      {tab === "validate" && <ValidateTab pw={pw} id={validatingId} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function ListTab({
  pw,
  onEdit,
  onValidate,
  onNew,
}: {
  pw: string;
  onEdit: (id: string) => void;
  onValidate: (id: string) => void;
  onNew: () => void;
}) {
  const list = useServerFn(listFounderLooks);
  const seed = useServerFn(seedPoolLoungingValidationLook);
  const refresh = useServerFn(refreshFounderLookHeroImages);
  const q = useQuery({
    queryKey: ["founder-looks", pw],
    queryFn: () => list({ data: { password: pw } }),
  });
  const seedM = useMutation({
    mutationFn: () => seed({ data: { password: pw } }),
    onSuccess: () => q.refetch(),
  });
  const refreshM = useMutation({
    mutationFn: (vars: { id: string; force: boolean }) =>
      refresh({ data: { password: pw, id: vars.id, force: vars.force } }),
    onSuccess: () => q.refetch(),
  });
  const [refreshReport, setRefreshReport] = useState<{
    id: string;
    report: Array<{ url: string; ok: boolean; image_url: string | null; reason: string | null; source: string | null; status: number | null }>;
  } | null>(null);

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={onNew} className="bg-black text-white px-4 py-2 text-sm">
          + New Founder Look
        </button>
        <button
          onClick={() => seedM.mutate()}
          disabled={seedM.isPending}
          className="border border-black px-4 py-2 text-sm"
        >
          {seedM.isPending ? "Seeding…" : "Seed: Pool Lounging Pietra Rosa"}
        </button>
      </div>
      {seedM.data && "ok" in seedM.data && seedM.data.ok && (
        <div className="text-xs text-green-700 mb-4">
          Seeded look. {seedM.data.refsWritten} references + {seedM.data.brandsWritten} brand records.
        </div>
      )}
      <div className="space-y-2">
        {(q.data && "ok" in q.data && q.data.ok ? q.data.looks : []).map((l) => (
          <div key={l.id} className="border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{l.title}</div>
                <div className="text-xs text-neutral-500">
                  {l.destination} · {l.moment} · {l.status}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onEdit(l.id)} className="text-xs underline">
                  Edit
                </button>
                <button
                  onClick={async () => {
                    const r = await refreshM.mutateAsync({ id: l.id, force: true });
                    if (r && "ok" in r && r.ok) {
                      setRefreshReport({ id: l.id, report: r.report });
                    } else {
                      setRefreshReport({
                        id: l.id,
                        report: [
                          {
                            url: "",
                            ok: false,
                            image_url: null,
                            source: null,
                            status: null,
                            reason: (r as { error?: string })?.error ?? "unknown",
                          },
                        ],
                      });
                    }
                  }}
                  disabled={refreshM.isPending}
                  className="text-xs underline"
                >
                  {refreshM.isPending && refreshM.variables?.id === l.id
                    ? "Refreshing…"
                    : "Refresh hero images"}
                </button>
                <button onClick={() => onValidate(l.id)} className="text-xs underline">
                  Blind A/B
                </button>
              </div>
            </div>
            {refreshReport && refreshReport.id === l.id && (
              <div className="mt-2 border-t border-neutral-100 pt-2 text-[11px] space-y-1">
                <div className="uppercase tracking-wider text-neutral-400">
                  Hero image extraction: {refreshReport.report.filter((r) => r.ok && r.image_url).length}/{refreshReport.report.length} OK
                </div>
                {refreshReport.report.map((r, i) => (
                  <div key={i} className={r.ok && r.image_url ? "text-neutral-700" : "text-red-700"}>
                    {r.ok && r.image_url ? "✓" : "✗"}{" "}
                    <span className="break-all">{r.url || "(no url)"}</span>
                    {r.image_url && (
                      <a href={r.image_url} target="_blank" rel="noreferrer" className="ml-2 underline">
                        image{r.source ? ` (${r.source})` : ""}
                      </a>
                    )}
                    {r.status != null && <span className="ml-2 text-neutral-400">HTTP {r.status}</span>}
                    {r.reason && <div className="text-neutral-500 ml-4 italic">{r.reason}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

type FormState = {
  title: string;
  destination: string;
  moment: string;
  style_family: string;
  hero_urls: string;
  activity_sequence: string;
  palette_include: string;
  palette_exclude: string;
  positive_rules: string;
  negative_rules: string;
  editorial_dna: string;
  hero_philosophy: string;
  founder_notes: string;
  accessory_philosophy: string;
  visual_weight: "hero-dominant" | "balanced" | "accessory-led";
  luxury_level: "editorial" | "heritage" | "mass-luxury";
  status: "draft" | "approved" | "published" | "retired";
};

const EMPTY: FormState = {
  title: "",
  destination: "Portofino",
  moment: "Pool Lounging & Shopping",
  style_family: "Mediterranean Glamour, Italian Riviera, Quiet Luxury",
  hero_urls: "",
  activity_sequence: "",
  palette_include: "tomato red, ivory, cream, raffia, camel, honey, gold",
  palette_exclude: "bright white, black, silver",
  positive_rules: 'bag: raffia, handwoven\njewelry: organic, sculptural, gold',
  negative_rules: 'bag: logo, monogram\nsunglasses: sport, shield',
  editorial_dna: "",
  hero_philosophy: "",
  founder_notes: "",
  accessory_philosophy: "",
  visual_weight: "hero-dominant",
  luxury_level: "editorial",
  status: "draft",
};

function parseRules(s: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const line of s.split("\n")) {
    const [k, v] = line.split(":");
    if (!k || !v) continue;
    out[k.trim().toLowerCase()] = v
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return out;
}

function rulesToText(r: Record<string, string[]>): string {
  return Object.entries(r)
    .map(([k, v]) => `${k}: ${v.join(", ")}`)
    .join("\n");
}

function parseHeroes(s: string) {
  return s
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Format: BRAND | CATEGORY | URL  (category optional)
      const parts = line.split("|").map((x) => x.trim());
      if (parts.length >= 3) {
        return { brand: parts[0], category: parts[1], url: parts[2], role: "Hero Garment" as const };
      }
      return { brand: parts[0] ?? "Unknown", category: "other", url: parts[1] ?? line, role: "Hero Garment" as const };
    });
}

function heroesToText(arr: Array<{ brand?: string; category?: string; url?: string }>) {
  return arr.map((h) => `${h.brand ?? ""} | ${h.category ?? "other"} | ${h.url ?? ""}`).join("\n");
}

function BuilderTab({ pw, id }: { pw: string; id: string | null }) {
  const get = useServerFn(getFounderLook);
  const save = useServerFn(saveFounderLook);
  const publish = useServerFn(publishFounderLook);
  const detail = useQuery({
    queryKey: ["founder-look", id],
    queryFn: () => (id ? get({ data: { password: pw, id } }) : Promise.resolve(null)),
    enabled: !!id,
  });

  const initial = useMemo<FormState>(() => {
    if (!detail.data || !("ok" in detail.data) || !detail.data.ok) return EMPTY;
    const l = detail.data.look as Record<string, unknown> as {
      title: string;
      destination: string;
      moment: string;
      style_family?: string[];
      hero_urls?: Array<{ brand?: string; category?: string; url?: string }>;
      activity_sequence?: string[];
      color_palette?: { include?: string[]; exclude?: string[] };
      positive_rules?: Record<string, string[]>;
      negative_rules?: Record<string, string[]>;
      editorial_dna?: string;
      hero_philosophy?: string;
      founder_notes?: string;
      accessory_philosophy?: string;
      visual_weight: FormState["visual_weight"];
      luxury_level: FormState["luxury_level"];
      status: FormState["status"];
    };
    return {
      title: l.title,
      destination: l.destination,
      moment: l.moment,
      style_family: (l.style_family ?? []).join(", "),
      hero_urls: heroesToText(l.hero_urls ?? []),
      activity_sequence: (l.activity_sequence ?? []).join(", "),
      palette_include: (l.color_palette?.include ?? []).join(", "),
      palette_exclude: (l.color_palette?.exclude ?? []).join(", "),
      positive_rules: rulesToText(l.positive_rules ?? {}),
      negative_rules: rulesToText(l.negative_rules ?? {}),
      editorial_dna: l.editorial_dna ?? "",
      hero_philosophy: l.hero_philosophy ?? "",
      founder_notes: l.founder_notes ?? "",
      accessory_philosophy: l.accessory_philosophy ?? "",
      visual_weight: l.visual_weight,
      luxury_level: l.luxury_level,
      status: l.status,
    };
  }, [detail.data]);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  if (id && detail.data && !hydrated) {
    setForm(initial);
    setHydrated(true);
  }

  const [savedId, setSavedId] = useState<string | null>(id);

  const saveM = useMutation({
    mutationFn: () =>
      save({
        data: {
          password: pw,
          id: savedId,
          title: form.title,
          destination: form.destination,
          moment: form.moment,
          style_family: form.style_family.split(",").map((s) => s.trim()).filter(Boolean),
          hero_urls: parseHeroes(form.hero_urls),
          activity_sequence: form.activity_sequence.split(",").map((s) => s.trim()).filter(Boolean),
          color_palette: {
            include: form.palette_include.split(",").map((s) => s.trim()).filter(Boolean),
            exclude: form.palette_exclude.split(",").map((s) => s.trim()).filter(Boolean),
          },
          positive_rules: parseRules(form.positive_rules),
          negative_rules: parseRules(form.negative_rules),
          editorial_dna: form.editorial_dna || null,
          hero_philosophy: form.hero_philosophy || null,
          founder_notes: form.founder_notes || null,
          accessory_philosophy: form.accessory_philosophy || null,
          visual_weight: form.visual_weight,
          luxury_level: form.luxury_level,
          status: form.status,
        },
      }),
    onSuccess: (r) => {
      if (r && "ok" in r && r.ok && r.id) setSavedId(r.id);
    },
  });

  const publishM = useMutation({
    mutationFn: () => publish({ data: { password: pw, id: savedId! } }),
  });

  // ── Phase 3 — Duplicate Analysis (pre-publish).
  const dupFn = useServerFn(analyzeFounderLookDuplicates);
  const dupM = useMutation({
    mutationFn: () => dupFn({ data: { password: pw, id: savedId! } }),
  });

  function field(label: string, k: keyof FormState, multiline = false, hint?: string) {
    return (
      <label className="block">
        <div className="text-xs uppercase tracking-wider text-neutral-600">{label}</div>
        {hint && <div className="text-[11px] text-neutral-400 mb-1">{hint}</div>}
        {multiline ? (
          <textarea
            value={form[k] as string}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            rows={4}
            className="mt-1 w-full border px-2 py-1 text-sm"
          />
        ) : (
          <input
            value={form[k] as string}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            className="mt-1 w-full border px-2 py-1 text-sm"
          />
        )}
      </label>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        {field("Title", "title")}
        <div className="grid grid-cols-2 gap-3">
          {field("Destination", "destination")}
          {field("Moment", "moment")}
        </div>
        {field("Style Family", "style_family", false, "Comma-separated")}
        {field(
          "Hero URLs",
          "hero_urls",
          true,
          "One per line. Format: BRAND | CATEGORY | URL",
        )}
        {field("Activity Sequence", "activity_sequence", false, "Comma-separated")}
        <div className="grid grid-cols-2 gap-3">
          {field("Palette Include", "palette_include", false, "Comma-separated")}
          {field("Palette Exclude", "palette_exclude", false, "Comma-separated")}
        </div>
        {field("Positive Rules", "positive_rules", true, "slot: keyword, keyword")}
        {field("Negative Rules", "negative_rules", true, "slot: keyword, keyword")}
      </div>
      <div className="space-y-4">
        {field("Editorial DNA", "editorial_dna", true)}
        {field("Hero Philosophy", "hero_philosophy", true)}
        {field("Accessory Philosophy", "accessory_philosophy", true)}
        {field("Founder Notes", "founder_notes", true)}
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <div className="text-xs uppercase">Visual Weight</div>
            <select
              value={form.visual_weight}
              onChange={(e) => setForm({ ...form, visual_weight: e.target.value as FormState["visual_weight"] })}
              className="mt-1 w-full border px-2 py-1 text-sm"
            >
              <option value="hero-dominant">hero-dominant</option>
              <option value="balanced">balanced</option>
              <option value="accessory-led">accessory-led</option>
            </select>
          </label>
          <label className="block">
            <div className="text-xs uppercase">Luxury Level</div>
            <select
              value={form.luxury_level}
              onChange={(e) => setForm({ ...form, luxury_level: e.target.value as FormState["luxury_level"] })}
              className="mt-1 w-full border px-2 py-1 text-sm"
            >
              <option value="editorial">editorial</option>
              <option value="heritage">heritage</option>
              <option value="mass-luxury">mass-luxury</option>
            </select>
          </label>
          <label className="block">
            <div className="text-xs uppercase">Status</div>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })}
              className="mt-1 w-full border px-2 py-1 text-sm"
            >
              <option value="draft">draft</option>
              <option value="approved">approved</option>
              <option value="published">published</option>
              <option value="retired">retired</option>
            </select>
          </label>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => saveM.mutate()}
            disabled={saveM.isPending}
            className="bg-black text-white px-4 py-2 text-sm"
          >
            {saveM.isPending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => dupM.mutate()}
            disabled={!savedId || dupM.isPending}
            className="border border-stone-400 px-4 py-2 text-sm"
            title="Check Editorial Memory before publishing"
          >
            {dupM.isPending ? "Checking…" : "Duplicate Analysis"}
          </button>
          <button
            onClick={() => publishM.mutate()}
            disabled={!savedId || publishM.isPending}
            className="border border-black px-4 py-2 text-sm"
          >
            {publishM.isPending ? "Publishing…" : "Save & Publish"}
          </button>
        </div>
        {saveM.data && "ok" in saveM.data && !saveM.data.ok && (
          <div className="text-xs text-red-600">{saveM.data.error}</div>
        )}
        {publishM.data && "ok" in publishM.data && publishM.data.ok && (
          <div className="text-xs text-green-700">
            Published. {publishM.data.refsWritten} refs · {publishM.data.brandsWritten} brand records.
            {typeof publishM.data.memoryWrites === "number" && (
              <> · {publishM.data.memoryWrites} memory entries.</>
            )}
          </div>
        )}
        {dupM.data && "ok" in dupM.data && dupM.data.ok && (
          <DuplicateReport report={dupM.data.report} />
        )}
        {dupM.data && "ok" in dupM.data && !dupM.data.ok && (
          <div className="text-xs text-red-600">{dupM.data.error}</div>
        )}
      </div>
    </div>
  );
}

function DuplicateReport({
  report,
}: {
  report: {
    exactMatches: Array<{ url: string; brand: string; productName: string | null; usageCount: number; destinations: string[] }>;
    similarMatches: Array<{ url: string; brand: string; productName: string | null; reason: string }>;
    brandConcentration: Array<{ brand: string; share: number; uses: number }>;
    colorConcentration: Array<{ color: string; share: number; uses: number }>;
    summary: string;
  };
}) {
  return (
    <div className="mt-4 border border-stone-300 p-3 text-xs space-y-3">
      <div className="text-[10px] tracking-[0.24em] uppercase text-stone-500">
        Editorial Memory · Duplicate Analysis
      </div>
      <p className="text-stone-700">{report.summary}</p>
      {report.exactMatches.length > 0 && (
        <div>
          <div className="font-medium text-red-700 mb-1">
            Exact duplicates ({report.exactMatches.length})
          </div>
          <ul className="space-y-0.5">
            {report.exactMatches.map((m) => (
              <li key={m.url}>
                · {m.brand} — {m.productName ?? m.url} <span className="text-stone-500">({m.usageCount}× in {m.destinations.join(", ")})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {report.similarMatches.length > 0 && (
        <div>
          <div className="font-medium text-amber-700 mb-1">
            Near-identical ({report.similarMatches.length})
          </div>
          <ul className="space-y-0.5">
            {report.similarMatches.map((m) => (
              <li key={m.url}>· {m.brand} — {m.productName ?? "—"} <span className="text-stone-500">({m.reason})</span></li>
            ))}
          </ul>
        </div>
      )}
      {report.brandConcentration.length > 0 && (
        <div>
          <div className="font-medium mb-1">Brand share (destination)</div>
          <ul className="space-y-0.5">
            {report.brandConcentration.slice(0, 5).map((b) => (
              <li key={b.brand}>
                · {b.brand} — {(b.share * 100).toFixed(0)}% ({b.uses}×)
              </li>
            ))}
          </ul>
        </div>
      )}
      {report.colorConcentration.length > 0 && (
        <div>
          <div className="font-medium mb-1">Color share</div>
          <ul className="space-y-0.5">
            {report.colorConcentration.slice(0, 5).map((c) => (
              <li key={c.color}>· {c.color} — {(c.share * 100).toFixed(0)}%</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-stone-500 italic">
        Publishing is never blocked — this is an editorial conscience.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Blind A/B validation harness                                        */
/* ─────────────────────────────────────────────────────────────────── */

type RunPayload = {
  ok?: boolean;
  error?: string;
  gated?: boolean;
  assemblyError?: string | null;
  looks?: Array<{
    title?: string;
    subtitle?: string | null;
    isHero?: boolean;
    founderQualityScore?: number | null;
    founderQualityBreakdown?: Record<string, number> | null;
    omissions?: string[];
    slots?: Array<{
      slot?: string;
      candidateId?: string;
      brand?: string | null;
      title?: string | null;
      image?: string | null;
      image_url?: string | null;
      url?: string | null;
      retailer?: string | null;
      editorialScore?: number | null;
      visualWeight?: string | null;
      tier?: string | null;
      isLockedHero?: boolean;
      explanation?: string | null;
      editorialReasons?: string[];
    }>;
  }>;
  candidates?: Array<{
    id?: string;
    slot?: string;
    brand?: string | null;
    title?: string | null;
    image?: string | null;
      image_url?: string | null;
    url?: string | null;
    retailer?: string | null;
    editorialScore?: number;
    baseEditorialScore?: number;
    founderSimilarity?: number;
    founderBoost?: number;
    founderPenalty?: number;
    founderHits?: Array<{ id: string; label: string; severity: string; delta: number }>;
    rankDeltaFromFounder?: number;
    founderReasons?: string[];
  }>;
  founderRetrieval?: unknown;
  heroLookApplied?: unknown;
  heroPiecesLocked?: Array<{
    slot: string;
    brand: string;
    productName: string | null;
    category: string | null;
    url: string;
  }>;
  slotsRequiringRefinement?: string[];
  editorialContext?: {
    heroVisualWeight?: string;
    neckline?: { neckline?: string; action?: string; reason?: string } | null;
    omissions?: Array<{ slot: string; reason: string }>;
  } | null;
  momentTemplate?: {
    key: string;
    note?: string | null;
    tiers?: Record<string, string>;
  } | null;
  discoveryTelemetry?: {
    searchesIssued?: number;
    totalCandidates?: number;
    rejectionsByReason?: Record<string, number>;
  };
};

type RunStatus = "idle" | "loading" | "done" | "error";

function ValidateTab({ pw, id }: { pw: string; id: string | null }) {
  const get = useServerFn(getFounderLook);
  const generate = useServerFn(generateYachtDayCollection);
  const record = useServerFn(recordValidationRun);
  const sendFeedback = useServerFn(submitFounderProductFeedback);
  const detail = useQuery({
    queryKey: ["founder-look", id, "validate"],
    queryFn: () => (id ? get({ data: { password: pw, id } }) : Promise.resolve(null)),
    enabled: !!id,
  });

  // sideOrder: which engine variant ("founder" | "baseline") sits in slot 1 vs slot 2.
  // The slots are presented to the founder as anonymous "Outfit 1" / "Outfit 2".
  const [sideOrder, setSideOrder] = useState<["founder" | "baseline", "founder" | "baseline"]>([
    "founder",
    "baseline",
  ]);
  const [slot1, setSlot1] = useState<{ status: RunStatus; run: RunPayload | null; err?: string }>({
    status: "idle",
    run: null,
  });
  const [slot2, setSlot2] = useState<{ status: RunStatus; run: RunPayload | null; err?: string }>({
    status: "idle",
    run: null,
  });
  const [revealed, setRevealed] = useState(false);

  const look = detail.data && "ok" in detail.data && detail.data.ok ? detail.data.look : null;

  async function runAB() {
    if (!look) return;
    setRevealed(false);
    // Randomize which slot gets Founder Learning.
    const order: ["founder" | "baseline", "founder" | "baseline"] =
      Math.random() < 0.5 ? ["founder", "baseline"] : ["baseline", "founder"];
    setSideOrder(order);
    setSlot1({ status: "loading", run: null });
    setSlot2({ status: "loading", run: null });

    const base = {
      password: pw,
      destination: look.destination,
      moment: look.moment,
      targetLooks: 4,
      includeOptional: true,
      discoveryMode: "fast" as const,
      enableCache: true,
    };
    const buildPayload = (variant: "founder" | "baseline", label: "A" | "B") => ({
      ...base,
      activity: look.moment,
      founderLearning: variant === "founder",
      founderLookId: variant === "founder" ? look.id : null,
      validationLabel: label,
    });

    const runOne = async (
      variant: "founder" | "baseline",
      label: "A" | "B",
      setter: typeof setSlot1,
    ) => {
      try {
        const r = (await generate({ data: buildPayload(variant, label) as never })) as RunPayload;
        setter({ status: "done", run: r });
        return r;
      } catch (e) {
        const msg = String((e as Error)?.message ?? e);
        setter({ status: "error", run: null, err: msg });
        return null;
      }
    };

    const [a, b] = await Promise.all([
      runOne(order[0], "A", setSlot1),
      runOne(order[1], "B", setSlot2),
    ]);

    if (a && b) {
      try {
        await record({
          data: {
            password: pw,
            founder_look_id: look.id,
            destination: look.destination,
            moment: look.moment,
            run_a: a as unknown,
            run_b: b as unknown,
            founder_side: order[0] === "founder" ? "A" : "B",
          },
        });
      } catch {
        /* audit-only; ignore */
      }
    }
  }

  if (!look) return <div className="text-sm text-neutral-500">Select a Founder Look first.</div>;

  const bothDone = slot1.status === "done" && slot2.status === "done";
  const anyRunning = slot1.status === "loading" || slot2.status === "loading";

  return (
    <div>
      <div className="mb-4 text-sm">
        Blind A/B for <span className="font-medium">{look.title}</span> · {look.destination} ·{" "}
        {look.moment}
      </div>
      <button
        onClick={runAB}
        disabled={anyRunning}
        className="bg-black text-white px-4 py-2 text-sm mb-6 disabled:opacity-50"
      >
        {anyRunning ? "Generating both outfits…" : "Run blind A/B"}
      </button>

      <div className="grid grid-cols-2 gap-6">
        <OutfitPanel
          slotLabel="Outfit 1"
          status={slot1.status}
          run={slot1.run}
          err={slot1.err}
          revealed={revealed}
          variant={sideOrder[0]}
          look={look}
          password={pw}
          sendFeedback={sendFeedback}
        />
        <OutfitPanel
          slotLabel="Outfit 2"
          status={slot2.status}
          run={slot2.run}
          err={slot2.err}
          revealed={revealed}
          variant={sideOrder[1]}
          look={look}
          password={pw}
          sendFeedback={sendFeedback}
        />
      </div>

      {bothDone && !revealed && (
        <div className="mt-8 border-t pt-6">
          <div className="text-sm text-neutral-600 mb-3">
            Choose the outfit that feels more <em>Resort Edit</em>, then reveal.
          </div>
          <button
            onClick={() => setRevealed(true)}
            className="bg-black text-white px-4 py-2 text-sm"
          >
            Reveal
          </button>
        </div>
      )}

      {bothDone && revealed && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-6">
            <DiagnosticsPanel
              slotLabel="Outfit 1"
              variant={sideOrder[0]}
              run={slot1.run!}
            />
            <DiagnosticsPanel
              slotLabel="Outfit 2"
              variant={sideOrder[1]}
              run={slot2.run!}
            />
          </div>
          <ComparisonTable
            sideOrder={sideOrder}
            slot1={slot1.run!}
            slot2={slot2.run!}
          />
        </>
      )}
    </div>
  );
}

const COMPARE_SLOTS = ["bag", "shoes", "sunglasses", "earrings", "necklace", "bracelet", "hat"];

function ComparisonTable({
  sideOrder,
  slot1,
  slot2,
}: {
  sideOrder: ["baseline" | "founder", "baseline" | "founder"];
  slot1: RunPayload;
  slot2: RunPayload;
}) {
  const baseline = sideOrder[0] === "baseline" ? slot1 : slot2;
  const founder = sideOrder[0] === "founder" ? slot1 : slot2;

  const sideFor = (run: RunPayload, slot: string) => {
    const hero = pickHeroLook(run);
    const s = hero?.slots?.find((x) => (x.slot ?? "").toLowerCase() === slot);
    if (s) return { brand: s.brand ?? "—", score: s.editorialScore ?? 0, state: "selected" as const };
    const om = run.editorialContext?.omissions?.find((o) => o.slot.toLowerCase() === slot);
    if (om) return { brand: "— omitted", score: 0, state: "omitted" as const };
    return { brand: "— unavailable", score: 0, state: "unavailable" as const };
  };

  const heroOf = (r: RunPayload) => pickHeroLook(r);
  const bQ = heroOf(baseline)?.founderQualityScore ?? 0;
  const fQ = heroOf(founder)?.founderQualityScore ?? 0;

  return (
    <div className="mt-8 border border-neutral-200 p-4">
      <h3 className="text-sm uppercase tracking-wider mb-3">Decision Comparison</h3>
      <table className="w-full text-[11px]">
        <thead className="text-neutral-400 uppercase tracking-wider">
          <tr>
            <th className="text-left py-1 w-24">Slot</th>
            <th className="text-left py-1">Baseline</th>
            <th className="text-left py-1">Founder</th>
            <th className="text-left py-1 w-24">Winner</th>
          </tr>
        </thead>
        <tbody>
          {COMPARE_SLOTS.map((slot) => {
            const b = sideFor(baseline, slot);
            const f = sideFor(founder, slot);
            if (b.state !== "selected" && f.state !== "selected") return null;
            const winner =
              b.state === "selected" && f.state === "selected"
                ? f.score > b.score
                  ? "Founder"
                  : f.score < b.score
                    ? "Baseline"
                    : "Tie"
                : f.state === "selected"
                  ? "Founder"
                  : "Baseline";
            return (
              <tr key={slot} className="border-t border-neutral-100">
                <td className="py-1 uppercase tracking-wider text-neutral-500">{slot}</td>
                <td className="py-1 text-neutral-700">{b.brand}{b.state === "selected" && ` · ${b.score.toFixed(1)}`}</td>
                <td className="py-1 text-neutral-700">{f.brand}{f.state === "selected" && ` · ${f.score.toFixed(1)}`}</td>
                <td className={`py-1 font-medium ${winner === "Founder" ? "text-green-700" : winner === "Baseline" ? "text-neutral-700" : "text-neutral-400"}`}>{winner}</td>
              </tr>
            );
          })}
          <tr className="border-t-2 border-neutral-300">
            <td className="py-2 uppercase tracking-wider text-neutral-500">Overall</td>
            <td className="py-2">Quality {bQ.toFixed(0)}</td>
            <td className="py-2">Quality {fQ.toFixed(0)}</td>
            <td className={`py-2 font-medium ${fQ > bQ ? "text-green-700" : fQ < bQ ? "text-neutral-700" : "text-neutral-400"}`}>
              {fQ > bQ ? "Founder" : fQ < bQ ? "Baseline" : "Tie"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

type SendFeedbackFn = (opts: { data: {
  password: string;
  founder_look_id?: string | null;
  destination?: string | null;
  moment?: string | null;
  slot: string;
  brand?: string | null;
  product_title?: string | null;
  product_url?: string | null;
  retailer?: string | null;
  image_url?: string | null;
  reason_code: FeedbackReasonCode;
  reason_label?: string | null;
  notes?: string | null;
  variant?: string | null;
} }) => Promise<unknown>;

type FeedbackCtx = {
  password: string;
  founderLookId: string | null;
  destination: string | null;
  moment: string | null;
  variant: "founder" | "baseline";
  sendFeedback: SendFeedbackFn;
};

function OutfitPanel({
  slotLabel,
  status,
  run,
  err,
  revealed,
  variant,
  look,
  password,
  sendFeedback,
}: {
  slotLabel: string;
  status: RunStatus;
  run: RunPayload | null;
  err?: string;
  revealed: boolean;
  variant: "founder" | "baseline";
  look: { id: string; destination: string; moment: string } | null;
  password: string;
  sendFeedback: SendFeedbackFn;
}) {
  const isFounder = variant === "founder";
  const headerSuffix = revealed ? (
    <span className={`ml-2 text-[11px] ${isFounder ? "text-green-700" : "text-neutral-400"}`}>
      {isFounder ? "★ Founder Learning ON" : "baseline"}
    </span>
  ) : null;

  return (
    <div
      className={`border p-4 ${revealed && isFounder ? "border-green-600" : "border-neutral-200"}`}
    >
      <div className="text-sm uppercase tracking-wider mb-4">
        {slotLabel}
        {headerSuffix}
      </div>

      {status === "idle" && (
        <div className="text-xs text-neutral-400">Click “Run blind A/B” to generate.</div>
      )}

      {status === "loading" && <LoadingState />}

      {status === "error" && (
        <div className="text-xs text-red-600 whitespace-pre-wrap">{err ?? "Generation failed."}</div>
      )}

      {status === "done" && run && (
        <OutfitBody
          run={run}
          revealed={revealed}
          feedback={{
            password,
            founderLookId: look?.id ?? null,
            destination: look?.destination ?? null,
            moment: look?.moment ?? null,
            variant,
            sendFeedback,
          }}
        />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      <div className="text-xs text-neutral-500 animate-pulse">Generating outfit…</div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

const SLOT_ORDER = [
  "swim",
  "coverup",
  "cover-up",
  "dress",
  "top",
  "bottom",
  "shoes",
  "bag",
  "sunglasses",
  "earrings",
  "necklace",
  "bracelet",
  "ring",
  "hat",
];

function pickHeroLook(run: RunPayload) {
  const looks = run.looks ?? [];
  if (!looks.length) return null;
  return looks.find((l) => l.isHero) ?? looks[0];
}

function orderSlots(slots: NonNullable<NonNullable<RunPayload["looks"]>[number]["slots"]>) {
  return [...slots].sort((a, b) => {
    const ai = SLOT_ORDER.indexOf((a.slot ?? "").toLowerCase());
    const bi = SLOT_ORDER.indexOf((b.slot ?? "").toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

/**
 * Build a unified per-slot status list that distinguishes three states:
 *  - "selected"    → an assembled candidate (locked hero OR newly chosen)
 *  - "omitted"     → intentional editorial omission (e.g. necklace under halter)
 *  - "unavailable" → required/preferred slot with no qualifying candidate
 *
 * This collapses the engine's three signals (hero.slots, editorialContext.omissions,
 * slotsRequiringRefinement + momentTemplate.tiers) into a single rendering list.
 */
type SlotStatus = "selected" | "omitted" | "unavailable";
type UnifiedSlot = {
  slot: string;
  status: SlotStatus;
  tier?: string | null;
  // selected
  data?: NonNullable<NonNullable<RunPayload["looks"]>[number]["slots"]>[number];
  // omitted / unavailable
  reason?: string;
};

function unifiedSlotsFor(run: RunPayload): UnifiedSlot[] {
  const hero = pickHeroLook(run);
  const filled = hero?.slots ? orderSlots(hero.slots) : [];
  const filledSlotKeys = new Set(filled.map((s) => (s.slot ?? "").toLowerCase()));

  const omissions = run.editorialContext?.omissions ?? [];
  const omittedKeys = new Set(omissions.map((o) => o.slot.toLowerCase()));

  const unavailable = (run.slotsRequiringRefinement ?? []).filter(
    (s) => !filledSlotKeys.has(s.toLowerCase()) && !omittedKeys.has(s.toLowerCase()),
  );

  const tierFor = (slot: string): string | null => {
    const tiers = run.momentTemplate?.tiers ?? null;
    if (!tiers) return null;
    return (tiers as Record<string, string>)[slot.toLowerCase()] ?? null;
  };

  const all: UnifiedSlot[] = [
    ...filled.map((s) => ({
      slot: s.slot ?? "",
      status: "selected" as const,
      tier: s.tier ?? tierFor(s.slot ?? ""),
      data: s,
    })),
    ...omissions.map((o) => ({
      slot: o.slot,
      status: "omitted" as const,
      tier: tierFor(o.slot),
      reason: o.reason,
    })),
    ...unavailable.map((s) => ({
      slot: s,
      status: "unavailable" as const,
      tier: tierFor(s),
      reason: "No qualifying candidate found in discovery.",
    })),
  ];

  // Sort by canonical SLOT_ORDER
  return all.sort((a, b) => {
    const ai = SLOT_ORDER.indexOf(a.slot.toLowerCase());
    const bi = SLOT_ORDER.indexOf(b.slot.toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

/**
 * Resolve a slot's image with a canonical fallback chain. The engine's primary
 * field is `image_url` (v6+); legacy candidates emit `image`. Both are accepted
 * and a precise reason is returned when nothing resolves.
 */
function resolveSlotImage(
  s: NonNullable<NonNullable<RunPayload["looks"]>[number]["slots"]>[number],
  cand?: { image?: string | null; image_url?: string | null; url?: string | null } | undefined,
): { url: string | null; source: string | null; reason: string } {
  const chain: Array<[string, string | null | undefined]> = [
    ["slot.image_url", s.image_url],
    ["slot.image", s.image],
    ["candidate.image_url", cand?.image_url],
    ["candidate.image", cand?.image],
  ];
  for (const [src, v] of chain) {
    if (typeof v === "string" && v.trim().length > 0) {
      return {
        url: v,
        source: src,
        reason: "Image URL resolved — if it still does not render, the host blocked the request (CORS / 404 / hotlink).",
      };
    }
  }
  if (!cand) {
    return {
      url: null,
      source: null,
      reason: "Slot resolved to no candidate — no image source available.",
    };
  }
  return {
    url: null,
    source: null,
    reason:
      "Candidate has no image_url/image — discovery result missing og:image, twitter:image, and image_src.",
  };
}

function OutfitBody({
  run,
  revealed,
  feedback,
}: {
  run: RunPayload;
  revealed: boolean;
  feedback: FeedbackCtx;
}) {
  if (run.ok === false) {
    return (
      <div className="text-xs text-red-600 space-y-2">
        <div>{run.error ?? "Engine returned no result."}</div>
        <FailureDiagnostics run={run} />
      </div>
    );
  }
  const hero = pickHeroLook(run);
  const lockedCount = run.heroPiecesLocked?.length ?? 0;

  // No hero look at all — show structured failure diagnostics rather than the
  // old single-line message. The user must see why one side rendered nothing.
  if (!hero || !hero.slots?.length) {
    return (
      <div className="space-y-3">
        <div className="text-xs text-amber-700">
          {lockedCount > 0
            ? `Founder Look locked ${lockedCount} hero piece${lockedCount === 1 ? "" : "s"} but assembly produced no rendered outfit.`
            : "Engine returned no assembled outfit."}
          {run.assemblyError ? <span className="block text-red-600 mt-1">↳ {run.assemblyError}</span> : null}
        </div>
        <FailureDiagnostics run={run} />
      </div>
    );
  }

  const candById = new Map((run.candidates ?? []).map((c) => [c.id, c]));
  const unified = unifiedSlotsFor(run);
  const refinement = run.slotsRequiringRefinement ?? [];

  return (
    <div>
      {hero.title && <div className="mb-3 text-xs italic text-neutral-500">{hero.title}</div>}
      <div className="mb-3 text-[11px] text-neutral-500 space-y-0.5">
        {lockedCount > 0 && (
          <div>✓ {lockedCount} Founder Hero piece{lockedCount === 1 ? "" : "s"} locked</div>
        )}
        {refinement.length > 0 && (
          <div className="text-amber-700">
            {refinement.length} accessory slot{refinement.length === 1 ? "" : "s"} unavailable:{" "}
            {refinement.join(", ")}
          </div>
        )}
        {run.editorialContext?.neckline?.action === "skip" && (
          <div className="text-neutral-500">
            Neckline: {run.editorialContext.neckline.neckline} → necklace skipped.
          </div>
        )}
      </div>

      {revealed && typeof hero.founderQualityScore === "number" && (
        <QualityBreakdown
          score={hero.founderQualityScore}
          breakdown={hero.founderQualityBreakdown ?? {}}
        />
      )}

      <div className="grid grid-cols-3 gap-3">
        {unified.map((u, i) => (
          <SlotCard
            key={`${u.slot}-${i}`}
            unified={u}
            cand={u.data?.candidateId ? candById.get(u.data.candidateId) : undefined}
            revealed={revealed}
            feedback={feedback}
          />
        ))}
      </div>
    </div>
  );
}

function FailureDiagnostics({ run }: { run: RunPayload }) {
  const c = run.candidates?.length ?? 0;
  const t = run.discoveryTelemetry;
  const locked = run.heroPiecesLocked ?? [];
  const rejections = t?.rejectionsByReason ?? {};
  const topRejections = Object.entries(rejections)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return (
    <div className="text-[10px] text-neutral-600 border border-neutral-200 bg-neutral-50 p-2 space-y-1">
      <div className="uppercase tracking-wider text-neutral-400">Failure diagnostics</div>
      <div>candidates discovered: <b>{c}</b></div>
      <div>searches issued: <b>{t?.searchesIssued ?? "?"}</b></div>
      <div>hero locked: <b>{locked.length}</b> {locked.map((l) => `${l.slot}=${l.brand}`).join(", ")}</div>
      {run.assemblyError && <div className="text-red-600">assemblyError: {run.assemblyError}</div>}
      {topRejections.length > 0 && (
        <div>
          top rejections:{" "}
          {topRejections.map(([k, v]) => `${k}=${v}`).join(", ")}
        </div>
      )}
      {(run.slotsRequiringRefinement?.length ?? 0) > 0 && (
        <div>missing slots: {run.slotsRequiringRefinement!.join(", ")}</div>
      )}
    </div>
  );
}

const TIER_BADGE: Record<string, { label: string; cls: string }> = {
  locked_hero: { label: "Locked Hero", cls: "bg-black text-white" },
  required: { label: "Required", cls: "bg-neutral-800 text-white" },
  strongly_preferred: { label: "Preferred", cls: "bg-neutral-200 text-neutral-700" },
  contextual: { label: "Contextual", cls: "bg-neutral-100 text-neutral-600" },
  conditional: { label: "Optional", cls: "bg-neutral-100 text-neutral-500" },
  omit: { label: "Omit", cls: "bg-neutral-100 text-neutral-400" },
};

function SlotCard({
  unified,
  cand,
  revealed,
  feedback,
}: {
  unified: UnifiedSlot;
  cand?: NonNullable<RunPayload["candidates"]>[number];
  revealed: boolean;
  feedback: FeedbackCtx;
}) {
  const tierBadge = unified.tier ? TIER_BADGE[unified.tier] : null;

  if (unified.status === "omitted") {
    return (
      <div className="border border-dashed border-neutral-300 p-2 bg-neutral-50 text-[11px] flex flex-col">
        <div className="aspect-[3/4] flex items-center justify-center text-neutral-400">
          <div className="text-center px-2">
            <div className="text-2xl mb-1">—</div>
            <div className="uppercase tracking-wider text-[9px]">Intentionally omitted</div>
          </div>
        </div>
        <div className="mt-1 text-neutral-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
          {unified.slot}
          {tierBadge && (
            <span className={`px-1 ${tierBadge.cls} text-[8px]`}>{tierBadge.label}</span>
          )}
        </div>
        <div className="text-neutral-600 italic">{unified.reason}</div>
      </div>
    );
  }

  if (unified.status === "unavailable") {
    return (
      <div className="border border-red-200 bg-red-50/50 p-2 text-[11px] flex flex-col">
        <div className="aspect-[3/4] flex items-center justify-center text-red-400">
          <div className="text-center px-2">
            <div className="text-2xl mb-1">⚠︎</div>
            <div className="uppercase tracking-wider text-[9px]">Unavailable</div>
          </div>
        </div>
        <div className="mt-1 text-red-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
          {unified.slot}
          {tierBadge && (
            <span className={`px-1 ${tierBadge.cls} text-[8px]`}>{tierBadge.label}</span>
          )}
        </div>
        <div className="text-red-700/80">{unified.reason}</div>
      </div>
    );
  }

  // selected
  const s = unified.data!;
  const img = resolveSlotImage(s, cand);
  const isLocked = !!s.isLockedHero;
  const source = classifyProductSource(s.brand, s.url, s.retailer);
  const sub = inferJewelrySubSlot(s.slot, s.title);
  const displaySlot = sub ?? (s.slot ?? "");
  const hasUrl = typeof s.url === "string" && s.url.length > 0;
  const openable = (children: ReactNode, cls = "") =>
    hasUrl ? (
      <a
        href={s.url!}
        target="_blank"
        rel="noreferrer"
        className={`hover:underline ${cls}`}
      >
        {children}
      </a>
    ) : (
      <span className={cls}>{children}</span>
    );

  return (
    <div
      className={`border p-2 text-[11px] flex flex-col ${
        isLocked ? "border-black" : "border-neutral-200"
      }`}
    >
      {img.url ? (
        hasUrl ? (
          <a href={s.url!} target="_blank" rel="noreferrer" className="block">
            <img
              src={img.url}
              alt={s.title ?? ""}
              loading="lazy"
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = "none";
                const sib = (el.parentElement?.nextElementSibling ?? null) as HTMLElement | null;
                if (sib) sib.style.display = "flex";
              }}
              className="w-full aspect-[3/4] object-cover bg-neutral-100"
            />
          </a>
        ) : (
          <img
            src={img.url}
            alt={s.title ?? ""}
            loading="lazy"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              const sib = el.nextElementSibling as HTMLElement | null;
              if (sib) sib.style.display = "flex";
            }}
            className="w-full aspect-[3/4] object-cover bg-neutral-100"
          />
        )
      ) : null}
      <div
        className="w-full aspect-[3/4] bg-neutral-100 flex-col items-center justify-center text-[9px] text-neutral-500 p-1 text-center"
        style={{ display: img.url ? "none" : "flex" }}
      >
        <div className="text-neutral-400 uppercase tracking-wider mb-1">No image</div>
        <div className="text-neutral-500 break-all line-clamp-3">{img.reason}</div>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1 text-neutral-400 uppercase tracking-wider text-[10px]">
        <span>{displaySlot}</span>
        {sub && (s.slot ?? "").toLowerCase() === "jewelry" && (
          <span className="text-neutral-300">(jewelry)</span>
        )}
        {isLocked && <span className="bg-black text-white px-1 text-[8px]">Hero</span>}
        {!isLocked && tierBadge && (
          <span className={`px-1 ${tierBadge.cls} text-[8px]`}>{tierBadge.label}</span>
        )}
        <span
          title={source.detail}
          className={`px-1 text-[8px] tracking-normal normal-case ${source.cls}`}
        >
          {source.label}
        </span>
      </div>
      <div className="text-neutral-800 font-medium">{openable(s.brand ?? "—")}</div>
      <div className="text-neutral-600 line-clamp-2">
        {openable(s.title ?? "")}
      </div>
      {s.retailer && (
        <div className="text-neutral-400 text-[10px] mt-0.5">
          via {openable(s.retailer)}
        </div>
      )}
      {!hasUrl && (
        <div className="text-[10px] text-red-500 mt-0.5">Product URL unavailable</div>
      )}
      {revealed && (
        <div className="mt-1 pt-1 border-t border-neutral-100 text-[10px] text-neutral-600 space-y-0.5">
          <div>
            score <b>{(s.editorialScore ?? 0).toFixed(1)}</b>
            {cand?.founderSimilarity != null && (
              <> · sim <b>{cand.founderSimilarity.toFixed(2)}</b></>
            )}
            {s.visualWeight && <> · weight <b>{s.visualWeight}</b></>}
          </div>
          {typeof cand?.rankDeltaFromFounder === "number" && cand.rankDeltaFromFounder !== 0 && (
            <div className="text-green-700">
              Δrank {cand.rankDeltaFromFounder! < 0 ? "↑" : "↓"} {Math.abs(cand.rankDeltaFromFounder!)}
            </div>
          )}
          {s.explanation && (
            <div className="text-neutral-500 italic">{s.explanation}</div>
          )}
          {(s.editorialReasons?.length ?? 0) > 0 && (
            <div className="text-neutral-500">{s.editorialReasons!.join(" · ")}</div>
          )}
          {cand?.founderHits?.length ? (
            <div className="text-red-500">
              {cand.founderHits.map((h) => h.id).join(", ")}
            </div>
          ) : null}
          <FeedbackChips slot={s} sub={sub} feedback={feedback} />
        </div>
      )}
    </div>
  );
}

/**
 * One-click editorial rejection chips. Visible after Reveal. Persists to
 * `founder_product_feedback` so the engine can learn from the override.
 */
function FeedbackChips({
  slot,
  sub,
  feedback,
}: {
  slot: NonNullable<NonNullable<RunPayload["looks"]>[number]["slots"]>[number];
  sub: ReturnType<typeof inferJewelrySubSlot>;
  feedback: FeedbackCtx;
}) {
  const [sent, setSent] = useState<FeedbackReasonCode | null>(null);
  const [pending, setPending] = useState<FeedbackReasonCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(code: FeedbackReasonCode, label: string) {
    setPending(code);
    setError(null);
    try {
      const r = (await feedback.sendFeedback({
        data: {
          password: feedback.password,
          founder_look_id: feedback.founderLookId,
          destination: feedback.destination,
          moment: feedback.moment,
          slot: sub ?? slot.slot ?? "unknown",
          brand: slot.brand ?? null,
          product_title: slot.title ?? null,
          product_url: slot.url ?? null,
          retailer: slot.retailer ?? null,
          image_url: slot.image_url ?? slot.image ?? null,
          reason_code: code,
          reason_label: label,
          variant: feedback.variant,
        },
      })) as { ok?: boolean; error?: string };
      if (r?.ok) setSent(code);
      else setError(r?.error ?? "save failed");
    } catch (e) {
      setError(String((e as Error)?.message ?? e));
    } finally {
      setPending(null);
    }
  }

  if (sent) {
    const label = FEEDBACK_REASONS.find((r) => r.code === sent)?.label ?? sent;
    return (
      <div className="mt-1 text-[10px] text-green-700">
        ✓ Feedback recorded — “{label}”. The engine will learn from this.
      </div>
    );
  }

  return (
    <details className="mt-1">
      <summary className="cursor-pointer text-[10px] text-neutral-500 hover:text-black">
        Reject this piece…
      </summary>
      <div className="mt-1 flex flex-wrap gap-1">
        {FEEDBACK_REASONS.map((r) => (
          <button
            key={r.code}
            onClick={() => submit(r.code, r.label)}
            disabled={pending === r.code}
            className="px-1 py-0.5 text-[9px] border border-neutral-300 hover:bg-black hover:text-white disabled:opacity-50"
          >
            {pending === r.code ? "…" : r.label}
          </button>
        ))}
      </div>
      {error && <div className="text-[10px] text-red-600 mt-1">{error}</div>}
    </details>
  );
}

function QualityBreakdown({
  score,
  breakdown,
}: {
  score: number;
  breakdown: Record<string, number>;
}) {
  const entries = Object.entries(breakdown);
  return (
    <div className="mb-3 border border-neutral-200 p-2 text-[11px]">
      <div className="flex items-baseline justify-between mb-2">
        <div className="uppercase tracking-wider text-neutral-500">Founder Quality</div>
        <div className="text-xl font-light">{Math.round(score)}</div>
      </div>
      {entries.length > 0 && (
        <div className="space-y-1">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <div className="w-28 text-neutral-500 capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</div>
              <div className="flex-1 h-1 bg-neutral-100 relative">
                <div
                  className="absolute inset-y-0 left-0 bg-black"
                  style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
                />
              </div>
              <div className="w-8 text-right text-neutral-600">{Math.round(v)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DiagnosticsPanel({
  slotLabel,
  variant,
  run,
}: {
  slotLabel: string;
  variant: "founder" | "baseline";
  run: RunPayload;
}) {
  const hero = pickHeroLook(run);
  const slots = hero ? orderSlots(hero.slots ?? []) : [];
  const candById = new Map((run.candidates ?? []).map((c) => [c.id, c]));
  const heroSlotCands = slots
    .map((s) => (s.candidateId ? candById.get(s.candidateId) : undefined))
    .filter((c): c is NonNullable<typeof c> => !!c);

  const avgSim =
    heroSlotCands.length && variant === "founder"
      ? heroSlotCands.reduce((a, c) => a + (c.founderSimilarity ?? 0), 0) / heroSlotCands.length
      : null;
  const boosts = heroSlotCands.filter((c) => (c.founderBoost ?? 0) > 0).length;
  const penalties = heroSlotCands.filter((c) => (c.founderPenalty ?? 0) > 0).length;
  const rankShifts = heroSlotCands.filter(
    (c) => typeof c.rankDeltaFromFounder === "number" && c.rankDeltaFromFounder !== 0,
  );
  const hardHits = heroSlotCands.flatMap((c) =>
    (c.founderHits ?? []).filter((h) => h.severity === "hard"),
  );

  return (
    <div className="border border-neutral-200 p-4 text-xs">
      <div className="uppercase tracking-wider mb-3">
        {slotLabel} · {variant === "founder" ? "Founder Learning ON" : "Baseline"}
      </div>
      {variant === "founder" ? (
        <ul className="space-y-1 text-neutral-700">
          <li>Avg hero similarity: <b>{avgSim != null ? avgSim.toFixed(2) : "—"}</b></li>
          <li>Slots boosted: <b>{boosts}</b></li>
          <li>Slots penalized: <b>{penalties}</b></li>
          <li>Ranking shifts in hero: <b>{rankShifts.length}</b></li>
          <li>Hard excludes triggered: <b>{hardHits.length}</b></li>
        </ul>
      ) : (
        <div className="text-neutral-500">
          Editorial baseline — no Founder Learning signal applied.
        </div>
      )}
      {variant === "founder" && rankShifts.length > 0 && (
        <div className="mt-3">
          <div className="text-neutral-500 uppercase tracking-wider mb-1">Why these won</div>
          <ul className="space-y-1">
            {rankShifts.slice(0, 6).map((c) => (
              <li key={c.id} className="text-neutral-700">
                <b>{c.slot}</b> · {c.brand} — moved {c.rankDeltaFromFounder! < 0 ? "up" : "down"}{" "}
                {Math.abs(c.rankDeltaFromFounder!)} ranks
                {c.founderReasons?.length ? (
                  <span className="text-neutral-500"> ({c.founderReasons.join(", ")})</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
