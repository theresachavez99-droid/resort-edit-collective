import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import { generateYachtDayCollection } from "@/lib/stylist-engine.functions";

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
  const [maxBrands, setMaxBrands] = useState(14);
  const [maxCandidates, setMaxCandidates] = useState(40);
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
        data: { password: pw, targetLooks, maxBrands, maxCandidates, persist },
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
          v3 Luxury Stylist Engine · Dry Run
        </p>
        <h1 className="text-3xl font-serif">Portofino · Yacht Day</h1>
        <p className="text-stone-600 max-w-2xl">
          Single engine, collection-first. Generates 5–10 complete editorial looks across the
          Yacht Day outfit ecosystem. No publishing, no live-site writes. Persists as a draft
          collection for Founder Review.
        </p>
      </header>

      <section className="border rounded-lg p-5 bg-stone-50 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Field label="Target looks" value={targetLooks} set={setTargetLooks} min={3} max={12} />
          <Field label="Max brands" value={maxBrands} set={setMaxBrands} min={3} max={30} />
          <Field label="Max candidates" value={maxCandidates} set={setMaxCandidates} min={10} max={80} />
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
          <CollectionReport result={result} />
          <LooksGrid result={result} />
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

function CollectionReport({ result }: { result: Extract<RunResult, { ok: true }> }) {
  const cs = result.collectionScore;
  const tel = result.discovery.telemetry;
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-serif">Collection report</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="Looks generated" value={cs.looksCount} />
        <Stat label="Filled slots" value={cs.slotCount} />
        <Stat label="Brand diversity" value={cs.brandDiversity} />
        <Stat label="Retailer diversity" value={cs.retailerDiversity} />
        <Stat label="Silhouette diversity" value={cs.silhouetteDiversity} />
        <Stat label="Palette diversity" value={cs.paletteDiversity} />
        <Stat label="Max brand share" value={cs.maxBrandShare} />
        <Stat label="Max retailer share" value={cs.maxRetailerShare} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="Discovery searches" value={tel.searchesIssued} />
        <Stat label="Discovery candidates" value={tel.candidatesAfterFilters} />
        <Stat label="Brand match rate" value={tel.brandMatchRate} />
        <Stat label="Avg editorial score" value={tel.avgEditorialScore} />
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
      <div className="grid md:grid-cols-2 gap-4 text-xs">
        <div className="border rounded p-3">
          <p className="font-medium mb-1">Brand distribution</p>
          <ul>
            {Object.entries(cs.brandDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([b, n]) => (
                <li key={b}>
                  {b}: {n}
                </li>
              ))}
          </ul>
        </div>
        <div className="border rounded p-3">
          <p className="font-medium mb-1">Retailer distribution</p>
          <ul>
            {Object.entries(cs.retailerDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([r, n]) => (
                <li key={r}>
                  {r}: {n}
                </li>
              ))}
          </ul>
        </div>
      </div>
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

function LooksGrid({ result }: { result: Extract<RunResult, { ok: true }> }) {
  if (result.looks.length === 0) {
    return (
      <section className="border rounded p-6 text-stone-600">
        Engine returned 0 complete looks. The candidate pool may be too thin or missing required slots.
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
            <article key={i} className="border rounded-lg p-5 bg-white space-y-3">
              <header>
                <p className="uppercase tracking-widest text-xs text-stone-500">
                  Look {i + 1}
                </p>
                <h3 className="text-xl font-serif">{look.title}</h3>
                {look.subtitle && (
                  <p className="text-sm italic text-stone-600">{look.subtitle}</p>
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
                  <span key={p} className="bg-amber-50 px-1.5 py-0.5 rounded">
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
                      <p className="font-medium truncate">{s.brand}</p>
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