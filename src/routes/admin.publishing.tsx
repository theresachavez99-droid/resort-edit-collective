import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listPublishingRows,
  type PublishingRow,
  type PublishingStatus,
} from "@/lib/publishing.functions";

export const Route = createFileRoute("/admin/publishing")({
  head: () => ({
    meta: [
      { title: "Publishing — Resort Edit" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PublishingPage,
});

const STORAGE_KEY = "admin_publishing_pw";

function PublishingPage() {
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
      .then((r) => (r.ok ? setAuthed(true) : window.localStorage.removeItem(STORAGE_KEY)))
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
          <h1 className="font-display tracking-[0.18em] uppercase text-xl mb-6">
            Publishing
          </h1>
          <label className="text-[0.65rem] tracking-[0.24em] uppercase text-ink/60">
            Admin password
          </label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-2 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            autoFocus
          />
          {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
          <button
            type="submit"
            disabled={!pw}
            className="mt-6 w-full bg-ink text-ivory py-2.5 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-50"
          >
            Enter
          </button>
        </form>
      </main>
    );
  }

  return <Board password={pw} />;
}

function Board({ password }: { password: string }) {
  const fn = useServerFn(listPublishingRows);
  const rowsQ = useQuery({
    queryKey: ["admin-publishing-rows"],
    queryFn: () => fn({ data: { password } }),
  });

  const rows: PublishingRow[] = rowsQ.data?.ok ? rowsQ.data.rows : [];

  const counts = rows.reduce(
    (acc, r) => {
      acc[r.status] += 1;
      return acc;
    },
    { live: 0, review: 0, draft: 0, empty: 0 } as Record<PublishingStatus, number>,
  );

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-ink/15 px-6 md:px-10 py-6 sticky top-0 bg-ivory/95 backdrop-blur z-20">
        <div className="max-w-[1500px] mx-auto flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-[0.62rem] tracking-[0.34em] uppercase text-gold">
              Founder · Mission Control
            </p>
            <h1 className="font-display tracking-[0.18em] uppercase text-2xl mt-1">
              Publishing
            </h1>
            <p className="text-[0.72rem] text-ink/65 font-serif italic mt-1">
              Every destination moment — what's ready, what needs review, where to go next.
            </p>
          </div>
          <div className="flex gap-4 text-[0.62rem] tracking-[0.24em] uppercase">
            <Stat label="Live" value={counts.live} tone="emerald" />
            <Stat label="Review" value={counts.review} tone="amber" />
            <Stat label="Draft" value={counts.draft} tone="ink" />
            <Stat label="Empty" value={counts.empty} tone="muted" />
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-8">
        <div className="mb-4 flex items-center gap-3 text-[0.65rem] tracking-[0.24em] uppercase">
          <Link to="/admin" className="underline text-ink/70">
            ← Founder Dashboard
          </Link>
        </div>

        {rowsQ.isLoading && (
          <p className="text-sm text-ink/55 italic">Loading…</p>
        )}

        <section>
          <h2 className="font-display tracking-[0.2em] uppercase text-base mb-3 border-b border-ink/15 pb-2">
            Portofino
          </h2>
          <div className="overflow-x-auto border border-ink/15 bg-ivory">
            <table className="w-full text-[0.78rem] border-collapse">
              <thead className="bg-cream/40 text-ink/60">
                <tr className="text-left">
                  <Th>#</Th>
                  <Th>Moment</Th>
                  <Th>Status</Th>
                  <Th>Looks</Th>
                  <Th>Banner</Th>
                  <Th>Last updated</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <Row key={r.moment_slug} r={r} />
                ))}
                {!rows.length && !rowsQ.isLoading && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-ink/55 italic">
                      No moments.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 font-medium text-[0.6rem] tracking-[0.22em] uppercase border-b border-ink/15">
      {children}
    </th>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "ink" | "muted";
}) {
  const cls =
    tone === "emerald"
      ? "text-emerald-800 border-emerald-700/40 bg-emerald-50"
      : tone === "amber"
        ? "text-amber-800 border-amber-700/40 bg-amber-50"
        : tone === "ink"
          ? "text-ink border-ink/30 bg-cream/30"
          : "text-ink/55 border-ink/15 bg-ivory";
  return (
    <div className={`border px-2.5 py-1.5 ${cls}`}>
      <span className="opacity-70">{label}</span>{" "}
      <span className="font-display tracking-[0.12em] ml-1">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: PublishingStatus }) {
  const map: Record<PublishingStatus, string> = {
    live: "border-emerald-700/60 text-emerald-800 bg-emerald-50",
    review: "border-amber-700/60 text-amber-800 bg-amber-50",
    draft: "border-ink/40 text-ink/80 bg-cream/40",
    empty: "border-ink/20 text-ink/55 bg-ivory",
  };
  return (
    <span
      className={`text-[0.55rem] tracking-[0.22em] uppercase px-1.5 py-0.5 border ${map[status]}`}
    >
      {status}
    </span>
  );
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  } catch {
    return "—";
  }
}

function Row({ r }: { r: PublishingRow }) {
  const canPublish = r.status === "live";
  return (
    <tr className="border-b border-ink/10 align-top hover:bg-cream/20">
      <td className="px-3 py-3 text-ink/55 font-display">{r.editorial_order}</td>
      <td className="px-3 py-3">
        <div className="font-display tracking-[0.12em] uppercase text-[0.85rem]">
          {r.moment_name}
        </div>
        <div className="text-[0.6rem] tracking-[0.18em] uppercase text-ink/45 mt-0.5">
          {r.moment_slug}
        </div>
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={r.status} />
      </td>
      <td className="px-3 py-3 text-ink/80">
        <div>{r.looks_count}</div>
        <div className="text-[0.58rem] tracking-[0.18em] uppercase text-ink/45 mt-0.5">
          {r.approved_count}A · {r.review_count}R · {r.draft_count}D
        </div>
      </td>
      <td className="px-3 py-3">
        <span
          className={
            "text-[0.58rem] tracking-[0.2em] uppercase px-1.5 py-0.5 border " +
            (r.banner_ok
              ? "border-emerald-700/40 text-emerald-800 bg-emerald-50"
              : "border-red-700/50 text-red-800 bg-red-50")
          }
        >
          {r.banner_ok ? "OK" : "Missing"}
        </span>
      </td>
      <td className="px-3 py-3 text-ink/70 whitespace-nowrap">{fmtDate(r.last_updated)}</td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-1.5">
          <ActionLink to="/admin/stylist-engine">Stylist</ActionLink>
          <ActionLink to="/admin/look-studio">Look Studio</ActionLink>
          <ActionLink to="/admin/editorial-review-queue">Review</ActionLink>
          <ActionLink to={r.public_path} external>
            Dev page
          </ActionLink>
          <button
            type="button"
            disabled={!canPublish}
            title={
              canPublish
                ? "Publishing is founder-controlled — no auto-publish."
                : "Eligible only when at least one approved look exists."
            }
            className="text-[0.58rem] tracking-[0.2em] uppercase px-2 py-1 border border-ink/40 bg-ink text-ivory disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Publish
          </button>
        </div>
      </td>
    </tr>
  );
}

function ActionLink({
  to,
  children,
  external,
}: {
  to: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls =
    "text-[0.58rem] tracking-[0.2em] uppercase px-2 py-1 border border-ink/25 text-ink/80 hover:bg-cream/50";
  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={cls}>
        {children} ↗
      </a>
    );
  }
  return (
    <Link to={to} className={cls}>
      {children}
    </Link>
  );
}
