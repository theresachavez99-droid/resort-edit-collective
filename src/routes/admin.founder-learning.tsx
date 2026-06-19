import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  ingestUploadedUrl,
  listUploadedUrls,
  listBrandReviewQueue,
  reviewBrand,
  addFounderReference,
  listFounderReferences,
} from "@/lib/founder-learning.functions";

export const Route = createFileRoute("/admin/founder-learning")({
  head: () => ({
    meta: [
      { title: "Founder Learning — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: FounderLearningPage,
});

const STORAGE_KEY = "admin_founder_pw";
type Tab = "urls" | "queue" | "references";

function FounderLearningPage() {
  const [password, setPassword] = useState<string>(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(STORAGE_KEY) ?? "",
  );
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("urls");
  const verify = useServerFn(verifyAdmin);

  async function tryAuth(pw: string) {
    try {
      const r = await verify({ data: { password: pw } });
      if (r?.ok) {
        setAuthed(true);
        window.localStorage.setItem(STORAGE_KEY, pw);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (password) void tryAuth(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authed) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="mb-4 text-xl font-semibold">Founder Learning · Admin</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void tryAuth(password);
          }}
          className="space-y-3"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded border px-3 py-2"
          />
          <button type="submit" className="w-full rounded bg-black px-4 py-2 text-white">
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Founder Approval Learning Layer</h1>
          <p className="text-sm text-muted-foreground">
            Every URL, brand, and product you approve becomes training data for sourcing.
          </p>
        </div>
      </header>

      <div className="mb-6 flex gap-2 border-b">
        {(
          [
            ["urls", "Uploaded URLs"],
            ["queue", "Brand Review Queue"],
            ["references", "Founder References"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${
              tab === k ? "border-black font-semibold" : "border-transparent text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "urls" && <UrlsTab password={password} />}
      {tab === "queue" && <QueueTab password={password} />}
      {tab === "references" && <ReferencesTab password={password} />}
    </main>
  );
}

/* ───────── URLs ───────── */

function UrlsTab({ password }: { password: string }) {
  const qc = useQueryClient();
  const ingest = useServerFn(ingestUploadedUrl);
  const list = useServerFn(listUploadedUrls);
  const { data, isLoading } = useQuery({
    queryKey: ["uploaded-urls"],
    queryFn: () => list({ data: { password, limit: 100 } }),
  });
  const items = (data?.ok ? data.items : []) as Array<Record<string, unknown>>;

  const [url, setUrl] = useState("");
  const [destHint, setDestHint] = useState("portofino");
  const [activityHint, setActivityHint] = useState("");
  const [notes, setNotes] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      ingest({
        data: {
          password,
          url,
          destination_hint: destHint || undefined,
          activity_hint: activityHint || undefined,
          notes: notes || undefined,
        },
      }),
    onSuccess: () => {
      setUrl("");
      setNotes("");
      qc.invalidateQueries({ queryKey: ["uploaded-urls"] });
      qc.invalidateQueries({ queryKey: ["brand-review-queue"] });
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-semibold">Upload a collection URL</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Nordstrom curation · ShopMy board · LTK · MyTheresa · Saks · Revolve · Pinterest. The system
          will harvest products, identify brands, and queue unknown brands for your review.
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.nordstrom.com/sr?…"
            className="rounded border px-3 py-2 md:col-span-2"
          />
          <input
            value={destHint}
            onChange={(e) => setDestHint(e.target.value)}
            placeholder="Destination hint (e.g. portofino)"
            className="rounded border px-3 py-2"
          />
          <input
            value={activityHint}
            onChange={(e) => setActivityHint(e.target.value)}
            placeholder="Activity hint (e.g. yacht_day)"
            className="rounded border px-3 py-2"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="rounded border px-3 py-2 md:col-span-2"
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            disabled={!url || mut.isPending}
            onClick={() => mut.mutate()}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {mut.isPending ? "Harvesting…" : "Harvest URL"}
          </button>
          {mut.data?.ok && (
            <span className="text-xs text-emerald-700">
              ✓ {mut.data.products_found} products · {mut.data.brands_found} brands ·{" "}
              {mut.data.new_brands} new
            </span>
          )}
          {mut.data && !mut.data.ok && (
            <span className="text-xs text-red-600">{mut.data.error}</span>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Recent uploads</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No URLs uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((row) => (
              <li key={row.id as string} className="rounded border bg-card px-3 py-2 text-sm">
                <div className="flex justify-between gap-3">
                  <a
                    href={row.url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-blue-700 underline"
                  >
                    {row.url as string}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    {row.harvest_status as string}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {String(row.products_found ?? 0)} products · {String(row.brands_found ?? 0)} brands ·{" "}
                  {String(row.new_brands_count ?? 0)} new
                  {row.harvest_error ? ` · ⚠ ${row.harvest_error as string}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ───────── Brand Review Queue ───────── */

function QueueTab({ password }: { password: string }) {
  const qc = useQueryClient();
  const list = useServerFn(listBrandReviewQueue);
  const review = useServerFn(reviewBrand);
  const { data, isLoading } = useQuery({
    queryKey: ["brand-review-queue"],
    queryFn: () => list({ data: { password, status: "pending" } }),
  });
  const items = (data?.ok ? data.items : []) as Array<Record<string, unknown>>;

  const mut = useMutation({
    mutationFn: (vars: { queue_id: string; decision: "approve" | "approve_selectively" | "reject" }) =>
      review({ data: { password, ...vars } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand-review-queue"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">Queue empty. Upload a URL to surface new brands.</p>;

  return (
    <ul className="space-y-3">
      {items.map((row) => {
        const products = (Array.isArray(row.products_found) ? row.products_found : []) as Array<
          Record<string, unknown>
        >;
        return (
          <li key={row.id as string} className="rounded-lg border bg-card p-4">
            <header className="mb-2 flex items-baseline justify-between">
              <h3 className="text-base font-semibold">{row.brand as string}</h3>
              <span className="text-xs text-muted-foreground">
                Seen {String(row.times_seen ?? 1)}× ·{" "}
                {((row.source_urls as string[]) ?? []).length} source URL(s)
              </span>
            </header>
            {products.length > 0 && (
              <div className="mb-3 flex gap-2 overflow-x-auto">
                {products.slice(0, 8).map((p, i) => (
                  <div key={i} className="w-20 shrink-0">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_url as string}
                        alt={(p.product_name as string) ?? ""}
                        className="h-24 w-20 rounded object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-24 w-20 rounded bg-muted" />
                    )}
                    <p className="mt-1 truncate text-[10px] text-muted-foreground">
                      {(p.product_name as string) ?? ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => mut.mutate({ queue_id: row.id as string, decision: "approve" })}
                disabled={mut.isPending}
                className="rounded bg-emerald-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() =>
                  mut.mutate({ queue_id: row.id as string, decision: "approve_selectively" })
                }
                disabled={mut.isPending}
                className="rounded bg-amber-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
              >
                Approve Selectively
              </button>
              <button
                onClick={() => mut.mutate({ queue_id: row.id as string, decision: "reject" })}
                disabled={mut.isPending}
                className="rounded bg-red-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ───────── Founder References ───────── */

function ReferencesTab({ password }: { password: string }) {
  const qc = useQueryClient();
  const add = useServerFn(addFounderReference);
  const list = useServerFn(listFounderReferences);
  const { data, isLoading } = useQuery({
    queryKey: ["founder-references"],
    queryFn: () => list({ data: { password, limit: 100 } }),
  });
  const items = (data?.ok ? data.items : []) as Array<Record<string, unknown>>;

  const [form, setForm] = useState({
    brand: "",
    image_url: "",
    source_url: "",
    product_name: "",
    product_category: "",
    destination_tags: "portofino",
    activity_tags: "",
    style_tags: "",
    silhouette: "",
    print_language: "",
    color_story: "",
    texture: "",
    notes: "",
  });
  const toArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  const mut = useMutation({
    mutationFn: () =>
      add({
        data: {
          password,
          brand: form.brand,
          image_url: form.image_url || undefined,
          source_url: form.source_url || undefined,
          product_name: form.product_name || undefined,
          product_category: form.product_category || undefined,
          destination_tags: toArr(form.destination_tags),
          activity_tags: toArr(form.activity_tags),
          style_tags: toArr(form.style_tags),
          silhouette: form.silhouette || undefined,
          print_language: form.print_language || undefined,
          color_story: toArr(form.color_story),
          texture: form.texture || undefined,
          founder_notes: form.notes || undefined,
        },
      }),
    onSuccess: () => {
      setForm({ ...form, brand: "", image_url: "", source_url: "", product_name: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["founder-references"] });
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-semibold">Add a founder reference</h2>
        {(
          [
            ["brand", "Brand *"],
            ["product_name", "Product name"],
            ["image_url", "Image URL"],
            ["source_url", "Source URL"],
            ["product_category", "Category (e.g. dress, swimwear)"],
            ["destination_tags", "Destinations (comma)"],
            ["activity_tags", "Activities (comma)"],
            ["style_tags", "Style families (comma)"],
            ["silhouette", "Silhouette"],
            ["print_language", "Print language"],
            ["color_story", "Color story (comma)"],
            ["texture", "Texture"],
            ["notes", "Founder notes"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="mb-2 block text-xs">
            <span className="mb-0.5 block text-muted-foreground">{label}</span>
            <input
              value={form[k as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
        ))}
        <button
          type="button"
          disabled={!form.brand || mut.isPending}
          onClick={() => mut.mutate()}
          className="mt-2 w-full rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {mut.isPending ? "Saving…" : "Save reference"}
        </button>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Approved references ({items.length})</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No references yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {items.map((r) => (
              <article key={r.id as string} className="rounded border bg-card p-2 text-xs">
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.image_url as string}
                    alt={(r.product_name as string) ?? ""}
                    className="mb-2 h-40 w-full rounded object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="mb-2 h-40 w-full rounded bg-muted" />
                )}
                <p className="font-medium">{r.brand as string}</p>
                <p className="truncate text-muted-foreground">{(r.product_name as string) ?? ""}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {((r.destination_tags as string[]) ?? []).join(" · ")}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}