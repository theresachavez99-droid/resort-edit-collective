import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import { generateYachtDayCollection } from "@/lib/stylist-engine.functions";
import {
  VisualCollectionBoard,
  type BoardLook,
} from "@/components/VisualCollectionBoard";

export const Route = createFileRoute("/admin/stylist-engine")({
  head: () => ({
    meta: [
      { title: "v3 Stylist Engine — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StylistEnginePage,
});

const STORAGE_KEY = "admin_yacht_pilot_pw";

type RunResult = Awaited<ReturnType<typeof generateYachtDayCollection>>;

function StylistEnginePage() {
  const verify = useServerFn(verifyAdmin);
  const runEngine = useServerFn(generateYachtDayCollection);

  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [targetLooks, setTargetLooks] = useState(6);
  const [maxBrandsPerSlot, setMaxBrandsPerSlot] = useState(8);
  const [retailersPerBrand, setRetailersPerBrand] = useState(6);
  const [resultsPerSearch, setResultsPerSearch] = useState(4);
  const [persist, setPersist] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      setPw(stored);
      verify({ data: { password: stored } })
        .then((r) => {
          if (r.ok) setAuthed(true);
          else window.localStorage.removeItem(STORAGE_KEY);
        })
        .catch(() => window.localStorage.removeItem(STORAGE_KEY));
    }
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

  const mutation = useMutation({
    mutationFn: () =>
      runEngine({
        data: {
          password: pw,
          targetLooks,
          maxBrandsPerSlot,
          retailersPerBrand,
          resultsPerSearch,
          persist,
        },
      }),
    onSuccess: (r) => setResult(r),
  });

  if (!authed) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-semibold mb-4">v3 Stylist Engine — Admin</h1>
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

  const isRunning = mutation.isPending;

  return (
    <main className="mx-auto max-w-6xl p-8 space-y-8">
      <header className="space-y-2">
        <p className="uppercase tracking-widest text-xs text-stone-500">
          v3 Luxury Stylist Engine · Slot-aware Dry Run
        </p>
        <h1 className="text-3xl font-serif">Portofino · Yacht Day</h1>
        <p className="text-stone-600 max-w-2xl">
          Sources by outfit slot — swim, coverup, shoes, bag, sunglasses, jewelry, hat — each
          with its own brand subset, query templates, and candidate quota. Refuses to call
          Gemini if any required slot has zero candidates. Persists complete looks only.
        </p>
        <p className="text-xs text-stone-500 max-w-2xl">
          Retailers / brand is a <strong>floor</strong>. Each slot has an
          intrinsic override (swim 4 · coverup 5 · shoes 7 · bag 7 · sunglasses 9 ·
          jewelry 9 · hat 7) — accessory slots search broader because their
          inventory is fragmented across more retailers.
        </p>
      </header>

      <section className="border rounded-lg p-5 bg-stone-50 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <Field label="Target looks" value={targetLooks} set={setTargetLooks} min={3} max={12} />
          <Field label="Brands per slot" value={maxBrandsPerSlot} set={setMaxBrandsPerSlot} min={2} max={20} />
          <Field
            label="Retailers / brand (floor)"
            value={retailersPerBrand}
            set={setRetailersPerBrand}
            min={1}
            max={12}
          />
          <Field label="Results / search" value={resultsPerSearch} set={setResultsPerSearch} min={1} max={10} />
          <label className="flex flex-col">
            <span className="text-stone-500 text-xs mb-1">Persist as draft</span>
            <input
              type="checkbox"
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
              className="h-5 w-5"
            />
          </label>
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={isRunning}
          className="bg-black text-white px-6 py-2.5 rounded disabled:opacity-50"
        >
          {isRunning ? "Generating collection…" : "Generate Yacht Day collection"}
        </button>
        {mutation.isError && (
          <p className="text-red-600 text-sm">
            Error: {(mutation.error as Error)?.message ?? "unknown"}
          </p>
        )}
      </section>

      {result && result.ok && (
        <>
          <RegistryCoverage result={result} />
          <SlotCoverage result={result} />
          <ExpansionReport result={result} />
          {result.gated ? (
            <section className="border border-red-300 bg-red-50 rounded p-5 text-red-900 space-y-1">
              <p className="font-medium">Insufficient candidates for complete look generation.</p>
              <p className="text-sm">{result.assemblyError}</p>
              <p className="text-xs text-red-700">
                Gemini was not called. Fix the registry tags (or the slot's query templates) and re-run.
              </p>
            </section>
          ) : (
            <>
              <EngineVisualBoard result={result} />
              <CollectionReport result={result} />
              <SlotEffectivenessReport result={result} />
              <LooksGrid result={result} />
            </>
          )}
        </>
      )}
      {result && !result.ok && (
        <section className="border border-red-300 bg-red-50 rounded p-4 text-red-800">
          <p className="font-medium">Engine failed at {result.stage}</p>
          <p className="text-sm">{result.error}</p>
        </section>
      )}
    </main>
  );
}

function Field(props: {
  label: string;
  value: number;
  set: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="flex flex-col">
      <span className="text-stone-500 text-xs mb-1">{props.label}</span>
      <input
        type="number"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.set(Number(e.target.value))}
        className="border rounded px-2 py-1.5"
      />
    </label>
  );
}

function SlotCoverage({ result }: { result: Extract<RunResult, { ok: true }> }) {
  const tel = result.discoveryTelemetry;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-serif">Slot coverage (before assembly)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-stone-100 text-left">
            <tr>
              <th className="px-3 py-2">Slot</th>
              <th className="px-3 py-2">Required</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Found</th>
              <th className="px-3 py-2">Brands</th>
              <th className="px-3 py-2">Searches</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.slotCoverage.map((s) => (
              <tr key={s.slot} className="border-t">
                <td className="px-3 py-2 font-medium">{s.label}</td>
                <td className="px-3 py-2">{s.required ? "yes" : "optional"}</td>
                <td className="px-3 py-2">{s.target}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      s.found === 0 && s.required
                        ? "text-red-700 font-medium"
                        : s.found < (s.shortfall + s.found)
                        ? "text-amber-700"
                        : "text-emerald-700"
                    }
                  >
                    {s.found}
                  </span>
                  <span className="text-[10px] text-stone-500 ml-1">
                    ({s.coreFound} core
                    {s.expansionFound > 0 ? ` · ${s.expansionFound} exp` : ""})
                  </span>
                </td>
                <td className="px-3 py-2">{s.brandsSearched}</td>
                <td className="px-3 py-2">{s.searchesIssued}</td>
                <td className="px-3 py-2">
                  {s.covered ? (
                    <span className="text-emerald-700">covered</span>
                  ) : s.found === 0 ? (
                    <span className="text-red-700">empty</span>
                  ) : (
                    <span className="text-amber-700">short by {s.shortfall}</span>
                  )}
                  {s.expansion?.triggered && (
                    <span className="ml-2 text-[10px] uppercase tracking-widest bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                      expansion
                    </span>
                  )}
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {s.retailersPerBrand}/brand · {s.retailersQueried.length} retailers
                    searched · {s.retailersRepresented.length} represented
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="Total searches" value={tel.searchesIssued} />
        <Stat label="Raw results" value={tel.rawResults} />
        <Stat label="Total candidates" value={tel.totalCandidates} />
        <Stat label="~Firecrawl credits" value={tel.approxFirecrawlCredits} />
        <Stat label="Expansion searches" value={tel.expansion?.searchesIssued ?? 0} />
        <Stat label="Expansion accepted" value={tel.expansion?.candidatesAccepted ?? 0} />
        <Stat
          label="Slots expanded"
          value={tel.expansion?.slotsExpanded?.join(", ") || "none"}
        />
      </div>
      {Object.keys(tel.rejectionsByReason).length > 0 && (
        <details className="text-xs text-stone-600">
          <summary className="cursor-pointer">Rejections by reason</summary>
          <ul className="mt-1">
            {Object.entries(tel.rejectionsByReason)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <li key={k}>
                  {k}: {v}
                </li>
              ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function CollectionReport({
  result,
}: {
  result: Extract<RunResult, { ok: true; gated: false }>;
}) {
  const cs = result.collectionScore;
  if (!cs) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-serif">Collection report</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="Looks total" value={cs.looksTotal} />
        <Stat label="Complete looks" value={cs.looksComplete} />
        <Stat label="Incomplete (discarded)" value={cs.looksIncomplete} />
        <Stat label="Filled slots" value={cs.slotCount} />
        <Stat label="Brand diversity" value={cs.brandDiversity} />
        <Stat label="Retailer diversity" value={cs.retailerDiversity} />
        <Stat label="Silhouette diversity" value={cs.silhouetteDiversity} />
        <Stat label="Palette diversity" value={cs.paletteDiversity} />
      </div>
      {result.collectionId && (
        <p className="text-xs text-stone-500">
          Persisted as draft collection <code>{result.collectionId}</code>
        </p>
      )}
      {result.assemblyError && (
        <p className="text-sm text-amber-700">Assembly warning: {result.assemblyError}</p>
      )}
      {result.persistError && (
        <p className="text-sm text-red-700">Persist error: {result.persistError}</p>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border rounded p-3 bg-white">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
}

function RegistryCoverage({ result }: { result: Extract<RunResult, { ok: true }> }) {
  const rc = result.registryCoverage ?? [];
  if (!rc.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-serif">Brands I Love · accessory coverage</h2>
      <p className="text-sm text-stone-600 max-w-2xl">
        Tier-1 registry depth per accessory slot (Yacht Day–tagged brands).
        Slots flagged below have a thin core pool — Tier-2 controlled accessory
        expansion will activate automatically if discovery falls short.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        {rc.map((c) => (
          <div
            key={c.slot}
            className={`border rounded p-3 ${c.weak ? "bg-amber-50 border-amber-300" : "bg-white"}`}
          >
            <p className="text-xs uppercase tracking-widest text-stone-500">{c.slot}</p>
            <p className="text-2xl font-medium">
              {c.brandCount}
              {c.weak && <span className="text-amber-700 text-xs ml-1">⚠ weak</span>}
            </p>
            <p className="text-[11px] text-stone-500">
              Expansion pool: {c.expansionPoolSize} luxury brands
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExpansionReport({ result }: { result: Extract<RunResult, { ok: true }> }) {
  const expanded = result.slotCoverage.filter((s) => s.expansion?.triggered);
  if (expanded.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-serif">Tier-2 Accessory Expansion · activated</h2>
      <p className="text-sm text-stone-600 max-w-2xl">
        Core Brands I Love returned fewer candidates than required for these
        slots. Discovery temporarily expanded into a curated luxury pool on
        approved retailers. Candidates are <strong>not</strong> auto-promoted —
        Founder approval is required.
      </p>
      <div className="space-y-3">
        {expanded.map((s) => (
          <div key={s.slot} className="border rounded p-4 bg-indigo-50/40 border-indigo-200">
            <div className="flex justify-between items-baseline">
              <p className="font-medium">
                {s.label}
                <span className="text-xs text-stone-600 ml-2">
                  ({s.coreFound} core + {s.expansionFound} expansion ·
                  target {s.target})
                </span>
              </p>
              <span className="text-[10px] uppercase tracking-widest text-indigo-800">
                {s.expansion?.reason}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Expansion brands searched: {s.expansion?.brandsConsidered.join(", ") || "—"}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              Searches issued: {s.expansion?.searchesIssued ?? 0} · accepted:{" "}
              {s.expansion?.accepted ?? 0}
            </p>
          </div>
        ))}
        <p className="text-xs text-stone-500 italic">
          When the Founder repeatedly approves a brand surfaced here, the engine
          will recommend promoting it to Brands I Love. Promotion is never
          automatic.
        </p>
      </div>
    </section>
  );
}

function LooksGrid({ result }: { result: Extract<RunResult, { ok: true; gated: false }> }) {
  void 0;
  return _OriginalLooksGrid({ result });
}
function _OriginalLooksGrid({ result }: { result: Extract<RunResult, { ok: true; gated: false }> }) {
  if (result.looks.length === 0) {
    return (
      <section className="border rounded p-6 text-stone-600">
        Engine returned 0 looks. Check the assembly warning above.
      </section>
    );
  }
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-serif">The collection</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {result.looks.map((look, i) => {
          const score = result.lookScores[i];
          return (
            <article
              key={i}
              className={`border rounded-lg p-5 space-y-3 ${
                look.complete ? "bg-white" : "bg-amber-50 border-amber-300"
              }`}
            >
              <header className="flex justify-between items-start">
                <div>
                  <p className="uppercase tracking-widest text-xs text-stone-500">
                    Look {i + 1}
                  </p>
                  <h3 className="text-xl font-serif">{look.title}</h3>
                  {look.subtitle && (
                    <p className="text-sm italic text-stone-600">{look.subtitle}</p>
                  )}
                </div>
                {!look.complete && (
                  <span className="text-[10px] uppercase tracking-widest bg-amber-200 text-amber-900 px-2 py-1 rounded">
                    Incomplete · not persisted
                  </span>
                )}
              </header>
              <p className="text-sm text-stone-700">{look.description}</p>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {look.styleDna.map((d) => (
                  <span key={d} className="bg-stone-100 px-1.5 py-0.5 rounded">
                    {d}
                  </span>
                ))}
                {look.palette.map((p) => (
                  <span key={p} className="bg-amber-100 px-1.5 py-0.5 rounded">
                    {p}
                  </span>
                ))}
              </div>
              <ul className="divide-y text-sm">
                {look.slots.map((s, j) => (
                  <li key={j} className="py-2 flex justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-widest text-stone-500">
                        {s.slot}
                      </p>
                      <p className="font-medium truncate">
                        {s.brand}
                        {s.source === "expansion" ? (
                          <span className="ml-2 text-[9px] uppercase tracking-widest bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded align-middle">
                            Accessory Discovery
                          </span>
                        ) : (
                          <span className="ml-2 text-[9px] uppercase tracking-widest bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded align-middle">
                            Core Brand
                          </span>
                        )}
                      </p>
                      <p className="text-stone-600 truncate">{s.title}</p>
                      {s.reasoning && (
                        <p className="text-xs text-stone-500 italic">{s.reasoning}</p>
                      )}
                    </div>
                    <div className="text-right text-xs">
                      <p>{s.retailer}</p>
                      <a
                        href={s.url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        open
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
              {score && (
                <p className="text-xs text-stone-500">
                  Completeness {score.completeness} · Editorial {score.editorial}
                  {score.missing.length > 0 && (
                    <span className="text-amber-700">
                      {" "}
                      · Missing: {score.missing.join(", ")}
                    </span>
                  )}
                </p>
              )}
              {look.reasoning && (
                <p className="text-xs text-stone-500 italic">Why this look: {look.reasoning}</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SlotEffectivenessReport({
  result,
}: {
  result: Extract<RunResult, { ok: true }>;
}) {
  const rows = result.slotEffectiveness ?? [];
  if (!rows.length) return null;
  const tone = (c: string) =>
    c === "strong"
      ? "bg-emerald-100 text-emerald-800"
      : c === "adequate"
        ? "bg-amber-100 text-amber-900"
        : "bg-red-100 text-red-800";
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-serif">Slot effectiveness</h2>
      <p className="text-sm text-stone-600 max-w-2xl">
        Per-slot read of how well discovery served assembly. A slot is{" "}
        <strong>weak</strong> if it fell short of its target, or if accepted
        candidates cluster on a single brand/retailer (no real choice for the
        stylist).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border">
          <thead className="bg-stone-100 text-left">
            <tr>
              <th className="px-2 py-2">Slot</th>
              <th className="px-2 py-2">Core brands</th>
              <th className="px-2 py-2">Expansion</th>
              <th className="px-2 py-2">Retailers searched</th>
              <th className="px-2 py-2">Found / Accepted / Rejected</th>
              <th className="px-2 py-2">Final used</th>
              <th className="px-2 py-2">Brand div.</th>
              <th className="px-2 py-2">Retailer div.</th>
              <th className="px-2 py-2">Coverage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slot} className="border-t align-top">
                <td className="px-2 py-2 font-medium">
                  {r.label}
                  {!r.required && (
                    <span className="ml-1 text-[10px] text-stone-500">(opt)</span>
                  )}
                </td>
                <td className="px-2 py-2">{r.coreBrandsSearched}</td>
                <td className="px-2 py-2">
                  {r.expansionActivated ? (
                    <span className="text-indigo-800">
                      yes ({r.expansionBrandsSearched})
                    </span>
                  ) : r.expansionEligible ? (
                    <span className="text-stone-500">no</span>
                  ) : (
                    <span className="text-stone-400">n/a</span>
                  )}
                </td>
                <td className="px-2 py-2">
                  {r.retailersSearched}
                  <span className="text-stone-500">
                    {" "}
                    · {r.retailersRepresentedCount} repr.
                  </span>
                  <div className="text-[10px] text-stone-500">
                    {r.retailersPerBrand}/brand cap
                  </div>
                </td>
                <td className="px-2 py-2">
                  {r.candidatesFound} / {r.candidatesAccepted} / {r.candidatesRejected}
                  <div className="text-[10px] text-stone-500">
                    accept rate {Math.round(r.acceptanceRate * 100)}%
                  </div>
                </td>
                <td className="px-2 py-2">{r.finalProductsUsed}</td>
                <td className="px-2 py-2">
                  {r.brandDiversity}
                  <span className="text-stone-500"> / {r.finalBrandDiversity} final</span>
                </td>
                <td className="px-2 py-2">
                  {r.retailerDiversity}
                  <span className="text-stone-500">
                    {" "}
                    / {r.finalRetailerDiversity} final
                  </span>
                </td>
                <td className="px-2 py-2">
                  <span
                    className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded ${tone(r.coverage)}`}
                  >
                    {r.coverage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-500 italic">
        Strong = required slot covered with ≥4 brands and ≥3 retailers. Adequate
        = covered but thin diversity. Weak = shortfall, single-brand, or no
        slot fills in complete looks — re-run with broader retailer depth or
        promote expansion brands.
      </p>
    </section>
  );
}
