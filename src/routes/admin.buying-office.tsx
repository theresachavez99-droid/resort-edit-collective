import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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

const TARGET_CANDIDATES = 30;
const APPROVED_HOSTS = [
  "revolve.com","mytheresa.com","net-a-porter.com","shopbop.com","fwrd.com",
  "nordstrom.com","saksfifthavenue.com","neimanmarcus.com","bloomingdales.com",
  "luisaviaroma.com",
];

/* =========================================================================
   Shell
   ========================================================================= */

function BuyingOffice() {
  const password =
    typeof window !== "undefined" ? (sessionStorage.getItem(PW_KEY) ?? "") : "";
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const listFn = useServerFn(listBuyingSessions);
  const sessionsQ = useQuery({
    queryKey: ["bo-sessions"],
    queryFn: () => listFn({ data: { password } }),
    enabled: !!password,
  });

  if (!password) {
    return (
      <main className="mx-auto max-w-xl p-10 text-sm">
        Open <code>/admin</code> first to unlock the founder workspace.
      </main>
    );
  }

  const sessions = sessionsQ.data?.sessions ?? [];
  const hasAny = sessions.length > 0;

  // Empty state
  if (!activeId && !creating && !hasAny && sessionsQ.isFetched) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="text-center space-y-6">
          <p className="text-[0.65rem] tracking-[0.4em] uppercase text-stone-500">
            Founder Buying Office
          </p>
          <h1 className="font-serif text-4xl">Welcome to the Founder Buying Office</h1>
          <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Build your first Founder Hero by reviewing live luxury products from across
            the world's best retailers.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="bg-ink text-ivory px-8 py-3 text-[0.7rem] tracking-[0.3em] uppercase"
          >
            Create Buying Review
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-12">
      <PageHeader onNew={() => { setActiveId(null); setCreating(true); }} />

      {creating && (
        <NewSessionWizard
          password={password}
          onCancel={() => setCreating(false)}
          onCreated={(id) => { setCreating(false); setActiveId(id); }}
        />
      )}

      {activeId && !creating && (
        <SessionWorkspace
          password={password}
          sessionId={activeId}
          onExit={() => setActiveId(null)}
          onNew={() => { setActiveId(null); setCreating(true); }}
        />
      )}

      {!activeId && !creating && hasAny && (
        <ActiveSessionPicker
          sessions={sessions}
          onSelect={setActiveId}
        />
      )}

      <CollapsibleSection title="Search Session History" defaultOpen={false}>
        <SessionHistoryList
          sessions={sessions}
          activeId={activeId}
          onSelect={(id) => { setCreating(false); setActiveId(id); }}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Advanced · Affiliate Provider Status" defaultOpen={false}>
        <AffiliatePanel password={password} />
      </CollapsibleSection>
    </main>
  );
}

function PageHeader({ onNew }: { onNew: () => void }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-stone-200 pb-6">
      <div className="space-y-2">
        <p className="text-[0.65rem] tracking-[0.4em] uppercase text-stone-500">
          Founder Workspace
        </p>
        <h1 className="font-serif text-3xl">Founder Buying Office</h1>
        <p className="text-xs text-stone-500 max-w-xl">
          Build Founder Heroes by reviewing live luxury products. Begin by creating a
          Buying Review.
        </p>
      </div>
      <button
        onClick={onNew}
        className="bg-ink text-ivory px-6 py-3 text-[0.7rem] tracking-[0.3em] uppercase"
      >
        + New Buying Review
      </button>
    </header>
  );
}

/* =========================================================================
   Wizard — Step 1 (setup) → Step 2 (brief) → Step 3 (import)
   ========================================================================= */

function NewSessionWizard({
  password,
  onCreated,
  onCancel,
}: {
  password: string;
  onCreated: (id: string) => void;
  onCancel: () => void;
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
    <section className="border border-stone-300 p-8 space-y-6 bg-stone-50/50">
      <WizardStepHeader step={1} of={3} label="Set the brief" />
      <h2 className="font-serif text-2xl">New Buying Review</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <LabeledInput label="Destination" value={destination} onChange={setDestination} />
        <LabeledInput label="Moment" value={moment} onChange={setMoment} />
        <Labeled label="Founder Look (optional)">
          <select
            className="border border-stone-300 px-3 py-2 text-sm w-full bg-white"
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
          <p className="text-[0.65rem] text-stone-500 mt-1">
            Linking a Founder Look sharpens benchmark similarity scoring against
            approved hero pieces.
          </p>
        </Labeled>
        <Labeled label="Notes (optional)">
          <input
            className="border border-stone-300 px-3 py-2 text-sm w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What are we building this session?"
          />
        </Labeled>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => create.mutate()}
          disabled={create.isPending || !destination || !moment}
          className="bg-ink text-ivory px-6 py-3 text-[0.7rem] tracking-[0.3em] uppercase disabled:opacity-40"
        >
          {create.isPending ? "Creating…" : "Continue → Lock Hero Brief"}
        </button>
        <button
          onClick={onCancel}
          className="border border-stone-300 px-4 py-3 text-[0.7rem] tracking-[0.3em] uppercase"
        >
          Cancel
        </button>
      </div>
      {create.error && (
        <p className="text-xs text-red-600">{(create.error as Error).message}</p>
      )}
    </section>
  );
}

function WizardStepHeader({ step, of, label }: { step: number; of: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: of }).map((_, i) => (
        <div
          key={i}
          className={
            "h-1 w-12 " + (i + 1 <= step ? "bg-ink" : "bg-stone-200")
          }
        />
      ))}
      <span className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500">
        Step {step} of {of} · {label}
      </span>
    </div>
  );
}

/* =========================================================================
   Session Workspace — orchestrates the progressive stages
   ========================================================================= */

