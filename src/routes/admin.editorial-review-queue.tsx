import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listEditorialReviewQueue,
  resolveReviewItem,
  recheckSlot,
} from "@/lib/inventory-health.functions";

export const Route = createFileRoute("/admin/editorial-review-queue")({
  head: () => ({
    meta: [
      { title: "Editorial Review Queue — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReviewQueuePage,
});

const STORAGE_KEY = "admin_review_queue_pw";

function ReviewQueuePage() {
  const verify = useServerFn(verifyAdmin);
  const list = useServerFn(listEditorialReviewQueue);
  const resolve = useServerFn(resolveReviewItem);
  const recheck = useServerFn(recheckSlot);

  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [status, setStatus] = useState<"open" | "resolved" | "dismissed">("open");

  useEffect(() => {
    const c = sessionStorage.getItem(STORAGE_KEY);
    if (c) setPw(c);
  }, []);

  const auth = useMutation({
    mutationFn: () => {
      if (!pw) throw new Error("Password required");
      return verify({ data: { password: pw } });
    },
    onSuccess: () => {
      sessionStorage.setItem(STORAGE_KEY, pw);
      setAuthed(true);
    },
  });

  const q = useQuery({
    queryKey: ["review-queue", status],
    enabled: authed,
    queryFn: () => list({ data: { password: pw, status } }),
  });

  const resolveMut = useMutation({
    mutationFn: (v: { id: string; resolution: "resolved" | "dismissed" }) =>
      resolve({ data: { password: pw, ...v } }),
    onSuccess: () => q.refetch(),
  });
  const recheckMut = useMutation({
    mutationFn: (slotId: string) => recheck({ data: { password: pw, slotId } }),
    onSuccess: () => q.refetch(),
  });

  if (!authed) {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-light mb-4">Editorial Review Queue</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Admin password"
          className="w-full border px-3 py-2 mb-3"
        />
        <button
          onClick={() => auth.mutate()}
          disabled={!pw}
          className="bg-black text-white px-4 py-2 text-sm tracking-widest uppercase"
        >
          Enter
        </button>
        {auth.error && (
          <p className="text-red-600 text-xs mt-2">{(auth.error as Error).message}</p>
        )}
      </div>
    );
  }

  const items = q.data?.items ?? [];
  const byPriority = (p: string) => items.filter((i) => i.priority === p);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-light">Editorial Review Queue</h1>
          <p className="text-xs text-stone-500 mt-1 tracking-wide">
            Founder-only exceptions. The platform handles routine fallbacks silently.
          </p>
        </div>
        <div className="flex gap-2 text-xs uppercase tracking-widest">
          {(["open", "resolved", "dismissed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 border ${
                status === s ? "bg-black text-white border-black" : "border-stone-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {status === "open" && (
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <Counter label="High priority" v={byPriority("high").length} accent="red" />
          <Counter label="Medium" v={byPriority("medium").length} accent="amber" />
          <Counter label="Low" v={byPriority("low").length} />
        </div>
      )}

      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.id}
            className="border border-stone-200 p-4 flex justify-between items-start"
          >
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <PriorityBadge p={it.priority} />
                <span className="text-xs text-stone-500">
                  {new Date(it.created_at).toLocaleString()}
                </span>
                {it.collection?.featured && (
                  <span className="bg-black text-white text-[10px] px-1.5 py-0.5 uppercase tracking-widest">
                    Featured
                  </span>
                )}
              </div>
              <div className="text-sm font-medium">{it.reason}</div>
              <div className="text-xs text-stone-600 mt-1">
                {it.collection ? (
                  <>
                    <a
                      className="underline"
                      href={`/admin/collections/${it.collection_id}`}
                    >
                      {it.collection.title}
                    </a>
                    {" · "}
                    {it.collection.destination} / {it.collection.activity}
                  </>
                ) : (
                  "—"
                )}
              </div>
              {it.slot && (
                <div className="text-xs text-stone-500 mt-1">
                  Slot: <strong>{it.slot.slot}</strong> · {it.slot.brand ?? "—"} ·{" "}
                  {it.slot.product_name ?? "—"}{" "}
                  {it.slot.source_url && (
                    <a
                      href={it.slot.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline ml-1"
                    >
                      open ↗
                    </a>
                  )}
                </div>
              )}
            </div>
            {status === "open" && (
              <div className="flex flex-col gap-1 text-xs">
                {it.slot_id && (
                  <button
                    className="border border-stone-300 px-3 py-1 uppercase tracking-widest"
                    onClick={() => recheckMut.mutate(it.slot_id!)}
                  >
                    Re-check
                  </button>
                )}
                <button
                  className="bg-emerald-700 text-white px-3 py-1 uppercase tracking-widest"
                  onClick={() =>
                    resolveMut.mutate({ id: it.id, resolution: "resolved" })
                  }
                >
                  Resolved
                </button>
                <button
                  className="border border-stone-300 px-3 py-1 uppercase tracking-widest"
                  onClick={() =>
                    resolveMut.mutate({ id: it.id, resolution: "dismissed" })
                  }
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
        {!items.length && (
          <div className="text-center text-stone-500 py-10 text-sm">
            Nothing in this queue.
          </div>
        )}
      </div>
    </div>
  );
}

function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = {
    high: "bg-red-600 text-white",
    medium: "bg-amber-500 text-white",
    low: "bg-stone-300 text-stone-800",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 ${
        map[p] ?? "bg-stone-200"
      }`}
    >
      {p}
    </span>
  );
}

function Counter({
  label,
  v,
  accent,
}: {
  label: string;
  v: number;
  accent?: "red" | "amber";
}) {
  const color =
    accent === "red" ? "text-red-700" : accent === "amber" ? "text-amber-700" : "text-stone-900";
  return (
    <div className="border border-stone-200 p-4">
      <div className="text-[10px] uppercase tracking-widest text-stone-500">{label}</div>
      <div className={`text-3xl font-light ${color}`}>{v}</div>
    </div>
  );
}
