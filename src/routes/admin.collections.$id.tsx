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

  return (
    <main className="mx-auto max-w-6xl p-8 space-y-8">
      <Link to="/admin/collections" className="text-sm text-blue-600 underline">
        ← All collections
      </Link>

      <header className="space-y-2">
        <p className="uppercase tracking-widest text-xs text-stone-500">
          Founder Review · Internal Only — approving does NOT publish
        </p>
        <h1 className="text-3xl font-serif">
          {collection.destination} · {collection.activity}
        </h1>
        <p className="text-xs text-stone-500">
          ID {collection.id} · created {new Date(collection.created_at).toLocaleString()}
        </p>
      </header>

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
          <h2 className="font-semibold">Looks ({looks.length})</h2>
          <p className="text-xs text-stone-500">
            Use ↑/↓ to reorder. Pin one look as featured. Lock products to protect them from
            regeneration.
          </p>
        </div>
        {looks.map((look, idx) => (
          <article key={look.id} className="border rounded p-4 space-y-3">
            <header className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">#{idx + 1}</span>
                  <h3 className="text-lg font-serif">{look.title}</h3>
                  {look.pinned && (
                    <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                  <StatusBadge status={look.status} />
                </div>
                {look.subtitle && (
                  <p className="text-sm text-stone-600">{look.subtitle}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                <button
                  disabled={!!busy || idx === 0}
                  onClick={() => {
                    const ids = looks.map((l) => l.id);
                    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
                    run("reorder", () =>
                      reorder({
                        data: { password: pw, collectionId: collection.id, orderedLookIds: ids },
                      }),
                    );
                  }}
                  className="text-xs border px-2 py-1 rounded"
                >
                  ↑
                </button>
                <button
                  disabled={!!busy || idx === looks.length - 1}
                  onClick={() => {
                    const ids = looks.map((l) => l.id);
                    [ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]];
                    run("reorder", () =>
                      reorder({
                        data: { password: pw, collectionId: collection.id, orderedLookIds: ids },
                      }),
                    );
                  }}
                  className="text-xs border px-2 py-1 rounded"
                >
                  ↓
                </button>
                <button
                  disabled={!!busy}
                  onClick={() =>
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
                  className="text-xs border px-2 py-1 rounded"
                >
                  {look.pinned ? "Unfeature" : "Feature"}
                </button>
                <button
                  disabled={!!busy}
                  onClick={() =>
                    run("approve-look", () =>
                      setLookStatus({
                        data: { password: pw, lookId: look.id, status: "approved" },
                      }),
                    )
                  }
                  className="text-xs border px-2 py-1 rounded bg-green-50"
                >
                  Approve
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => {
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
                  className="text-xs border px-2 py-1 rounded bg-red-50"
                >
                  Reject
                </button>
                <button
                  disabled={!!busy}
                  onClick={() =>
                    confirm("Regenerate every unlocked slot in this look?") &&
                    run("regen-look", () =>
                      regenLook({ data: { password: pw, lookId: look.id } }),
                    )
                  }
                  className="text-xs border px-2 py-1 rounded"
                >
                  Regenerate Look
                </button>
              </div>
            </header>
            <div className="grid gap-2">
              {look.slots.map((s) => (
                <SlotRow
                  key={s.id}
                  slot={s}
                  busy={busy}
                  onLock={(locked) =>
                    run("lock-slot", () =>
                      lockSlot({ data: { password: pw, slotId: s.id, locked } }),
                    )
                  }
                  onReplace={(patch) =>
                    run("replace-slot", () =>
                      replaceSlot({ data: { password: pw, slotId: s.id, ...patch } }),
                    )
                  }
                  onRegen={() =>
                    run("regen-slot", () =>
                      regenSlot({ data: { password: pw, slotId: s.id } }),
                    )
                  }
                />
              ))}
            </div>
          </article>
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