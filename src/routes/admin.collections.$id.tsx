import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  getEditorialCollection,
  updateCollectionStatus,
  updateCollectionNotes,
  updateLookStatus,
  setFeaturedLook,
  reorderLooks,
  setSlotLocked,
  replaceSlotProduct,
  regenerateSlot,
  regenerateLook,
} from "@/lib/editorial-review.functions";
import {
  setFeaturedCollection,
  unfeatureCollection,
} from "@/lib/inventory-health.functions";

export const Route = createFileRoute("/admin/collections/$id")({
  head: () => ({
    meta: [
      { title: "Collection Review — Founder (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CollectionDetail,
});

const STORAGE_KEY = "admin_yacht_pilot_pw";
const COLLECTION_STATUSES = ["draft", "in_review", "approved", "rejected"] as const;
const EDITORIAL_QUESTIONS = [
  { id: "authentic", label: "Authentic to the destination?" },
  { id: "activity", label: "Matches the activity?" },
  { id: "publish", label: "Would I publish this?" },
  { id: "distinct", label: "Visually distinct from other looks?" },
  { id: "strengthens", label: "Strengthens the overall collection?" },
] as const;
type EditorialAnswer = "yes" | "no" | null;
type LookAnswers = Record<string, EditorialAnswer>;
const answersStorageKey = (collectionId: string) =>
  `admin_editorial_answers:${collectionId}`;

function loadAnswers(collectionId: string): Record<string, LookAnswers> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(answersStorageKey(collectionId)) ?? "{}");
  } catch {
    return {};
  }
}
function saveAnswers(collectionId: string, all: Record<string, LookAnswers>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(answersStorageKey(collectionId), JSON.stringify(all));
}

type Slot = SlotData & {
  metadata?: Record<string, unknown> | null;
  reasoning?: string | null;
};
type Look = {
  id: string;
  title: string;
  subtitle: string | null;
  status: string;
  pinned: boolean;
  reasoning?: Record<string, unknown> | null;
  scoring?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  slots: Slot[];
};

function pickString(obj: unknown, key: string): string | null {
  if (!obj || typeof obj !== "object") return null;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "string" && v ? v : null;
}
function pickNumber(obj: unknown, key: string): number | null {
  if (!obj || typeof obj !== "object") return null;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "number" ? v : null;
}
function pickStringArray(obj: unknown, key: string): string[] {
  if (!obj || typeof obj !== "object") return [];
  const v = (obj as Record<string, unknown>)[key];
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function lookEditorialScore(look: Look): number | null {
  const explicit =
    pickNumber(look.scoring, "editorial") ??
    pickNumber(look.metadata, "editorialScore");
  if (explicit != null) return explicit;
  const slotScores = look.slots
    .map((s) => pickNumber(s.metadata, "editorialScore"))
    .filter((n): n is number => n != null);
  if (!slotScores.length) return null;
  return slotScores.reduce((a, b) => a + b, 0) / slotScores.length;
}
function lookCompleteness(look: Look): { filled: number; total: number } {
  const total = look.slots.length;
  const filled = look.slots.filter((s) => s.brand && s.product_name).length;
  return { filled, total };
}
function lookBrandDiversity(look: Look): number {
  const filled = look.slots.filter((s) => s.brand);
  if (!filled.length) return 0;
  const unique = new Set(filled.map((s) => (s.brand ?? "").toLowerCase())).size;
  return unique / filled.length;
}
function lookStyleDNA(look: Look): string[] {
  const fromMeta = pickStringArray(look.metadata, "styleDNA");
  if (fromMeta.length) return fromMeta;
  const themes = pickStringArray(look.metadata, "themes");
  if (themes.length) return themes;
  const palettes = look.slots
    .map((s) => pickString(s.metadata, "palette"))
    .filter((x): x is string => !!x);
  const silhouettes = look.slots
    .map((s) => pickString(s.metadata, "silhouette"))
    .filter((x): x is string => !!x);
  return Array.from(new Set([...palettes, ...silhouettes])).slice(0, 6);
}

function collectionInsights(looks: Look[]) {
  const allSlots = looks.flatMap((l) => l.slots);
  const filled = allSlots.filter((s) => s.brand && s.product_name);
  const brands = new Set(filled.map((s) => (s.brand ?? "").toLowerCase()));
  const retailers = new Set(filled.map((s) => (s.retailer ?? "").toLowerCase()).filter(Boolean));
  const palettes = filled
    .map((s) => pickString(s.metadata, "palette"))
    .filter((x): x is string => !!x);
  const silhouettes = filled
    .map((s) => pickString(s.metadata, "silhouette"))
    .filter((x): x is string => !!x);
  const paletteSet = new Set(palettes.map((p) => p.toLowerCase()));
  const silhouetteSet = new Set(silhouettes.map((s) => s.toLowerCase()));

  const editorialScores = looks
    .map(lookEditorialScore)
    .filter((n): n is number => n != null);
  const avgEditorial = editorialScores.length
    ? editorialScores.reduce((a, b) => a + b, 0) / editorialScores.length
    : null;
  const spread = editorialScores.length
    ? Math.max(...editorialScores) - Math.min(...editorialScores)
    : 0;

  const totalSlots = allSlots.length;
  const completeness = totalSlots ? filled.length / totalSlots : 0;

  // Activity authenticity: share of slots whose brand metadata included activity tag.
  // Proxy: filled-slot ratio combined with brand diversity.
  const brandDiv = filled.length ? brands.size / filled.length : 0;
  const retailerDiv = filled.length ? retailers.size / filled.length : 0;
  // Cohesion: high when palettes/silhouettes overlap across looks but not collapsed to 1.
  const cohesion = filled.length
    ? 1 -
      Math.abs(
        (paletteSet.size + silhouetteSet.size) / (palettes.length + silhouettes.length || 1) -
          0.5,
      ) * 2
    : 0;

  return {
    looks: looks.length,
    filled: filled.length,
    totalSlots,
    completeness,
    brands: brands.size,
    retailers: retailers.size,
    brandDiversity: brandDiv,
    retailerDiversity: retailerDiv,
    palettes: paletteSet.size,
    silhouettes: silhouetteSet.size,
    avgEditorial,
    editorialSpread: spread,
    cohesion: Math.max(0, Math.min(1, cohesion)),
  };
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
function scoreFmt(n: number | null): string {
  return n == null ? "—" : n.toFixed(2);
}
function ratingFromPct(n: number): { label: string; cls: string } {
  if (n >= 0.75) return { label: "Strong", cls: "bg-green-100 text-green-800" };
  if (n >= 0.45) return { label: "Adequate", cls: "bg-amber-100 text-amber-900" };
  return { label: "Weak", cls: "bg-red-100 text-red-800" };
}

function CollectionDetail() {
  const { id } = Route.useParams();
  const verify = useServerFn(verifyAdmin);
  const get = useServerFn(getEditorialCollection);
  const setStatus = useServerFn(updateCollectionStatus);
  const setNotes = useServerFn(updateCollectionNotes);
  const setLookStatus = useServerFn(updateLookStatus);
  const feature = useServerFn(setFeaturedLook);
  const reorder = useServerFn(reorderLooks);
  const lockSlot = useServerFn(setSlotLocked);
  const replaceSlot = useServerFn(replaceSlotProduct);
  const regenSlot = useServerFn(regenerateSlot);
  const regenLook = useServerFn(regenerateLook);
  const featureCollection = useServerFn(setFeaturedCollection);
  const unfeatureCol = useServerFn(unfeatureCollection);

  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) return;
    setPw(stored);
    verify({ data: { password: stored } })
      .then((r) => {
        if (r.ok) setAuthed(true);
        else window.localStorage.removeItem(STORAGE_KEY);
      })
      .catch(() => window.localStorage.removeItem(STORAGE_KEY));
  }, [verify]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const r = await verify({ data: { password: pw } });
      if (r.ok) {
        window.localStorage.setItem(STORAGE_KEY, pw);
        setAuthed(true);
      } else setAuthError("Wrong password");
    } catch {
      setAuthError("Auth error");
    }
  };

  const query = useQuery({
    queryKey: ["editorial_collection", id, authed],
    enabled: authed,
    queryFn: () => get({ data: { password: pw, id } }),
  });

  const refetch = () => query.refetch();

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    try {
      await fn();
      await refetch();
    } catch (e) {
      alert(`${label} failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  if (!authed) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-semibold mb-4">Collection Review — Admin</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            placeholder="Admin password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">
            Enter
          </button>
          {authError && <p className="text-red-600 text-sm">{authError}</p>}
        </form>
      </main>
    );
  }

  if (query.isLoading) return <main className="p-8 text-stone-500">Loading…</main>;
  if (query.error)
    return <main className="p-8 text-red-600">{(query.error as Error).message}</main>;
  if (!query.data?.ok) return <main className="p-8">No data</main>;

  const { collection, looks } = query.data;
  const typedLooks = looks as unknown as Look[];
  const insights = collectionInsights(typedLooks);
  const [answers, setAnswersState] = useState<Record<string, LookAnswers>>(() =>
    loadAnswers(collection.id),
  );
  const updateAnswer = (lookId: string, qid: string, value: EditorialAnswer) => {
    setAnswersState((prev) => {
      const next = {
        ...prev,
        [lookId]: { ...(prev[lookId] ?? {}), [qid]: value },
      };
      saveAnswers(collection.id, next);
      return next;
    });
  };

  return (
    <main className="mx-auto max-w-6xl p-8 space-y-8">
      <Link to="/admin/collections" className="text-sm text-blue-600 underline">
        ← All collections
      </Link>

      <header className="space-y-2">
        <p className="uppercase tracking-widest text-xs text-stone-500">
          Editorial Review · Internal Only — approving does NOT publish
        </p>
        <h1 className="text-3xl font-serif">
          {collection.destination} · {collection.activity}
        </h1>
        <p className="text-xs text-stone-500">
          ID {collection.id} · created {new Date(collection.created_at).toLocaleString()}
        </p>
      </header>

      <CollectionInsightsPanel insights={insights} />
      <SwimArchetypeDiagnosticsPanel
        diagnostics={(collection as { diagnostics?: { swimDiagnostics?: SwimDxData; decisionDeviations?: DeviationData[] } }).diagnostics ?? null}
      />

      <section className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Collection status</h2>
        <div className="flex gap-2 flex-wrap">
          {COLLECTION_STATUSES.map((s) => (
            <button
              key={s}
              disabled={!!busy || collection.status === s}
              onClick={() =>
                run(`status:${s}`, () =>
                  setStatus({ data: { password: pw, id: collection.id, status: s } }),
                )
              }
              className={`px-3 py-1 rounded border text-sm ${
                collection.status === s ? "bg-black text-white border-black" : "bg-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="border-t border-stone-200 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Featured Editorial Collection{" "}
                {(collection as { featured?: boolean }).featured ? (
                  <span className="ml-2 bg-black text-white text-[10px] px-1.5 py-0.5 uppercase tracking-widest align-middle">
                    Featured
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Only one collection per Destination + Activity can be featured. Other
                collections (seasonal, holiday, editor's favourites) remain in the
                database. Requires status <em>approved</em>.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                disabled={
                  !!busy ||
                  collection.status !== "approved" ||
                  !!(collection as { featured?: boolean }).featured
                }
                onClick={() =>
                  run("feature-collection", () =>
                    featureCollection({
                      data: { password: pw, collectionId: collection.id },
                    }),
                  )
                }
                className="px-3 py-1 rounded border text-sm bg-black text-white disabled:opacity-40"
              >
                Mark as Featured
              </button>
              <button
                disabled={
                  !!busy || !(collection as { featured?: boolean }).featured
                }
                onClick={() =>
                  run("unfeature-collection", () =>
                    unfeatureCol({
                      data: { password: pw, collectionId: collection.id },
                    }),
                  )
                }
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
              >
                Unfeature
              </button>
            </div>
          </div>
        </div>
        <NotesEditor
          initial={collection.notes ?? ""}
          onSave={(notes) =>
            run("notes", () =>
              setNotes({ data: { password: pw, id: collection.id, notes } }),
            )
          }
          busy={busy === "notes"}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold font-serif text-xl">The Collection · {looks.length} looks</h2>
          <p className="text-xs text-stone-500">
            Review like a magazine. Products are refinement tools beneath each look.
          </p>
        </div>
        {typedLooks.map((look, idx) => (
          <EditorialLookCard
            key={look.id}
            look={look}
            idx={idx}
            total={typedLooks.length}
            avgEditorial={insights.avgEditorial}
            collectionBrandTotal={insights.brands || 1}
            busy={busy}
            answers={answers[look.id] ?? {}}
            onAnswer={(qid, v) => updateAnswer(look.id, qid, v)}
            onMove={(dir) => {
              const ids = typedLooks.map((l) => l.id);
              const j = idx + dir;
              if (j < 0 || j >= ids.length) return;
              [ids[j], ids[idx]] = [ids[idx], ids[j]];
              run("reorder", () =>
                reorder({
                  data: { password: pw, collectionId: collection.id, orderedLookIds: ids },
                }),
              );
            }}
            onFeature={() =>
              run("feature", () =>
                feature({
                  data: {
                    password: pw,
                    collectionId: collection.id,
                    lookId: look.pinned ? null : look.id,
                  },
                }),
              )
            }
            onApprove={() =>
              run("approve-look", () =>
                setLookStatus({
                  data: { password: pw, lookId: look.id, status: "approved" },
                }),
              )
            }
            onReject={() => {
              const reason = prompt("Rejection reason (optional)") ?? undefined;
              run("reject-look", () =>
                setLookStatus({
                  data: {
                    password: pw,
                    lookId: look.id,
                    status: "rejected",
                    rejectedReason: reason,
                  },
                }),
              );
            }}
            onRegenLook={() =>
              confirm("Regenerate every unlocked slot in this look?") &&
              run("regen-look", () =>
                regenLook({ data: { password: pw, lookId: look.id } }),
              )
            }
            onLockSlot={(slotId, locked) =>
              run("lock-slot", () =>
                lockSlot({ data: { password: pw, slotId, locked } }),
              )
            }
            onReplaceSlot={(slotId, patch) =>
              run("replace-slot", () =>
                replaceSlot({ data: { password: pw, slotId, ...patch } }),
              )
            }
            onRegenSlot={(slotId) =>
              run("regen-slot", () => regenSlot({ data: { password: pw, slotId } }))
            }
          />
        ))}
      </section>
    </main>
  );
}

function NotesEditor({
  initial,
  onSave,
  busy,
}: {
  initial: string;
  onSave: (notes: string) => void;
  busy: boolean;
}) {
  const [val, setVal] = useState(initial);
  useEffect(() => setVal(initial), [initial]);
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-stone-500">Notes</label>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={3}
        className="w-full border rounded p-2 text-sm"
        placeholder="Internal review notes…"
      />
      <button
        disabled={busy || val === initial}
        onClick={() => onSave(val)}
        className="text-xs border px-3 py-1 rounded bg-white"
      >
        {busy ? "Saving…" : "Save notes"}
      </button>
    </div>
  );
}

type SlotData = {
  id: string;
  slot: string;
  brand: string | null;
  product_name: string | null;
  retailer: string | null;
  source_url: string | null;
  image_url: string | null;
  price: number | null;
  currency: string | null;
  locked: boolean;
  metadata?: Record<string, unknown> | null;
};

function SlotRow({
  slot,
  busy,
  onLock,
  onReplace,
  onRegen,
}: {
  slot: SlotData;
  busy: string | null;
  onLock: (locked: boolean) => void;
  onReplace: (patch: {
    brand: string;
    productName: string;
    retailer: string;
    sourceUrl: string;
    imageUrl?: string | null;
    price?: number | null;
    currency?: string;
  }) => void;
  onRegen: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    brand: slot.brand ?? "",
    productName: slot.product_name ?? "",
    retailer: slot.retailer ?? "",
    sourceUrl: slot.source_url ?? "",
    imageUrl: slot.image_url ?? "",
    price: slot.price?.toString() ?? "",
    currency: slot.currency ?? "USD",
  });

  return (
    <div className={`border rounded p-3 text-sm ${slot.locked ? "bg-stone-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-stone-500">{slot.slot}</span>
            {slot.locked && (
              <span className="text-xs bg-stone-200 px-2 py-0.5 rounded">Locked</span>
            )}
            {(() => {
              const aff = pickNumber(slot.metadata, "brandAffinity");
              if (aff === null) return null;
              const tone =
                aff >= 90
                  ? "bg-emerald-100 text-emerald-800"
                  : aff >= 75
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-100 text-stone-700";
              return (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded ${tone}`}
                  title="Editorial Affinity for this destination + activity"
                >
                  Affinity {Math.round(aff)}
                </span>
              );
            })()}
          </div>
          <div className="mt-1">
            <span className="font-medium">{slot.brand ?? "—"}</span> ·{" "}
            <span className="text-stone-700">{slot.product_name ?? "—"}</span>
          </div>
          <div className="text-xs text-stone-500">
            {slot.retailer ?? "—"}
            {slot.source_url && (
              <>
                {" · "}
                <a
                  href={slot.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  source
                </a>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          <button
            disabled={!!busy}
            onClick={() => onLock(!slot.locked)}
            className="text-xs border px-2 py-1 rounded"
          >
            {slot.locked ? "Unlock" : "Lock"}
          </button>
          <button
            disabled={!!busy || slot.locked}
            onClick={onRegen}
            className="text-xs border px-2 py-1 rounded"
            title={slot.locked ? "Unlock to regenerate" : "Regenerate this slot"}
          >
            Regenerate
          </button>
          <button
            disabled={!!busy}
            onClick={() => setEditing((v) => !v)}
            className="text-xs border px-2 py-1 rounded"
          >
            {editing ? "Cancel" : "Replace"}
          </button>
        </div>
      </div>

      {editing && (
        <form
          className="mt-3 grid grid-cols-2 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onReplace({
              brand: form.brand,
              productName: form.productName,
              retailer: form.retailer,
              sourceUrl: form.sourceUrl,
              imageUrl: form.imageUrl || null,
              price: form.price ? Number(form.price) : null,
              currency: form.currency || "USD",
            });
            setEditing(false);
          }}
        >
          {(
            [
              ["brand", "Brand"],
              ["productName", "Product name"],
              ["retailer", "Retailer"],
              ["sourceUrl", "Source URL"],
              ["imageUrl", "Image URL (optional)"],
              ["price", "Price (optional)"],
              ["currency", "Currency"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="text-xs">
              <span className="text-stone-500">{label}</span>
              <input
                value={(form as Record<string, string>)[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                className="w-full border rounded px-2 py-1 mt-0.5"
              />
            </label>
          ))}
          <div className="col-span-2">
            <button
              type="submit"
              disabled={!!busy}
              className="text-xs border px-3 py-1 rounded bg-black text-white"
            >
              Save replacement
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "approved"
      ? "bg-green-100 text-green-800"
      : status === "rejected"
        ? "bg-red-100 text-red-800"
        : status === "in_review"
          ? "bg-amber-100 text-amber-900"
          : "bg-stone-100 text-stone-700";
  return <span className={`inline-block rounded px-2 py-0.5 text-xs ${cls}`}>{status}</span>;
}

// ──────────────────────────────────────────────────────────────────
// Collection-level insights (editorial first)
// ──────────────────────────────────────────────────────────────────

function CollectionInsightsPanel({
  insights,
}: {
  insights: ReturnType<typeof collectionInsights>;
}) {
  const cards: Array<{ label: string; value: string; sub?: string; rating?: number }> = [
    {
      label: "Editorial diversity",
      value: insights.avgEditorial == null ? "—" : insights.avgEditorial.toFixed(2),
      sub: `spread ${insights.editorialSpread.toFixed(2)}`,
    },
    {
      label: "Brand diversity",
      value: `${insights.brands} brands`,
      sub: pct(insights.brandDiversity),
      rating: insights.brandDiversity,
    },
    {
      label: "Retailer diversity",
      value: `${insights.retailers} retailers`,
      sub: pct(insights.retailerDiversity),
      rating: insights.retailerDiversity,
    },
    {
      label: "Color balance",
      value: `${insights.palettes} palettes`,
      sub: "across looks",
    },
    {
      label: "Silhouette balance",
      value: `${insights.silhouettes} shapes`,
      sub: "across looks",
    },
    {
      label: "Activity authenticity",
      value: pct(insights.completeness),
      sub: `${insights.filled}/${insights.totalSlots} slots`,
      rating: insights.completeness,
    },
    {
      label: "Collection cohesion",
      value: pct(insights.cohesion),
      sub: "palette + silhouette",
      rating: insights.cohesion,
    },
  ];
  return (
    <section className="border rounded p-4 space-y-3 bg-stone-50/40">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl">Collection Insights</h2>
        <p className="text-xs text-stone-500">Read the magazine before the catalog.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => {
          const rating = c.rating != null ? ratingFromPct(c.rating) : null;
          return (
            <div key={c.label} className="border rounded bg-white p-3">
              <p className="text-[11px] uppercase tracking-wider text-stone-500">{c.label}</p>
              <p className="text-lg font-serif mt-1">{c.value}</p>
              <div className="flex items-center justify-between mt-1">
                {c.sub && <span className="text-xs text-stone-500">{c.sub}</span>}
                {rating && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${rating.cls}`}>
                    {rating.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────
// Editorial Look Card — primary unit of review
// ──────────────────────────────────────────────────────────────────

type ReplacePatch = {
  brand: string;
  productName: string;
  retailer: string;
  sourceUrl: string;
  imageUrl?: string | null;
  price?: number | null;
  currency?: string;
};

function EditorialLookCard({
  look,
  idx,
  total,
  avgEditorial,
  collectionBrandTotal,
  busy,
  answers,
  onAnswer,
  onMove,
  onFeature,
  onApprove,
  onReject,
  onRegenLook,
  onLockSlot,
  onReplaceSlot,
  onRegenSlot,
}: {
  look: Look;
  idx: number;
  total: number;
  avgEditorial: number | null;
  collectionBrandTotal: number;
  busy: string | null;
  answers: LookAnswers;
  onAnswer: (qid: string, v: EditorialAnswer) => void;
  onMove: (dir: -1 | 1) => void;
  onFeature: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRegenLook: () => void;
  onLockSlot: (slotId: string, locked: boolean) => void;
  onReplaceSlot: (slotId: string, patch: ReplacePatch) => void;
  onRegenSlot: (slotId: string) => void;
}) {
  const [showProducts, setShowProducts] = useState(false);
  const score = lookEditorialScore(look);
  const completeness = lookCompleteness(look);
  const brandDiv = lookBrandDiversity(look);
  const dna = lookStyleDNA(look);
  const uniqueBrands = new Set(
    look.slots.map((s) => (s.brand ?? "").toLowerCase()).filter(Boolean),
  ).size;
  const description =
    look.subtitle ||
    pickString(look.metadata, "description") ||
    pickString(look.reasoning, "summary") ||
    "";
  const scoreDelta =
    score != null && avgEditorial != null ? score - avgEditorial : null;

  return (
    <article className="border rounded bg-white">
      {/* Editorial summary */}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>Look {idx + 1} of {total}</span>
              {look.pinned && (
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded">Featured</span>
              )}
              <StatusBadge status={look.status} />
            </div>
            <h3 className="text-2xl font-serif">{look.title}</h3>
            {description && <p className="text-sm text-stone-700 max-w-2xl">{description}</p>}
            {dna.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {dna.map((d) => (
                  <span
                    key={d}
                    className="text-[11px] border border-stone-300 px-2 py-0.5 rounded-full text-stone-600"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-1">
              <button
                disabled={!!busy || idx === 0}
                onClick={() => onMove(-1)}
                className="text-xs border px-2 py-1 rounded"
                title="Move up"
              >
                ↑
              </button>
              <button
                disabled={!!busy || idx === total - 1}
                onClick={() => onMove(1)}
                className="text-xs border px-2 py-1 rounded"
                title="Move down"
              >
                ↓
              </button>
              <button
                disabled={!!busy}
                onClick={onFeature}
                className="text-xs border px-2 py-1 rounded"
              >
                {look.pinned ? "Unfeature" : "Feature"}
              </button>
            </div>
          </div>
        </div>

        {/* Editorial scorecard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Metric
            label="Editorial score"
            value={scoreFmt(score)}
            sub={
              scoreDelta == null
                ? undefined
                : `${scoreDelta >= 0 ? "+" : ""}${scoreDelta.toFixed(2)} vs avg`
            }
          />
          <Metric
            label="Completeness"
            value={`${completeness.filled}/${completeness.total}`}
            sub={completeness.total ? pct(completeness.filled / completeness.total) : "—"}
          />
          <Metric
            label="Brand diversity"
            value={pct(brandDiv)}
            sub={`${uniqueBrands} unique`}
          />
          <Metric
            label="Collection contribution"
            value={`${uniqueBrands}/${collectionBrandTotal}`}
            sub="brands shared"
          />
        </div>

        {/* Editorial review questions */}
        <div className="border rounded p-3 bg-stone-50/60 space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-stone-500">
            Editorial review
          </p>
          <ul className="space-y-1.5">
            {EDITORIAL_QUESTIONS.map((q) => {
              const cur = answers[q.id] ?? null;
              return (
                <li key={q.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-stone-700">{q.label}</span>
                  <div className="flex gap-1">
                    {(["yes", "no"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => onAnswer(q.id, cur === v ? null : v)}
                        className={`text-xs px-2 py-0.5 rounded border ${
                          cur === v
                            ? v === "yes"
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-red-600 text-white border-red-600"
                            : "bg-white text-stone-600"
                        }`}
                      >
                        {v === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Primary editorial actions */}
        <div className="flex flex-wrap gap-2">
          <button
            disabled={!!busy}
            onClick={onApprove}
            className="text-sm px-4 py-1.5 rounded bg-green-600 text-white"
          >
            Approve look
          </button>
          <button
            disabled={!!busy}
            onClick={onReject}
            className="text-sm px-4 py-1.5 rounded border border-red-300 text-red-700"
          >
            Reject
          </button>
          <button
            disabled={!!busy}
            onClick={onRegenLook}
            className="text-sm px-3 py-1.5 rounded border text-stone-700"
          >
            Regenerate look
          </button>
        </div>
      </div>

      {/* Collapsed product slots */}
      <div className="border-t">
        <button
          onClick={() => setShowProducts((v) => !v)}
          className="w-full text-left px-5 py-2.5 text-xs uppercase tracking-wider text-stone-500 hover:bg-stone-50 flex items-center justify-between"
        >
          <span>
            Refine products · {completeness.filled}/{completeness.total} slots filled
          </span>
          <span>{showProducts ? "Hide ▲" : "Show ▼"}</span>
        </button>
        {showProducts && (
          <div className="p-4 pt-0 grid gap-2">
            {look.slots.map((s) => (
              <SlotRow
                key={s.id}
                slot={s}
                busy={busy}
                onLock={(locked) => onLockSlot(s.id, locked)}
                onReplace={(patch) => onReplaceSlot(s.id, patch)}
                onRegen={() => onRegenSlot(s.id)}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border rounded p-2.5 bg-white">
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{label}</p>
      <p className="text-base font-serif mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-stone-500">{sub}</p>}
    </div>
  );
}