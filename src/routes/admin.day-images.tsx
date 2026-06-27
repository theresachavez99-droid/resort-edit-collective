import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verifyAdmin } from "@/lib/admin-auth.functions";
import {
  listDayImagesAdmin,
  uploadStagedDayImage,
  approveStagedDayImage,
  rejectStagedDayImage,
  clearCanonicalDayImage,
  type CanonicalRow,
  type StagedUpload,
} from "@/lib/day-images.functions";
import {
  CANONICAL_DAY_IMAGES,
  describeDayImageBindings,
  type DaySlug,
} from "@/data/dayImageRegistry";

export const Route = createFileRoute("/admin/day-images")({
  head: () => ({
    meta: [
      { title: "Day Image Registry — Admin (Resort Edit)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DayImagesPage,
});

const STORAGE_KEY = "admin_day_images_pw";
const DAYS: DaySlug[] = ["day-1", "day-2", "day-3", "day-4", "day-5"];
const DAY_LABEL: Record<DaySlug, string> = {
  "day-1": "Yacht & Harbour Aperitivo",
  "day-2": "Beach Club & Long Lunch",
  "day-3": "Pool Lounging & Shopping",
  "day-4": "Sunset Views & Riviera Dinner",
  "day-5": "Espresso Morning & Exploring the Harbor",
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function DayImagesPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const verify = useServerFn(verifyAdmin);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setPassword(stored);
  }, []);

  if (!password) {
    return (
      <main className="min-h-screen bg-ivory text-ink flex items-center justify-center px-6">
        <form
          className="w-full max-w-sm border border-ink/20 bg-cream/30 p-8"
          onSubmit={async (e) => {
            e.preventDefault();
            setPwError(null);
            try {
              await verify({ data: { password: pwInput } });
              window.localStorage.setItem(STORAGE_KEY, pwInput);
              setPassword(pwInput);
            } catch {
              setPwError("Invalid password");
            }
          }}
        >
          <h1 className="font-display tracking-[0.18em] uppercase text-xl mb-6">Day Image Registry</h1>
          <label className="eyebrow tracking-[0.24em] text-[0.65rem] text-ink/60">Admin password</label>
          <input
            type="password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            className="mt-2 w-full border border-ink/30 bg-ivory px-3 py-2"
            autoFocus
          />
          {pwError && <p className="mt-2 text-sm text-red-700">{pwError}</p>}
          <button type="submit" className="mt-5 w-full bg-ink text-ivory py-2.5 tracking-[0.2em] text-sm">
            UNLOCK
          </button>
        </form>
      </main>
    );
  }

  return <Authenticated password={password} onLock={() => { window.localStorage.removeItem(STORAGE_KEY); setPassword(null); }} />;
}

function Authenticated({ password, onLock }: { password: string; onLock: () => void }) {
  const qc = useQueryClient();
  const list = useServerFn(listDayImagesAdmin);
  const upload = useServerFn(uploadStagedDayImage);
  const approve = useServerFn(approveStagedDayImage);
  const reject = useServerFn(rejectStagedDayImage);
  const clear = useServerFn(clearCanonicalDayImage);

  const query = useQuery({
    queryKey: ["admin-day-images"],
    queryFn: () => list({ data: { password } }),
  });

  const refetch = () => {
    qc.invalidateQueries({ queryKey: ["admin-day-images"] });
    qc.invalidateQueries({ queryKey: ["canonical-day-image-overrides"] });
  };

  const approveMut = useMutation({
    mutationFn: (id: string) => approve({ data: { password, id } }),
    onSuccess: refetch,
  });
  const rejectMut = useMutation({
    mutationFn: (id: string) => reject({ data: { password, id } }),
    onSuccess: refetch,
  });
  const clearMut = useMutation({
    mutationFn: (day_slug: DaySlug) => clear({ data: { password, day_slug } }),
    onSuccess: refetch,
  });

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-ink/15 px-6 py-5 flex items-center justify-between bg-cream/50">
        <div>
          <h1 className="font-display text-2xl tracking-[0.14em] uppercase">Day Image Registry</h1>
          <p className="mt-1 text-xs text-ink/60 max-w-2xl">
            DB-backed canonical image per day. When set, overrides
            <code className="px-1">dayImageRegistry.ts</code> across every Day surface at render time.
            Pending uploads are NOT shown on the live site.
          </p>
        </div>
        <button onClick={onLock} className="text-xs eyebrow tracking-[0.2em] text-ink/50 hover:text-ink">
          LOCK
        </button>
      </header>

      <section className="px-6 py-8 max-w-6xl mx-auto space-y-10">
        {query.isLoading && <p className="text-sm text-ink/60">Loading…</p>}
        {query.isError && <p className="text-sm text-red-700">{(query.error as Error).message}</p>}
        {query.data &&
          DAYS.map((slug) => {
            const canonical = query.data.canonical[slug] as CanonicalRow | undefined;
            const staged = query.data.staged[slug] ?? [];
            return (
              <DayBlock
                key={slug}
                slug={slug}
                canonical={canonical}
                staged={staged}
                password={password}
                uploadFn={async (file, notes) => {
                  const dataUrl = await fileToBase64(file);
                  await upload({
                    data: {
                      password,
                      day_slug: slug,
                      filename: file.name,
                      content_type: file.type as "image/png" | "image/jpeg" | "image/webp",
                      data_base64: dataUrl,
                      notes: notes || undefined,
                    },
                  });
                  refetch();
                }}
                onApprove={(id) => approveMut.mutate(id)}
                onReject={(id) => rejectMut.mutate(id)}
                onClear={() => clearMut.mutate(slug)}
              />
            );
          })}
      </section>
    </main>
  );
}

function DayBlock({
  slug,
  canonical,
  staged,
  uploadFn,
  onApprove,
  onReject,
  onClear,
}: {
  slug: DaySlug;
  canonical?: CanonicalRow;
  staged: StagedUpload[];
  password: string;
  uploadFn: (file: File, notes: string) => Promise<void>;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const tsFallback = CANONICAL_DAY_IMAGES[slug];
  const liveSrc = canonical?.image_url ?? tsFallback;
  const bindings = useMemo(() => describeDayImageBindings(slug), [slug]);
  const surfacesPreview = bindings.map((b) => ({
    surface: b.surface,
    image: canonical?.image_url ?? b.image,
    source: canonical ? "DB canonical" : b.isOverride ? "TS override" : "TS default",
  }));

  return (
    <article className="border border-ink/15 bg-cream/30">
      <header className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
        <div>
          <div className="eyebrow text-[0.65rem] tracking-[0.32em] text-gold">{slug.toUpperCase()}</div>
          <h2 className="font-display text-xl mt-1">{DAY_LABEL[slug]}</h2>
        </div>
        <div className="text-xs text-ink/60 text-right">
          <div>
            Active source:{" "}
            <span className={canonical ? "text-emerald-700 font-semibold" : "text-ink/60"}>
              {canonical ? "canonical_day_image (DB)" : "canonical_day_image (TS fallback)"}
            </span>
          </div>
          {canonical && (
            <button
              onClick={onClear}
              className="mt-1 text-[0.7rem] tracking-[0.18em] uppercase text-red-700 hover:underline"
            >
              Revert to TS default
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
        {/* LIVE */}
        <div>
          <div className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/60 mb-2">Currently live</div>
          <div className="aspect-[4/5] bg-muted overflow-hidden border border-ink/10">
            <img src={liveSrc} alt={`${slug} live`} className="w-full h-full object-cover" />
          </div>
          <p className="mt-2 text-[0.7rem] text-ink/60 break-all">{liveSrc}</p>
        </div>

        {/* UPLOAD */}
        <div>
          <div className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/60 mb-2">Upload new candidate</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="block w-full text-sm"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="mt-2 w-full border border-ink/20 bg-ivory px-2 py-1.5 text-sm"
            rows={2}
          />
          <button
            disabled={pending}
            onClick={async () => {
              setErr(null);
              const f = fileRef.current?.files?.[0];
              if (!f) {
                setErr("Select a file first");
                return;
              }
              setPending(true);
              try {
                await uploadFn(f, notes);
                if (fileRef.current) fileRef.current.value = "";
                setNotes("");
              } catch (e) {
                setErr((e as Error).message);
              } finally {
                setPending(false);
              }
            }}
            className="mt-3 bg-ink text-ivory px-4 py-2 text-sm tracking-[0.2em] disabled:opacity-50"
          >
            {pending ? "UPLOADING…" : "UPLOAD TO STAGING"}
          </button>
          {err && <p className="mt-2 text-sm text-red-700">{err}</p>}

          <p className="mt-3 text-[0.7rem] text-ink/55 leading-relaxed">
            Source state: <code>founder_upload_pending</code>. Pending uploads are blocked from product rails and
            live Day pages until approved.
          </p>
        </div>
      </div>

      {/* STAGED */}
      {staged.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <div className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/60 mb-3">
            Pending review ({staged.length})
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {staged.map((s) => (
              <div key={s.id} className="border border-ink/10 bg-ivory">
                <div className="aspect-[4/5] bg-muted overflow-hidden">
                  <img src={s.image_url} alt="staged" className="w-full h-full object-cover" />
                </div>
                <div className="p-2 text-[0.7rem]">
                  <div className="text-ink/70 truncate">{s.original_filename ?? "—"}</div>
                  <div className="text-ink/40">{new Date(s.created_at).toLocaleString()}</div>
                  {s.notes && <div className="mt-1 italic text-ink/60">{s.notes}</div>}
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={() => onApprove(s.id)}
                      className="flex-1 bg-emerald-700 text-ivory py-1 tracking-[0.16em] uppercase text-[0.62rem]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(s.id)}
                      className="flex-1 border border-ink/30 py-1 tracking-[0.16em] uppercase text-[0.62rem]"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SURFACE REPORT */}
      <details className="border-t border-ink/10 px-5 py-3">
        <summary className="cursor-pointer eyebrow text-[0.6rem] tracking-[0.3em] text-ink/60">
          Surfaces that resolve to this day's image
        </summary>
        <ul className="mt-3 space-y-1 text-[0.75rem] text-ink/70">
          {surfacesPreview.map((s) => (
            <li key={s.surface} className="flex items-center gap-2">
              <code className="w-32 inline-block">{s.surface}</code>
              <span className="text-ink/50">{s.source}</span>
              <a href={s.image} target="_blank" rel="noreferrer" className="ml-auto text-gold underline truncate max-w-[28ch]">
                preview
              </a>
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}