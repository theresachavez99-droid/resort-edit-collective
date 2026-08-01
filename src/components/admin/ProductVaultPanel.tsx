import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listVaultProducts,
  upsertVaultProduct,
  setVaultProductStatus,
  setVaultInventoryStatus,
  deleteVaultProduct,
  promoteSourcedToVault,
} from "@/lib/vault.functions";
import { listSourcedProducts } from "@/lib/firecrawl.functions";


const STORAGE_KEY = "admin_product_vault_pw";

const CATEGORIES = [
  "swimwear",
  "coverup",
  "dress",
  "top",
  "shorts",
  "pants",
  "skirt",
  "sandals",
  "espadrilles",
  "flats",
  "heels",
  "bag",
  "sunglasses",
  "earrings",
  "necklace",
  "bracelet",
  "ring",
  "hair",
] as const;

const APPROVAL_STATUSES = ["pending", "approved", "rejected", "archived"] as const;
const INVENTORY_STATUSES = ["in_stock", "low_stock", "out_of_stock", "unknown"] as const;

type VaultRow = {
  id: string;
  product_name: string;
  brand: string;
  retailer: string | null;
  affiliate_url: string;
  brand_url: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  price: number | null;
  currency: string | null;
  inventory_status: (typeof INVENTORY_STATUSES)[number];
  category: string;
  subcategory: string | null;
  destination_tags: string[];
  activity_tags: string[];
  color_tags: string[];
  print_tags: string[];
  material_tags: string[];
  silhouette_tags: string[];
  luxury_score: number | null;
  resort_edit_score: number | null;
  approval_status: (typeof APPROVAL_STATUSES)[number];
  notes: string | null;
  last_verified_at: string | null;
  approved_at: string | null;
  created_at: string;
  source_sourced_product_id: string | null;
};

function emptyForm(): VaultFormState {
  return {
    product_name: "",
    brand: "",
    retailer: "",
    affiliate_url: "",
    brand_url: "",
    image_url: "",
    price: "",
    category: "dress",
    subcategory: "",
    destination_tags: "",
    activity_tags: "",
    color_tags: "",
    print_tags: "",
    material_tags: "",
    silhouette_tags: "",
    luxury_score: "",
    resort_edit_score: "",
    notes: "",
  };
}

type VaultFormState = {
  product_name: string;
  brand: string;
  retailer: string;
  affiliate_url: string;
  brand_url: string;
  image_url: string;
  price: string;
  category: string;
  subcategory: string;
  destination_tags: string;
  activity_tags: string;
  color_tags: string;
  print_tags: string;
  material_tags: string;
  silhouette_tags: string;
  luxury_score: string;
  resort_edit_score: string;
  notes: string;
};

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formToInput(f: VaultFormState) {
  return {
    product_name: f.product_name.trim(),
    brand: f.brand.trim(),
    retailer: f.retailer.trim() || null,
    affiliate_url: f.affiliate_url.trim(),
    brand_url: f.brand_url.trim() || null,
    image_url: f.image_url.trim() || null,
    price: f.price ? Number(f.price) : null,
    category: f.category.trim(),
    subcategory: f.subcategory.trim() || null,
    destination_tags: parseTags(f.destination_tags),
    activity_tags: parseTags(f.activity_tags),
    color_tags: parseTags(f.color_tags),
    print_tags: parseTags(f.print_tags),
    material_tags: parseTags(f.material_tags),
    silhouette_tags: parseTags(f.silhouette_tags),
    luxury_score: f.luxury_score ? Number(f.luxury_score) : null,
    resort_edit_score: f.resort_edit_score ? Number(f.resort_edit_score) : null,
    notes: f.notes.trim() || null,
  };
}

function rowToForm(r: VaultRow): VaultFormState {
  return {
    product_name: r.product_name,
    brand: r.brand,
    retailer: r.retailer ?? "",
    affiliate_url: r.affiliate_url,
    brand_url: r.brand_url ?? "",
    image_url: r.image_url ?? "",
    price: r.price != null ? String(r.price) : "",
    category: r.category,
    subcategory: r.subcategory ?? "",
    destination_tags: r.destination_tags.join(", "),
    activity_tags: r.activity_tags.join(", "),
    color_tags: r.color_tags.join(", "),
    print_tags: r.print_tags.join(", "),
    material_tags: r.material_tags.join(", "),
    silhouette_tags: r.silhouette_tags.join(", "),
    luxury_score: r.luxury_score != null ? String(r.luxury_score) : "",
    resort_edit_score: r.resort_edit_score != null ? String(r.resort_edit_score) : "",
    notes: r.notes ?? "",
  };
}

