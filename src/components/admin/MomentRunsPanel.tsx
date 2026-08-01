import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listMomentsForRun } from "@/lib/moment-run.functions";


export function MomentRunsPanel() {
  const list = useServerFn(listMomentsForRun);
  const [pw, setPw] = useState("");
  useEffect(() => {
    const c = sessionStorage.getItem("admin_dashboard_pw");
    if (c) setPw(c);
  }, []);
  const q = useQuery({
    queryKey: ["moments-for-run", pw],
    enabled: !!pw,
    queryFn: () => list({ data: { password: pw } }),
  });

  if (!pw) {
    return (
      <div className="mx-auto max-w-xl p-8 text-sm text-stone-600">
        Authenticate via <Link to="/admin" className="underline">/admin</Link> first.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Editorial workspace</p>
        <h1 className="mt-2 font-serif text-3xl text-stone-900">Moment Runs</h1>
        <p className="mt-3 text-sm text-stone-600 max-w-2xl">
          One workspace, one engine. Select a moment to open its 5-stage Run
          (Compile → Feed → Rank → Curate → Publish). The legacy Buying
          Office, Stylist Engine, Look Studio, and Collections panels are
          consolidated here.
        </p>
      </header>

      {q.isLoading && <p className="text-sm text-stone-500">Loading…</p>}
      {q.data?.ok && (
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {q.data.moments.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                  {m.destination}
                </p>
                <p className="mt-1 font-serif text-lg text-stone-900">{m.name}</p>
                <p className="text-xs text-stone-500">{m.slug} · status: {m.status ?? "—"}</p>
              </div>
              <Link
                to="/admin/moments/$id/run"
                params={{ id: m.id }}
                className="rounded-full border border-stone-900 px-4 py-2 text-xs uppercase tracking-[0.14em] text-stone-900 hover:bg-stone-900 hover:text-white transition"
              >
                Open Run
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}