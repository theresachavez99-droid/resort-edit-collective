import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listImageRepairQueue,
  approveImage,
  replaceImage,
  markAsScreenshot,
  quarantineProduct,
  ignoreImageRepair,
  type RepairQueueItem,
  type RepairReason,
} from "@/lib/image-repair.functions";

export const Route = createFileRoute("/admin/image-repair-queue")({
  head: () => ({
    meta: [
      { title: "Image Repair Queue — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ImageRepairPage,
});

const STORAGE_KEY = "admin_image_repair_pw";

const REASON_LABEL: Record<RepairReason, string> = {
  cross_brand_collision: "Cross-brand collision",
  placeholder: "Placeholder image",
  sketch: "Sketch / SVG illustration",
  founder_screenshot: "Founder screenshot",
  duplicate_url: "Duplicate URL",
  broken_url: "Broken / empty URL",
  unknown_source: "Unknown image source",
};

const REASON_TONE: Record<RepairReason, string> = {
  cross_brand_collision: "bg-red-50 text-red-800 border-red-200",
  placeholder: "bg-amber-50 text-amber-800 border-amber-200",
  sketch: "bg-amber-50 text-amber-800 border-amber-200",
  founder_screenshot: "bg-orange-50 text-orange-800 border-orange-200",
  duplicate_url: "bg-yellow-50 text-yellow-800 border-yellow-200",
  broken_url: "bg-red-50 text-red-800 border-red-200",
  unknown_source: "bg-slate-50 text-slate-700 border-slate-200",
};

function ImageRepairPage() {
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
          <h1 className="font-display tracking-[0.18em] uppercase text-xl mb-6">Image Repair Queue</h1>
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

  return (
    <RepairBoard
      password={password}
      onLogout={() => {
        window.localStorage.removeItem(STORAGE_KEY);
        setPassword(null);
      }}
    />
  );
}

function RepairBoard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listImageRepairQueue);
  const approveFn = useServerFn(approveImage);
  const replaceFn = useServerFn(replaceImage);
  const screenshotFn = useServerFn(markAsScreenshot);
  const quarantineFn = useServerFn(quarantineProduct);
  const ignoreFn = useServerFn(ignoreImageRepair);

  const queue = useQuery({
    queryKey: ["image-repair-queue"],
    queryFn: () => listFn({ data: { password } }),
  });

  const [filter, setFilter] = useState<RepairReason | "all">("all");

  const filtered = useMemo(() => {
    const rows = queue.data ?? [];
    return filter === "all" ? rows : rows.filter((r) => r.reasons.includes(filter));
  }, [queue.data, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: queue.data?.length ?? 0 };
    for (const r of queue.data ?? []) {
      for (const reason of r.reasons) c[reason] = (c[reason] ?? 0) + 1;
    }
    return c;
  }, [queue.data]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["image-repair-queue"] });

  return (
    <main className="min-h-screen bg-ivory text-ink px-6 md:px-10 py-10">
      <header className="max-w-7xl mx-auto flex items-end justify-between gap-6 border-b border-ink/15 pb-6">
        <div>
          <p className="eyebrow tracking-[0.32em] text-[0.6rem] text-gold">ADMIN</p>
          <h1 className="font-display text-2xl md:text-3xl tracking-[0.14em] uppercase mt-2">
            Image Repair Queue
          </h1>
          <p className="font-serif italic text-ink/65 mt-2">
            {queue.isLoading
              ? "Loading…"
              : `${counts.all ?? 0} product${counts.all === 1 ? "" : "s"} need image repair before they can appear on live rails.`}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="eyebrow tracking-[0.24em] text-[0.65rem] text-ink/60 hover:text-ink"
        >
          Lock
        </button>
      </header>

      <nav className="max-w-7xl mx-auto mt-6 flex flex-wrap gap-2">
        {(["all", ...Object.keys(REASON_LABEL)] as const).map((k) => {
          const label = k === "all" ? "All flagged" : REASON_LABEL[k as RepairReason];
          const n = counts[k] ?? 0;
          const active = filter === k;
          return (
            <button
              key={k}
              onClick={() => setFilter(k as RepairReason | "all")}
              className={`eyebrow tracking-[0.2em] text-[0.6rem] px-3 py-1.5 border ${
                active ? "bg-ink text-ivory border-ink" : "border-ink/20 hover:border-ink/40"
              }`}
            >
              {label} · {n}
            </button>
          );
        })}
      </nav>

      <ul className="max-w-7xl mx-auto mt-8 space-y-4">
        {filtered.length === 0 && !queue.isLoading ? (
          <li className="border border-ink/10 bg-cream/30 p-10 text-center font-serif italic text-ink/65">
            Queue empty. All flagged images for this filter have been resolved.
          </li>
        ) : null}

        {filtered.map((item) => (
          <QueueRow
            key={item.id}
            item={item}
            password={password}
            actions={{
              approve: async () => {
                await approveFn({ data: { password, id: item.id } });
                invalidate();
              },
              replace: async (image_url) => {
                await replaceFn({ data: { password, id: item.id, image_url } });
                invalidate();
              },
              screenshot: async () => {
                await screenshotFn({ data: { password, id: item.id } });
                invalidate();
              },
              quarantine: async () => {
                await quarantineFn({ data: { password, id: item.id } });
                invalidate();
              },
              ignore: async () => {
                await ignoreFn({ data: { password, id: item.id } });
                invalidate();
              },
            }}
          />
        ))}
      </ul>
    </main>
  );
}

