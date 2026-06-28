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
  updateBuyingSession,
} from "@/lib/buying-office.functions";
import { listFounderLooks } from "@/lib/founder-looks.functions";

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
const SESSION_STATUSES = ["open", "in_review", "finalists_locked", "published", "archived"];
const STRATEGY_OPTIONS = ["manual_import", "category_scrape", "affiliate_feed", "hybrid"];
const DEPTH_OPTIONS = ["shallow (1 page)", "standard (2-3 pages)", "deep (full set)"];

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

      {!activeId && (
        <NewSessionPanel password={password} onCreated={(id) => setActiveId(id)} />
      )}
      {activeId && (
        <SessionDetail
          password={password}
          sessionId={activeId}
          onExit={() => setActiveId(null)}
        />
      )}
      <SessionHistoryPanel
        password={password}
        activeId={activeId}
        onSelect={setActiveId}
      />
      <AffiliatePanel password={password} />
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

// -------------------- New Session creation --------------------

function NewSessionPanel({
  password,
  onCreated,
}: {
  password: string;
  onCreated: (id: string) => void;
}) {
  const createFn = useServerFn(createBuyingSession);
  const looksFn = useServerFn(listFounderLooks);
  const qc = useQueryClient();
  const looksQ = useQuery({
    queryKey: ["bo-founder-looks"],
    queryFn: () => looksFn({ data: { password } }),
  });

  const [destination, setDestination] = useState("Portofino");
  const [moment, setMoment] = useState("Arrival Day");
  const [founderLookId, setFounderLookId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          password,
          destination,
          moment,
          founderLookId: founderLookId || null,
          notes: notes || undefined,
        },
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["bo-sessions"] });
      onCreated(r.session.id);
    },
  });

  const looks = looksQ.data?.ok ? looksQ.data.looks : [];

  return (
    <section className="border border-stone-300 p-6 space-y-4 bg-stone-50">
      <div>
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">Start</p>
        <h2 className="font-serif text-xl">New Search Session</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Destination">
          <input
            className="border border-stone-300 px-2 py-1 text-sm w-full"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </Field>
        <Field label="Moment">
          <input
            className="border border-stone-300 px-2 py-1 text-sm w-full"
            value={moment}
            onChange={(e) => setMoment(e.target.value)}
          />
        </Field>
        <Field label="Founder Look (optional · sharpens scoring)">
          <select
            className="border border-stone-300 px-2 py-1 text-sm w-full bg-white"
            value={founderLookId}
            onChange={(e) => setFounderLookId(e.target.value)}
          >
            <option value="">— none —</option>
            {looks.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.title} · {l.destination}/{l.moment}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes">
          <input
            className="border border-stone-300 px-2 py-1 text-sm w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What are we building this session?"
          />
        </Field>
      </div>
      <button
        onClick={() => create.mutate()}
        disabled={create.isPending}
        className="bg-ink text-ivory px-6 py-2 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
      >
        {create.isPending ? "Creating…" : "Create Session & Open Buying Review"}
      </button>
      {create.error && (
        <p className="text-xs text-red-600">{(create.error as Error).message}</p>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[0.6rem] tracking-[0.24em] uppercase text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

// -------------------- Session detail / candidates --------------------

function SessionDetail({
  password,
  sessionId,
  onExit,
}: {
  password: string;
  sessionId: string;
  onExit: () => void;
}) {
  const getFn = useServerFn(getBuyingSession);
  const importUrls = useServerFn(importUrlsToSession);
  const importRows = useServerFn(importRowsToSession);
  const updateSession = useServerFn(updateBuyingSession);
  const looksFn = useServerFn(listFounderLooks);
  const qc = useQueryClient();
  const key = ["bo-session", sessionId];

  const q = useQuery({
    queryKey: key,
    queryFn: () => getFn({ data: { password, id: sessionId } }),
  });
  const looksQ = useQuery({
    queryKey: ["bo-founder-looks"],
    queryFn: () => looksFn({ data: { password } }),
  });

  const [urlText, setUrlText] = useState("");
  const [csvText, setCsvText] = useState("");
  const [sortKey, setSortKey] = useState<"editorial" | "similarity" | "confidence" | "price" | "new">("editorial");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAffiliate, setFilterAffiliate] = useState<string>("all");
  const [filterRetailer, setFilterRetailer] = useState<string>("all");
  const [compareIds, setCompareIds] = useState<Record<string, true>>({});
  const [showCompare, setShowCompare] = useState(false);

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

  const sessionMut = useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      updateSession({ data: { password, id: sessionId, patch: patch as never } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const candidates = q.data?.candidates ?? [];
  const session = q.data?.session as any;
  const heroBrief = q.data?.heroBrief;
  const looks = looksQ.data?.ok ? looksQ.data.looks : [];
  const linkedLook = looks.find((l: any) => l.id === session?.founder_look_id);
  const diag = (session?.source_diagnostics ?? {}) as Record<string, any>;

  const retailers = useMemo(
    () => Array.from(new Set(candidates.map((c: any) => c.retailer).filter(Boolean))) as string[],
    [candidates],
  );

  const filtered = useMemo(() => {
    let list = [...candidates];
    if (filterStatus !== "all") list = list.filter((c: any) => (c.status ?? "review") === filterStatus);
    if (filterAffiliate !== "all") list = list.filter((c: any) => (c.affiliate_status ?? "pending") === filterAffiliate);
    if (filterRetailer !== "all") list = list.filter((c: any) => c.retailer === filterRetailer);
    list.sort((a: any, b: any) => {
      if (sortKey === "new") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortKey === "price") return (a.price ?? Infinity) - (b.price ?? Infinity);
      const f = (c: any) =>
        sortKey === "editorial"
          ? c.editorial_score
          : sortKey === "similarity"
            ? c.benchmark_similarity
            : c.editorial_confidence;
      return (f(b) ?? 0) - (f(a) ?? 0);
    });
    return list;
  }, [candidates, sortKey, filterStatus, filterAffiliate, filterRetailer]);

  const compareList = candidates.filter((c: any) => compareIds[c.id]);

  return (
    <section className="space-y-8">
      {/* ---------- Section 1: Header ---------- */}
      <div className="border border-stone-300 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
              Search Session · {session?.session_code}
            </p>
            <h2 className="font-serif text-2xl mt-1">
              {session?.destination} — {session?.moment}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Created {session?.created_at && new Date(session.created_at).toLocaleString()} ·{" "}
              {candidates.length} candidates
            </p>
          </div>
          <button
            onClick={onExit}
            className="text-[0.65rem] tracking-[0.24em] uppercase underline text-stone-500"
          >
            ← All sessions
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3 text-xs">
          <HeaderField label="Founder Look">
            <select
              className="border border-stone-300 px-2 py-1 text-xs w-full bg-white"
              value={session?.founder_look_id ?? ""}
              onChange={(e) =>
                sessionMut.mutate({ founder_look_id: e.target.value || null })
              }
            >
              <option value="">— none —</option>
              {looks.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </HeaderField>
          <HeaderField label="Session Status">
            <select
              className="border border-stone-300 px-2 py-1 text-xs w-full bg-white"
              value={session?.status ?? "open"}
              onChange={(e) => sessionMut.mutate({ status: e.target.value })}
            >
              {SESSION_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </HeaderField>
          <HeaderField label="Search Strategy">
            <select
              className="border border-stone-300 px-2 py-1 text-xs w-full bg-white"
              value={session?.strategy ?? "manual_import"}
              onChange={(e) => sessionMut.mutate({ strategy: e.target.value })}
            >
              {STRATEGY_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </HeaderField>
          <HeaderField label="Search Depth">
            <select
              className="border border-stone-300 px-2 py-1 text-xs w-full bg-white"
              value={diag.depth ?? ""}
              onChange={(e) => sessionMut.mutate({ depth: e.target.value })}
            >
              <option value="">— set —</option>
              {DEPTH_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </HeaderField>
          <HeaderField label="Editorial Benchmark">
            <input
              className="border border-stone-300 px-2 py-1 text-xs w-full"
              defaultValue={diag.benchmark ?? ""}
              placeholder="e.g. Alexandra Miro Pietra Rosa"
              onBlur={(e) => {
                if (e.target.value !== (diag.benchmark ?? "")) {
                  sessionMut.mutate({ benchmark: e.target.value });
                }
              }}
            />
          </HeaderField>
          <HeaderField label="Founder Hero Brief">
            <div className="text-[0.7rem] text-stone-600 leading-relaxed">
              {heroBrief ? (
                <>
                  <div>Brands: {heroBrief.brands.join(", ") || "—"}</div>
                  <div>Palette: {(heroBrief.paletteInclude ?? []).join(", ") || "—"}</div>
                  <div>Style: {(heroBrief.styleFamily ?? []).join(", ") || "—"}</div>
                </>
              ) : (
                <span className="text-amber-700">
                  Link a Founder Look above to load the Hero Brief.
                </span>
              )}
            </div>
          </HeaderField>
        </div>
        {linkedLook?.founder_notes && (
          <div className="text-[0.7rem] text-stone-500 border-t border-stone-200 pt-2">
            <span className="uppercase tracking-[0.24em] text-[0.6rem]">From Founder Look:</span>{" "}
            {linkedLook.founder_notes}
          </div>
        )}
      </div>

      {/* ---------- Section 2: Import Products ---------- */}
      <div className="border-2 border-ink p-5 space-y-4">
        <div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Step 1
          </p>
          <h3 className="font-serif text-xl">Import Products</h3>
          <p className="text-xs text-stone-500 mt-1">
            Paste product URLs or upload a CSV. Each row is scored against the Hero Brief on import.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-[0.6rem] tracking-[0.24em] uppercase text-stone-500">
              Paste Product URLs
            </h4>
            <textarea
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              rows={5}
              className="w-full border border-stone-300 px-2 py-1 text-xs font-mono"
              placeholder="One URL per line"
            />
            <button
              onClick={() => urlMut.mutate()}
              disabled={urlMut.isPending}
              className="bg-ink text-ivory px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
            >
              {urlMut.isPending ? "Importing…" : "Import URLs"}
            </button>
            {urlMut.data && (
              <p className="text-xs text-emerald-700">
                Imported {urlMut.data.inserted.length} · Skipped {urlMut.data.skipped.length}
              </p>
            )}
            {urlMut.error && (
              <p className="text-xs text-red-600">{(urlMut.error as Error).message}</p>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-[0.6rem] tracking-[0.24em] uppercase text-stone-500">
              Or Upload CSV
            </h4>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={5}
              className="w-full border border-stone-300 px-2 py-1 text-xs font-mono"
              placeholder="product_url,brand,product_name,price&#10;https://...,Alexandra Miro,Zella,420"
            />
            <button
              onClick={() => csvMut.mutate()}
              disabled={csvMut.isPending}
              className="bg-ink text-ivory px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
            >
              {csvMut.isPending ? "Importing…" : "Import CSV"}
            </button>
            {csvMut.data && (
              <p className="text-xs text-emerald-700">
                Imported {csvMut.data.inserted.length} · Skipped {csvMut.data.skipped.length}
              </p>
            )}
            {csvMut.error && (
              <p className="text-xs text-red-600">{(csvMut.error as Error).message}</p>
            )}
            <p className="text-[0.6rem] text-stone-500">
              Columns: product_url, affiliate_url, brand, product_name, retailer, category, color,
              price, currency, image_url, description, notes.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Section 3 + 4: Buying Review ---------- */}
      <div className="space-y-4">
        <div className="flex items-end justify-between border-b border-stone-200 pb-2">
          <div>
            <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">Step 2</p>
            <h3 className="font-serif text-xl">Buying Review · {filtered.length} of {candidates.length}</h3>
          </div>
          <div className="flex gap-2 text-[0.65rem]">
            <button
              onClick={() => setShowCompare((s) => !s)}
              disabled={compareList.length < 2}
              className="border border-stone-300 px-2 py-1 disabled:opacity-40"
            >
              Compare ({compareList.length})
            </button>
            <button
              onClick={() => setCompareIds({})}
              className="border border-stone-300 px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[0.7rem]">
          <Selector label="Sort" value={sortKey} onChange={(v) => setSortKey(v as any)}
            options={[
              ["editorial", "Editorial Score"],
              ["similarity", "Benchmark Similarity"],
              ["confidence", "Editorial Confidence"],
              ["price", "Price (low→high)"],
              ["new", "Newest"],
            ]}
          />
          <Selector label="Status" value={filterStatus} onChange={setFilterStatus}
            options={[["all", "All"], ...STATUS_ORDER.map((s) => [s, STATUS_LABEL[s]] as [string, string])]}
          />
          <Selector label="Affiliate" value={filterAffiliate} onChange={setFilterAffiliate}
            options={[["all", "All"], ["linked", "Linked"], ["pending", "Pending"]]}
          />
          <Selector label="Retailer" value={filterRetailer} onChange={setFilterRetailer}
            options={[["all", "All"], ...retailers.map((r) => [r, r] as [string, string])]}
          />
        </div>

        {showCompare && compareList.length >= 2 && (
          <CompareTable items={compareList} />
        )}

        {candidates.length === 0 ? (
          <div className="border border-dashed border-stone-300 p-10 text-center text-xs text-stone-500">
            No candidates yet. Paste URLs above to begin.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c: any) => (
              <CandidateCard
                key={c.id}
                c={c}
                password={password}
                invalidateKey={key}
                checked={!!compareIds[c.id]}
                onToggleCompare={() =>
                  setCompareIds((prev) => {
                    const next = { ...prev };
                    if (next[c.id]) delete next[c.id];
                    else next[c.id] = true;
                    return next;
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------- Decision Log (current session) ---------- */}
      <DecisionLog candidates={candidates} />
    </section>
  );
}

function HeaderField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[0.6rem] tracking-[0.24em] uppercase text-stone-500">
        {label}
      </div>
      {children}
    </div>
  );
}

function Selector({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="flex items-center gap-1 border border-stone-300 px-2 py-1">
      <span className="uppercase tracking-[0.2em] text-stone-500 text-[0.6rem]">
        {label}
      </span>
      <select
        className="bg-transparent text-xs focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

function CompareTable({ items }: { items: any[] }) {
  return (
    <div className="overflow-x-auto border border-stone-200">
      <table className="w-full text-[0.7rem]">
        <thead className="bg-stone-50">
          <tr>
            {["", "Brand", "Product", "Retailer", "Price", "Ed", "Sim", "Conf", "Affiliate", "Status"].map((h) => (
              <th key={h} className="text-left px-2 py-1 border-b border-stone-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-b border-stone-100">
              <td className="px-2 py-1">
                {c.image_url && <img src={c.image_url} className="w-10 h-10 object-cover" alt="" />}
              </td>
              <td className="px-2 py-1">{c.brand ?? "—"}</td>
              <td className="px-2 py-1">{c.product_name ?? "—"}</td>
              <td className="px-2 py-1">{c.retailer ?? "—"}</td>
              <td className="px-2 py-1">{c.price ? `${c.currency ?? "USD"} ${c.price}` : "—"}</td>
              <td className="px-2 py-1">{Math.round(c.editorial_score ?? 0)}</td>
              <td className="px-2 py-1">{Math.round(c.benchmark_similarity ?? 0)}</td>
              <td className="px-2 py-1">{Math.round(c.editorial_confidence ?? 0)}</td>
              <td className="px-2 py-1">{c.affiliate_status}</td>
              <td className="px-2 py-1">{STATUS_LABEL[c.status] ?? c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DecisionLog({ candidates }: { candidates: any[] }) {
  const events = useMemo(() => {
    const decided = candidates.filter((c: any) =>
      ["favorite", "finalist", "founder_hero", "rejected", "review_later"].includes(c.status),
    );
    return decided
      .map((c: any) => ({
        id: c.id,
        status: c.status,
        brand: c.brand,
        product_name: c.product_name,
        at: c.updated_at ?? c.created_at,
        notes: c.notes,
        rejection_reason: c.rejection_reason,
      }))
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [candidates]);

  if (!events.length) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-1">
        Decision Log · this session
      </h3>
      <ul className="text-xs divide-y divide-stone-100 border border-stone-200">
        {events.map((e) => (
          <li key={e.id} className="px-3 py-2 flex gap-3">
            <span className="text-stone-400 w-28 shrink-0">
              {new Date(e.at).toLocaleString()}
            </span>
            <span className="font-medium w-32 shrink-0">{STATUS_LABEL[e.status] ?? e.status}</span>
            <span className="text-stone-700 truncate">
              {e.brand ?? "—"} — {e.product_name ?? "—"}
              {e.rejection_reason && <span className="text-stone-500"> · {e.rejection_reason}</span>}
              {e.notes && <span className="text-stone-500"> · {e.notes}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------------------- Session history (across sessions) --------------------

function SessionHistoryPanel({
  password,
  activeId,
  onSelect,
}: {
  password: string;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const listFn = useServerFn(listBuyingSessions);
  const q = useQuery({
    queryKey: ["bo-sessions"],
    queryFn: () => listFn({ data: { password } }),
  });
  const sessions = q.data?.sessions ?? [];
  return (
    <section className="space-y-3">
      <h2 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-2">
        Search Session History
      </h2>
      {sessions.length === 0 ? (
        <p className="text-xs text-stone-500">No sessions yet.</p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s: any) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={
                "text-left border p-3 text-xs " +
                (s.id === activeId
                  ? "border-ink bg-stone-50"
                  : "border-stone-200 hover:border-stone-400")
              }
            >
              <div className="font-mono text-[0.7rem] text-stone-500">{s.session_code}</div>
              <div className="font-medium text-sm mt-1">
                {s.destination} — {s.moment}
              </div>
              <div className="text-stone-500 mt-1">
                {new Date(s.created_at).toLocaleString()} · {s.status ?? "open"}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function CandidateCard({
  c,
  password,
  invalidateKey,
  checked,
  onToggleCompare,
}: {
  c: any;
  password: string;
  invalidateKey: readonly unknown[];
  checked: boolean;
  onToggleCompare: () => void;
}) {
  const updateFn = useServerFn(updateCandidate);
  const delFn = useServerFn(deleteCandidate);
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: invalidateKey as unknown[] });

  const [showImg, setShowImg] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [showAff, setShowAff] = useState(false);
  const [affUrl, setAffUrl] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<string>(c.notes ?? "");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const patch = (p: Record<string, unknown>) =>
    updateFn({ data: { password, id: c.id, patch: p as never } }).then(inv);

  return (
    <div
      className={
        "border p-3 text-xs space-y-2 flex flex-col " +
        (checked ? "border-ink bg-stone-50" : "border-stone-200")
      }
    >
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1 text-[0.65rem] text-stone-500">
          <input type="checkbox" checked={checked} onChange={onToggleCompare} />
          Compare
        </label>
        <span className="text-[0.65rem] text-stone-500">
          {STATUS_LABEL[c.status] ?? c.status}
        </span>
      </div>
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
        <button onClick={() => setShowReject((s) => !s)} className="border border-stone-300 px-2 py-0.5 hover:bg-stone-100">
          Reject
        </button>
      </div>
      {showReject && (
        <div className="flex gap-1">
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason (logo-heavy, off-palette, etc.)"
            className="flex-1 border border-stone-300 px-1 py-0.5 text-[0.7rem]"
          />
          <button
            onClick={() => patch({ status: "rejected", rejection_reason: rejectReason || null }).then(() => setShowReject(false))}
            className="border border-stone-300 px-2 py-0.5"
          >
            Save
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {!showNotes ? (
          <button onClick={() => setShowNotes(true)} className="text-[0.65rem] underline text-stone-500">
            {c.notes ? "Edit notes" : "Add notes"}
          </button>
        ) : (
          <div className="w-full flex gap-1">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Founder notes…"
              className="flex-1 border border-stone-300 px-1 py-0.5 text-[0.7rem]"
            />
            <button
              onClick={() => patch({ notes }).then(() => setShowNotes(false))}
              className="border border-stone-300 px-2 py-0.5"
            >
              Save
            </button>
          </div>
        )}
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