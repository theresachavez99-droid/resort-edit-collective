import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSubscribers, updateSubscriber } from "@/lib/subscribers.functions";
import { verifyAdmin } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/admin/subscribers")({
  head: () => ({
    meta: [
      { title: "Subscribers — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SubscribersPage,
});

const STORAGE_KEY = "admin_subscribers_pw";

type Subscriber = {
  id: string;
  email: string;
  source_page: string | null;
  destination: string | null;
  cta_source: string | null;
  status: string;
  tags: string[] | null;
  notes: string | null;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
};

function SubscribersPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const verifyFn = useServerFn(verifyAdmin);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    verifyFn({ data: { password: saved } })
      .then(() => {
        setPw(saved);
        setUnlocked(true);
      })
      .catch(() => sessionStorage.removeItem(STORAGE_KEY));
  }, []);

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory p-6">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setVerifying(true);
            try {
              await verifyFn({ data: { password: pw } });
              sessionStorage.setItem(STORAGE_KEY, pw);
              setUnlocked(true);
            } catch {
              setError("Incorrect password.");
            } finally {
              setVerifying(false);
            }
          }}
          className="w-full max-w-sm space-y-4 bg-white border border-border/60 p-6 rounded-md"
        >
          <h1 className="font-serif text-xl">Subscribers — Admin</h1>
          <p className="text-sm text-ink/70">
            Enter the admin password to view newsletter subscribers.
          </p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full border border-border/60 rounded px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={verifying || !pw}
            className="w-full bg-ink text-ivory py-2 text-sm rounded hover:bg-ink/90"
          >
            {verifying ? "Verifying…" : "Unlock"}
          </button>
        </form>
      </div>
    );
  }

  return <SubscribersTable password={pw} />;
}

