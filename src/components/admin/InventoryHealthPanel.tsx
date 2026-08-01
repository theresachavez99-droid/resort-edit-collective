import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  getInventoryHealthDashboard,
  runScheduledHealthSweep,
} from "@/lib/inventory-health.functions";


const STORAGE_KEY = "admin_inventory_health_pw";

export function InventoryHealthPanel() {
  const verify = useServerFn(verifyAdmin);
  const getDash = useServerFn(getInventoryHealthDashboard);
  const sweep = useServerFn(runScheduledHealthSweep);
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const c = sessionStorage.getItem(STORAGE_KEY);
    if (c) setPw(c);
  }, []);

  const auth = useMutation({
    mutationFn: () => verify({ data: { password: pw } }),
    onSuccess: () => {
      sessionStorage.setItem(STORAGE_KEY, pw);
      setAuthed(true);
    },
  });

  const dash = useQuery({
    queryKey: ["inventory-health"],
    enabled: authed,
    queryFn: () => getDash({ data: { password: pw } }),
  });

  const sweepMut = useMutation({
    mutationFn: (force: boolean) =>
      sweep({ data: { password: pw, maxSlots: 120, force } }),
    onSuccess: () => dash.refetch(),
  });

  if (!authed) {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-light mb-4">Inventory Health</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Admin password"
          className="w-full border px-3 py-2 mb-3"
        />
        <button
          onClick={() => auth.mutate()}
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

  const t = dash.data?.totals;
  const collections = dash.data?.collections ?? [];
  const events = dash.data?.recentEvents ?? [];

  // Operational cost panel — sweep is HEAD-only, so Firecrawl usage is 0.
  const lastSweep = sweepMut.data;

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light">Inventory Health</h1>
          <p className="text-xs text-stone-500 mt-1 tracking-wide">
            Cost-controlled monitoring. Featured collections checked every 24h, others every 5d.
            Firecrawl reserved for discovery only.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => sweepMut.mutate(false)}
            disabled={sweepMut.isPending}
            className="bg-black text-white px-4 py-2 text-xs uppercase tracking-widest"
          >
            {sweepMut.isPending ? "Sweeping…" : "Run scheduled sweep"}
          </button>
          <button
            onClick={() => sweepMut.mutate(true)}
            disabled={sweepMut.isPending}
            className="border border-black px-4 py-2 text-xs uppercase tracking-widest"
          >
            Force re-check
          </button>
        </div>
      </div>

      {t && (
        <div className="grid grid-cols-6 gap-4 mb-8">
          <Stat label="Approved collections" value={t.collections} />
          <Stat label="Featured" value={t.featured} />
          <Stat label="Slots monitored" value={t.slotsTotal} />
          <Stat label="Healthy" value={t.slotsHealthy} accent="emerald" />
          <Stat label="Unhealthy" value={t.slotsUnhealthy} accent="red" />
          <Stat label="Fallback active" value={t.slotsFallback} accent="amber" />
        </div>
      )}

      {lastSweep && (
        <div className="border border-stone-200 bg-stone-50 p-4 mb-8 text-xs">
          <div className="uppercase tracking-widest text-stone-500 mb-2">Last sweep</div>
          <div className="grid grid-cols-6 gap-4">
            <Mini label="Collections" v={lastSweep.stats.collectionsConsidered} />
            <Mini label="Checked" v={lastSweep.stats.slotsChecked} />
            <Mini label="Cached/skipped" v={lastSweep.stats.slotsSkippedCached} />
            <Mini label="Healthy" v={lastSweep.stats.healthy} />
            <Mini label="Queued" v={lastSweep.stats.queuedForReview} />
            <Mini label="Firecrawl calls" v={lastSweep.stats.firecrawlSearches} />
          </div>
        </div>
      )}

      <h2 className="text-sm uppercase tracking-widest mb-3">Published Collections</h2>
      <div className="border border-stone-200 mb-10">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-widest text-stone-500">
            <tr>
              <th className="text-left px-3 py-2">Collection</th>
              <th className="text-left px-3 py-2">Destination / Activity</th>
              <th className="text-right px-3 py-2">Slots</th>
              <th className="text-right px-3 py-2">Healthy</th>
              <th className="text-right px-3 py-2">Unhealthy</th>
              <th className="text-right px-3 py-2">Fallback</th>
              <th className="text-right px-3 py-2">Health</th>
              <th className="text-left px-3 py-2">Last check</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id} className="border-t border-stone-100">
                <td className="px-3 py-2">
                  {c.featured && (
                    <span className="mr-2 inline-block bg-black text-white text-[10px] px-1.5 py-0.5 uppercase tracking-widest">
                      Featured
                    </span>
                  )}
                  <span className="text-stone-900">{c.title ?? "Untitled"}</span>
                  <a
                    className="ml-2 text-[11px] uppercase tracking-widest text-stone-500 underline hover:text-stone-900"
                    href="/admin/editorial-intelligence"
                  >
                    Open Run workspace →
                  </a>
                </td>
                <td className="px-3 py-2 text-stone-600">
                  {c.destination} · {c.activity}
                </td>
                <td className="px-3 py-2 text-right">{c.slotsTotal}</td>
                <td className="px-3 py-2 text-right text-emerald-700">{c.slotsHealthy}</td>
                <td className="px-3 py-2 text-right text-red-700">{c.slotsUnhealthy}</td>
                <td className="px-3 py-2 text-right text-amber-700">{c.slotsFallback}</td>
                <td className="px-3 py-2 text-right">
                  {c.healthScore == null ? "—" : `${c.healthScore}%`}
                </td>
                <td className="px-3 py-2 text-stone-500 text-xs">
                  {c.lastCheckAt ? new Date(c.lastCheckAt).toLocaleString() : "never"}
                </td>
              </tr>
            ))}
            {!collections.length && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-stone-500 text-sm">
                  No approved collections yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-sm uppercase tracking-widest mb-3">Recent Health Events</h2>
      <div className="border border-stone-200">
        <table className="w-full text-xs">
          <thead className="bg-stone-50 uppercase tracking-widest text-stone-500">
            <tr>
              <th className="text-left px-3 py-2">When</th>
              <th className="text-left px-3 py-2">Event</th>
              <th className="text-left px-3 py-2">Outcome</th>
              <th className="text-left px-3 py-2">HTTP</th>
              <th className="text-left px-3 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t border-stone-100">
                <td className="px-3 py-2 text-stone-500">
                  {new Date(e.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2">{e.event_type}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      e.outcome === "healthy"
                        ? "text-emerald-700"
                        : "text-red-700"
                    }
                  >
                    {e.outcome}
                  </span>
                </td>
                <td className="px-3 py-2">{e.http_status ?? "—"}</td>
                <td className="px-3 py-2 text-stone-600">{e.message ?? "—"}</td>
              </tr>
            ))}
            {!events.length && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-stone-500">
                  No events yet — run a sweep above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 text-xs text-stone-600">
        <div className="border border-stone-200 p-4">
          <div className="uppercase tracking-widest text-stone-500 mb-2">Cost Controls</div>
          <ul className="space-y-1">
            <li>• HEAD-only checks (no JS render, no scraping).</li>
            <li>• Cached results respected per cadence; cached slots skip.</li>
            <li>• Sweep capped at 120 slots per run.</li>
            <li>• Firecrawl is never invoked by the sweep.</li>
            <li>• Failures route to the Editorial Review Queue.</li>
          </ul>
        </div>
        <div className="border border-stone-200 p-4">
          <div className="uppercase tracking-widest text-stone-500 mb-2">Cadence</div>
          <ul className="space-y-1">
            <li>• Featured collection / featured look: 24h</li>
            <li>• Other published looks: 5 days</li>
            <li>• Collections older than 60d: 21 days</li>
            <li>• Draft / rejected: never monitored</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "red" | "amber";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-700"
      : accent === "red"
        ? "text-red-700"
        : accent === "amber"
          ? "text-amber-700"
          : "text-stone-900";
  return (
    <div className="border border-stone-200 p-4">
      <div className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">
        {label}
      </div>
      <div className={`text-2xl font-light ${color}`}>{value}</div>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-stone-500">{label}</div>
      <div className="text-base">{v}</div>
    </div>
  );
}
