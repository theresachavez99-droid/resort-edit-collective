import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listEditorialReferences,
  seedEditorialReferences,
  extractEditorialReference,
  extractAllPendingEditorialReferences,
  deleteEditorialReference,
  type EditorialReferenceRow,
} from "@/lib/editorial-library.functions";

export const Route = createFileRoute("/admin/editorial-library")({
  head: () => ({
    meta: [
      { title: "Editorial Reference Library — Resort Edit Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EditorialLibraryPage,
});

const STORAGE_KEY = "admin_look_studio_pw";

function EditorialLibraryPage() {
  const verify = useServerFn(verifyAdmin);
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    setPw(stored);
    verify({ data: { password: stored } })
      .then((r) => {
        if (r.ok) setAuthed(true);
        else window.localStorage.removeItem(STORAGE_KEY);
      })
      .catch(() => window.localStorage.removeItem(STORAGE_KEY));
  }, [verify]);

  if (!authed) {
    return (
      <main className="min-h-screen bg-ivory text-ink flex items-center justify-center px-6">
        <form
          className="w-full max-w-sm border border-ink/20 bg-cream/30 p-8"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            try {
              await verify({ data: { password: pw } });
              window.localStorage.setItem(STORAGE_KEY, pw);
              setAuthed(true);
            } catch {
              setErr("Invalid password");
            }
          }}
        >
          <h1 className="font-display tracking-[0.18em] uppercase text-xl mb-6">Editorial Library</h1>
          <label className="text-[0.65rem] tracking-[0.24em] uppercase text-ink/60">Admin password</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-2 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            autoFocus
          />
          {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
          <button type="submit" className="mt-6 w-full bg-ink text-ivory py-2.5 text-[0.7rem] tracking-[0.24em] uppercase">
            Enter
          </button>
        </form>
      </main>
    );
  }

  return <LibraryBoard password={pw} />;
}

function LibraryBoard({ password }: { password: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listEditorialReferences);
  const seedFn = useServerFn(seedEditorialReferences);
  const extractFn = useServerFn(extractEditorialReference);
  const extractAllFn = useServerFn(extractAllPendingEditorialReferences);
  const deleteFn = useServerFn(deleteEditorialReference);

  const refs = useQuery({
    queryKey: ["editorial-references"],
    queryFn: () => listFn({}),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["editorial-references"] });

  const seed = useMutation({
    mutationFn: () => seedFn({ data: { password } }),
    onSuccess: invalidate,
  });
  const extractOne = useMutation({
    mutationFn: (id: string) => extractFn({ data: { password, id } }),
    onSuccess: invalidate,
  });
  const extractAll = useMutation({
    mutationFn: () => extractAllFn({ data: { password } }),
    onSuccess: invalidate,
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { password, id } }),
    onSuccess: invalidate,
  });

  const references = (refs.data && refs.data.ok ? refs.data.references : []) as EditorialReferenceRow[];
  const [collectionFilter, setCollectionFilter] = useState<string>("all");
  const collections = Array.from(new Set(references.map((r) => r.collection ?? "core-stylist-references")));
  const filtered = collectionFilter === "all"
    ? references
    : references.filter((r) => (r.collection ?? "core-stylist-references") === collectionFilter);
  const counts = {
    total: filtered.length,
    ready: filtered.filter((r) => r.extraction_status === "ready").length,
    pending: filtered.filter((r) => r.extraction_status === "pending").length,
    failed: filtered.filter((r) => r.extraction_status === "failed").length,
    extracting: filtered.filter((r) => r.extraction_status === "extracting").length,
  };

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-ink/15 px-6 md:px-10 py-6 sticky top-0 bg-ivory/95 backdrop-blur z-20">
        <div className="max-w-[1500px] mx-auto flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-[0.62rem] tracking-[0.34em] uppercase text-gold">Resort Edit — Admin</p>
            <h1 className="font-display text-3xl md:text-4xl tracking-[0.12em] uppercase mt-2">Editorial Reference Library</h1>
            <p className="font-serif italic text-ink/65 mt-2 text-sm max-w-2xl">
              Training substrate for the story-first generation pipeline. These references teach Resort Edit how luxury
              destination stylists construct highly-saveable looks. Do not edit field by field — re-run extraction if a
              reference is misinterpreted, and refine the extraction prompt if patterns are consistently wrong.
            </p>
            <p className="mt-3 text-[0.7rem] tracking-[0.18em] uppercase text-ink/55">
              {counts.total} references · {counts.ready} ready · {counts.pending} pending · {counts.extracting} extracting · {counts.failed} failed
            </p>
            {collections.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCollectionFilter("all")}
                  className={`border px-2.5 py-1 text-[0.6rem] tracking-[0.22em] uppercase ${collectionFilter === "all" ? "bg-ink text-ivory border-ink" : "border-ink/25 text-ink/70"}`}
                >
                  All ({references.length})
                </button>
                {collections.map((c) => {
                  const n = references.filter((r) => (r.collection ?? "core-stylist-references") === c).length;
                  return (
                    <button
                      key={c}
                      onClick={() => setCollectionFilter(c)}
                      className={`border px-2.5 py-1 text-[0.6rem] tracking-[0.22em] uppercase ${collectionFilter === c ? "bg-ink text-ivory border-ink" : "border-ink/25 text-ink/70"}`}
                    >
                      {c} ({n})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => seed.mutate()}
              disabled={seed.isPending}
              className="border border-ink/25 px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-50"
            >
              {seed.isPending ? "Seeding…" : "Seed references"}
            </button>
            <button
              onClick={() => extractAll.mutate()}
              disabled={extractAll.isPending}
              className="bg-ink text-ivory px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-50"
            >
              {extractAll.isPending ? "Extracting all…" : `Extract all pending (${counts.pending + counts.failed})`}
            </button>
            <button
              onClick={invalidate}
              className="border border-ink/25 px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase"
            >
              Refresh
            </button>
          </div>
        </div>
        {seed.data && !("ok" in seed.data && seed.data.ok) && (
          <p className="text-sm text-red-700 mt-3 max-w-[1500px] mx-auto">Seed failed.</p>
        )}
        {seed.data && "ok" in seed.data && seed.data.ok && (
          <p className="text-sm text-ink/60 mt-3 max-w-[1500px] mx-auto">
            Seeded {seed.data.inserted} new · skipped {seed.data.skipped} existing.
          </p>
        )}
        {extractAll.data && extractAll.data.ok && (
          <p className="text-sm text-ink/60 mt-3 max-w-[1500px] mx-auto">
            Processed {extractAll.data.processed} references — {extractAll.data.summary.filter((s) => s.ok).length} ok, {extractAll.data.summary.filter((s) => !s.ok).length} failed.
          </p>
        )}
      </header>

      <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-8 space-y-6">
        {refs.isLoading && <p className="text-sm text-ink/55">Loading references…</p>}
        {!refs.isLoading && filtered.length === 0 && (
          <div className="border border-ink/20 bg-cream/30 p-8 text-center">
            <p className="font-serif italic text-ink/70">No references yet.</p>
            <p className="text-sm text-ink/55 mt-2">Click <em>Seed references</em> to insert the starter references.</p>
          </div>
        )}
        {filtered.map((r) => (
          <ReferenceCard
            key={r.id}
            r={r}
            onExtract={() => extractOne.mutate(r.id)}
            onDelete={() => {
              if (confirm(`Delete "${r.title}"? This cannot be undone.`)) del.mutate(r.id);
            }}
            isExtracting={extractOne.isPending && extractOne.variables === r.id}
          />
        ))}
      </div>
    </main>
  );
}

function statusChip(status: string) {
  const color =
    status === "ready"
      ? "bg-green-100 text-green-900 border-green-300"
      : status === "failed"
        ? "bg-red-100 text-red-900 border-red-300"
        : status === "extracting"
          ? "bg-amber-100 text-amber-900 border-amber-300"
          : "bg-ink/5 text-ink/70 border-ink/20";
  return (
    <span className={`inline-block border px-2 py-0.5 text-[0.6rem] tracking-[0.18em] uppercase ${color}`}>{status}</span>
  );
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function asEntries(v: unknown): Array<[string, number]> {
  if (!v || typeof v !== "object") return [];
  return Object.entries(v as Record<string, unknown>)
    .filter(([, val]) => typeof val === "number")
    .map(([k, val]) => [k, val as number]);
}

function ReferenceCard({
  r,
  onExtract,
  onDelete,
  isExtracting,
}: {
  r: EditorialReferenceRow;
  onExtract: () => void;
  onDelete: () => void;
  isExtracting: boolean;
}) {
  const [showRaw, setShowRaw] = useState(false);
  const supportingPieces = asStringArray(r.supporting_pieces);
  const destinationSignals = asStringArray(r.destination_signals);
  const luxurySignals = asStringArray(r.luxury_signals);
  const saveabilityDrivers = asStringArray(r.saveability_drivers);
  const editorialTags = asStringArray(r.editorial_tags);
  const brands = asStringArray(r.brands_detected);
  const priceTiers = asEntries(r.price_tier_mix);
  const categoryMix = asEntries(r.category_mix);

  return (
    <article className="border border-ink/15 bg-cream/20 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0 overflow-hidden">
      <div className="bg-ink/5 border-r border-ink/10">
        {r.reference_image ? (
          <img src={r.reference_image} alt={r.title} className="w-full h-full object-cover aspect-[3/4] md:aspect-auto" />
        ) : (
          <div className="aspect-[3/4] md:aspect-auto md:h-full flex items-center justify-center text-center px-6 text-ink/50 text-sm">
            <div>
              <p className="font-serif italic">Nordstrom curation</p>
              {r.reference_url && (
                <a href={r.reference_url} target="_blank" rel="noreferrer" className="block mt-2 text-[0.7rem] uppercase tracking-[0.18em] underline">
                  Open ↗
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {statusChip(r.extraction_status)}
              <span className="text-[0.6rem] tracking-[0.18em] uppercase text-ink/55">{r.source_type}</span>
              {r.collection && r.collection !== "core-stylist-references" && (
                <span className="border border-gold/60 bg-gold/10 text-ink px-2 py-0.5 text-[0.6rem] tracking-[0.18em] uppercase">
                  {r.reference_type ?? r.collection}
                </span>
              )}
              {r.editorial_priority === "high" && (
                <span className="border border-ink bg-ink text-ivory px-2 py-0.5 text-[0.6rem] tracking-[0.18em] uppercase">
                  Priority · High
                </span>
              )}
              {r.engagement_unlock_keyword && (
                <span className="border border-ink/20 px-2 py-0.5 text-[0.6rem] tracking-[0.18em] uppercase text-ink/70">
                  Unlock · {r.engagement_unlock_keyword}
                </span>
              )}
            </div>
            <h2 className="font-display text-xl tracking-[0.06em] uppercase mt-2">{r.title}</h2>
            {r.editorial_story && r.editorial_story !== r.title && (
              <p className="font-serif italic text-ink/70 mt-1">"{r.editorial_story}"</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onExtract}
              disabled={isExtracting}
              className="border border-ink/25 px-3 py-1.5 text-[0.65rem] tracking-[0.2em] uppercase disabled:opacity-50"
            >
              {isExtracting ? "Extracting…" : r.extraction_status === "ready" ? "Re-extract" : "Extract"}
            </button>
            <button onClick={onDelete} className="border border-red-300 text-red-800 px-3 py-1.5 text-[0.65rem] tracking-[0.2em] uppercase">
              Delete
            </button>
          </div>
        </header>

        {r.extraction_status === "failed" && r.extraction_error && (
          <p className="text-sm text-red-800 border border-red-200 bg-red-50 px-3 py-2">{r.extraction_error}</p>
        )}

        {r.extraction_status === "ready" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <Field label="Destination" value={r.destination} />
            <Field label="Activity" value={r.activity} />
            <Field label="Mood" value={r.mood} />
            <Field label="Occasion" value={r.occasion} />
            <Field label="Color story" value={r.color_story} />
            <Field label="Hero piece category" value={r.hero_piece_category} />
            <FieldBlock label="Hero piece" value={r.hero_piece} />
            <FieldBlock label="Accessory strategy" value={r.accessory_strategy} />
            <FieldBlock label="Silhouette strategy" value={r.silhouette_strategy} />
            <FieldBlock label="Texture strategy" value={r.texture_strategy} />
            <FieldBlock label="Learned patterns" value={r.learned_patterns} />

            <ChipList label="Supporting pieces" items={supportingPieces} />
            <ChipList label="Destination signals" items={destinationSignals} />
            <ChipList label="Luxury signals" items={luxurySignals} />
            <ChipList label="Saveability drivers" items={saveabilityDrivers} />
            <ChipList label="Editorial tags" items={editorialTags} />
            {brands.length > 0 && <ChipList label="Brands detected" items={brands} />}

            {priceTiers.length > 0 && (
              <div>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ink/55 mb-1">Price tier mix</p>
                <ul className="text-sm space-y-0.5">
                  {priceTiers.map(([k, v]) => (
                    <li key={k} className="flex justify-between border-b border-ink/10 py-0.5">
                      <span>{k}</span>
                      <span className="font-mono">{Math.round(v * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {categoryMix.length > 0 && (
              <div>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ink/55 mb-1">Category mix</p>
                <ul className="text-sm space-y-0.5">
                  {categoryMix.map(([k, v]) => (
                    <li key={k} className="flex justify-between border-b border-ink/10 py-0.5">
                      <span>{k}</span>
                      <span className="font-mono">{Math.round(v * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-ink/10 flex items-center gap-4 flex-wrap">
          {r.reference_url && (
            <a href={r.reference_url} target="_blank" rel="noreferrer" className="text-[0.65rem] tracking-[0.2em] uppercase underline text-ink/70">
              Source ↗
            </a>
          )}
          <button
            onClick={() => setShowRaw((s) => !s)}
            className="text-[0.65rem] tracking-[0.2em] uppercase text-ink/55 underline"
          >
            {showRaw ? "Hide raw extraction" : "Show raw extraction"}
          </button>
          {r.extracted_at && (
            <span className="text-[0.6rem] tracking-[0.18em] uppercase text-ink/45">
              extracted {new Date(r.extracted_at).toLocaleString()}
            </span>
          )}
        </div>
        {showRaw && (
          <pre className="text-[0.7rem] bg-ink/5 border border-ink/15 p-3 overflow-x-auto max-h-80">
            {JSON.stringify(r.raw_extraction, null, 2)}
          </pre>
        )}
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ink/55">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}

function FieldBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="md:col-span-2">
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ink/55">{label}</p>
      <p className="mt-0.5 font-serif italic text-ink/80">{value}</p>
    </div>
  );
}

function ChipList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="md:col-span-2">
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ink/55 mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={`${it}-${i}`} className="border border-ink/20 px-2 py-0.5 text-[0.7rem] bg-ivory">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}