interface RowActions {
  approve: () => Promise<void>;
  replace: (imageUrl: string) => Promise<void>;
  screenshot: () => Promise<void>;
  quarantine: () => Promise<void>;
  ignore: () => Promise<void>;
}

function QueueRow({
  item,
  actions,
}: {
  item: RepairQueueItem;
  password: string;
  actions: RowActions;
}) {
  const [newUrl, setNewUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<void>) => async () => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const replaceMut = useMutation({
    mutationFn: () => actions.replace(newUrl.trim()),
    onError: (e) => setError(e instanceof Error ? e.message : "Replace failed"),
    onSuccess: () => setNewUrl(""),
  });

  return (
    <li className="border border-ink/15 bg-cream/20 p-5 flex gap-6">
      <div className="w-32 shrink-0">
        <div className="aspect-[3/4] bg-ink/5 border border-ink/10 overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={`${item.brand} ${item.product_name}`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-[0.65rem] text-ink/40">
              no image
            </div>
          )}
        </div>
        <p className="mt-2 eyebrow tracking-[0.2em] text-[0.55rem] text-ink/45">
          {item.image_source}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="eyebrow tracking-[0.28em] text-[0.6rem] text-gold">
            {item.brand.toUpperCase()}
          </p>
          <h3 className="font-serif text-[1.05rem] text-ink leading-snug">{item.product_name}</h3>
          {item.product_category ? (
            <span className="text-[0.7rem] text-ink/50">{item.product_category}</span>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.reasons.map((r) => (
            <span
              key={r}
              className={`eyebrow tracking-[0.18em] text-[0.55rem] px-2 py-0.5 border ${REASON_TONE[r]}`}
            >
              {REASON_LABEL[r]}
            </span>
          ))}
        </div>

        {item.collision_brands && item.collision_brands.length > 1 ? (
          <p className="mt-2 text-[0.78rem] text-red-800">
            Image also assigned to: {item.collision_brands.filter((b) => b !== item.brand.toLowerCase()).join(", ")}
          </p>
        ) : null}

        <p className="mt-2 text-[0.78rem] text-ink/55 truncate">
          <span className="text-ink/40">image:</span>{" "}
          {item.image_url ? (
            <a href={item.image_url} target="_blank" rel="noreferrer" className="underline">
              {item.image_url}
            </a>
          ) : (
            <span className="italic">(none)</span>
          )}
        </p>
        <p className="text-[0.78rem] text-ink/55 truncate">
          <span className="text-ink/40">source:</span>{" "}
          {item.source_url ? (
            <a href={item.source_url} target="_blank" rel="noreferrer" className="underline">
              {item.source_url}
            </a>
          ) : (
            <span className="italic">(none)</span>
          )}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="url"
            placeholder="Paste corrected image URL…"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 min-w-[260px] border border-ink/25 bg-ivory px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => replaceMut.mutate()}
            disabled={!newUrl.trim() || replaceMut.isPending || busy}
            className="eyebrow tracking-[0.22em] text-[0.6rem] bg-ink text-ivory px-3 py-1.5 disabled:opacity-50"
          >
            Replace
          </button>
          <button
            onClick={run(actions.approve)}
            disabled={busy}
            className="eyebrow tracking-[0.22em] text-[0.6rem] border border-ink/30 px-3 py-1.5 hover:bg-ink/5 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={run(actions.screenshot)}
            disabled={busy}
            className="eyebrow tracking-[0.22em] text-[0.6rem] border border-orange-300 text-orange-800 px-3 py-1.5 hover:bg-orange-50 disabled:opacity-50"
          >
            Mark screenshot
          </button>
          <button
            onClick={run(actions.quarantine)}
            disabled={busy}
            className="eyebrow tracking-[0.22em] text-[0.6rem] border border-red-300 text-red-800 px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
          >
            Quarantine
          </button>
          <button
            onClick={run(actions.ignore)}
            disabled={busy}
            className="eyebrow tracking-[0.22em] text-[0.6rem] text-ink/50 hover:text-ink px-3 py-1.5 disabled:opacity-50"
          >
            Ignore
          </button>
        </div>
        {error ? <p className="mt-2 text-[0.78rem] text-red-700">{error}</p> : null}
      </div>
    </li>
  );
}