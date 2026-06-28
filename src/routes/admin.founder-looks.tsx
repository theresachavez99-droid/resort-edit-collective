import { useMemo, useState } from "react";
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
} from "@/lib/founder-looks.functions";
import { generateYachtDayCollection } from "@/lib/stylist-engine.functions";

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
  const q = useQuery({
    queryKey: ["founder-looks", pw],
    queryFn: () => list({ data: { password: pw } }),
  });
  const seedM = useMutation({
    mutationFn: () => seed({ data: { password: pw } }),
    onSuccess: () => q.refetch(),
  });

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
          <div key={l.id} className="border p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{l.title}</div>
              <div className="text-xs text-neutral-500">
                {l.destination} · {l.moment} · {l.status}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(l.id)} className="text-xs underline">
                Edit
              </button>
              <button onClick={() => onValidate(l.id)} className="text-xs underline">
                Blind A/B
              </button>
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Blind A/B validation harness                                        */
/* ─────────────────────────────────────────────────────────────────── */

function ValidateTab({ pw, id }: { pw: string; id: string | null }) {
  const get = useServerFn(getFounderLook);
  const generate = useServerFn(generateYachtDayCollection);
  const record = useServerFn(recordValidationRun);
  const detail = useQuery({
    queryKey: ["founder-look", id, "validate"],
    queryFn: () => (id ? get({ data: { password: pw, id } }) : Promise.resolve(null)),
    enabled: !!id,
  });

  const [runs, setRuns] = useState<{
    A: unknown | null;
    B: unknown | null;
    revealed: boolean;
    founderSide: "A" | "B" | null;
  }>({ A: null, B: null, revealed: false, founderSide: null });
  const [running, setRunning] = useState(false);

  const look = detail.data && "ok" in detail.data && detail.data.ok ? detail.data.look : null;

  async function runAB() {
    if (!look) return;
    setRunning(true);
    // Randomize which side gets Founder Learning.
    const founderSide: "A" | "B" = Math.random() < 0.5 ? "A" : "B";
    const base = {
      password: pw,
      destination: look.destination,
      moment: look.moment,
      targetLooks: 4,
      includeOptional: true,
      discoveryMode: "fast" as const,
      enableCache: true,
    };
    try {
      const [a, b] = await Promise.all([
        generate({
          data: {
            ...base,
            activity: look.moment,
            founderLearning: founderSide === "A",
            founderLookId: founderSide === "A" ? look.id : null,
            validationLabel: "A",
          } as never,
        }),
        generate({
          data: {
            ...base,
            activity: look.moment,
            founderLearning: founderSide === "B",
            founderLookId: founderSide === "B" ? look.id : null,
            validationLabel: "B",
          } as never,
        }),
      ]);
      setRuns({ A: a, B: b, revealed: false, founderSide });
      // Persist for audit.
      await record({
        data: {
          password: pw,
          founder_look_id: look.id,
          destination: look.destination,
          moment: look.moment,
          run_a: a,
          run_b: b,
          founder_side: founderSide,
        },
      });
    } finally {
      setRunning(false);
    }
  }

  if (!look) return <div className="text-sm text-neutral-500">Select a Founder Look first.</div>;

  return (
    <div>
      <div className="mb-4 text-sm">
        Blind A/B for <span className="font-medium">{look.title}</span> ({look.destination} · {look.moment}).
      </div>
      <button
        onClick={runAB}
        disabled={running}
        className="bg-black text-white px-4 py-2 text-sm mb-6"
      >
        {running ? "Running both sides…" : "Run blind A/B"}
      </button>
      <div className="grid grid-cols-2 gap-6">
        <Side label="A" run={runs.A} revealed={runs.revealed} founderSide={runs.founderSide} />
        <Side label="B" run={runs.B} revealed={runs.revealed} founderSide={runs.founderSide} />
      </div>
      {runs.A && runs.B && !runs.revealed && (
        <button
          onClick={() => setRuns({ ...runs, revealed: true })}
          className="mt-6 border border-black px-4 py-2 text-sm"
        >
          Reveal which side used Founder Learning
        </button>
      )}
    </div>
  );
}

function Side({
  label,
  run,
  revealed,
  founderSide,
}: {
  label: "A" | "B";
  run: unknown;
  revealed: boolean;
  founderSide: "A" | "B" | null;
}) {
  if (!run) return <div className="border p-6 text-sm text-neutral-400">—</div>;
  const r = run as {
    ok?: boolean;
    looks?: Array<{
      title?: string;
      slots?: Array<{ slot?: string; brand?: string; product_name?: string; image_url?: string | null }>;
    }>;
    candidates?: Array<{
      slot?: string;
      brand?: string;
      title?: string | null;
      image?: string | null;
      editorialScore?: number;
      founderSimilarity?: number;
      founderHits?: Array<{ id: string; label: string; severity: string; delta: number }>;
      rankDeltaFromFounder?: number;
      founderReasons?: string[];
    }>;
  };
  const top = (r.candidates ?? []).slice(0, 24);
  const isFounder = revealed && founderSide === label;
  return (
    <div className={`border p-4 ${revealed && isFounder ? "border-green-600" : ""}`}>
      <div className="text-sm uppercase tracking-wider mb-3">
        Side {label}
        {revealed && (
          <span className={`ml-2 text-xs ${isFounder ? "text-green-700" : "text-neutral-400"}`}>
            {isFounder ? "★ Founder Learning ON" : "baseline"}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {top.map((c, i) => (
          <div key={i} className="text-[11px]">
            {c.image ? (
              <img src={c.image} alt="" className="w-full aspect-[3/4] object-cover bg-neutral-100" />
            ) : (
              <div className="w-full aspect-[3/4] bg-neutral-100" />
            )}
            <div className="mt-1 text-neutral-700">{c.brand}</div>
            <div className="text-neutral-400 line-clamp-1">{c.title ?? ""}</div>
            <div className="flex justify-between text-neutral-400">
              <span>{c.slot}</span>
              <span>{(c.editorialScore ?? 0).toFixed(1)}</span>
            </div>
            {revealed && c.founderSimilarity != null && (
              <div className="text-[10px] text-neutral-500">
                sim {c.founderSimilarity.toFixed(2)} · Δ{c.rankDeltaFromFounder ?? 0}
                {c.founderHits?.length ? (
                  <span className="ml-1 text-red-500">
                    [{c.founderHits.map((h) => h.id).join(",")}]
                  </span>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