function SessionWorkspace({
  password,
  sessionId,
  onExit,
  onNew,
}: {
  password: string;
  sessionId: string;
  onExit: () => void;
  onNew: () => void;
}) {
  const getFn = useServerFn(getBuyingSession);
  const looksFn = useServerFn(listFounderLooks);
  const key = ["bo-session", sessionId];

  const q = useQuery({
    queryKey: key,
    queryFn: () => getFn({ data: { password, id: sessionId } }),
  });
  const looksQ = useQuery({
    queryKey: ["bo-founder-looks"],
    queryFn: () => looksFn({ data: { password } }),
  });

  if (q.isLoading) {
    return <p className="text-xs text-stone-500">Loading session…</p>;
  }
  if (!q.data) return null;

  const session = q.data.session as any;
  const candidates = (q.data.candidates ?? []) as any[];
  const heroBrief = q.data.heroBrief;
  const diag = (session.source_diagnostics ?? {}) as Record<string, any>;
  const briefLocked = !!diag.brief_locked;
  const looks = looksQ.data?.ok ? looksQ.data.looks : [];
  const linkedLook = looks.find((l: any) => l.id === session.founder_look_id);

  const hero = candidates.find((c) => c.status === "founder_hero");
  const finalists = candidates.filter((c) => c.status === "finalist");
  const hasCandidates = candidates.length > 0;

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="space-y-10 min-w-0">
        <SessionHeader session={session} onExit={onExit} />

        {/* Stage A: Brief (editable until locked) */}
        <BriefPanel
        password={password}
        session={session}
        diag={diag}
        heroBrief={heroBrief}
        linkedLook={linkedLook}
        invalidateKey={key}
      />

        {/* Stage B: Import (only once brief is locked) */}
        {briefLocked && (
        <ImportPanel
          password={password}
          sessionId={sessionId}
          invalidateKey={key}
          hasCandidates={hasCandidates}
          candidateCount={candidates.length}
        />
        )}

        {/* Stage C: Review (only once candidates exist) */}
        {briefLocked && hasCandidates && (
        <ReviewPanel
          password={password}
          candidates={candidates}
          invalidateKey={key}
        />
        )}

        {/* Stage D: Finalists (only once one is marked) */}
        {briefLocked && (
        <FinalistsPanel
          password={password}
          finalists={finalists}
          invalidateKey={key}
        />
        )}

        {/* Stage E: Hero celebration */}
        {hero && (
        <HeroCelebration
          hero={hero}
          onAnother={onNew}
          onExit={onExit}
        />
        )}

        {/* Always-on collapsed decision log */}
        {hasCandidates && (
        <CollapsibleSection title="Decision Log" defaultOpen={false}>
          <DecisionLog candidates={candidates} session={session} />
        </CollapsibleSection>
        )}
      </div>

      <aside className="hidden lg:block">
        <SessionSummarySidebar session={session} candidates={candidates} />
      </aside>
    </section>
  );
}