function SubscribersTable({ password }: { password: string }) {
  const listFn = useServerFn(listSubscribers);
  const updateFn = useServerFn(updateSubscriber);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["subscribers"],
    queryFn: () => listFn({ data: { password } }),
  });

  const mutation = useMutation({
    mutationFn: (vars: {
      id: string;
      status?: "active" | "unsubscribed";
      tags?: string[];
      notes?: string | null;
    }) => updateFn({ data: { password, ...vars } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscribers"] }),
  });

  const subs: Subscriber[] = (data?.subscribers as Subscriber[]) ?? [];

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [destination, setDestination] = useState<string>("all");
  const [cta, setCta] = useState<string>("all");

  const destinations = useMemo(
    () => Array.from(new Set(subs.map((s) => s.destination).filter(Boolean) as string[])).sort(),
    [subs],
  );
  const ctas = useMemo(
    () => Array.from(new Set(subs.map((s) => s.cta_source).filter(Boolean) as string[])).sort(),
    [subs],
  );

  const filtered = subs.filter((s) => {
    if (status !== "all" && s.status !== status) return false;
    if (destination !== "all" && s.destination !== destination) return false;
    if (cta !== "all" && s.cta_source !== cta) return false;
    if (q && !s.email.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  function exportCsv() {
    const headers = [
      "email",
      "created_at",
      "source_page",
      "destination",
      "cta_source",
      "status",
      "tags",
      "notes",
      "unsubscribed_at",
    ];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(",")];
    filtered.forEach((s) => {
      lines.push(
        [
          s.email,
          s.created_at,
          s.source_page,
          s.destination,
          s.cta_source,
          s.status,
          (s.tags ?? []).join("|"),
          s.notes,
          s.unsubscribed_at,
        ]
          .map(esc)
          .join(","),
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-ivory text-ink p-6 lg:p-10">
      <header className="mb-6 space-y-2">
        <h1 className="font-serif text-3xl">Subscribers</h1>
        <p className="text-sm text-ink/70">
          Newsletter signups from the footer and View Full Look CTAs. Admin-only — not exposed publicly.
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-ink/70">
          <span><strong>{subs.length}</strong> total</span>
          <span><strong>{subs.filter((s) => s.status === "active").length}</strong> active</span>
          <span><strong>{subs.filter((s) => s.status === "unsubscribed").length}</strong> unsubscribed</span>
          <span><strong>{filtered.length}</strong> matching filters</span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email…"
          className="border border-border/60 rounded px-2 py-1 text-sm bg-white"
        />
        <SelectBox label="Status" value={status} setValue={setStatus} options={["active", "unsubscribed"]} />
        <SelectBox label="Destination" value={destination} setValue={setDestination} options={destinations} />
        <SelectBox label="CTA" value={cta} setValue={setCta} options={ctas} />
        <button
          onClick={exportCsv}
          className="ml-auto bg-ink text-ivory text-xs uppercase tracking-wider px-3 py-1.5 rounded hover:bg-ink/90"
        >
          Export CSV
        </button>
      </div>

      {isLoading && <p className="text-sm text-ink/60">Loading subscribers…</p>}
      {error && (
        <p className="text-sm text-red-600">
          Failed to load: {(error as Error).message}
        </p>
      )}

      <div className="overflow-auto bg-white border border-border/60 rounded">
        <table className="w-full text-xs">
          <thead className="bg-cream text-left">
            <tr>
              <th className="p-2">Email</th>
              <th className="p-2">Created</th>
              <th className="p-2">Source page</th>
              <th className="p-2">Destination</th>
              <th className="p-2">CTA</th>
              <th className="p-2">Status</th>
              <th className="p-2 min-w-[160px]">Tags</th>
              <th className="p-2 min-w-[200px]">Notes</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <Row key={s.id} sub={s} onUpdate={(v) => mutation.mutate({ id: s.id, ...v })} />
            ))}
            {filtered.length === 0 && !isLoading && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-ink/50">
                  No subscribers match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  sub,
  onUpdate,
}: {
  sub: Subscriber;
  onUpdate: (v: { status?: "active" | "unsubscribed"; tags?: string[]; notes?: string | null }) => void;
}) {
  const [tagsDraft, setTagsDraft] = useState((sub.tags ?? []).join(", "));
  const [notesDraft, setNotesDraft] = useState(sub.notes ?? "");

  useEffect(() => setTagsDraft((sub.tags ?? []).join(", ")), [sub.tags]);
  useEffect(() => setNotesDraft(sub.notes ?? ""), [sub.notes]);

  const tagsChanged = tagsDraft !== (sub.tags ?? []).join(", ");
  const notesChanged = notesDraft !== (sub.notes ?? "");

  return (
    <tr className="border-t border-border/40 align-top">
      <td className="p-2 font-medium break-all">{sub.email}</td>
      <td className="p-2 text-ink/70 whitespace-nowrap">
        {new Date(sub.created_at).toLocaleDateString()}
      </td>
      <td className="p-2 text-ink/70 break-all max-w-[200px]">{sub.source_page ?? "—"}</td>
      <td className="p-2 text-ink/70">{sub.destination ?? "—"}</td>
      <td className="p-2 text-ink/70">{sub.cta_source ?? "—"}</td>
      <td className="p-2">
        <span
          className={
            "px-1.5 py-px rounded border text-[0.65rem] " +
            (sub.status === "active"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-ink/5 text-ink/60 border-border/60")
          }
        >
          {sub.status}
        </span>
      </td>
      <td className="p-2">
        <div className="flex flex-col gap-1">
          <input
            value={tagsDraft}
            onChange={(e) => setTagsDraft(e.target.value)}
            placeholder="tag1, tag2"
            className="border border-border/60 rounded px-1.5 py-1 text-xs bg-white"
          />
          {tagsChanged && (
            <button
              onClick={() =>
                onUpdate({
                  tags: tagsDraft
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              className="text-[0.6rem] uppercase tracking-wider bg-ink text-ivory rounded px-2 py-1 self-start"
            >
              Save tags
            </button>
          )}
        </div>
      </td>
      <td className="p-2">
        <div className="flex flex-col gap-1">
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            rows={2}
            className="border border-border/60 rounded px-1.5 py-1 text-xs bg-white"
          />
          {notesChanged && (
            <button
              onClick={() => onUpdate({ notes: notesDraft.trim() || null })}
              className="text-[0.6rem] uppercase tracking-wider bg-ink text-ivory rounded px-2 py-1 self-start"
            >
              Save notes
            </button>
          )}
        </div>
      </td>
      <td className="p-2">
        {sub.status === "active" ? (
          <button
            onClick={() => onUpdate({ status: "unsubscribed" })}
            className="text-[0.6rem] uppercase tracking-wider border border-border/60 rounded px-2 py-1 hover:border-red-400 hover:text-red-600 whitespace-nowrap"
          >
            Unsubscribe
          </button>
        ) : (
          <button
            onClick={() => onUpdate({ status: "active" })}
            className="text-[0.6rem] uppercase tracking-wider border border-border/60 rounded px-2 py-1 hover:border-green-500 hover:text-green-700 whitespace-nowrap"
          >
            Reactivate
          </button>
        )}
      </td>
    </tr>
  );
}

function SelectBox({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-ink/60">{label}</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border border-border/60 rounded px-2 py-1 text-sm bg-white"
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}