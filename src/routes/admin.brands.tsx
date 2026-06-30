import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listBrands,
  upsertBrand,
  setBrandStatus,
  deleteBrand,
  PRIMARY_CATEGORIES,
  ACTIVITY_STRENGTHS,
} from "@/lib/brands.functions";
// Performance tab retired in Consolidation Order Track A — restored in Track B
// when brand signals consolidate into Editorial Memory.

export const Route = createFileRoute("/admin/brands")({
  head: () => ({
    meta: [
      { title: "Brands — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BrandsAdminPage,
});

const STORAGE_KEY = "admin_brands_pw";
const STATUSES = ["pending", "approved", "archived"] as const;
const TIERS = ["hero", "discovery"] as const;

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  status: (typeof STATUSES)[number];
  tier: (typeof TIERS)[number];
  categories: string[];
  activities: string[];
  notes: string | null;
  why_we_love: string | null;
  created_at: string;
};

type FormState = {
  name: string;
  website: string;
  status: (typeof STATUSES)[number];
  tier: (typeof TIERS)[number];
  categories: string[];
  activities: string[];
  notes: string;
  why_we_love: string;
};

const emptyForm = (): FormState => ({
  name: "",
  website: "",
  status: "pending",
  tier: "discovery",
  categories: [],
  activities: [],
  notes: "",
  why_we_love: "",
});

function rowToForm(r: BrandRow): FormState {
  return {
    name: r.name,
    website: r.website ?? "",
    status: r.status,
    tier: r.tier,
    categories: r.categories,
    activities: r.activities,
    notes: r.notes ?? "",
    why_we_love: r.why_we_love ?? "",
  };
}

function formToInput(f: FormState) {
  return {
    name: f.name.trim(),
    website: f.website.trim() || null,
    status: f.status,
    tier: f.tier,
    categories: f.categories as (typeof PRIMARY_CATEGORIES)[number][],
    activities: f.activities as (typeof ACTIVITY_STRENGTHS)[number][],
    notes: f.notes.trim() || null,
    why_we_love: f.why_we_love.trim() || null,
  };
}

function BrandsAdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const verify = useServerFn(verifyAdmin);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setPassword(stored);
  }, []);

  if (!password) {
    return (
      <main className="min-h-screen bg-ivory text-ink flex items-center justify-center px-6">
        <form
          className="w-full max-w-sm border border-ink/20 bg-cream/30 p-8"
          onSubmit={async (e) => {
            e.preventDefault();
            setPwError(null);
            try {
              await verify({ data: { password: pwInput } });
              window.localStorage.setItem(STORAGE_KEY, pwInput);
              setPassword(pwInput);
            } catch {
              setPwError("Invalid password");
            }
          }}
        >
          <h1 className="font-display tracking-[0.18em] uppercase text-xl mb-6">Brands</h1>
          <label className="eyebrow tracking-[0.24em] text-[0.65rem] text-ink/60">
            Admin password
          </label>
          <input
            type="password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            className="mt-2 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            autoFocus
          />
          {pwError && <p className="mt-3 text-sm text-red-700">{pwError}</p>}
          <button
            type="submit"
            className="mt-6 w-full bg-ink text-ivory py-2.5 eyebrow tracking-[0.24em] text-[0.7rem]"
          >
            Unlock
          </button>
        </form>
      </main>
    );
  }

  return (
    <BrandsBoard
      password={password}
      onLogout={() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setPassword(null);
      }}
    />
  );
}

