import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBuyingSession,
  listBuyingSessions,
  getBuyingSession,
  importUrlsToSession,
  importRowsToSession,
  updateCandidate,
  deleteCandidate,
  getAffiliateNetworkStatus,
} from "@/lib/buying-office.functions";

export const Route = createFileRoute("/admin/buying-office")({
  head: () => ({
    meta: [
      { title: "Founder Buying Office — Resort Edit" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BuyingOffice,
});

const PW_KEY = "admin_dashboard_pw";
const STATUS_LABEL: Record<string, string> = {
  review: "In Review",
  favorite: "Favorite",
  review_later: "Review Later",
  finalist: "Finalist",
  founder_hero: "Founder Hero",
  rejected: "Rejected",
};
const STATUS_ORDER = ["review", "favorite", "review_later", "finalist", "founder_hero", "rejected"];

function BuyingOffice() {
  const password = typeof window !== "undefined" ? (sessionStorage.getItem(PW_KEY) ?? "") : "";
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!password) {
    return (
      <main className="mx-auto max-w-xl p-10 text-sm">
        Open <code>/admin</code> first to unlock the founder workspace.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header>
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
          Founder Buying Office
        </p>
        <h1 className="font-serif text-3xl">Buying Review</h1>
        <p className="text-xs text-stone-500 mt-2 max-w-2xl">
          Build the 20 Portofino Founder Heroes. Paste product URLs or import rows now;
          affiliate links can be added later without losing the candidate.
        </p>
      </header>

      <AffiliatePanel password={password} />
      <SessionsPanel
        password={password}
        activeId={activeId}
        onSelect={setActiveId}
      />
      {activeId && <SessionDetail password={password} sessionId={activeId} />}
    </main>
  );
}

// -------------------- Affiliate credentials panel --------------------

function AffiliatePanel({ password }: { password: string }) {
  const fn = useServerFn(getAffiliateNetworkStatus);
  const q = useQuery({
    queryKey: ["bo-affiliate"],
    queryFn: () => fn({ data: { password } }),
  });
  const data = q.data;
  return (
    <section className="border border-stone-200 p-5">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
          Affiliate Credentials Status
        </h2>
        <span className="text-xs text-stone-500">
          {data ? `${data.summary.ready}/${data.summary.total} networks ready` : "…"}
        </span>
      </div>
      {!data ? (
        <p className="text-xs text-stone-500">Loading…</p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {data.networks.map((n) => (
            <div key={n.network} className="border border-stone-200 p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{n.label}</span>
                <span
                  className={
                    n.providerReady
                      ? "text-emerald-700"
                      : n.credentialsPresent
                        ? "text-amber-700"
                        : "text-stone-500"
                  }
                >
                  {n.providerReady ? "Ready" : n.credentialsPresent ? "Creds OK · adapter pending" : "Blocked"}
                </span>
              </div>
              <div className="text-stone-500">
                Retailers: {n.retailerPrograms.join(", ")}
              </div>
              <div className="text-stone-500">
                Credentials:{" "}
                {n.requiredCredentials
                  .map((c) => `${c.label} ${c.present ? "✓" : "✗"}`)
                  .join(" · ")}
              </div>
              <div className="text-stone-500">
                Programs: {n.programsApproved}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// -------------------- Sessions list / create --------------------

function SessionsPanel({
  password,
  activeId,
  onSelect,
}: {
  password: string;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const listFn = useServerFn(listBuyingSessions);
  const createFn = useServerFn(createBuyingSession);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["bo-sessions"],
    queryFn: () => listFn({ data: { password } }),
  });

  const [destination, setDestination] = useState("Portofino");
  const [moment, setMoment] = useState("Arrival Day");
  const [notes, setNotes] = useState("");

  const create = useMutation({
    mutationFn: () =>
      createFn({ data: { password, destination, moment, notes: notes || undefined } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["bo-sessions"] });
      onSelect(r.session.id);
      setNotes("");
    },
  });

  useEffect(() => {
    if (!activeId && q.data?.sessions?.[0]) onSelect(q.data.sessions[0].id);
  }, [q.data, activeId, onSelect]);

  return (
    <section className="space-y-4">
      <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-2">
        Search Sessions
      </h2>

      <div className="border border-stone-200 p-4 grid gap-2 md:grid-cols-4">
        <input
          className="border border-stone-300 px-2 py-1 text-sm"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination"
        />
        <input
          className="border border-stone-300 px-2 py-1 text-sm"
          value={moment}
          onChange={(e) => setMoment(e.target.value)}
          placeholder="Moment"
        />
        <input
          className="border border-stone-300 px-2 py-1 text-sm md:col-span-1"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
        />
        <button
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="bg-ink text-ivory px-4 py-1 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
        >
          {create.isPending ? "Creating…" : "New Session"}
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {(q.data?.sessions ?? []).map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={
              "text-left border p-3 text-xs " +
              (s.id === activeId ? "border-ink bg-stone-50" : "border-stone-200 hover:border-stone-400")
            }
          >
            <div className="font-mono text-[0.7rem] text-stone-500">{s.session_code}</div>
            <div className="font-medium text-sm mt-1">
              {s.destination} — {s.moment}
            </div>
            <div className="text-stone-500 mt-1">
              {new Date(s.created_at).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// -------------------- Session detail / candidates --------------------

function SessionDetail({ password, sessionId }: { password: string; sessionId: string }) {
  const getFn = useServerFn(getBuyingSession);
  const importUrls = useServerFn(importUrlsToSession);
  const importRows = useServerFn(importRowsToSession);
  const qc = useQueryClient();
  const key = ["bo-session", sessionId];

  const q = useQuery({
    queryKey: key,
    queryFn: () => getFn({ data: { password, id: sessionId } }),
  });

  const [urlText, setUrlText] = useState("");
  const [csvText, setCsvText] = useState("");

  const urlMut = useMutation({
    mutationFn: () => {
      const urls = urlText
        .split(/\s+/)
        .map((u) => u.trim())
        .filter((u) => /^https?:\/\//i.test(u));
      if (!urls.length) throw new Error("Paste at least one URL");
      return importUrls({ data: { password, sessionId, urls } });
    },
    onSuccess: () => {
      setUrlText("");
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const csvMut = useMutation({
    mutationFn: () => {
      const rows = parseCsv(csvText);
      if (!rows.length) throw new Error("No rows parsed");
      return importRows({ data: { password, sessionId, rows } });
    },
    onSuccess: () => {
      setCsvText("");
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const candidates = q.data?.candidates ?? [];
  const grouped = useMemo(() => {
    const m: Record<string, typeof candidates> = {};
    for (const c of candidates) {
      const s = (c.status as string) || "review";
      (m[s] ||= []).push(c);
    }
    return m;
  }, [candidates]);

  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between border-b border-stone-200 pb-2">
        <div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            {q.data?.session.destination} · {q.data?.session.moment}
          </p>
          <h2 className="font-serif text-xl">
            {q.data?.session.session_code}
          </h2>
          {!q.data?.heroBrief && (
            <p className="text-xs text-amber-700 mt-1">
              No Hero Brief linked — similarity scores use the baseline. Link a Founder Look to sharpen ranking.
            </p>
          )}
        </div>
        <div className="text-xs text-stone-500">{candidates.length} candidates</div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-stone-200 p-4 space-y-2">
          <h3 className="text-[0.65rem] tracking-[0.24em] uppercase text-stone-500">
            Paste product URLs
          </h3>
          <textarea
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            rows={6}
            className="w-full border border-stone-300 px-2 py-1 text-xs font-mono"
            placeholder="One URL per line (or space-separated)"
          />
          <button
            onClick={() => urlMut.mutate()}
            disabled={urlMut.isPending}
            className="bg-ink text-ivory px-3 py-1 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
          >
            {urlMut.isPending ? "Importing…" : "Import URLs"}
          </button>
          {urlMut.data && (
            <p className="text-xs text-stone-500">
              Imported {urlMut.data.inserted.length} · Skipped {urlMut.data.skipped.length}
            </p>
          )}
          {urlMut.error && (
            <p className="text-xs text-red-600">{(urlMut.error as Error).message}</p>
          )}
        </div>

        <div className="border border-stone-200 p-4 space-y-2">
          <h3 className="text-[0.65rem] tracking-[0.24em] uppercase text-stone-500">
            Import rows (CSV)
          </h3>
          <p className="text-[0.65rem] text-stone-500">
            Header row required. Supported columns: product_url, affiliate_url, brand, product_name,
            retailer, category, color, price, currency, image_url, description, notes.
          </p>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={6}
            className="w-full border border-stone-300 px-2 py-1 text-xs font-mono"
            placeholder="product_url,brand,product_name,price&#10;https://...,Alexandra Miro,Zella,420"
          />
          <button
            onClick={() => csvMut.mutate()}
            disabled={csvMut.isPending}
            className="bg-ink text-ivory px-3 py-1 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
          >
            {csvMut.isPending ? "Importing…" : "Import Rows"}
          </button>
          {csvMut.data && (
            <p className="text-xs text-stone-500">
              Imported {csvMut.data.inserted.length} · Skipped {csvMut.data.skipped.length}
            </p>
          )}
          {csvMut.error && (
            <p className="text-xs text-red-600">{(csvMut.error as Error).message}</p>
          )}
        </div>
      </div>

      {STATUS_ORDER.map((status) => {
        const items = grouped[status] ?? [];
        if (!items.length) return null;
        return (
          <div key={status} className="space-y-2">
            <h3 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-1">
              {STATUS_LABEL[status] ?? status} · {items.length}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => (
                <CandidateCard
                  key={c.id}
                  c={c}
                  password={password}
                  invalidateKey={key}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function CandidateCard({
  c,
  password,
  invalidateKey,
}: {
  c: any;
  password: string;
  invalidateKey: readonly unknown[];
}) {
  const updateFn = useServerFn(updateCandidate);
  const delFn = useServerFn(deleteCandidate);
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: invalidateKey as unknown[] });

  const [showImg, setShowImg] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [showAff, setShowAff] = useState(false);
  const [affUrl, setAffUrl] = useState("");

  const patch = (p: Record<string, unknown>) =>
    updateFn({ data: { password, id: c.id, patch: p as never } }).then(inv);

  return (
    <div className="border border-stone-200 p-3 text-xs space-y-2 flex flex-col">
      <div className="aspect-square bg-stone-100 overflow-hidden">
        {c.image_url ? (
          <img src={c.image_url} alt={c.product_name ?? ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[0.65rem] text-stone-500 px-3 text-center">
            Image missing — paste image URL below
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm truncate" title={c.brand ?? ""}>
          {c.brand ?? "Brand unknown"}
        </span>
        <span className="text-[0.65rem] text-stone-500">
          {c.source === "manual_import" ? "Manual" : c.source}
        </span>
      </div>
      <div className="text-stone-600 line-clamp-2" title={c.product_name ?? ""}>
        {c.product_name ?? "Untitled"}
      </div>
      <div className="text-stone-500">
        {c.retailer ?? "no retailer"}
        {c.price != null && (
          <> · {c.currency ?? "USD"} {Number(c.price).toLocaleString()}</>
        )}
      </div>
      <div className="flex gap-2 text-[0.65rem]">
        <span className="border border-stone-300 px-1.5 py-0.5">
          Ed {Math.round(c.editorial_score ?? 0)}
        </span>
        <span className="border border-stone-300 px-1.5 py-0.5">
          Sim {Math.round(c.benchmark_similarity ?? 0)}
        </span>
        <span className="border border-stone-300 px-1.5 py-0.5">
          Conf {Math.round(c.editorial_confidence ?? 0)}
        </span>
      </div>
      <div
        className={
          "text-[0.65rem] " +
          (c.affiliate_status === "linked" ? "text-emerald-700" : "text-amber-700")
        }
      >
        Affiliate: {c.affiliate_status === "linked" ? "Linked" : "Pending / Needs affiliate link"}
      </div>
      {Array.isArray(c.ranking_reasons) && c.ranking_reasons.length > 0 && (
        <ul className="text-[0.65rem] text-stone-500 list-disc pl-4 space-y-0.5">
          {c.ranking_reasons.slice(0, 4).map((r: string, i: number) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-1 pt-1">
        <a
          href={c.affiliate_url ?? c.product_url}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-stone-300 px-2 py-0.5 hover:bg-stone-100"
        >
          Open
        </a>
        <button onClick={() => patch({ status: "favorite" })} className="border border-stone-300 px-2 py-0.5 hover:bg-stone-100">
          ★ Favorite
        </button>
        <button onClick={() => patch({ status: "review_later" })} className="border border-stone-300 px-2 py-0.5 hover:bg-stone-100">
          Later
        </button>
        <button onClick={() => patch({ status: "finalist" })} className="border border-stone-300 px-2 py-0.5 hover:bg-stone-100">
          Finalist
        </button>
        <button onClick={() => patch({ status: "founder_hero" })} className="border border-ink bg-ink text-ivory px-2 py-0.5">
          Promote Hero
        </button>
        <button onClick={() => patch({ status: "rejected" })} className="border border-stone-300 px-2 py-0.5 hover:bg-stone-100">
          Reject
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {!showAff ? (
          <button onClick={() => setShowAff(true)} className="text-[0.65rem] underline text-stone-500">
            {c.affiliate_url ? "Edit affiliate URL" : "Add affiliate URL"}
          </button>
        ) : (
          <div className="w-full flex gap-1">
            <input
              value={affUrl}
              onChange={(e) => setAffUrl(e.target.value)}
              placeholder={c.affiliate_url ?? "https://…"}
              className="flex-1 border border-stone-300 px-1 py-0.5 text-[0.7rem]"
            />
            <button
              onClick={() => patch({ affiliate_url: affUrl }).then(() => setShowAff(false))}
              className="border border-stone-300 px-2 py-0.5"
            >
              Save
            </button>
          </div>
        )}
        {!showImg ? (
          <button onClick={() => setShowImg(true)} className="text-[0.65rem] underline text-stone-500">
            {c.image_url ? "Replace image URL" : "Add image URL"}
          </button>
        ) : (
          <div className="w-full flex gap-1">
            <input
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="https://…/image.jpg"
              className="flex-1 border border-stone-300 px-1 py-0.5 text-[0.7rem]"
            />
            <button
              onClick={() => patch({ image_url: imgUrl }).then(() => setShowImg(false))}
              className="border border-stone-300 px-2 py-0.5"
            >
              Save
            </button>
          </div>
        )}
        <button
          onClick={() => {
            if (confirm("Remove this candidate from the session?")) {
              delFn({ data: { password, id: c.id } }).then(inv);
            }
          }}
          className="text-[0.65rem] underline text-red-700 ml-auto"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// -------------------- CSV parser (lightweight) --------------------

function parseCsv(text: string): Array<Record<string, unknown>> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const out: Array<Record<string, unknown>> = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const row: Record<string, unknown> = {};
    header.forEach((key, idx) => {
      const v = (cols[idx] ?? "").trim();
      if (!v) return;
      if (key === "price") {
        const n = Number(v.replace(/[^0-9.]/g, ""));
        if (Number.isFinite(n)) row[key] = n;
      } else {
        row[key] = v;
      }
    });
    if (row.product_url) out.push(row);
  }
  return out;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else {
      if (ch === ',') { out.push(cur); cur = ""; }
      else if (ch === '"') quoted = true;
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}