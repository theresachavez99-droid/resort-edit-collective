import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  listEditorialMemory,
  getEditorialMemorySummary,
  setSignaturePiece,
  getProductMemoryDetail,
  type MemoryProductRow,
  type ShareRow,
} from "@/lib/editorial-memory.functions";


const STORAGE_KEY = "admin_dashboard_pw";

export function EditorialMemoryPanel() {
  const [pw, setPw] = useState("");
  useEffect(() => {
    const c = sessionStorage.getItem(STORAGE_KEY);
    if (c) setPw(c);
  }, []);

  const [destination, setDestination] = useState<string>("");
  const [moment, setMoment] = useState<string>("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [signatureOnly, setSignatureOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const listFn = useServerFn(listEditorialMemory);
  const summaryFn = useServerFn(getEditorialMemorySummary);
  const detailFn = useServerFn(getProductMemoryDetail);
  const setSigFn = useServerFn(setSignaturePiece);

  const list = useQuery({
    queryKey: ["memory-list", pw, destination, moment, brand, category, signatureOnly, search],
    enabled: !!pw,
    queryFn: () =>
      listFn({
        data: {
          password: pw,
          destination: destination || null,
          moment: moment || null,
          brand: brand || null,
          category: category || null,
          signatureOnly: signatureOnly || undefined,
          search: search || null,
          limit: 300,
        },
      }),
  });

  const summary = useQuery({
    queryKey: ["memory-summary", pw, destination],
    enabled: !!pw,
    queryFn: () =>
      summaryFn({ data: { password: pw, destination: destination || null } }),
  });

  const detail = useQuery({
    queryKey: ["memory-detail", pw, selectedUrl],
    enabled: !!pw && !!selectedUrl,
    queryFn: () => detailFn({ data: { password: pw, productUrl: selectedUrl! } }),
  });

  const sigMut = useMutation({
    mutationFn: (input: { url: string; signature: boolean; reason?: string }) =>
      setSigFn({
        data: {
          password: pw,
          productUrl: input.url,
          signature: input.signature,
          reason: input.reason ?? null,
        },
      }),
    onSuccess: async () => {
      await list.refetch();
      await summary.refetch();
      if (selectedUrl) await detail.refetch();
    },
  });

  const products: MemoryProductRow[] = useMemo(() => {
    return list.data?.ok ? list.data.products : [];
  }, [list.data]);

  if (!pw) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-serif text-2xl mb-3">Editorial Memory</h1>
        <p className="text-xs text-stone-500 mb-4">
          Enter the admin password (or sign in via the Studio first).
        </p>
        <input
          type="password"
          className="w-full border border-stone-300 px-3 py-2"
          placeholder="Admin password"
          onChange={(e) => {
            setPw(e.target.value);
            sessionStorage.setItem(STORAGE_KEY, e.target.value);
          }}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <header>
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
          Resort Edit · Editorial
        </p>
        <h1 className="font-serif text-3xl">Editorial Memory</h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl">
          Every product that has ever appeared in a published Resort Edit look.
          Use this archive to track concentration, mark Signature Pieces, and
          ensure each new look adds richness rather than repeating accessories.
        </p>
      </header>

      {/* Filters */}
      <section className="grid gap-2 md:grid-cols-6">
        <input
          placeholder="Destination (e.g. Portofino)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border border-stone-300 px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Moment"
          value={moment}
          onChange={(e) => setMoment(e.target.value)}
          className="border border-stone-300 px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border border-stone-300 px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Category (swim, bag, …)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-stone-300 px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Search name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stone-300 px-2 py-1.5 text-sm"
        />
        <label className="flex items-center gap-2 text-xs text-stone-700">
          <input
            type="checkbox"
            checked={signatureOnly}
            onChange={(e) => setSignatureOnly(e.target.checked)}
          />
          Signature only
        </label>
      </section>

      {/* Concentration summary */}
      <section className="grid gap-4 md:grid-cols-3">
        <ShareCard title="Brand share" rows={summary.data?.ok ? summary.data.brand : []} />
        <ShareCard title="Category share" rows={summary.data?.ok ? summary.data.category : []} />
        <ShareCard title="Material share" rows={summary.data?.ok ? summary.data.material : []} />
        <ShareCard title="Color share" rows={summary.data?.ok ? summary.data.color : []} />
        <ShareCard title="Retailer share" rows={summary.data?.ok ? summary.data.retailer : []} />
        <ShareCard title="Moments" rows={summary.data?.ok ? summary.data.moments : []} />
      </section>

      {/* Product grid */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Products in memory · {products.length}
          </h2>
          {list.isFetching && <span className="text-xs text-stone-400">loading…</span>}
        </div>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <button
              key={p.product_url}
              onClick={() => setSelectedUrl(p.product_url)}
              className={`text-left border p-3 hover:border-stone-700 transition ${
                p.signature_piece ? "border-amber-500" : "border-stone-200"
              }`}
            >
              <div className="aspect-square bg-stone-100 mb-2 flex items-center justify-center overflow-hidden">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.product_name ?? ""} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-stone-400">no image</span>
                )}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">
                {p.brand}
              </div>
              <div className="text-xs font-medium line-clamp-2">
                {p.product_name ?? "—"}
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-stone-500">
                <span>{p.category ?? "—"}</span>
                <span className="font-medium text-stone-800">{p.usage_count}× used</span>
              </div>
              {p.signature_piece && (
                <div className="text-[10px] text-amber-700 font-semibold mt-1 uppercase tracking-wider">
                  ★ Signature
                </div>
              )}
              <div className="text-[10px] text-stone-500 mt-1">
                {p.destinations.join(" · ")}
              </div>
            </button>
          ))}
          {products.length === 0 && !list.isFetching && (
            <p className="text-sm text-stone-500 col-span-full">
              Nothing in memory yet. Publish a Editorial Look to seed the archive.
            </p>
          )}
        </div>
      </section>

      {/* Detail drawer */}
      {selectedUrl && (
        <DetailPanel
          data={detail.data}
          onClose={() => setSelectedUrl(null)}
          onToggleSignature={(sig, reason) =>
            sigMut.mutate({ url: selectedUrl, signature: sig, reason })
          }
          mutating={sigMut.isPending}
        />
      )}
    </main>
  );
}