function BrandsBoard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listBrands);
  const upsertFn = useServerFn(upsertBrand);
  const statusFn = useServerFn(setBrandStatus);
  const delFn = useServerFn(deleteBrand);

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterTier, setFilterTier] = useState<string>("");
  const [search, setSearch] = useState("");

  const brandsQ = useQuery({
    queryKey: ["brands", filterStatus, filterCategory, filterTier, search],
    queryFn: () =>
      listFn({
        data: {
          password,
          status: (filterStatus || null) as (typeof STATUSES)[number] | null,
          category: (filterCategory || null) as (typeof PRIMARY_CATEGORIES)[number] | null,
          tier: (filterTier || null) as (typeof TIERS)[number] | null,
          search: search || null,
        },
      }),
  });

  const [editing, setEditing] = useState<BrandRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const upsertM = useMutation({
    mutationFn: async () => {
      const input = formToInput(form);
      if (!input.name) throw new Error("Brand name is required");
      return upsertFn({ data: { password, id: editing?.id, brand: input } });
    },
    onSuccess: () => {
      setEditing(null);
      setForm(emptyForm());
      setFormError(null);
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const statusM = useMutation({
    mutationFn: (v: { id: string; status: (typeof STATUSES)[number] }) =>
      statusFn({ data: { password, ...v } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { password, id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands"] }),
  });

  const rows = (brandsQ.data?.rows ?? []) as BrandRow[];

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, archived: 0, hero: 0, discovery: 0, total: rows.length };
    for (const r of rows) {
      c[r.status]++;
      c[r.tier]++;
    }
    return c;
  }, [rows]);

  function toggleArr<T extends string>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  return (
    <main className="min-h-screen bg-ivory text-ink px-6 md:px-10 py-10 max-w-[1500px] mx-auto">
      <header className="flex items-end justify-between flex-wrap gap-4 border-b border-ink/15 pb-6 mb-8">
        <div>
          <p className="eyebrow tracking-[0.34em] text-[0.62rem] text-gold">
            RESORT EDIT — ADMIN
          </p>
          <h1 className="font-display text-3xl md:text-4xl tracking-[0.12em] uppercase mt-2">
            Brands
          </h1>
          <p className="font-serif italic text-ink/65 mt-2 text-sm">
            The approved brand universe — affiliate status, editorial scoring, performance.
          </p>
        </div>
        <div className="text-xs text-ink/60 flex items-center gap-4 flex-wrap">
          <span>Total {counts.total}</span>
          <span>Approved {counts.approved}</span>
          <span>Pending {counts.pending}</span>
          <span>Archived {counts.archived}</span>
          <span>Hero {counts.hero}</span>
          <span>Discovery {counts.discovery}</span>
          <button onClick={onLogout} className="underline hover:text-gold">
            Log out
          </button>
        </div>
      </header>

      {/* Filters */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-ink/20 bg-ivory px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="border border-ink/20 bg-ivory px-3 py-2 text-sm"
        >
          <option value="">All tiers</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-ink/20 bg-ivory px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {PRIMARY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brand name"
          className="border border-ink/20 bg-ivory px-3 py-2 text-sm"
        />
      </section>

      {/* Editor */}
      <section className="border border-ink/15 bg-cream/30 p-6 mb-10">
        <h2 className="font-display tracking-[0.14em] uppercase text-lg mb-4">
          {editing ? `Edit: ${editing.name}` : "Add brand"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <Label>Brand name *</Label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label>Brand website</Label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://"
              className="mt-1 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as (typeof STATUSES)[number] })
              }
              className="mt-1 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Tier</Label>
            <select
              value={form.tier}
              onChange={(e) =>
                setForm({ ...form, tier: e.target.value as (typeof TIERS)[number] })
              }
              className="mt-1 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>Primary categories</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRIMARY_CATEGORIES.map((c) => {
                const on = form.categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, categories: toggleArr(form.categories, c) })
                    }
                    className={`eyebrow tracking-[0.18em] text-[0.62rem] px-3 py-1.5 border ${
                      on
                        ? "bg-ink text-ivory border-ink"
                        : "border-ink/25 bg-ivory text-ink/70"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Activity strengths</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACTIVITY_STRENGTHS.map((a) => {
                const on = form.activities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, activities: toggleArr(form.activities, a) })
                    }
                    className={`eyebrow tracking-[0.18em] text-[0.62rem] px-3 py-1.5 border ${
                      on
                        ? "bg-gold text-ink border-gold"
                        : "border-ink/25 bg-ivory text-ink/70"
                    }`}
                  >
                    {a.replace(/-/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>Why Resort Edit loves this brand</Label>
            <textarea
              value={form.why_we_love}
              onChange={(e) => setForm({ ...form, why_we_love: e.target.value })}
              rows={2}
              className="mt-1 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Brand notes (internal)</Label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="mt-1 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            />
          </div>
        </div>
        {formError && <p className="mt-3 text-sm text-red-700">{formError}</p>}
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => upsertM.mutate()}
            disabled={upsertM.isPending}
            className="bg-ink text-ivory eyebrow tracking-[0.24em] text-[0.7rem] px-5 py-2.5"
          >
            {upsertM.isPending ? "Saving…" : editing ? "Save changes" : "Add brand"}
          </button>
          {editing && (
            <button
              onClick={() => {
                setEditing(null);
                setForm(emptyForm());
                setFormError(null);
              }}
              className="border border-ink/30 eyebrow tracking-[0.24em] text-[0.7rem] px-5 py-2.5"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* Brand rows */}
      <section>
        <h2 className="font-display tracking-[0.14em] uppercase text-lg mb-4">
          Brands ({rows.length})
        </h2>
        {brandsQ.isLoading && <p className="text-sm text-ink/60">Loading…</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((r) => (
            <article
              key={r.id}
              className="border border-ink/15 bg-ivory p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display tracking-[0.08em] text-base truncate">
                    {r.name}
                  </p>
                  {r.website && (
                    <a
                      href={r.website}
                      target="_blank"
                      rel="noopener nofollow"
                      className="text-xs text-ink/55 underline truncate block"
                    >
                      {r.website}
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Pill kind="status" value={r.status} />
                  <Pill kind="tier" value={r.tier} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1 text-[0.62rem] text-ink/65">
                {r.categories.map((c) => (
                  <span key={c} className="border border-ink/15 px-1.5 py-0.5">
                    {c}
                  </span>
                ))}
              </div>
              {r.activities.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 text-[0.62rem] text-gold/80">
                  {r.activities.map((a) => (
                    <span key={a} className="border border-gold/30 px-1.5 py-0.5">
                      {a.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              )}
              {r.why_we_love && (
                <p className="font-serif italic text-ink/70 text-sm mt-3">
                  “{r.why_we_love}”
                </p>
              )}
              {r.notes && (
                <p className="text-xs text-ink/55 mt-2">{r.notes}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-[0.62rem]">
                <button
                  onClick={() => {
                    setEditing(r);
                    setForm(rowToForm(r));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="border border-ink/30 eyebrow tracking-[0.22em] px-3 py-1.5"
                >
                  Edit
                </button>
                {r.status !== "approved" && (
                  <button
                    onClick={() => statusM.mutate({ id: r.id, status: "approved" })}
                    className="border border-ink/30 eyebrow tracking-[0.22em] px-3 py-1.5"
                  >
                    Approve
                  </button>
                )}
                {r.status !== "archived" && (
                  <button
                    onClick={() => statusM.mutate({ id: r.id, status: "archived" })}
                    className="border border-ink/30 eyebrow tracking-[0.22em] px-3 py-1.5"
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Delete ${r.name}? This cannot be undone.`)) delM.mutate(r.id);
                  }}
                  className="border border-red-700/40 text-red-800 eyebrow tracking-[0.22em] px-3 py-1.5"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="eyebrow tracking-[0.24em] text-[0.62rem] text-ink/55 uppercase">
      {children}
    </label>
  );
}

