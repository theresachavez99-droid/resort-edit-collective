import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import { SubscribersPanel } from "@/components/admin/SubscribersPanel";
import { seedPoolLoungingValidationLook } from "@/lib/founder-looks.functions";
import {
  seedMomentArchetypes,
  seedPortofinoMoments,
} from "@/lib/destination-moments.functions";

/**
 * /admin/system — the non-editorial surface.
 *
 * Everything that is a setup, migration, or list-management chore lives here
 * so the editorial routes stay focused on Looks. Seed utilities were pulled
 * out of the Look Builder and the Destination Moments editor in the Step 2
 * streamlining pass; Subscribers is reached from here rather than from the
 * dashboard's Operations list.
 */
export const Route = createFileRoute("/admin/system")({
  head: () => ({
    meta: [
      { title: "System — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SystemPage,
});

const STORAGE_KEY = "admin_dashboard_pw";
type Tab = "seeds" | "lists";

/**
 * Seed / migration utilities write directly to editorial tables, so they are
 * only rendered outside production. Production keeps the read-only surfaces.
 */
const SEEDS_ENABLED = import.meta.env.DEV;

function SystemPage() {
  const verify = useServerFn(verifyAdmin);
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("seeds");

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) setPw(saved);
  }, []);

  const auth = useMutation({
    mutationFn: () => {
      if (!pw) throw new Error("Password required");
      return verify({ data: { password: pw } });
    },
    onSuccess: () => {
      sessionStorage.setItem(STORAGE_KEY, pw);
      setAuthed(true);
    },
  });

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 mb-2">
          Internal Only
        </p>
        <h1 className="font-serif text-3xl mb-6">System</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Admin password"
          className="w-full border border-stone-300 px-3 py-2 mb-3"
          onKeyDown={(e) => {
            if (e.key === "Enter") auth.mutate();
          }}
        />
        <button
          onClick={() => auth.mutate()}
          disabled={!pw}
          className="bg-ink text-ivory px-5 py-2 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
        >
          Enter
        </button>
        {auth.error && (
          <p className="text-red-600 text-xs mt-3">{(auth.error as Error).message}</p>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <header className="flex items-baseline justify-between">
        <div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
            Studio
          </p>
          <h1 className="font-serif text-3xl">System</h1>
        </div>
        <Link to="/admin" className="text-sm text-stone-500 underline">
          ← Studio
        </Link>
      </header>

      <nav className="flex gap-6 border-b border-stone-200">
        {(
          [
            ["seeds", "Seeds & Migration"],
            ["lists", "Lists"],
          ] as Array<[Tab, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 text-[0.7rem] tracking-[0.24em] uppercase ${
              tab === key ? "border-b-2 border-ink text-ink" : "text-stone-500"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "seeds" ? <SeedsTab pw={pw} /> : <ListsTab />}
    </main>
  );
}

function SeedsTab({ pw }: { pw: string }) {
  return (
    <section className="space-y-4">
      <p className="text-xs text-stone-500 max-w-xl leading-relaxed">
        One-off setup utilities. These write directly to editorial tables — run
        them only when standing up a new destination or restoring reference data.
      </p>
      <SeedButton
        pw={pw}
        label="Seed: Moment Archetypes"
        description="Populates the shared archetype vocabulary used by Destination Moments."
        fn={seedMomentArchetypes}
      />
      <SeedButton
        pw={pw}
        label="Seed: Portofino Moments"
        description="Creates the Portofino moment adaptations from the canonical journey."
        fn={seedPortofinoMoments}
      />
      <SeedButton
        pw={pw}
        label="Seed: Pool Lounging Validation Look"
        description="Reference look used to validate the scoring engine end to end."
        fn={seedPoolLoungingValidationLook}
      />
    </section>
  );
}

function SeedButton({
  pw,
  label,
  description,
  fn,
}: {
  pw: string;
  label: string;
  description: string;
  fn: Parameters<typeof useServerFn>[0];
}) {
  const call = useServerFn(fn);
  const m = useMutation({
    mutationFn: () => call({ data: { password: pw } } as never),
  });
  return (
    <div className="border border-stone-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-stone-500 mt-1 leading-relaxed">
            {description}
          </div>
        </div>
        <button
          onClick={() => m.mutate()}
          disabled={m.isPending}
          className="shrink-0 border border-ink px-3 py-2 text-[0.65rem] tracking-[0.24em] uppercase hover:bg-ink hover:text-ivory transition disabled:opacity-40"
        >
          {m.isPending ? "Running…" : "Run"}
        </button>
      </div>
      {m.isSuccess && (
        <p className="text-xs text-emerald-700 mt-3">Done.</p>
      )}
      {m.error && (
        <p className="text-xs text-red-600 mt-3">{(m.error as Error).message}</p>
      )}
    </div>
  );
}

function ListsTab() {
  return (
    <section className="space-y-3">
      <p className="text-xs text-stone-500 max-w-xl leading-relaxed">
        Audience and list management. Not an editorial workflow — kept out of the
        Looks pipeline on purpose.
      </p>
      <Link
        to="/admin/subscribers"
        className="block border border-stone-200 p-4 hover:border-stone-400 transition"
      >
        <div className="text-sm font-medium">Subscribers</div>
        <div className="text-xs text-stone-500 mt-1 leading-relaxed">
          Newsletter list — status, tags, and notes.
        </div>
      </Link>
    </section>
  );
}