function SessionSummarySidebar({
  session, candidates,
}: { session: any; candidates: any[] }) {
  const counts = useMemo(() => {
    const by = (s: string) => candidates.filter((c) => c.status === s).length;
    return {
      imported: candidates.length,
      favorite: by("favorite"),
      later: by("review_later"),
      finalist: by("finalist"),
      rejected: by("rejected"),
      hero: candidates.find((c) => c.status === "founder_hero"),
      inspiration: candidates.filter((c) => c.import_type === "editorial_inspiration").length,
    };
  }, [candidates]);

  return (
    <div className="sticky top-6 border border-stone-200 p-5 space-y-3 bg-white text-xs">
      <p className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500">
        Buying Review
      </p>
      <p className="font-serif text-base leading-tight">
        {session.destination} — {session.moment}
      </p>
      <div className="border-t border-stone-100 pt-3 space-y-1.5">
        <Row label="Imported" value={counts.imported} />
        <Row label="Editorial Inspiration" value={counts.inspiration} muted />
        <Row label="Favorites" value={counts.favorite} />
        <Row label="Later" value={counts.later} />
        <Row label="Finalists" value={counts.finalist} />
        <Row label="Rejected" value={counts.rejected} muted />
      </div>
      <div className="border-t border-stone-100 pt-3">
        <p className="text-[0.55rem] uppercase tracking-[0.24em] text-stone-500">
          Founder Hero
        </p>
        <p className="font-serif text-sm mt-1">
          {counts.hero ? `${counts.hero.brand ?? ""} — ${counts.hero.product_name ?? ""}` : "Not Selected"}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={"flex justify-between " + (muted ? "text-stone-500" : "")}>
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SessionHeader({ session, onExit }: { session: any; onExit: () => void }) {
  return (
    <div className="flex items-start justify-between border-b border-stone-200 pb-4">
      <div>
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500">
          Buying Review · {session.session_code}
        </p>
        <h2 className="font-serif text-2xl mt-1">
          {session.destination} — {session.moment}
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Created {new Date(session.created_at).toLocaleString()}
        </p>
      </div>
      <button
        onClick={onExit}
        className="text-[0.65rem] tracking-[0.24em] uppercase underline text-stone-500"
      >
        ← All Reviews
      </button>
    </div>
  );
}

/* =========================================================================
   Brief panel
   ========================================================================= */

function BriefPanel({
  password,
  session,
  diag,
  heroBrief,
  linkedLook,
  invalidateKey,
}: {
  password: string;
  session: any;
  diag: Record<string, any>;
  heroBrief: any;
  linkedLook: any;
  invalidateKey: readonly unknown[];
}) {
  const updateFn = useServerFn(updateBuyingSession);
  const qc = useQueryClient();
  const locked = !!diag.brief_locked;

  const [story, setStory] = useState<string>(diag.editorial_story ?? "");
  const [energy, setEnergy] = useState<string>(diag.moment_energy ?? "");
  const [color, setColor] = useState<string>(diag.color_direction ?? "");
  const [benchmark, setBenchmark] = useState<string>(diag.benchmark ?? "");
  const [exclusions, setExclusions] = useState<string>(diag.exclusions ?? "");
  const [strategy, setStrategy] = useState<string>(session.strategy ?? "manual_import");
  const [depth, setDepth] = useState<string>(diag.depth ?? "standard (2-3 pages)");

  const mut = useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      updateFn({ data: { password, id: session.id, patch: patch as never } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey as unknown[] }),
  });

  const lock = () =>
    mut.mutate({
      editorial_story: story,
      moment_energy: energy,
      color_direction: color,
      benchmark,
      exclusions,
      strategy,
      depth,
      brief_locked: true,
      wizard_stage: "import",
    });

  const unlock = () => mut.mutate({ brief_locked: false, wizard_stage: "brief" });

  if (!locked) {
    return (
      <section className="border border-stone-300 p-6 space-y-5 bg-stone-50/50">
        <WizardStepHeader step={2} of={3} label="Lock the Founder Hero Brief" />
        <p className="text-xs text-stone-600">
          The brief is the editorial north star for every product imported into this
          review. Once locked, changes require a new Buying Review.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Labeled label="Editorial Story">
            <textarea rows={3} value={story} onChange={(e) => setStory(e.target.value)}
              className="border border-stone-300 px-3 py-2 text-sm w-full"
              placeholder="The one-line story this moment tells." />
          </Labeled>
          <Labeled label="Moment Energy">
            <textarea rows={3} value={energy} onChange={(e) => setEnergy(e.target.value)}
              className="border border-stone-300 px-3 py-2 text-sm w-full"
              placeholder="Languid, electric, golden hour, etc." />
          </Labeled>
          <Labeled label="Color Direction">
            <input value={color} onChange={(e) => setColor(e.target.value)}
              className="border border-stone-300 px-3 py-2 text-sm w-full"
              placeholder="Butter yellow, capri red, sand, terracotta…" />
          </Labeled>
          <Labeled label="Editorial Benchmark">
            <input value={benchmark} onChange={(e) => setBenchmark(e.target.value)}
              className="border border-stone-300 px-3 py-2 text-sm w-full"
              placeholder="e.g. Alexandra Miro · Pietra Rosa" />
          </Labeled>
          <Labeled label="Editorial Exclusions">
            <textarea rows={2} value={exclusions} onChange={(e) => setExclusions(e.target.value)}
              className="border border-stone-300 px-3 py-2 text-sm w-full"
              placeholder="Logos, sporty silhouettes, scandi minimalism, etc." />
          </Labeled>
          <div className="grid grid-cols-2 gap-3">
            <Labeled label="Search Strategy">
              <select value={strategy} onChange={(e) => setStrategy(e.target.value)}
                className="border border-stone-300 px-3 py-2 text-sm w-full bg-white">
                <option value="manual_import">manual_import</option>
                <option value="category_scrape">category_scrape</option>
                <option value="affiliate_feed">affiliate_feed</option>
                <option value="hybrid">hybrid</option>
              </select>
            </Labeled>
            <Labeled label="Search Depth">
              <select value={depth} onChange={(e) => setDepth(e.target.value)}
                className="border border-stone-300 px-3 py-2 text-sm w-full bg-white">
                <option>shallow (1 page)</option>
                <option>standard (2-3 pages)</option>
                <option>deep (full set)</option>
              </select>
            </Labeled>
          </div>
        </div>

        {heroBrief && (
          <div className="text-[0.7rem] text-stone-500 border-t border-stone-200 pt-3">
            <span className="uppercase tracking-[0.24em] text-[0.6rem]">
              Pulled from Founder Look:
            </span>{" "}
            Brands {(heroBrief.brands ?? []).join(", ") || "—"} · Palette{" "}
            {(heroBrief.paletteInclude ?? []).join(", ") || "—"} · Style{" "}
            {(heroBrief.styleFamily ?? []).join(", ") || "—"}
          </div>
        )}

        <button
          onClick={lock}
          disabled={mut.isPending}
          className="bg-ink text-ivory px-6 py-3 text-[0.7rem] tracking-[0.3em] uppercase disabled:opacity-40"
        >
          {mut.isPending ? "Locking…" : "Lock Brief & Continue → Import"}
        </button>
      </section>
    );
  }

  // Locked summary
  return (
    <section className="border border-ink p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[0.6rem] tracking-[0.3em] uppercase text-ink">
            ✓ Founder Hero Brief Locked
          </span>
        </div>
        <button
          onClick={unlock}
          className="text-[0.6rem] tracking-[0.24em] uppercase underline text-stone-500"
        >
          Unlock (creates audit entry)
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 text-xs text-stone-700">
        <BriefField label="Editorial Story" value={story} />
        <BriefField label="Moment Energy" value={energy} />
        <BriefField label="Color Direction" value={color} />
        <BriefField label="Editorial Benchmark" value={benchmark} />
        <BriefField label="Editorial Exclusions" value={exclusions} />
        <div className="grid grid-cols-2 gap-3">
          <BriefField label="Strategy" value={strategy} />
          <BriefField label="Depth" value={depth} />
        </div>
      </div>
      {linkedLook?.title && (
        <p className="text-[0.7rem] text-stone-500 border-t border-stone-200 pt-2">
          Founder Look: {linkedLook.title}
        </p>
      )}
    </section>
  );
}

function BriefField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.6rem] tracking-[0.24em] uppercase text-stone-500">
        {label}
      </div>
      <div className="mt-1">{value || <span className="text-stone-400">—</span>}</div>
    </div>
  );
}

