import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listProductHealth,
  runProductHealthCheck,
  setProductStatus,
  promoteBackup,
  upsertReplacementCandidate,
  approveReplacementCandidate,
} from "@/lib/product-health.functions";
import {
  PRODUCT_STATUSES,
  MAX_BACKUPS_PER_SLOT,
  resolveSlot,
  type ProductStatus,
  type SlotProductDisplay,
} from "@/lib/product-health";

/**
 * /admin/product-health — operational product availability desk.
 *
 * Looks are permanent editorial concepts; commerce items are replaceable. This
 * screen shows every slot, which product is publicly displayed right now, the
 * approved backups behind it, and the replacement-candidate queue. Nothing is
 * ever published automatically: approval is always a human action here.
 */
export const Route = createFileRoute("/admin/product-health")({
  head: () => ({
    meta: [
      { title: "Product Health — Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProductHealthPage,
});

const STORAGE_KEY = "admin_dashboard_pw";

type ProductRow = {
  id: string;
  destination: string;
  moment: string;
  look_key: string;
  slot: string;
  slot_label: string | null;
  brand: string;
  product_name: string;
  retailer: string | null;
  url: string | null;
  price: string | null;
  status: string;
  last_checked_at: string | null;
  last_http_status: number | null;
  last_seen_available_at: string | null;
  is_primary: boolean;
  replacement_priority: number;
  notes: string | null;
};

type CandidateRow = {
  id: string;
  slot_product_id: string | null;
  look_key: string;
  slot: string;
  brand: string;
  product_name: string;
  retailer: string | null;
  pdp_url: string;
  price: string | null;
  matching_score: number | null;
  rationale: string | null;
  verified_at: string | null;
  approval_status: string;
  source: string;
};

function fmt(ts: string | null): string {
  if (!ts) return "never";
  return new Date(ts).toLocaleString();
}

function statusTone(status: string): string {
  if (status === "active") return "text-emerald-700";
  if (status === "needs_review") return "text-amber-700";
  return "text-red-700";
}

function ProductHealthPage() {
  const listFn = useServerFn(listProductHealth);
  const checkFn = useServerFn(runProductHealthCheck);
  const statusFn = useServerFn(setProductStatus);
  const promoteFn = useServerFn(promoteBackup);
  const approveFn = useServerFn(approveReplacementCandidate);
  const qc = useQueryClient();

  const [pw, setPw] = useState("");
  useEffect(() => {
    const c = sessionStorage.getItem(STORAGE_KEY);
    if (c) setPw(c);
  }, []);

  const data = useQuery({
    queryKey: ["admin-product-health"],
    enabled: Boolean(pw),
    queryFn: () => listFn({ data: { password: pw } }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-product-health"] });

  const check = useMutation({
    mutationFn: (vars: { productId?: string }) =>
      checkFn({ data: { password: pw, ...vars } }),
    onSuccess: invalidate,
  });
  const mark = useMutation({
    mutationFn: (vars: { productId: string; status: ProductStatus }) =>
      statusFn({ data: { password: pw, ...vars } }),
    onSuccess: invalidate,
  });
  const promote = useMutation({
    mutationFn: (productId: string) => promoteFn({ data: { password: pw, productId } }),
    onSuccess: invalidate,
  });
  const decide = useMutation({
    mutationFn: (vars: { candidateId: string; decision: "approved" | "rejected" }) =>
      approveFn({ data: { password: pw, ...vars } }),
    onSuccess: invalidate,
  });

  if (!pw) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-serif text-2xl mb-4">Product Health</h1>
        <p className="text-sm text-stone-600 mb-4">
          Enter the Studio password (or unlock from the Studio dashboard).
        </p>
        <input
          type="password"
          placeholder="Admin password"
          className="w-full border border-stone-300 px-3 py-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value;
              if (v) {
                sessionStorage.setItem(STORAGE_KEY, v);
                setPw(v);
              }
            }
          }}
        />
      </main>
    );
  }

  const products = (data.data?.products ?? []) as ProductRow[];
  const candidates = (data.data?.candidates ?? []) as CandidateRow[];

  // Group by look_key + slot so each row shows the public product plus backups.
  const groups = new Map<string, ProductRow[]>();
  for (const p of products) {
    const key = `${p.look_key}::${p.slot}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Studio · Internal Only
          </p>
          <h1 className="font-serif text-3xl mt-1">Product Health</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-xs underline text-stone-600">
            ← Studio
          </Link>
          <button
            onClick={() => check.mutate({})}
            disabled={check.isPending}
            className="bg-stone-900 text-white px-4 py-2 text-[0.7rem] tracking-[0.2em] uppercase disabled:opacity-40"
          >
            {check.isPending ? "Checking…" : "Run health check"}
          </button>
        </div>
      </div>

      {check.data && (
        <p className="mt-3 text-xs text-stone-600">
          Checked {check.data.count} link(s).{" "}
          {check.data.checked.filter((c) => c.changed).length} status change(s).
        </p>
      )}
      {(check.error || mark.error || promote.error || decide.error) && (
        <p className="mt-3 text-xs text-red-600">
          {String(
            (check.error || mark.error || promote.error || decide.error) as Error,
          )}
        </p>
      )}

      {data.isLoading && <p className="mt-8 text-sm text-stone-500">Loading…</p>}
      {data.error && (
        <p className="mt-8 text-sm text-red-600">Unauthorized or failed to load.</p>
      )}

      {groups.size === 0 && !data.isLoading && (
        <p className="mt-8 text-sm text-stone-500">
          No slots are under availability management yet.
        </p>
      )}

      <div className="mt-8 space-y-8">
        {[...groups.entries()].map(([key, rows]) => {
          const display = resolveSlot(
            rows.map(
              (r) =>
                ({
                  destination: r.destination,
                  moment: r.moment,
                  look_key: r.look_key,
                  slot: r.slot,
                  slot_label: r.slot_label,
                  brand: r.brand,
                  product_name: r.product_name,
                  retailer: r.retailer,
                  url: r.url,
                  price: r.price,
                  status: r.status as ProductStatus,
                  is_primary: r.is_primary,
                  replacement_priority: r.replacement_priority,
                }) satisfies SlotProductDisplay,
            ),
          );
          const primary = rows.find((r) => r.is_primary);
          const backups = rows.filter((r) => !r.is_primary);
          const slotCandidates = candidates.filter(
            (c) => c.look_key === rows[0]!.look_key && c.slot === rows[0]!.slot,
          );
          return (
            <section key={key} className="border border-stone-200">
              <header className="bg-stone-50 px-4 py-3 flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <div className="text-[0.62rem] tracking-[0.3em] uppercase text-stone-500">
                    {rows[0]!.destination} · {rows[0]!.moment} ·{" "}
                    {rows[0]!.slot_label ?? rows[0]!.slot}
                  </div>
                  <div className="font-serif text-lg mt-0.5">
                    {rows[0]!.look_key} — {rows[0]!.slot}
                  </div>
                </div>
                <div className="text-xs">
                  <span className="uppercase tracking-[0.2em] text-stone-500">
                    Public now:
                  </span>{" "}
                  {display.state === "live" ? (
                    <span className="text-emerald-700">
                      {display.product.brand} — {display.product.product_name}
                      {display.promotedBackup ? " (backup)" : ""}
                    </span>
                  ) : (
                    <span className="text-amber-700">Replacement in review</span>
                  )}
                </div>
              </header>

              <table className="w-full text-xs">
                <thead className="text-left text-stone-500">
                  <tr className="border-b border-stone-200">
                    <th className="px-4 py-2 font-normal">Role</th>
                    <th className="px-4 py-2 font-normal">Product</th>
                    <th className="px-4 py-2 font-normal">Retailer</th>
                    <th className="px-4 py-2 font-normal">Status</th>
                    <th className="px-4 py-2 font-normal">Last checked</th>
                    <th className="px-4 py-2 font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...(primary ? [primary] : []), ...backups].map((r) => (
                    <tr key={r.id} className="border-b border-stone-100 align-top">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.is_primary ? "Primary" : `Backup #${r.replacement_priority}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.brand}</div>
                        <div className="text-stone-600">{r.product_name}</div>
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[0.68rem] underline text-stone-500 break-all"
                          >
                            {r.url}
                          </a>
                        )}
                        {r.notes && (
                          <div className="text-[0.68rem] text-stone-500 mt-1">{r.notes}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">{r.retailer ?? "—"}</td>
                      <td className={`px-4 py-3 whitespace-nowrap ${statusTone(r.status)}`}>
                        {r.status}
                        {r.last_http_status ? ` (${r.last_http_status})` : ""}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-stone-500">
                        {fmt(r.last_checked_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => check.mutate({ productId: r.id })}
                            className="border border-stone-300 px-2 py-1"
                          >
                            Check
                          </button>
                          {PRODUCT_STATUSES.filter((s) => s !== r.status).map((s) => (
                            <button
                              key={s}
                              onClick={() => mark.mutate({ productId: r.id, status: s })}
                              className="border border-stone-300 px-2 py-1"
                            >
                              Mark {s.replace("_", " ")}
                            </button>
                          ))}
                          {!r.is_primary && r.status === "active" && (
                            <button
                              onClick={() => promote.mutate(r.id)}
                              className="bg-stone-900 text-white px-2 py-1"
                            >
                              Promote
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-4 py-4 border-t border-stone-200 bg-white">
                <div className="text-[0.62rem] tracking-[0.3em] uppercase text-stone-500 mb-2">
                  Replacement candidates ({backups.length}/{MAX_BACKUPS_PER_SLOT} backups
                  approved)
                </div>
                {slotCandidates.length === 0 && (
                  <p className="text-xs text-stone-500 mb-3">
                    None yet — add one below. AI sourcing will write into this same queue.
                  </p>
                )}
                <ul className="space-y-2 mb-4">
                  {slotCandidates.map((c) => (
                    <li key={c.id} className="text-xs flex flex-wrap gap-3 items-baseline">
                      <span className="font-medium">{c.brand}</span>
                      <span className="text-stone-600">{c.product_name}</span>
                      <span className="text-stone-500">{c.price ?? "—"}</span>
                      <span className="text-stone-500">
                        match {c.matching_score ?? "—"}
                      </span>
                      <a
                        href={c.pdp_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-stone-500 break-all"
                      >
                        PDP
                      </a>
                      <span className="uppercase tracking-[0.15em] text-stone-500">
                        {c.approval_status}
                      </span>
                      {c.approval_status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              decide.mutate({ candidateId: c.id, decision: "approved" })
                            }
                            className="bg-stone-900 text-white px-2 py-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              decide.mutate({ candidateId: c.id, decision: "rejected" })
                            }
                            className="border border-stone-300 px-2 py-1"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {c.rationale && (
                        <span className="text-stone-500 basis-full">{c.rationale}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {primary && (
                  <CandidateForm pw={pw} slotProductId={primary.id} onSaved={invalidate} />
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

/** Manual entry of a replacement candidate — same shape AI sourcing will emit. */
function CandidateForm({
  pw,
  slotProductId,
  onSaved,
}: {
  pw: string;
  slotProductId: string;
  onSaved: () => void;
}) {
  const upsertFn = useServerFn(upsertReplacementCandidate);
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [retailer, setRetailer] = useState("");
  const [pdpUrl, setPdpUrl] = useState("");
  const [price, setPrice] = useState("");
  const [score, setScore] = useState("");
  const [rationale, setRationale] = useState("");

  const save = useMutation({
    mutationFn: () =>
      upsertFn({
        data: {
          password: pw,
          slotProductId,
          brand,
          productName,
          pdpUrl,
          ...(retailer ? { retailer } : {}),
          ...(price ? { price } : {}),
          ...(score ? { matchingScore: Number(score) } : {}),
          ...(rationale ? { rationale } : {}),
          source: "manual",
        },
      }),
    onSuccess: () => {
      setBrand("");
      setProductName("");
      setRetailer("");
      setPdpUrl("");
      setPrice("");
      setScore("");
      setRationale("");
      onSaved();
    },
  });

  const input = "border border-stone-300 px-2 py-1 text-xs";
  return (
    <div className="border-t border-stone-100 pt-3">
      <div className="grid gap-2 md:grid-cols-3">
        <input className={input} placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
        <input className={input} placeholder="Product name" value={productName} onChange={(e) => setProductName(e.target.value)} />
        <input className={input} placeholder="Retailer" value={retailer} onChange={(e) => setRetailer(e.target.value)} />
        <input className={`${input} md:col-span-2`} placeholder="Exact PDP URL" value={pdpUrl} onChange={(e) => setPdpUrl(e.target.value)} />
        <input className={input} placeholder="Price (e.g. $228)" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className={input} placeholder="Match score 0–100" value={score} onChange={(e) => setScore(e.target.value)} />
        <input className={`${input} md:col-span-2`} placeholder="Rationale" value={rationale} onChange={(e) => setRationale(e.target.value)} />
      </div>
      <button
        onClick={() => save.mutate()}
        disabled={!brand || !productName || !pdpUrl || save.isPending}
        className="mt-2 bg-stone-900 text-white px-3 py-1.5 text-[0.68rem] tracking-[0.2em] uppercase disabled:opacity-40"
      >
        {save.isPending ? "Saving…" : "Add candidate"}
      </button>
      {save.error && (
        <p className="text-xs text-red-600 mt-2">{(save.error as Error).message}</p>
      )}
    </div>
  );
}