function Pill({ kind, value }: { kind: "status" | "tier"; value: string }) {
  const tone =
    value === "approved" || value === "hero"
      ? "bg-gold/20 text-ink border-gold/40"
      : value === "archived"
        ? "bg-ink/10 text-ink/50 border-ink/20"
        : "bg-cream text-ink/70 border-ink/20";
  return (
    <span
      className={`eyebrow tracking-[0.2em] text-[0.55rem] px-2 py-0.5 border ${tone}`}
    >
      {kind === "tier" ? `${value} brand` : value}
    </span>
  );
}

function BrandPerformancePanel({ password }: { password: string }) {
  const fn = useServerFn(getBrandPerformance);
  const q = useQuery({
    queryKey: ["brand-performance"],
    queryFn: () => fn({ data: { password } }),
  });
  const rows = (q.data?.brands ?? []) as Array<{
    id: string;
    name: string;
    tier: string | null;
    commerceSource: string | null;
    totals: {
      appearances: number;
      approvals: number;
      rejections: number;
      publications: number;
      approvalRate: number | null;
      avgEditorialScore: number | null;
    };
    topAffinity: Array<[string, number]>;
  }>;
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.totals.publications - a.totals.publications),
    [rows],
  );
  if (q.isLoading) return <p className="text-sm text-ink/55">Loading performance…</p>;
  if (!sorted.length)
    return <p className="text-sm text-ink/55 italic">No performance signals yet.</p>;
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display tracking-[0.14em] uppercase text-lg">Performance</h2>
        <p className="font-serif italic text-ink/65 text-sm mt-1">
          Founder approval signals, publication frequency, and editorial affinity per brand.
        </p>
      </div>
      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full text-sm">
          <thead className="bg-cream/40 text-[0.62rem] tracking-[0.22em] uppercase text-ink/55">
            <tr>
              <th className="text-left px-3 py-2">Brand</th>
              <th className="text-left px-3 py-2">Tier</th>
              <th className="text-right px-3 py-2">Appearances</th>
              <th className="text-right px-3 py-2">Approved</th>
              <th className="text-right px-3 py-2">Rejected</th>
              <th className="text-right px-3 py-2">Published</th>
              <th className="text-right px-3 py-2">Avg Score</th>
              <th className="text-left px-3 py-2">Top Contexts</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => (
              <tr key={b.id} className="border-t border-ink/10">
                <td className="px-3 py-2 font-display tracking-[0.06em]">{b.name}</td>
                <td className="px-3 py-2 text-ink/65">{b.tier ?? "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{b.totals.appearances}</td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-800">
                  {b.totals.approvals}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-red-700">
                  {b.totals.rejections}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{b.totals.publications}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {b.totals.avgEditorialScore != null
                    ? b.totals.avgEditorialScore.toFixed(1)
                    : "—"}
                </td>
                <td className="px-3 py-2 text-[0.7rem] text-ink/65">
                  {b.topAffinity
                    .slice(0, 3)
                    .map(([ctx, v]) => `${ctx} ${v}`)
                    .join(" · ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}