function ShareCard({ title, rows }: { title: string; rows: ShareRow[] }) {
  const top = rows.slice(0, 6);
  return (
    <div className="border border-stone-200 p-3">
      <div className="text-[10px] tracking-[0.24em] uppercase text-stone-500 mb-2">
        {title}
      </div>
      {top.length === 0 ? (
        <p className="text-xs text-stone-400">No data yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {top.map((r) => (
            <li key={r.key} className="text-xs flex items-center justify-between gap-2">
              <span className="truncate">{r.key}</span>
              <span className="text-stone-500 tabular-nums">
                {r.uses}× ({(r.share * 100).toFixed(0)}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type DetailData =
  | { ok: true; product: MemoryProductRow; usages: unknown[]; feedback: unknown[] }
  | { ok: false; error: string }
  | undefined;

function DetailPanel({
  data,
  onClose,
  onToggleSignature,
  mutating,
}: {
  data: DetailData;
  onClose: () => void;
  onToggleSignature: (sig: boolean, reason?: string) => void;
  mutating: boolean;
}) {
  const [reason, setReason] = useState("");
  if (!data) return null;
  if (!data.ok) {
    return (
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-stone-300 p-6 overflow-y-auto z-50">
        <button onClick={onClose} className="text-xs underline">Close</button>
        <p className="text-sm text-red-600 mt-4">{data.error}</p>
      </div>
    );
  }
  const p = data.product;
  const usages = data.usages as Array<{
    id: string;
    destination: string;
    moment: string;
    slot: string | null;
    role: string | null;
    used_at: string;
  }>;
  const feedback = data.feedback as Array<{
    id: string;
    reason_code: string;
    notes: string | null;
    created_at: string;
  }>;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-stone-300 p-6 overflow-y-auto z-50">
      <button onClick={onClose} className="text-xs underline mb-3">Close</button>
      <div className="aspect-square bg-stone-100 mb-3">
        {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-stone-500">{p.brand}</div>
      <div className="text-base font-medium">{p.product_name ?? "—"}</div>
      <a href={p.product_url} target="_blank" rel="noreferrer" className="text-xs underline text-stone-600 break-all">
        {p.product_url}
      </a>

      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
        <Stat label="Used" value={`${p.usage_count}×`} />
        <Stat label="Destinations" value={p.destinations.join(", ") || "—"} />
        <Stat label="Category" value={p.category ?? "—"} />
        <Stat label="Color" value={p.color_family ?? "—"} />
        <Stat label="Material" value={p.material ?? "—"} />
        <Stat label="Silhouette" value={p.silhouette ?? "—"} />
      </div>

      {/* Signature override */}
      <div className="mt-5 border-t border-stone-200 pt-4">
        <div className="text-[10px] tracking-[0.24em] uppercase text-stone-500 mb-2">
          Signature Override
        </div>
        {p.signature_piece ? (
          <div className="space-y-2">
            <div className="text-xs text-amber-700">
              ★ Marked as Signature — diversity penalties skipped.
            </div>
            {p.signature_reason && (
              <div className="text-xs text-stone-600 italic">"{p.signature_reason}"</div>
            )}
            <button
              onClick={() => onToggleSignature(false)}
              disabled={mutating}
              className="text-xs underline disabled:opacity-50"
            >
              Remove Signature status
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (e.g. signature KREWE sunglass)"
              className="w-full border border-stone-300 px-2 py-1.5 text-xs"
            />
            <button
              onClick={() => onToggleSignature(true, reason)}
              disabled={mutating}
              className="bg-ink text-ivory text-[10px] tracking-[0.24em] uppercase px-3 py-1.5 disabled:opacity-50"
            >
              Mark as Signature
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-stone-200 pt-4">
        <div className="text-[10px] tracking-[0.24em] uppercase text-stone-500 mb-2">
          Usage history · {usages.length}
        </div>
        <ul className="space-y-1 text-xs max-h-48 overflow-y-auto">
          {usages.map((u) => (
            <li key={u.id} className="flex justify-between gap-3">
              <span>{u.destination} — {u.moment}</span>
              <span className="text-stone-500">{new Date(u.used_at).toLocaleDateString()}</span>
            </li>
          ))}
          {usages.length === 0 && <li className="text-stone-400">No usages recorded.</li>}
        </ul>
      </div>

      {feedback.length > 0 && (
        <div className="mt-5 border-t border-stone-200 pt-4">
          <div className="text-[10px] tracking-[0.24em] uppercase text-stone-500 mb-2">
            Editorial Feedback · {feedback.length}
          </div>
          <ul className="space-y-1 text-xs">
            {feedback.map((f) => (
              <li key={f.id}>
                <span className="font-medium">{f.reason_code}</span>
                {f.notes && <span className="text-stone-500"> — {f.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-stone-500">{label}</div>
      <div className="text-stone-800">{value}</div>
    </div>
  );
}
