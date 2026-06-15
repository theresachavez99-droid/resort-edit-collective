import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import { runYachtDayDryRun } from "@/lib/yacht-day-pilot.functions";

export const Route = createFileRoute("/admin/yacht-day-pilot")({
  head: () => ({
    meta: [
      { title: "Yacht Day Pilot — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: YachtDayPilotPage,
});

const STORAGE_KEY = "admin_yacht_pilot_pw";

type DryRunResult = Awaited<ReturnType<typeof runYachtDayDryRun>>;

function YachtDayPilotPage() {
  const verify = useServerFn(verifyAdmin);
  const runDryRun = useServerFn(runYachtDayDryRun);

  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [result, setResult] = useState<DryRunResult | null>(null);
  const [maxBrands, setMaxBrands] = useState(12);
  const [retailersPerBrand, setRetailersPerBrand] = useState(3);
  const [resultsPerSearch, setResultsPerSearch] = useState(4);
  const [maxCandidates, setMaxCandidates] = useState(30);

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
      } else {
        setAuthError("Wrong password");
      }
    } catch {
      setAuthError("Auth error");
    }
  };

  const mutation = useMutation({
    mutationFn: () =>
      runDryRun({
        data: {
          password: pw,
          maxBrands,
          retailersPerBrand,
          resultsPerSearch,
          maxCandidates,
        },
      }),
    onSuccess: (r) => setResult(r),
  });

  if (!authed) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="font-serif text-2xl mb-4">Yacht Day Pilot — Admin</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Admin password"
            className="w-full border px-3 py-2 rounded"
          />
          <button type="submit" className="w-full bg-black text-white py-2 rounded">
            Enter
          </button>
          {authError && <p className="text-sm text-red-600">{authError}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl">Yacht Day Pilot — Dry Run</h1>
        <p className="text-sm text-muted-foreground">
          Discover candidate URLs via Firecrawl <code>/search</code> across approved swim brands × approved
          retailers. <strong>No PDP scrapes. No DB writes.</strong> Nothing is approved or published.
          Review distribution before committing to a real sourcing run.
        </p>
      </header>

      <section className="border rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/30">
        <label className="text-sm space-y-1">
          <span className="block text-muted-foreground">Max brands</span>
          <input
            type="number"
            min={1}
            max={30}
            value={maxBrands}
            onChange={(e) => setMaxBrands(Number(e.target.value))}
            className="w-full border px-2 py-1 rounded"
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="block text-muted-foreground">Retailers / brand</span>
          <input
            type="number"
            min={1}
            max={8}
            value={retailersPerBrand}
            onChange={(e) => setRetailersPerBrand(Number(e.target.value))}
            className="w-full border px-2 py-1 rounded"
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="block text-muted-foreground">Results / search</span>
          <input
            type="number"
            min={1}
            max={10}
            value={resultsPerSearch}
            onChange={(e) => setResultsPerSearch(Number(e.target.value))}
            className="w-full border px-2 py-1 rounded"
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="block text-muted-foreground">Max candidates</span>
          <input
            type="number"
            min={5}
            max={60}
            value={maxCandidates}
            onChange={(e) => setMaxCandidates(Number(e.target.value))}
            className="w-full border px-2 py-1 rounded"
          />
        </label>
        <div className="md:col-span-4 text-xs text-muted-foreground">
          Approx Firecrawl spend ≤ {maxBrands * retailersPerBrand} search credits.
        </div>
      </section>

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="bg-black text-white px-5 py-2 rounded disabled:opacity-50"
      >
        {mutation.isPending ? "Running…" : "Run dry-run"}
      </button>

      {mutation.error && (
        <p className="text-sm text-red-600">Run failed: {String(mutation.error)}</p>
      )}

      {result && !result.ok && (
        <p className="text-sm text-red-600">Server error: {result.error}</p>
      )}

      {result?.ok && <DryRunReport result={result} />}
    </main>
  );
}

function DryRunReport({ result }: { result: Extract<DryRunResult, { ok: true }> }) {
  const t = result.telemetry;
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Searches issued" value={t.searchesIssued} />
        <Stat label="Searches failed" value={t.searchesFailed} />
        <Stat label="Raw results" value={t.rawResultsSeen} />
        <Stat label="Candidates (PDP, approved retailer)" value={t.candidatesAfterFilters} />
        <Stat label="Already cached" value={t.cachedCandidates} />
        <Stat label="PDP scrapes performed" value={t.scrapesPerformed} highlight />
        <Stat label="DB writes" value={t.dbWrites} highlight />
        <Stat label="≈ Firecrawl credits used" value={t.approxFirecrawlCreditsUsed} />
      </section>

      <section>
        <h2 className="font-serif text-xl mb-2">Brand distribution</h2>
        <Histogram data={result.brandHistogram} max={Math.max(1, ...Object.values(result.brandHistogram))} />
        {Object.keys(result.brandHistogram).length === 0 && (
          <p className="text-sm text-muted-foreground">No candidates discovered yet.</p>
        )}
      </section>

      <section>
        <h2 className="font-serif text-xl mb-2">Retailer distribution</h2>
        <Histogram
          data={result.retailerHistogram}
          max={Math.max(1, ...Object.values(result.retailerHistogram))}
        />
      </section>

      <section>
        <h2 className="font-serif text-xl mb-2">Brands considered ({result.brandsConsidered.length})</h2>
        <div className="text-xs text-muted-foreground mb-2">
          Resort Edit scoring not run — no PDPs were scraped in this dry-run. Scores will populate when the live
          sourcing run hits each candidate's PDP.
        </div>
        <ul className="text-sm grid grid-cols-2 md:grid-cols-3 gap-1">
          {result.brandsConsidered.map((b) => (
            <li key={b.slug} className="flex justify-between border-b py-1">
              <span>
                {b.name} <span className="text-xs text-muted-foreground">({b.tier})</span>
              </span>
              <span className="tabular-nums">{b.foundCount}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-2">Top candidates ({result.candidates.length})</h2>
        <ol className="space-y-2">
          {result.candidates.map((c, i) => (
            <li key={c.url} className="border rounded p-3 text-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">#{i + 1}</span>
                <span className="font-medium">{c.brand}</span>
                <span className="text-xs text-muted-foreground">· {c.retailer}</span>
                {c.alreadyCached && (
                  <span className="text-xs bg-yellow-100 px-1 rounded">already cached</span>
                )}
              </div>
              {c.title && <div className="mt-1">{c.title}</div>}
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 break-all"
              >
                {c.url}
              </a>
              {c.description && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {result.errors.length > 0 && (
        <section>
          <h2 className="font-serif text-xl mb-2">Errors ({result.errors.length})</h2>
          <ul className="text-xs text-red-600 space-y-1">
            {result.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`border rounded p-3 ${highlight ? "bg-green-50" : ""}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl tabular-nums">{value}</div>
    </div>
  );
}

function Histogram({ data, max }: { data: Record<string, number>; max: number }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-1">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-2 text-sm">
          <div className="w-40 truncate">{k}</div>
          <div className="flex-1 bg-muted h-4 rounded overflow-hidden">
            <div className="bg-black h-full" style={{ width: `${(v / max) * 100}%` }} />
          </div>
          <div className="w-8 text-right tabular-nums">{v}</div>
        </div>
      ))}
    </div>
  );
}