export function ProductVaultPanel() {
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
          <h1 className="font-display tracking-[0.18em] uppercase text-xl mb-6">Product Vault</h1>
          <label className="eyebrow tracking-[0.24em] text-[0.65rem] text-ink/60">Admin password</label>
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

  return <VaultBoard password={password} onLogout={() => { window.localStorage.removeItem(STORAGE_KEY); setPassword(null); }} />;
}

function VaultBoard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listVaultProducts);
  const upsertFn = useServerFn(upsertVaultProduct);
  const statusFn = useServerFn(setVaultProductStatus);
  const invFn = useServerFn(setVaultInventoryStatus);
  const delFn = useServerFn(deleteVaultProduct);
  const promoteFn = useServerFn(promoteSourcedToVault);
  const sourcedFn = useServerFn(listSourcedProducts);

  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [search, setSearch] = useState("");

  const vault = useQuery({
    queryKey: ["vault", filterStatus, filterCategory, search],
    queryFn: () =>
      listFn({
        data: {
          password,
          status: (filterStatus || null) as (typeof APPROVAL_STATUSES)[number] | null,
          category: filterCategory || null,
          search: search || null,
        },
      }),
  });

  const sourced = useQuery({
    queryKey: ["sourced-for-vault"],
    queryFn: () => sourcedFn({ data: { password } }),
  });

  const sourcedReady = useMemo(
    () => (sourced.data?.rows ?? []).filter((r) => r.status === "scraped" && r.image_url),
    [sourced.data],
  );

  const [editing, setEditing] = useState<VaultRow | null>(null);
  const [form, setForm] = useState<VaultFormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const upsertM = useMutation({
    mutationFn: async () => {
      const input = formToInput(form);
      if (!input.product_name || !input.brand || !input.affiliate_url) {
        throw new Error("Name, brand, and affiliate URL are required");
      }
      return upsertFn({
        data: { password, id: editing?.id, product: input },
      });
    },
    onSuccess: () => {
      setEditing(null);
      setForm(emptyForm());
      setFormError(null);
      qc.invalidateQueries({ queryKey: ["vault"] });
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const statusM = useMutation({
    mutationFn: (v: { id: string; approval_status: (typeof APPROVAL_STATUSES)[number] }) =>
      statusFn({ data: { password, ...v } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });

  const invM = useMutation({
    mutationFn: (v: { id: string; inventory_status: (typeof INVENTORY_STATUSES)[number] }) =>
      invFn({ data: { password, ...v } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });

  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { password, id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vault"] }),
  });

  const promoteM = useMutation({
    mutationFn: (sourcedId: string) =>
      promoteFn({ data: { password, sourced_id: sourcedId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vault"] });
      qc.invalidateQueries({ queryKey: ["sourced-for-vault"] });
    },
  });

  const rows = (vault.data?.rows ?? []) as VaultRow[];

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, archived: 0 };
    for (const r of rows) c[r.approval_status]++;
    return c;
  }, [rows]);

  return (
    <main className="min-h-screen bg-ivory text-ink px-6 md:px-10 py-10 max-w-[1500px] mx-auto">
      <header className="flex items-end justify-between flex-wrap gap-4 border-b border-ink/15 pb-6 mb-8">
        <div>
          <p className="eyebrow tracking-[0.34em] text-[0.62rem] text-gold">RESORT EDIT — ADMIN</p>
          <h1 className="font-display text-3xl md:text-4xl tracking-[0.12em] uppercase mt-2">
            Product Vault
          </h1>
          <p className="font-serif italic text-ink/65 mt-2 text-sm">
            Permanent library of Resort Edit–approved products. Source once, reuse across destinations.
          </p>
        </div>
        <div className="text-xs text-ink/60 flex items-center gap-4">
          <span>Pending {counts.pending}</span>
          <span>Approved {counts.approved}</span>
          <span>Rejected {counts.rejected}</span>
          <button onClick={onLogout} className="underline hover:text-gold">Log out</button>
        </div>
      </header>

      {/* Filters */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-ink/20 bg-ivory px-3 py-2 text-sm"
        >
          <option value="">All approval statuses</option>
          {APPROVAL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-ink/20 bg-ivory px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or brand"
          className="border border-ink/20 bg-ivory px-3 py-2 text-sm md:col-span-2"
        />
      </section>

      {/* Editor */}
      <section className="border border-ink/15 bg-cream/30 p-6 mb-10">
        <h2 className="font-display tracking-[0.14em] uppercase text-lg mb-4">
          {editing ? `Edit: ${editing.product_name}` : "Add product"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <Field label="Product name *" value={form.product_name} onChange={(v) => setForm({ ...form, product_name: v })} />
          <Field label="Brand *" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
          <Field label="Retailer" value={form.retailer} onChange={(v) => setForm({ ...form, retailer: v })} />
          <Field label="Affiliate URL *" value={form.affiliate_url} onChange={(v) => setForm({ ...form, affiliate_url: v })} />
          <Field label="Brand URL" value={form.brand_url} onChange={(v) => setForm({ ...form, brand_url: v })} />
          <Field label="Image URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />
          <Field label="Price (USD)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" />
          <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={[...CATEGORIES]} />
          <Field label="Subcategory" value={form.subcategory} onChange={(v) => setForm({ ...form, subcategory: v })} />
          <Field label="Destination tags (comma)" value={form.destination_tags} onChange={(v) => setForm({ ...form, destination_tags: v })} />
          <Field label="Activity tags (comma)" value={form.activity_tags} onChange={(v) => setForm({ ...form, activity_tags: v })} />
          <Field label="Color tags (comma)" value={form.color_tags} onChange={(v) => setForm({ ...form, color_tags: v })} />
          <Field label="Print tags (comma)" value={form.print_tags} onChange={(v) => setForm({ ...form, print_tags: v })} />
          <Field label="Material tags (comma)" value={form.material_tags} onChange={(v) => setForm({ ...form, material_tags: v })} />
          <Field label="Silhouette tags (comma)" value={form.silhouette_tags} onChange={(v) => setForm({ ...form, silhouette_tags: v })} />
          <Field label="Luxury score 0–10" value={form.luxury_score} onChange={(v) => setForm({ ...form, luxury_score: v })} type="number" />
          <Field label="Resort Edit score 0–10" value={form.resort_edit_score} onChange={(v) => setForm({ ...form, resort_edit_score: v })} type="number" />
          <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
        </div>
        {formError && <p className="mt-3 text-sm text-red-700">{formError}</p>}
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => upsertM.mutate()}
            disabled={upsertM.isPending}
            className="bg-ink text-ivory eyebrow tracking-[0.24em] text-[0.7rem] px-5 py-2.5"
          >
            {upsertM.isPending ? "Saving…" : editing ? "Save changes" : "Add to vault"}
          </button>
          {editing && (
            <button
              onClick={() => { setEditing(null); setForm(emptyForm()); setFormError(null); }}
              className="border border-ink/30 eyebrow tracking-[0.24em] text-[0.7rem] px-5 py-2.5"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* Vault rows */}
      <section className="mb-12">
        <h2 className="font-display tracking-[0.14em] uppercase text-lg mb-4">
          Vault ({rows.length})
        </h2>
        {vault.isLoading && <p className="text-sm text-ink/60">Loading…</p>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rows.map((r) => (
            <article key={r.id} className="border border-ink/15 bg-ivory p-4 flex gap-4">
              {r.image_url ? (
                <img src={r.image_url} alt="" className="w-24 h-32 object-cover bg-cream/40" />
              ) : (
                <div className="w-24 h-32 bg-cream/50 flex items-center justify-center text-[0.6rem] text-ink/40">no image</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="eyebrow tracking-[0.24em] text-[0.6rem] text-gold">{r.brand}</p>
                    <p className="font-display tracking-[0.06em] text-sm truncate">{r.product_name}</p>
                    <p className="text-xs text-ink/55 mt-1">
                      {r.category}{r.subcategory ? ` · ${r.subcategory}` : ""}{r.price ? ` · $${r.price}` : ""}
                    </p>
                  </div>
                  <Pill status={r.approval_status} />
                </div>
                <p className="mt-2 text-[0.7rem] text-ink/55">
                  Inv: <span className="font-mono">{r.inventory_status}</span>
                  {r.luxury_score != null && ` · Lux ${r.luxury_score}`}
                  {r.resort_edit_score != null && ` · RE ${r.resort_edit_score}`}
                </p>
                <div className="mt-2 flex flex-wrap gap-1 text-[0.62rem] text-ink/60">
                  {[
                    ...r.destination_tags.map((t) => `dest:${t}`),
                    ...r.activity_tags.map((t) => `act:${t}`),
                    ...r.color_tags.map((t) => `col:${t}`),
                  ].slice(0, 8).map((t) => (
                    <span key={t} className="border border-ink/15 px-1.5 py-0.5">{t}</span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.65rem]">
                  <a href={r.affiliate_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold">link</a>
                  <button
                    onClick={() => { setEditing(r); setForm(rowToForm(r)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="border border-ink/25 px-2 py-1 hover:border-gold"
                  >Edit</button>
                  {r.approval_status !== "approved" && (
                    <button
                      onClick={() => statusM.mutate({ id: r.id, approval_status: "approved" })}
                      className="border border-ink/25 px-2 py-1 hover:border-gold"
                    >Approve</button>
                  )}
                  {r.approval_status !== "rejected" && (
                    <button
                      onClick={() => statusM.mutate({ id: r.id, approval_status: "rejected" })}
                      className="border border-ink/25 px-2 py-1 hover:border-gold"
                    >Reject</button>
                  )}
                  <select
                    value={r.inventory_status}
                    onChange={(e) => invM.mutate({ id: r.id, inventory_status: e.target.value as (typeof INVENTORY_STATUSES)[number] })}
                    className="border border-ink/25 px-2 py-1 bg-ivory"
                  >
                    {INVENTORY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => { if (confirm(`Delete "${r.product_name}"?`)) delM.mutate(r.id); }}
                    className="text-red-700 hover:underline ml-auto"
                  >Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Promote from sourced */}
      <section className="mt-10 border-t border-ink/15 pt-8">
        <h2 className="font-display tracking-[0.14em] uppercase text-lg mb-3">
          Promote from sourcing queue ({sourcedReady.length})
        </h2>
        <p className="text-xs text-ink/55 mb-4">
          Scraped products from the Firecrawl queue. Promote moves them into the vault as <em>pending</em> for tagging and approval.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sourcedReady.map((s) => (
            <div key={s.id} className="border border-ink/15 bg-ivory p-3 flex gap-3 text-xs">
              {s.image_url ? (
                <img src={s.image_url} alt="" className="w-16 h-20 object-cover bg-cream/40" />
              ) : (
                <div className="w-16 h-20 bg-cream/50" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display tracking-[0.05em] truncate">{s.brand ?? "—"}</p>
                <p className="text-ink/65 truncate">{s.product_name ?? s.source_url}</p>
                <p className="text-ink/45 truncate">{s.slot_category ?? ""}</p>
                <button
                  onClick={() => promoteM.mutate(s.id)}
                  disabled={promoteM.isPending}
                  className="mt-2 border border-ink/25 px-2 py-1 hover:border-gold"
                >
                  Promote
                </button>
              </div>
            </div>
          ))}
          {sourcedReady.length === 0 && <p className="text-xs text-ink/50">No scraped items ready.</p>}
        </div>
      </section>
    </main>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="eyebrow tracking-[0.2em] text-[0.6rem] text-ink/55">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-ink/20 bg-ivory px-2.5 py-1.5"
      />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="eyebrow tracking-[0.2em] text-[0.6rem] text-ink/55">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-ink/20 bg-ivory px-2.5 py-1.5"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Pill({ status }: { status: VaultRow["approval_status"] }) {
  const color =
    status === "approved" ? "bg-emerald-50 text-emerald-800 border-emerald-200"
    : status === "rejected" ? "bg-red-50 text-red-800 border-red-200"
    : status === "archived" ? "bg-ink/5 text-ink/60 border-ink/20"
    : "bg-amber-50 text-amber-800 border-amber-200";
  return (
    <span className={`eyebrow tracking-[0.22em] text-[0.55rem] border px-1.5 py-0.5 ${color}`}>{status}</span>
  );
}