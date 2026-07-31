import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listMomentArchetypes,
  listAllDestinationMoments,
  seedMomentArchetypes,
  seedPortofinoMoments,
  type DestinationMomentRow,
  type MomentArchetypeRow,
} from "@/lib/destination-moments.functions";
import { NamingWarningChip } from "@/components/admin/NamingWarningChip";
import { getPortofinoMomentVerdicts } from "@/lib/portofino-moments.functions";
// Collections tab retired in Consolidation Order Track A — replaced by the
// Moment Run workspace in Track B.

export const Route = createFileRoute("/admin/destination-moments")({
  head: () => ({
    meta: [
      { title: "Destination Moments — Resort Edit Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DestinationMomentsPage,
});

const STORAGE_KEY = "admin_dest_moments_pw";

function DestinationMomentsPage() {
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
          <h1 className="font-display tracking-[0.18em] uppercase text-xl mb-6">Destination Moments</h1>
          <label className="text-[0.65rem] tracking-[0.24em] uppercase text-ink/60">Admin password</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-2 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm"
            autoFocus
          />
          {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
          <button type="submit" className="mt-6 w-full bg-ink text-ivory py-2.5 text-[0.7rem] tracking-[0.24em] uppercase">
            Enter
          </button>
        </form>
      </main>
    );
  }

  return <MomentsBoard password={pw} />;
}

function MomentsBoard({ password }: { password: string }) {
  const qc = useQueryClient();
  const archFn = useServerFn(listMomentArchetypes);
  const momFn = useServerFn(listAllDestinationMoments);
  const verdictsFn = useServerFn(getPortofinoMomentVerdicts);

  const archetypes = useQuery({
    queryKey: ["dest-moment-archetypes"],
    queryFn: () => archFn({ data: { password } }),
  });
  const moments = useQuery({
    queryKey: ["dest-moments-all"],
    queryFn: () => momFn({ data: { password } }),
  });
  const verdicts = useQuery({
    queryKey: ["portofino-moment-verdicts"],
    queryFn: () => verdictsFn({ data: { password } }),
  });

  const momentRows = moments.data?.ok ? moments.data.moments : [];
  const archRows = archetypes.data?.ok ? archetypes.data.archetypes : [];
  const verdictMap = new Map(
    (verdicts.data?.ok ? verdicts.data.verdicts : []).map((v) => [v.moment_slug, v]),
  );

  const byDestination = momentRows.reduce<Record<string, DestinationMomentRow[]>>((acc, m) => {
    (acc[m.destination_slug] ??= []).push(m);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-ink/15 px-6 md:px-10 py-6 sticky top-0 bg-ivory/95 backdrop-blur z-20">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-[0.62rem] tracking-[0.34em] uppercase text-gold">Resort Edit — Admin</p>
            <h1 className="font-display tracking-[0.18em] uppercase text-2xl mt-1">Destination Moments Library</h1>
            <p className="text-[0.72rem] text-ink/65 font-serif italic mt-1">
              The vocabulary every Resort Edit destination is built from. DRESSED FOR THE DESTINATION™.
            </p>
          </div>
          <Link
            to="/admin/system"
            className="border border-ink/30 px-3 py-2 text-[0.65rem] tracking-[0.22em] uppercase"
          >
            Seeds → System
          </Link>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8 space-y-12">
        {/* Archetype library */}
        <section>
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display tracking-[0.18em] uppercase text-lg">Archetype Library</h2>
            <p className="text-[0.7rem] text-ink/55">Cross-destination reusable moments ({archRows.length})</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {archRows.map((a) => (
              <ArchetypeCard key={a.id} a={a} />
            ))}
            {!archRows.length && !archetypes.isLoading && (
              <p className="text-sm text-ink/55 italic">
                No archetypes yet — run "Seed: Moment Archetypes" in System.
              </p>
            )}
          </div>
        </section>

        {/* Destinations */}
        <section>
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display tracking-[0.18em] uppercase text-lg">Destinations</h2>
            <p className="text-[0.7rem] text-ink/55">{momentRows.length} moments across {Object.keys(byDestination).length} destinations</p>
          </header>
          {Object.entries(byDestination).length === 0 && (
            <p className="text-sm text-ink/55 italic">
              No destination moments yet — run "Seed: Portofino Moments" in System.
            </p>
          )}
          <div className="space-y-10">
            {Object.entries(byDestination).map(([destSlug, list]) => (
              <div key={destSlug}>
                <h3 className="font-display tracking-[0.2em] uppercase text-base mb-3 border-b border-ink/15 pb-2">
                  {destSlug.replace(/-/g, " ")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {list.map((m) => (
                    <MomentCard
                      key={m.id}
                      m={m}
                      verdict={m.destination_slug === "portofino" ? verdictMap.get(m.moment_slug) : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function ArchetypeCard({ a }: { a: MomentArchetypeRow }) {
  const isCore = a.moment_type === "core";
  return (
    <article className="border border-ink/15 bg-cream/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display tracking-[0.12em] uppercase text-sm">{a.archetype_name}</h3>
        <span className="text-[0.55rem] tracking-[0.18em] uppercase text-ink/45">{a.archetype_slug}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        <span
          className={
            "text-[0.55rem] tracking-[0.22em] uppercase px-1.5 py-0.5 border " +
            (isCore ? "bg-ink text-ivory border-ink" : "bg-ivory text-ink/70 border-ink/30")
          }
        >
          {isCore ? "Core" : "Optional"}
        </span>
        <span
          className={
            "text-[0.55rem] tracking-[0.22em] uppercase px-1.5 py-0.5 border " +
            (a.destination_required
              ? "border-gold/60 text-gold"
              : "border-ink/20 text-ink/45")
          }
          title={
            a.destination_required
              ? "Moment names MUST include the destination (e.g. 'Portofino Arrival Day')."
              : "Moment names may be generic (e.g. 'Villa Dinner')."
          }
        >
          {a.destination_required ? "Destination required" : "Destination optional"}
        </span>
      </div>
      {a.description && <p className="text-[0.78rem] text-ink/70 mt-2 font-serif italic leading-snug">{a.description}</p>}
    </article>
  );
}

function MomentCard({
  m,
  verdict,
}: {
  m: DestinationMomentRow;
  verdict?: { source: "tagged" | "fallback" | "founder_look"; candidate_slug: string | null };
}) {
  const cues = (m.styling_cues ?? {}) as Record<string, unknown>;
  const palette = Array.isArray(cues.palette) ? (cues.palette as string[]) : [];
  return (
    <article className="border border-ink/15 bg-ivory p-5 space-y-3">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display tracking-[0.14em] uppercase text-base">{m.moment_name}</h4>
            <NamingWarningChip title={`${m.destination_slug} ${m.moment_name}`} size="xs" />
            {verdict && (
              <span
                className={
                  "text-[0.55rem] tracking-[0.2em] uppercase px-1.5 py-0.5 border " +
                  (verdict.source === "founder_look"
                    ? "border-violet-700/60 text-violet-800 bg-violet-50"
                    : verdict.source === "tagged"
                      ? "border-emerald-700/60 text-emerald-800 bg-emerald-50"
                      : "border-amber-700/60 text-amber-800 bg-amber-50")
                }
                title={
                  verdict.source === "founder_look"
                    ? "Published Founder Look is overriding the fallback."
                    : verdict.source === "tagged"
                      ? `Tagged: ${verdict.candidate_slug ?? "approved candidate"}`
                      : "Fallback look — tag approved candidate for this moment."
                }
              >
                {verdict.source === "founder_look"
                  ? "Founder Look"
                  : verdict.source === "tagged"
                    ? "Tagged"
                    : "Fallback look"}
              </span>
            )}
          </div>
          <p className="text-[0.6rem] tracking-[0.18em] uppercase text-ink/45 mt-1">
            {m.archetype_slug ?? "no archetype"} · {m.time_of_day ?? "—"} · sort {m.sort_order}
          </p>
        </div>
        {!m.active && (
          <span className="border border-ink/30 text-ink/60 px-2 py-0.5 text-[0.55rem] tracking-[0.18em] uppercase">
            Inactive
          </span>
        )}
      </header>
      {m.narrative && <p className="font-serif italic text-[0.85rem] text-ink/80 leading-snug">"{m.narrative}"</p>}
      <dl className="grid grid-cols-1 gap-y-1.5 text-[0.78rem]">
        {typeof cues.silhouette === "string" && <CueRow label="Silhouette" value={cues.silhouette} />}
        {typeof cues.hero === "string" && <CueRow label="Hero" value={cues.hero} />}
        {typeof cues.accessory_strategy === "string" && <CueRow label="Accessories" value={cues.accessory_strategy} />}
        {typeof cues.avoid === "string" && <CueRow label="Avoid" value={cues.avoid} />}
      </dl>
      {palette.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-[0.55rem] tracking-[0.22em] uppercase text-ink/45">Palette</span>
          {palette.map((c, i) => (
            <span key={i} className="text-[0.68rem] text-ink/70 border border-ink/15 px-1.5 py-0.5">{c}</span>
          ))}
        </div>
      )}
    </article>
  );
}

function CueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-[0.6rem] tracking-[0.2em] uppercase text-ink/45 w-24 shrink-0 pt-0.5">{label}</dt>
      <dd className="text-ink/80">{value}</dd>
    </div>
  );
}