/* =========================================================================
   Import panel
   ========================================================================= */

function ImportPanel({
  password,
  sessionId,
  invalidateKey,
  hasCandidates,
}: {
  password: string;
  sessionId: string;
  invalidateKey: readonly unknown[];
  hasCandidates: boolean;
}) {
  const importUrls = useServerFn(importUrlsToSession);
  const importRows = useServerFn(importRowsToSession);
  const qc = useQueryClient();

  const [urlText, setUrlText] = useState("");
  const [csvText, setCsvText] = useState("");
  const [lastResult, setLastResult] = useState<{ count: number; brands: string[] } | null>(null);

  const urlMut = useMutation({
    mutationFn: () => {
      const urls = urlText.split(/\s+/).map((u) => u.trim()).filter((u) => /^https?:\/\//i.test(u));
      if (!urls.length) throw new Error("Paste at least one URL");
      return importUrls({ data: { password, sessionId, urls } });
    },
    onSuccess: (r) => {
      setUrlText("");
      setLastResult({ count: r.inserted.length, brands: [] });
      qc.invalidateQueries({ queryKey: invalidateKey as unknown[] });
      requestAnimationFrame(() => {
        document.getElementById("review-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
  });

  const csvMut = useMutation({
    mutationFn: () => {
      const rows = parseCsv(csvText);
      if (!rows.length) throw new Error("No rows parsed");
      return importRows({ data: { password, sessionId, rows } });
    },
    onSuccess: (r) => {
      setCsvText("");
      setLastResult({ count: r.inserted.length, brands: [] });
      qc.invalidateQueries({ queryKey: invalidateKey as unknown[] });
      requestAnimationFrame(() => {
        document.getElementById("review-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
  });

  const onCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  return (
    <section className="space-y-6">
      <WizardStepHeader step={3} of={3} label="Import products" />

      <p className="text-xs text-stone-600 italic border-l-2 border-stone-300 pl-3">
        Build the strongest Buying Review by importing exceptional candidates from
        multiple retailers rather than reviewing one retailer at a time.
      </p>

      {lastResult && (
        <div className="border border-emerald-600 bg-emerald-50/40 px-4 py-3 text-xs text-emerald-800 flex items-center justify-between">
          <span>✓ {lastResult.count} products imported successfully.</span>
          <a href="#review-anchor" className="underline">Review now →</a>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="border border-stone-300 p-5 space-y-3 lg:col-span-1">
          <h3 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Paste Product URLs
          </h3>
          <textarea
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            rows={8}
            className="w-full border border-stone-300 px-3 py-2 text-xs font-mono"
            placeholder={
              "Paste one product URL per line.\n\nSupported retailers include Revolve, Mytheresa, Net-a-Porter, Shopbop, FWRD, Nordstrom, Saks, Neiman Marcus, Bloomingdale's, Luisaviaroma, and brand-direct URLs."
            }
          />
          <button
            onClick={() => urlMut.mutate()}
            disabled={urlMut.isPending}
            className="bg-ink text-ivory px-5 py-2 text-[0.7rem] tracking-[0.3em] uppercase w-full disabled:opacity-40"
          >
            {urlMut.isPending ? "Importing…" : "Import URLs"}
          </button>
          {urlMut.error && (
            <p className="text-xs text-red-600">{(urlMut.error as Error).message}</p>
          )}
        </div>

        <div className="border border-stone-300 p-5 space-y-3 lg:col-span-1">
          <h3 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Upload CSV
          </h3>
          <DropZone onFile={onCsvFile} />
          {csvText && (
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={4}
              className="w-full border border-stone-300 px-3 py-2 text-xs font-mono"
            />
          )}
          <button
            onClick={() => csvMut.mutate()}
            disabled={csvMut.isPending || !csvText}
            className="bg-ink text-ivory px-5 py-2 text-[0.7rem] tracking-[0.3em] uppercase w-full disabled:opacity-40"
          >
            {csvMut.isPending ? "Importing…" : "Import CSV"}
          </button>
          <p className="text-[0.65rem] text-stone-500">
            Columns: product_url, affiliate_url, brand, product_name, retailer, category,
            price, currency, image_url, description, notes.
          </p>
          {csvMut.error && (
            <p className="text-xs text-red-600">{(csvMut.error as Error).message}</p>
          )}
        </div>

        <div className="border border-stone-200 p-5 space-y-2 lg:col-span-1 opacity-60">
          <h3 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Affiliate Feed Search
          </h3>
          <p className="text-xs text-stone-500">
            Coming Soon — pulls curated candidates directly from Rakuten, Awin, Impact,
            CJ, and Skimlinks once network credentials are linked.
          </p>
          <button
            disabled
            className="border border-stone-300 px-5 py-2 text-[0.7rem] tracking-[0.3em] uppercase w-full"
          >
            Disabled
          </button>
        </div>
      </div>

      {!hasCandidates && !lastResult && (
        <p className="text-xs text-stone-500 text-center">
          Import products to begin your Buying Review.
        </p>
      )}
    </section>
  );
}

function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      onClick={() => ref.current?.click()}
      className={
        "border-2 border-dashed p-8 text-center cursor-pointer text-xs " +
        (drag ? "border-ink bg-stone-100" : "border-stone-300 text-stone-500")
      }
    >
      Drop CSV here or click to choose
      <input
        ref={ref}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

/* =========================================================================
   Review panel
   ========================================================================= */

function ReviewPanel({
  password,
  candidates,
  invalidateKey,
}: {
  password: string;
  candidates: any[];
  invalidateKey: readonly unknown[];
}) {
  const [sortKey, setSortKey] = useState<
    "editorial" | "similarity" | "confidence" | "price" | "retailer" | "brand" | "color"
  >("editorial");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRetailer, setFilterRetailer] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAffiliate, setFilterAffiliate] = useState("all");
  const [compareIds, setCompareIds] = useState<Record<string, true>>({});
  const [showCompare, setShowCompare] = useState(false);

  const retailers = uniqVals(candidates, "retailer");
  const brands = uniqVals(candidates, "brand");
  const colors = uniqVals(candidates, "color");
  const cats = uniqVals(candidates, "category");

  const compareList = candidates.filter((c) => compareIds[c.id]).slice(0, 4);

  const sorted = useMemo(() => {
    let list = [...candidates];
    if (filterStatus !== "all") list = list.filter((c) => (c.status ?? "review") === filterStatus);
    if (filterRetailer !== "all") list = list.filter((c) => c.retailer === filterRetailer);
    if (filterBrand !== "all") list = list.filter((c) => c.brand === filterBrand);
    if (filterColor !== "all") list = list.filter((c) => c.color === filterColor);
    if (filterCategory !== "all") list = list.filter((c) => c.category === filterCategory);
    if (filterAffiliate !== "all") list = list.filter((c) => (c.affiliate_status ?? "pending") === filterAffiliate);
    list.sort((a, b) => {
      switch (sortKey) {
        case "price": return (a.price ?? Infinity) - (b.price ?? Infinity);
        case "retailer": return (a.retailer ?? "").localeCompare(b.retailer ?? "");
        case "brand": return (a.brand ?? "").localeCompare(b.brand ?? "");
        case "color": return (a.color ?? "").localeCompare(b.color ?? "");
        case "similarity": return (b.benchmark_similarity ?? 0) - (a.benchmark_similarity ?? 0);
        case "confidence": return (b.editorial_confidence ?? 0) - (a.editorial_confidence ?? 0);
        default: return (b.editorial_score ?? 0) - (a.editorial_score ?? 0);
      }
    });
    return list;
  }, [candidates, sortKey, filterStatus, filterRetailer, filterBrand, filterColor, filterCategory, filterAffiliate]);

  const toggleCompare = (id: string) =>
    setCompareIds((p) => {
      const next = { ...p };
      if (next[id]) delete next[id];
      else if (Object.keys(next).length < 4) next[id] = true;
      return next;
    });

  return (
    <section id="review-anchor" className="space-y-5 scroll-mt-10">
      <div className="flex items-end justify-between border-b border-stone-200 pb-3">
        <div>
          <p className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500">
            Stage · Review
          </p>
          <h3 className="font-serif text-2xl">
            Buying Review · {sorted.length} of {candidates.length}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Move strong candidates to <strong>Finalist</strong>, then promote one to{" "}
            <strong>Founder Hero</strong>.
          </p>
        </div>
        <div className="flex gap-2 text-[0.65rem]">
          <button
            onClick={() => setShowCompare((s) => !s)}
            disabled={compareList.length < 2}
            className="border border-stone-300 px-3 py-2 disabled:opacity-40"
          >
            {showCompare ? "Hide Compare" : `Compare (${compareList.length}/4)`}
          </button>
          {compareList.length > 0 && (
            <button onClick={() => setCompareIds({})} className="border border-stone-300 px-3 py-2">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-[0.7rem]">
        <Selector label="Sort" value={sortKey} onChange={(v) => setSortKey(v as any)}
          options={[
            ["editorial", "Editorial Score"],
            ["similarity", "Benchmark Similarity"],
            ["confidence", "Confidence"],
            ["price", "Price"],
            ["retailer", "Retailer"],
            ["brand", "Brand"],
            ["color", "Color"],
          ]}
        />
        <Selector label="Status" value={filterStatus} onChange={setFilterStatus}
          options={[["all", "All"], ...Object.entries(STATUS_LABEL)]}
        />
        <Selector label="Retailer" value={filterRetailer} onChange={setFilterRetailer}
          options={[["all", "All"], ...retailers.map((r) => [r, r] as [string, string])]}
        />
        <Selector label="Brand" value={filterBrand} onChange={setFilterBrand}
          options={[["all", "All"], ...brands.map((r) => [r, r] as [string, string])]}
        />
        <Selector label="Color" value={filterColor} onChange={setFilterColor}
          options={[["all", "All"], ...colors.map((r) => [r, r] as [string, string])]}
        />
        <Selector label="Category" value={filterCategory} onChange={setFilterCategory}
          options={[["all", "All"], ...cats.map((r) => [r, r] as [string, string])]}
        />
        <Selector label="Affiliate" value={filterAffiliate} onChange={setFilterAffiliate}
          options={[["all", "All"], ["linked", "Linked"], ["pending", "Pending"]]}
        />
      </div>

      {showCompare && compareList.length >= 2 && (
        <CompareWorkspace items={compareList} />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {sorted.map((c) => (
          <EditorialCard
            key={c.id}
            c={c}
            password={password}
            invalidateKey={invalidateKey}
            checked={!!compareIds[c.id]}
            onToggleCompare={() => toggleCompare(c.id)}
          />
        ))}
      </div>
    </section>
  );
}

function uniqVals(list: any[], key: string): string[] {
  return Array.from(new Set(list.map((c) => c[key]).filter(Boolean)));
}

/* =========================================================================
   Editorial candidate card
   ========================================================================= */

function EditorialCard({
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

  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showPromote, setShowPromote] = useState(false);
  const [promoteNotes, setPromoteNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(c.notes ?? "");

  const patch = (p: Record<string, unknown>) =>
    updateFn({ data: { password, id: c.id, patch: p as never } }).then(inv);

  const reasons: string[] = Array.isArray(c.ranking_reasons) ? c.ranking_reasons : [];

  return (
    <article
      className={
        "border bg-white flex flex-col " +
        (checked ? "border-ink ring-1 ring-ink" : "border-stone-200")
      }
    >
      <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
        {c.image_url ? (
          <img src={c.image_url} alt={c.product_name ?? ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-stone-500 px-6 text-center">
            Image missing — add an image URL below
          </div>
        )}
        <label className="absolute top-3 left-3 bg-white/90 border border-stone-300 px-2 py-1 text-[0.65rem] flex items-center gap-1">
          <input type="checkbox" checked={checked} onChange={onToggleCompare} />
          Compare
        </label>
        <span className="absolute top-3 right-3 bg-white/90 border border-stone-300 px-2 py-1 text-[0.65rem]">
          {STATUS_LABEL[c.status] ?? c.status}
        </span>
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            {c.brand ?? "Brand unknown"}
          </p>
          <h4 className="font-serif text-lg mt-0.5 leading-snug">
            {c.product_name ?? "Untitled"}
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            {c.retailer ?? "—"}
            {c.price != null && <> · {c.currency ?? "USD"} {Number(c.price).toLocaleString()}</>}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[0.65rem] text-stone-700">
          <Metric label="Editorial" value={Math.round(c.editorial_score ?? 0)} />
          <Metric label="Similarity" value={Math.round(c.benchmark_similarity ?? 0)} />
          <Metric label="Confidence" value={Math.round(c.editorial_confidence ?? 0)} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[0.65rem]">
          <Pill label="Family" value={c.category ?? "—"} />
          <Pill label="Color" value={c.color ?? "—"} />
          <Pill
            label="Affiliate"
            value={c.affiliate_status === "linked" ? "Linked" : "Pending"}
            tone={c.affiliate_status === "linked" ? "ok" : "warn"}
          />
          <Pill label="Source" value={c.source === "manual_import" ? "Manual" : c.source} />
        </div>

        {reasons.length > 0 && (
          <div className="text-[0.7rem] text-stone-600 border-t border-stone-100 pt-2">
            <div className="uppercase tracking-[0.24em] text-[0.6rem] text-stone-500 mb-1">
              Why this ranked
            </div>
            <ul className="list-disc pl-4 space-y-0.5">
              {reasons.slice(0, 4).map((r, i) => (<li key={i}>{r}</li>))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-stone-100 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-[0.65rem] tracking-[0.2em] uppercase">
            <ActionBtn onClick={() => patch({ status: "favorite" })} label="Favorite" />
            <ActionBtn onClick={() => patch({ status: "review_later" })} label="Later" />
            <ActionBtn onClick={() => patch({ status: "finalist" })} label="Finalist" />
            <ActionBtn onClick={() => setShowReject((s) => !s)} label="Reject" />
            <ActionBtn onClick={() => setShowPromote(true)} label="Promote" tone="primary" />
            <a
              href={c.affiliate_url ?? c.product_url}
              target="_blank" rel="noopener noreferrer"
              className="text-center border border-stone-300 px-2 py-2 hover:bg-stone-100"
            >
              Open
            </a>
          </div>

          {showReject && (
            <div className="flex gap-1">
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why is this rejected? (logo-heavy, off-palette…)"
                className="flex-1 border border-stone-300 px-2 py-1 text-xs"
              />
              <button
                onClick={() =>
                  patch({ status: "rejected", rejection_reason: rejectReason || null })
                    .then(() => setShowReject(false))
                }
                className="border border-stone-300 px-3 py-1 text-xs"
              >
                Save
              </button>
            </div>
          )}

          {showPromote && (
            <PromoteHeroDialog
              candidate={c}
              notes={promoteNotes}
              onChange={setPromoteNotes}
              onCancel={() => setShowPromote(false)}
              onConfirm={() => {
                if (!promoteNotes.trim()) return;
                patch({ status: "founder_hero", notes: promoteNotes }).then(() => {
                  setShowPromote(false);
                  setPromoteNotes("");
                });
              }}
            />
          )}

          <div className="flex flex-wrap gap-3 text-[0.65rem] text-stone-500">
            {!showNotes ? (
              <button onClick={() => setShowNotes(true)} className="underline">
                {c.notes ? "Edit notes" : "Add notes"}
              </button>
            ) : (
              <div className="w-full flex gap-1">
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex-1 border border-stone-300 px-2 py-1 text-xs"
                />
                <button
                  onClick={() => patch({ notes }).then(() => setShowNotes(false))}
                  className="border border-stone-300 px-3 py-1 text-xs"
                >
                  Save
                </button>
              </div>
            )}
            <button
              onClick={() => {
                const u = prompt("Image URL?");
                if (u) patch({ image_url: u });
              }}
              className="underline"
            >
              {c.image_url ? "Replace image" : "Add image"}
            </button>
            <button
              onClick={() => {
                const u = prompt("Affiliate URL?");
                if (u) patch({ affiliate_url: u });
              }}
              className="underline"
            >
              {c.affiliate_url ? "Edit affiliate" : "Add affiliate"}
            </button>
            <button
              onClick={() => {
                if (confirm("Remove this candidate?")) delFn({ data: { password, id: c.id } }).then(inv);
              }}
              className="underline text-red-700 ml-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-stone-200 p-2 text-center">
      <div className="font-serif text-lg leading-none">{value}</div>
      <div className="uppercase tracking-[0.2em] text-[0.55rem] text-stone-500 mt-1">
        {label}
      </div>
    </div>
  );
}

function Pill({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  const cls =
    tone === "ok"
      ? "border-emerald-600 text-emerald-700"
      : tone === "warn"
        ? "border-amber-500 text-amber-700"
        : "border-stone-300 text-stone-600";
  return (
    <div className={"border px-2 py-1 truncate " + cls}>
      <span className="uppercase tracking-[0.2em] text-[0.55rem] mr-1">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ActionBtn({
  label, onClick, tone,
}: { label: string; onClick: () => void; tone?: "primary" }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-2 py-2 " +
        (tone === "primary"
          ? "bg-ink text-ivory"
          : "border border-stone-300 hover:bg-stone-100")
      }
    >
      {label}
    </button>
  );
}

function PromoteHeroDialog({
  candidate, notes, onChange, onConfirm, onCancel,
}: {
  candidate: any;
  notes: string;
  onChange: (s: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-stone-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-6 space-y-4 border border-stone-300">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500">
          Promote Founder Hero
        </p>
        <h4 className="font-serif text-xl">
          {candidate.brand} — {candidate.product_name}
        </h4>
        <p className="text-xs text-stone-600">
          Why is this becoming a Founder Hero? Required.
        </p>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-stone-300 px-3 py-2 text-sm"
          placeholder="The exact silhouette / color / story that earned the hero slot…"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="border border-stone-300 px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!notes.trim()}
            className="bg-ink text-ivory px-4 py-2 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
          >
            Confirm Hero
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Compare workspace
   ========================================================================= */

function CompareWorkspace({ items }: { items: any[] }) {
  const rows: Array<[string, (c: any) => any]> = [
    ["Editorial Score", (c) => Math.round(c.editorial_score ?? 0)],
    ["Benchmark Similarity", (c) => Math.round(c.benchmark_similarity ?? 0)],
    ["Confidence", (c) => Math.round(c.editorial_confidence ?? 0)],
    ["Brand", (c) => c.brand ?? "—"],
    ["Retailer", (c) => c.retailer ?? "—"],
    ["Price", (c) => c.price ? `${c.currency ?? "USD"} ${c.price}` : "—"],
    ["Color Story", (c) => c.color ?? "—"],
    ["Editorial Family", (c) => c.category ?? "—"],
    ["Affiliate", (c) => c.affiliate_status ?? "pending"],
  ];
  return (
    <section className="border border-ink p-5 space-y-4 bg-stone-50/40">
      <h4 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
        Compare · {items.length} pieces
      </h4>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((c) => (
          <div key={c.id} className="space-y-2">
            <div className="aspect-[4/5] bg-stone-100">
              {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
              {c.brand}
            </p>
            <p className="font-serif text-sm leading-tight">{c.product_name}</p>
          </div>
        ))}
      </div>
      <table className="w-full text-xs border-t border-stone-200">
        <tbody>
          {rows.map(([label, fn]) => {
            const values = items.map(fn);
            const distinct = new Set(values.map(String)).size > 1;
            return (
              <tr key={label} className="border-b border-stone-100">
                <td className="py-2 pr-3 uppercase tracking-[0.2em] text-[0.6rem] text-stone-500 w-40">
                  {label}
                </td>
                {values.map((v, i) => (
                  <td
                    key={i}
                    className={"py-2 px-2 " + (distinct ? "font-medium text-ink" : "text-stone-600")}
                  >
                    {v as any}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

/* =========================================================================
   Finalists
   ========================================================================= */

function FinalistsPanel({
  password, finalists, invalidateKey,
}: { password: string; finalists: any[]; invalidateKey: readonly unknown[] }) {
  const updateFn = useServerFn(updateCandidate);
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: invalidateKey as unknown[] });

  const [order, setOrder] = useState<string[]>(finalists.map((f) => f.id));
  useEffect(() => {
    setOrder((prev) => {
      const ids = finalists.map((f) => f.id);
      const kept = prev.filter((id) => ids.includes(id));
      const added = ids.filter((id) => !kept.includes(id));
      return [...kept, ...added];
    });
  }, [finalists]);

  const sorted = order
    .map((id) => finalists.find((f) => f.id === id))
    .filter(Boolean) as any[];

  const move = (idx: number, dir: -1 | 1) => {
    setOrder((arr) => {
      const next = arr.slice();
      const target = idx + dir;
      if (target < 0 || target >= next.length) return next;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const remove = (c: any) =>
    updateFn({ data: { password, id: c.id, patch: { status: "review" } as never } }).then(inv);

  return (
    <section className="space-y-4 border-t border-stone-200 pt-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500">
            Stage · Finalists
          </p>
          <h3 className="font-serif text-2xl">
            Current Finalists · {sorted.length}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Reorder by priority, then promote your strongest piece to Founder Hero.
          </p>
        </div>
      </div>

      <ol className="space-y-2">
        {sorted.map((c, i) => (
          <li key={c.id} className="border border-stone-200 p-3 flex items-center gap-4">
            <span className="font-serif text-xl w-8 text-stone-400">{i + 1}</span>
            <div className="w-16 aspect-square bg-stone-100">
              {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
                {c.brand}
              </p>
              <p className="font-serif">{c.product_name}</p>
              <p className="text-xs text-stone-500">
                Ed {Math.round(c.editorial_score ?? 0)} · Sim {Math.round(c.benchmark_similarity ?? 0)}
              </p>
            </div>
            <div className="flex gap-1 text-[0.65rem]">
              <button onClick={() => move(i, -1)} className="border border-stone-300 px-2 py-1">↑</button>
              <button onClick={() => move(i, 1)} className="border border-stone-300 px-2 py-1">↓</button>
              <button onClick={() => remove(c)} className="border border-stone-300 px-2 py-1">
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs text-stone-500">
        → To promote, open a finalist card above and tap <strong>Promote</strong>.
      </p>
    </section>
  );
}

/* =========================================================================
   Hero celebration
   ========================================================================= */

function HeroCelebration({
  hero, onAnother, onExit,
}: { hero: any; onAnother: () => void; onExit: () => void }) {
  return (
    <section className="border-2 border-ink p-8 bg-stone-50/60 space-y-5 text-center">
      <p className="text-[0.65rem] tracking-[0.4em] uppercase text-ink">
        ✓ Founder Hero Created
      </p>
      <h3 className="font-serif text-3xl">
        {hero.brand} — {hero.product_name}
      </h3>
      {hero.image_url && (
        <div className="mx-auto w-48 aspect-[4/5] bg-white">
          <img src={hero.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {hero.notes && (
        <p className="text-sm text-stone-600 max-w-md mx-auto italic">"{hero.notes}"</p>
      )}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          to="/admin/buying-office"
          className="bg-ink text-ivory px-6 py-3 text-[0.7rem] tracking-[0.3em] uppercase"
          onClick={(e) => { e.preventDefault(); onAnother(); }}
        >
          Create Another Buying Review
        </Link>
        <button
          onClick={onAnother}
          className="border border-ink px-6 py-3 text-[0.7rem] tracking-[0.3em] uppercase"
        >
          Begin Accessory Sourcing
        </button>
        <Link to="/admin" className="border border-stone-300 px-6 py-3 text-[0.7rem] tracking-[0.3em] uppercase">
          Return to Dashboard
        </Link>
      </div>
      <p className="text-[0.65rem] text-stone-500 pt-2">
        Or continue refining finalists above.
      </p>
    </section>
  );
}

/* =========================================================================
   Decision log + history
   ========================================================================= */

function DecisionLog({ candidates, session }: { candidates: any[]; session: any }) {
  const events = useMemo(() => {
    const out: Array<{ at: string; label: string; detail: string }> = [
      {
        at: session.created_at,
        label: "Session created",
        detail: `${session.destination} — ${session.moment}`,
      },
    ];
    for (const c of candidates) {
      out.push({
        at: c.created_at,
        label: "Imported",
        detail: `${c.brand ?? "—"} · ${c.product_name ?? "Untitled"}`,
      });
      if (c.status && c.status !== "review") {
        out.push({
          at: c.updated_at ?? c.created_at,
          label: STATUS_LABEL[c.status] ?? c.status,
          detail: `${c.brand ?? "—"} · ${c.product_name ?? "Untitled"}${c.rejection_reason ? ` · ${c.rejection_reason}` : ""}`,
        });
      }
    }
    return out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [candidates, session]);

  if (!events.length) {
    return <p className="text-xs text-stone-500">No decisions yet.</p>;
  }

  return (
    <ul className="text-xs divide-y divide-stone-100 border border-stone-200">
      {events.map((e, i) => (
        <li key={i} className="px-3 py-2 flex gap-3">
          <span className="text-stone-400 w-32 shrink-0">
            {new Date(e.at).toLocaleString()}
          </span>
          <span className="font-medium w-32 shrink-0">{e.label}</span>
          <span className="text-stone-700 truncate">{e.detail}</span>
        </li>
      ))}
    </ul>
  );
}

function SessionHistoryList({
  sessions, activeId, onSelect,
}: {
  sessions: any[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (!sessions.length) {
    return <p className="text-xs text-stone-500">No previous reviews.</p>;
  }
  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((s) => (
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
  );
}

function ActiveSessionPicker({
  sessions, onSelect,
}: { sessions: any[]; onSelect: (id: string) => void }) {
  return (
    <section className="border border-stone-200 p-6 space-y-3">
      <p className="text-[0.6rem] tracking-[0.3em] uppercase text-stone-500">
        Resume a Buying Review
      </p>
      <SessionHistoryList sessions={sessions.slice(0, 6)} activeId={null} onSelect={onSelect} />
    </section>
  );
}

/* =========================================================================
   Affiliate panel (advanced)
   ========================================================================= */

function AffiliatePanel({ password }: { password: string }) {
  const fn = useServerFn(getAffiliateNetworkStatus);
  const q = useQuery({
    queryKey: ["bo-affiliate"],
    queryFn: () => fn({ data: { password } }),
  });
  const data = q.data;
  if (!data) return <p className="text-xs text-stone-500">Loading…</p>;
  return (
    <div className="space-y-3">
      <p className="text-[0.65rem] text-stone-500">
        {data.summary.ready}/{data.summary.total} networks ready · troubleshooting view
      </p>
      <div className="grid gap-2 md:grid-cols-2">
        {data.networks.map((n) => (
          <div key={n.network} className="border border-stone-200 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{n.label}</span>
              <span className={
                n.providerReady ? "text-emerald-700"
                  : n.credentialsPresent ? "text-amber-700" : "text-stone-500"
              }>
                {n.providerReady ? "Ready" : n.credentialsPresent ? "Creds OK · adapter pending" : "Blocked"}
              </span>
            </div>
            <div className="text-stone-500">Retailers: {n.retailerPrograms.join(", ")}</div>
            <div className="text-stone-500">
              Credentials: {n.requiredCredentials.map((c) => `${c.label} ${c.present ? "✓" : "✗"}`).join(" · ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   Shared primitives
   ========================================================================= */

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[0.6rem] tracking-[0.24em] uppercase text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function LabeledInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Labeled label={label}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-stone-300 px-3 py-2 text-sm w-full"
      />
    </Labeled>
  );
}

function Selector({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="flex items-center gap-1 border border-stone-300 px-2 py-1">
      <span className="uppercase tracking-[0.2em] text-stone-500 text-[0.6rem]">{label}</span>
      <select
        className="bg-transparent text-xs focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
      </select>
    </label>
  );
}

function CollapsibleSection({
  title, children, defaultOpen,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <section className="border-t border-stone-200 pt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
          {title}
        </span>
        <span className="text-xs text-stone-500">{open ? "Hide" : "Show"}</span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

/* =========================================================================
   CSV parser
   ========================================================================= */

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
      } else row[key] = v;
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