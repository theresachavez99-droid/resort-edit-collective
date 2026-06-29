import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  getHeroOutfitWorkspace,
  importHeroGarments,
  groupGarmentsIntoOutfit,
  addGarmentToOutfit,
  removeGarmentFromOutfit,
  patchHeroGarment,
  patchHeroOutfit,
  promoteHeroOutfit,
  addManualSlotCandidate,
  selectSlotCandidate,
  clearSlotCandidates,
  validateHeroOutfitForPublish,
  publishFounderLookFromOutfit,
  regenerateSlotWithAI,
  rejectSlotCandidate,
  addCustomComponent,
  removeCustomComponent,
} from "@/lib/hero-outfit.functions";
import { slotsForMoment, profileForMoment } from "@/lib/hero-outfit-slots";

export const Route = createFileRoute("/admin/hero-outfit/$id")({
  component: HeroOutfitStudio,
});

const PW_KEY = "resort_admin_pw";

function getPw(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PW_KEY) ?? "";
}

function HeroOutfitStudio() {
  const router = useRouter();
  const { id: sessionId } = Route.useParams();
  const [password, setPassword] = useState<string>(getPw());
  const [pwReady, setPwReady] = useState<boolean>(!!getPw());

  if (!pwReady) {
    return (
      <div className="min-h-screen bg-ivory text-ink flex items-center justify-center p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem(PW_KEY, password);
            setPwReady(true);
          }}
          className="border border-stone-300 p-8 max-w-sm w-full space-y-4"
        >
          <h1 className="text-xs tracking-[0.3em] uppercase">Admin Password</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-stone-300 px-3 py-2 text-sm"
          />
          <button className="bg-ink text-ivory px-5 py-2 text-xs tracking-[0.3em] uppercase w-full">
            Enter Studio
          </button>
        </form>
      </div>
    );
  }

  return <Workspace sessionId={sessionId} password={password} />;
}

function Workspace({ sessionId, password }: { sessionId: string; password: string }) {
  const qc = useQueryClient();
  const fetchWorkspace = useServerFn(getHeroOutfitWorkspace);
  const q = useQuery({
    queryKey: ["hero-workspace", sessionId],
    queryFn: () => fetchWorkspace({ data: { password, sessionId } }),
  });

  if (q.isLoading) {
    return <div className="p-8 text-xs text-stone-500">Loading Hero Outfit Studio…</div>;
  }
  if (q.error || !q.data) {
    return (
      <div className="p-8 text-xs text-red-600">
        {(q.error as Error)?.message ?? "Failed to load workspace."}
      </div>
    );
  }

  const { session, outfits, candidates } = q.data;
  type Outfit = typeof outfits[number];
  type Candidate = typeof candidates[number];

  // Garments not yet attached to any outfit:
  const looseGarments = candidates.filter(
    (c: Candidate) => c.is_hero_garment && !c.hero_outfit_id,
  );
  const refetch = () => qc.invalidateQueries({ queryKey: ["hero-workspace", sessionId] });

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-stone-300 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-[0.6rem] tracking-[0.32em] uppercase text-stone-500">
            Hero Outfit Studio
          </div>
          <h1 className="text-lg font-serif">
            {session.destination} · {session.moment}
          </h1>
        </div>
        <a
          href="/admin/buying-office"
          className="text-xs tracking-[0.3em] uppercase text-stone-500 hover:text-ink"
        >
          ← All sessions
        </a>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-12">
        {/* STAGE 3 — Import Hero Garments */}
        <ImportStage
          sessionId={sessionId}
          password={password}
          onDone={refetch}
        />

        {/* Loose garments (not yet grouped) */}
        {looseGarments.length > 0 && (
          <LooseGarmentsCard
            garments={looseGarments}
            outfits={outfits}
            password={password}
            sessionId={sessionId}
            onChange={refetch}
          />
        )}

        {/* STAGE 4-8 — One panel per Hero Outfit */}
        {outfits.length === 0 && looseGarments.length === 0 && (
          <div className="border border-dashed border-stone-300 p-8 text-center text-xs text-stone-500">
            Paste Hero garment URLs above to begin.
          </div>
        )}

        {outfits.map((o: Outfit) => (
          <OutfitPanel
            key={o.id}
            outfit={o}
            candidates={candidates.filter((c: Candidate) => c.hero_outfit_id === o.id)}
            password={password}
            onChange={refetch}
          />
        ))}
      </div>
    </div>
  );
}

function ImportStage({
  sessionId,
  password,
  onDone,
}: {
  sessionId: string;
  password: string;
  onDone: () => void;
}) {
  const [urls, setUrls] = useState("");
  const importFn = useServerFn(importHeroGarments);
  const mut = useMutation({
    mutationFn: async () => {
      const list = urls
        .split(/\s+/)
        .map((s) => s.trim())
        .filter((s) => /^https?:\/\//.test(s));
      if (list.length === 0) throw new Error("Paste at least one product URL.");
      const result = await importFn({ data: { password, sessionId, urls: list } });
      // eslint-disable-next-line no-console
      console.info("[hero-outfit] import result", result);
      return result;
    },
    onSuccess: (r) => {
      toast.success(
        `${r.imported} garments imported · ${r.outfitsCreated} Hero Outfit${r.outfitsCreated === 1 ? "" : "s"} detected.`,
      );
      setUrls("");
      onDone();
    },
    onError: (e) => {
      // eslint-disable-next-line no-console
      console.error("[hero-outfit] import failed", e);
      toast.error((e as Error)?.message ?? "Hero garment import failed.");
    },
  });

  const errorMessage = mut.isError ? ((mut.error as Error)?.message ?? "Import failed.") : null;

  return (
    <section className="border border-stone-300 p-6 space-y-4">
      <div>
        <div className="text-[0.6rem] tracking-[0.32em] uppercase text-stone-500">
          Stage 3
        </div>
        <h2 className="text-base font-serif">Import Hero Garments</h2>
        <p className="text-xs text-stone-600 italic mt-2">
          Paste one or more product URLs that together form the foundation of this look.
        </p>
        <ul className="text-xs text-stone-600 mt-2 space-y-0.5 pl-4 list-disc">
          <li>Dress · jumpsuit · romper</li>
          <li>Vest + trousers · top + shorts · skirt + top</li>
          <li>Swim + cover-up</li>
        </ul>
        <p className="text-xs text-stone-500 mt-2">
          The Stylist Engine will complete the remaining outfit after the Hero is approved.
        </p>
      </div>
      <textarea
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        rows={6}
        placeholder="https://www.revolve.com/faithfull-maya-vest-in-natural/dp/FAIB-WS275/&#10;https://www.revolve.com/faithfull-isotta-pant-in-natural/dp/FAIB-WP74/"
        className="w-full border border-stone-300 px-3 py-2 text-xs font-mono"
      />
      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="bg-ink text-ivory px-5 py-2 text-[0.7rem] tracking-[0.3em] uppercase disabled:opacity-40 cursor-pointer disabled:cursor-wait"
        >
          {mut.isPending ? "Importing hero garments…" : "Import Hero Garments"}
        </button>
        {mut.isPending && (
          <span className="text-xs text-stone-500 italic">
            Fetching product data from retailers — this can take 10–30s.
          </span>
        )}
      </div>
      {errorMessage && (
        <div className="border border-red-300 bg-red-50 text-red-700 text-xs px-3 py-2">
          {errorMessage}
        </div>
      )}
    </section>
  );
}

function LooseGarmentsCard({
  garments,
  outfits,
  password,
  sessionId,
  onChange,
}: {
  garments: any[];
  outfits: any[];
  password: string;
  sessionId: string;
  onChange: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const groupFn = useServerFn(groupGarmentsIntoOutfit);
  const addFn = useServerFn(addGarmentToOutfit);

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section className="border border-stone-300 p-6 space-y-4">
      <h2 className="text-sm tracking-[0.3em] uppercase text-stone-700">
        Unassigned garments
      </h2>
      <p className="text-xs text-stone-500">
        Select two or more and Group as Hero Outfit, or add to an existing outfit.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {garments.map((g) => (
          <label
            key={g.id}
            className={
              "border p-3 text-xs cursor-pointer " +
              (selected.has(g.id) ? "border-ink" : "border-stone-300")
            }
          >
            <input
              type="checkbox"
              checked={selected.has(g.id)}
              onChange={() => toggle(g.id)}
              className="mr-2"
            />
            <span className="font-medium">{g.brand ?? "?"}</span>
            <div className="text-stone-500 mt-1 line-clamp-2">{g.product_name ?? g.product_url}</div>
            {g.image_url ? (
              <img src={g.image_url} alt="" className="w-full h-32 object-cover mt-2" />
            ) : (
              <div className="w-full h-32 bg-stone-100 mt-2 flex items-center justify-center text-[0.6rem] text-stone-400">
                no image
              </div>
            )}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          disabled={selected.size < 1}
          onClick={async () => {
            try {
              await groupFn({ data: { password, sessionId, garmentIds: Array.from(selected) } });
              toast.success("Hero Outfit created.");
              setSelected(new Set());
              onChange();
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
          className="bg-ink text-ivory px-4 py-2 text-[0.65rem] tracking-[0.3em] uppercase disabled:opacity-40"
        >
          Group as Hero Outfit
        </button>
        {outfits.length > 0 && selected.size === 1 && (
          <select
            className="border border-stone-300 text-xs px-2"
            onChange={async (e) => {
              if (!e.target.value) return;
              try {
                const id = Array.from(selected)[0];
                await addFn({ data: { password, outfitId: e.target.value, garmentId: id } });
                toast.success("Added to outfit.");
                setSelected(new Set());
                onChange();
              } catch (err) {
                toast.error((err as Error).message);
              }
            }}
          >
            <option value="">Add to existing outfit…</option>
            {outfits.map((o) => (
              <option key={o.id} value={o.id}>
                {o.primary_brand ?? "Outfit"} ({o.status})
              </option>
            ))}
          </select>
        )}
      </div>
    </section>
  );
}

function OutfitPanel({
  outfit,
  candidates,
  password,
  onChange,
}: {
  outfit: any;
  candidates: any[];
  password: string;
  onChange: () => void;
}) {
  const promoteFn = useServerFn(promoteHeroOutfit);
  const removeFn = useServerFn(removeGarmentFromOutfit);
  const patchGarmentFn = useServerFn(patchHeroGarment);
  const patchOutfitFn = useServerFn(patchHeroOutfit);
  const validateFn = useServerFn(validateHeroOutfitForPublish);
  const publishFn = useServerFn(publishFounderLookFromOutfit);

  const heroes = candidates.filter((c) => c.is_hero_garment);
  const isDraft = outfit.status === "draft";
  const isPromoted = outfit.status === "promoted" || outfit.status === "published";
  const isPublished = outfit.status === "published";

  const slotDefs = slotsForMoment(outfit.moment);
  const profile = profileForMoment(outfit.moment);

  // V3 editorial workspace state
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);

  // Auto-expand only slots that have no current selection.
  const slotSelections = useMemo(() => {
    const map = new Map<string, any>();
    for (const c of candidates) {
      if (c.selected_for_look && c.stylist_slot && !c.is_hero_garment) {
        map.set(c.stylist_slot, c);
      }
    }
    return map;
  }, [candidates]);

  const customComponents: Array<{ id: string; name: string; url: string; image_url?: string | null; brand?: string | null; notes?: string | null; price?: number | null }> =
    Array.isArray(outfit.custom_components) ? outfit.custom_components : [];

  return (
    <section className="border-2 border-ink/20 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[0.6rem] tracking-[0.32em] uppercase text-stone-500">
            Hero Outfit · status: {outfit.status} · {profile}
          </div>
          <h2 className="text-lg font-serif mt-1">
            {outfit.title ?? outfit.primary_brand ?? "Untitled Hero Outfit"}
          </h2>
          {outfit.color_palette?.length > 0 && (
            <div className="text-xs text-stone-500 mt-1">
              Palette: {outfit.color_palette.join(" · ")}
            </div>
          )}
        </div>
        {isPublished && (
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-emerald-700">
            ✓ Published
          </div>
        )}
      </div>

      {/* PRIMARY — Current Founder Look summary */}
      {isPromoted && (
        <CurrentLookSummary
          outfit={outfit}
          heroes={heroes}
          slotDefs={slotDefs}
          slotSelections={slotSelections}
          customComponents={customComponents}
          password={password}
          onChangeSlot={(slot: string) =>
            setExpandedSlots((s) => {
              const n = new Set(s);
              n.add(slot);
              return n;
            })
          }
          onChange={onChange}
        />
      )}

      {/* Hero garments — only show editable cards when not yet promoted, or
          when one needs an image fix. Once promoted, summary card covers it. */}
      {isDraft && (
        <div className="space-y-3">
          <div className="text-[0.6rem] tracking-[0.32em] uppercase text-stone-500">
            Stage 4 — Hero garments
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {heroes.map((g) => (
              <HeroGarmentCard
                key={g.id}
                garment={g}
                editable={!isPublished}
                onPatchImage={async (image_url) => {
                  await patchGarmentFn({
                    data: { password, garmentId: g.id, patch: { image_url } },
                  });
                  onChange();
                }}
                onRemove={async () => {
                  if (!confirm("Remove from this Hero Outfit?")) return;
                  await removeFn({ data: { password, garmentId: g.id } });
                  onChange();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stage 5 — Promote */}
      {isDraft && (
        <div className="border-t border-stone-200 pt-4 flex items-center justify-between">
          <p className="text-xs text-stone-600">
            Review the Hero garments. Once promoted, the AI fills accessories around them.
            <br />
            <span className="text-stone-500 italic">
              Images aren't required — paste them manually if scraping failed.
            </span>
          </p>
          <button
            onClick={async () => {
              try {
                await promoteFn({ data: { password, outfitId: outfit.id } });
                toast.success("Hero Outfit promoted. Next: Build Complete Outfit.");
                onChange();
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            disabled={heroes.length === 0}
            className="bg-ink text-ivory px-5 py-2 text-[0.7rem] tracking-[0.3em] uppercase disabled:opacity-40"
          >
            Promote Hero Outfit
          </button>
        </div>
      )}

      {/* SECONDARY — incomplete slot work area */}
      {isPromoted && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-t border-stone-200 pt-4">
            <div className="text-[0.6rem] tracking-[0.32em] uppercase text-stone-500">
              Decisions remaining
            </div>
            <label className="text-[0.6rem] tracking-[0.25em] uppercase text-stone-500 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
              Show archived
            </label>
          </div>
          {slotDefs.map((def) => {
            const slotCands = candidates.filter((c) => c.stylist_slot === def.slot);
            const selected = slotCands.find((c) => c.selected_for_look);
            const isFilled = !!selected;
            const isExpanded = expandedSlots.has(def.slot) || !isFilled;
            return (
              <SlotRow
                key={def.slot}
                outfitId={outfit.id}
                slot={def.slot}
                label={def.label}
                required={def.required}
                candidates={slotCands}
                selectedId={selected?.id ?? null}
                password={password}
                onChange={onChange}
                disabled={isPublished}
                expanded={isExpanded}
                showArchived={showArchived}
                onToggleExpand={() =>
                  setExpandedSlots((s) => {
                    const n = new Set(s);
                    n.has(def.slot) ? n.delete(def.slot) : n.add(def.slot);
                    return n;
                  })
                }
              />
            );
          })}
          <OptionalComponentsEditor
            outfitId={outfit.id}
            password={password}
            components={customComponents}
            onChange={onChange}
            disabled={isPublished}
          />
        </div>
      )}

      {/* Stage 8 — Publish */}
      {isPromoted && !isPublished && (
        <PublishCard
          outfit={outfit}
          password={password}
          onChange={onChange}
          validateFn={validateFn}
          publishFn={publishFn}
        />
      )}
    </section>
  );
}

function HeroGarmentCard({
  garment,
  editable,
  onPatchImage,
  onRemove,
}: {
  garment: any;
  editable: boolean;
  onPatchImage: (url: string) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const [imgEdit, setImgEdit] = useState(false);
  const [imgUrl, setImgUrl] = useState(garment.image_url ?? "");
  return (
    <div className="border border-stone-300 p-3 text-xs space-y-2">
      <div className="font-medium">{garment.brand ?? "—"}</div>
      <div className="text-stone-500 line-clamp-2">
        {garment.product_name ?? garment.product_url}
      </div>
      {garment.image_url ? (
        <img src={garment.image_url} alt="" className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-stone-100 flex items-center justify-center text-[0.65rem] text-stone-400">
          no image — paste one below
        </div>
      )}
      {editable && (
        <>
          <button
            onClick={() => setImgEdit((v) => !v)}
            className="text-[0.65rem] tracking-[0.25em] uppercase text-stone-500 hover:text-ink"
          >
            {garment.image_url ? "Replace image URL" : "Add image URL"}
          </button>
          {imgEdit && (
            <div className="flex gap-1">
              <input
                type="url"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="https://…"
                className="flex-1 border border-stone-300 px-2 py-1 text-[0.7rem]"
              />
              <button
                onClick={async () => {
                  await onPatchImage(imgUrl);
                  setImgEdit(false);
                }}
                className="bg-ink text-ivory px-2 text-[0.6rem] uppercase tracking-[0.2em]"
              >
                Save
              </button>
            </div>
          )}
          <button
            onClick={onRemove}
            className="text-[0.65rem] tracking-[0.25em] uppercase text-red-600 hover:underline"
          >
            Remove from outfit
          </button>
        </>
      )}
      <a
        href={garment.product_url}
        target="_blank"
        rel="noreferrer"
        className="block text-[0.65rem] tracking-[0.25em] uppercase text-stone-500 hover:text-ink truncate"
      >
        {garment.retailer ?? "view source"} →
      </a>
    </div>
  );
}

function SlotRow({
  outfitId,
  slot,
  label,
  required,
  candidates,
  selectedId,
  password,
  onChange,
  disabled,
  expanded = true,
  showArchived = false,
  onToggleExpand,
}: {
  outfitId: string;
  slot: string;
  label: string;
  required: boolean;
  candidates: any[];
  selectedId: string | null;
  password: string;
  onChange: () => void;
  disabled: boolean;
  expanded?: boolean;
  showArchived?: boolean;
  onToggleExpand?: () => void;
}) {
  const [pasteUrl, setPasteUrl] = useState("");
  const addManual = useServerFn(addManualSlotCandidate);
  const select = useServerFn(selectSlotCandidate);
  const clearSlot = useServerFn(clearSlotCandidates);
  const regenerate = useServerFn(regenerateSlotWithAI);
  const reject = useServerFn(rejectSlotCandidate);
  const [regenLoading, setRegenLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  // V3: hide rejected + replaced from primary workflow.
  const activeCandidates = candidates.filter(
    (c) => c.status !== "rejected" && c.status !== "replaced",
  );
  // Only show the latest AI generation. We approximate "latest" by
  // taking the max created_at among AI siblings (replaced rows are
  // already filtered above by selectSlotCandidate / regenerate).
  const aiActive = activeCandidates.filter((c) => c.stylist_source === "ai");
  let latestAiKey: string | null = null;
  if (aiActive.length > 0) {
    const sorted = [...aiActive].sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
    );
    // group by minute bucket as proxy run id
    latestAiKey = String(sorted[0].created_at ?? "").slice(0, 16);
  }
  const liveCandidates = activeCandidates.filter((c) => {
    if (c.stylist_source !== "ai") return true;
    return String(c.created_at ?? "").slice(0, 16) === latestAiKey;
  });
  const visibleCandidates = liveCandidates.slice(0, visibleCount);
  const hiddenCount = Math.max(0, liveCandidates.length - visibleCandidates.length);
  const rejectedCands = candidates.filter((c) => c.status === "rejected");
  const supersededCount = activeCandidates.length - liveCandidates.length;

  const selected = candidates.find((c) => c.id === selectedId) ?? null;

  // Collapsed (filled) view — one-line summary.
  if (!expanded && selected) {
    return (
      <div className="border border-stone-200 px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-emerald-700 text-xs">✓</span>
          <span className="text-[0.6rem] tracking-[0.25em] uppercase text-stone-500 w-24 shrink-0">
            {label}
          </span>
          {selected.image_url && (
            <img
              src={selected.image_url}
              alt=""
              className="w-8 h-8 object-cover border border-stone-200 shrink-0"
            />
          )}
          <span className="text-xs truncate">
            <span className="font-medium">{selected.brand ?? "—"}</span>
            {selected.product_name ? (
              <span className="text-stone-500"> — {selected.product_name}</span>
            ) : null}
          </span>
        </div>
        {!disabled && (
          <button
            onClick={onToggleExpand}
            className="text-[0.6rem] tracking-[0.25em] uppercase text-stone-500 hover:text-ink shrink-0"
          >
            Change
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="border border-stone-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">{label}</span>
          {required && (
            <span className="ml-2 text-[0.6rem] tracking-[0.25em] uppercase text-red-700">
              required
            </span>
          )}
          {selectedId && (
            <span className="ml-2 text-[0.6rem] tracking-[0.25em] uppercase text-emerald-700">
              ✓ selected
            </span>
          )}
        </div>
        {!disabled && (
          <div className="flex items-center gap-3">
            {selectedId && onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="text-[0.6rem] tracking-[0.25em] uppercase text-stone-500 hover:text-ink"
              >
                Collapse
              </button>
            )}
            <button
              onClick={async () => {
                setRegenLoading(true);
                try {
                  await regenerate({
                    data: { password, outfitId, slot: slot as any, count: 6 },
                  });
                  setVisibleCount(6);
                  onChange();
                  toast.success(`AI recommended ${label.toLowerCase()} candidates.`);
                } catch (e) {
                  toast.error((e as Error).message);
                } finally {
                  setRegenLoading(false);
                }
              }}
              disabled={regenLoading}
              className="text-[0.6rem] tracking-[0.25em] uppercase bg-ink text-ivory px-2 py-1 disabled:opacity-40"
            >
              {regenLoading ? "Thinking…" : "Regenerate with AI"}
            </button>
            {candidates.length > 0 && (
              <button
                onClick={async () => {
                  if (!confirm(`Clear all ${label} candidates?`)) return;
                  await clearSlot({ data: { password, outfitId, slot: slot as any } });
                  onChange();
                }}
                className="text-[0.6rem] tracking-[0.25em] uppercase text-stone-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Candidates */}
      {visibleCandidates.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {visibleCandidates.map((c) => {
            const rr = (c.ranking_reasons ?? {}) as {
              why_works?: string;
              why_fits?: string;
            };
            const isAI = c.stylist_source === "ai";
            const editorial = c.editorial_score != null ? Math.round(Number(c.editorial_score) * 10) : null;
            const similarity =
              c.benchmark_similarity != null ? Math.round(Number(c.benchmark_similarity) * 100) : null;
            return (
              <div
                key={c.id}
                className={
                  "border p-2 text-xs space-y-1 " +
                  (c.id === selectedId ? "border-emerald-600 bg-emerald-50/40" : "border-stone-300")
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{c.brand ?? "—"}</span>
                  {isAI && (
                    <span className="text-[0.55rem] tracking-[0.25em] uppercase text-violet-700">
                      AI
                    </span>
                  )}
                </div>
                <div className="text-stone-600 line-clamp-2">
                  {c.product_name ?? c.product_url}
                </div>
                {c.image_url ? (
                  <img src={c.image_url} alt="" className="w-full h-24 object-cover" />
                ) : (
                  <div className="w-full h-24 bg-stone-100 flex items-center justify-center text-[0.6rem] text-stone-400">
                    {isAI ? "AI suggestion — find via retailer" : "no image"}
                  </div>
                )}
                <div className="flex items-center justify-between text-[0.6rem] text-stone-500">
                  <span>{c.retailer ?? "—"}</span>
                  <span>
                    {c.price ? `$${Math.round(Number(c.price))}` : "—"} ·{" "}
                    {c.affiliate_status ?? "pending"}
                  </span>
                </div>
                {(editorial != null || similarity != null) && (
                  <div className="flex gap-3 text-[0.6rem] text-stone-500">
                    {editorial != null && <span>Editorial {editorial}</span>}
                    {similarity != null && <span>Founder sim {similarity}%</span>}
                  </div>
                )}
                {(rr.why_works || rr.why_fits) && (
                  <details className="text-[0.65rem] text-stone-600">
                    <summary className="cursor-pointer text-stone-500">Why it works</summary>
                    {rr.why_works && <p className="mt-1">{rr.why_works}</p>}
                    {rr.why_fits && <p className="mt-1 italic">Fits moment: {rr.why_fits}</p>}
                  </details>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    disabled={disabled}
                    onClick={async () => {
                      await select({
                        data: { password, outfitId, slot: slot as any, candidateId: c.id },
                      });
                      onChange();
                    }}
                    className="flex-1 bg-ink text-ivory px-2 py-1 text-[0.6rem] tracking-[0.2em] uppercase disabled:opacity-40"
                  >
                    {c.id === selectedId ? "Selected ✓" : "Select"}
                  </button>
                  <a
                    href={c.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-stone-300 px-2 py-1 text-[0.6rem] tracking-[0.2em] uppercase text-stone-600"
                  >
                    View
                  </a>
                  <button
                    disabled={disabled}
                    onClick={async () => {
                      await reject({ data: { password, candidateId: c.id } });
                      onChange();
                    }}
                    className="border border-stone-300 px-2 py-1 text-[0.6rem] tracking-[0.2em] uppercase text-stone-500 hover:text-red-600 disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {hiddenCount > 0 && (
        <button
          onClick={() => setVisibleCount((v) => v + 6)}
          className="text-[0.6rem] tracking-[0.25em] uppercase text-stone-500 hover:text-ink"
        >
          Show {hiddenCount} more
        </button>
      )}
      {(supersededCount > 0 || rejectedCands.length > 0) && (
        <div className="text-[0.6rem] text-stone-400 italic">
          {supersededCount > 0 && <span>{supersededCount} superseded · </span>}
          {rejectedCands.length > 0 && <span>{rejectedCands.length} rejected</span>}
        </div>
      )}
      {showArchived && rejectedCands.length > 0 && (
        <details className="text-[0.65rem] text-stone-500" open>
          <summary className="cursor-pointer">Rejected ({rejectedCands.length})</summary>
          <ul className="mt-2 space-y-1">
            {rejectedCands.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <span className="line-through">{c.brand} — {c.product_name}</span>
                {c.product_url && (
                  <a
                    href={c.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-stone-400 underline"
                  >
                    view
                  </a>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Manual paste */}
      {!disabled && (
        <div className="flex gap-2">
          <input
            type="url"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            placeholder={`Paste URL instead — manual override for ${label.toLowerCase()}`}
            className="flex-1 border border-stone-300 px-2 py-1 text-xs"
          />
          <button
            onClick={async () => {
              try {
                await addManual({
                  data: { password, outfitId, slot: slot as any, url: pasteUrl },
                });
                setPasteUrl("");
                onChange();
                toast.success(`${label} added.`);
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            disabled={!pasteUrl}
            className="bg-stone-700 text-ivory px-3 text-[0.65rem] tracking-[0.25em] uppercase disabled:opacity-40"
          >
            Add
          </button>
        </div>
      )}

      {candidates.length === 0 && (
        <p className="text-[0.7rem] text-stone-500 italic">
          Click "Regenerate with AI" to source candidates, or paste a URL to fill manually.
        </p>
      )}
      {selectedId && !disabled && (
        <button
          onClick={async () => {
            await select({
              data: { password, outfitId, slot: slot as any, candidateId: null },
            });
            onChange();
            toast.message(`${label} left empty.`);
          }}
          className="text-[0.6rem] tracking-[0.25em] uppercase text-stone-500 hover:text-ink"
        >
          Leave empty temporarily
        </button>
      )}
    </div>
  );
}

function PublishCard({
  outfit,
  password,
  onChange,
  validateFn,
  publishFn,
}: {
  outfit: any;
  password: string;
  onChange: () => void;
  validateFn: ReturnType<typeof useServerFn>;
  publishFn: ReturnType<typeof useServerFn>;
}) {
  const [title, setTitle] = useState(outfit.title ?? "");
  const [notes, setNotes] = useState(outfit.founder_notes ?? "");
  const [validation, setValidation] = useState<any>(null);

  const runValidate = async () => {
    try {
      const r = await validateFn({ data: { password, outfitId: outfit.id } });
      setValidation(r);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="border-t border-stone-200 pt-4 space-y-3">
      <div className="text-[0.6rem] tracking-[0.32em] uppercase text-stone-500">
        Stage 8 — Publish Founder Look
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Look title (optional)"
        className="w-full border border-stone-300 px-3 py-2 text-sm"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Editorial notes (optional)"
        rows={3}
        className="w-full border border-stone-300 px-3 py-2 text-xs"
      />

      {validation && !validation.ok && (
        <div className="border border-red-300 bg-red-50/40 p-3 text-xs text-red-800">
          <div className="font-medium">Cannot publish yet:</div>
          <ul className="mt-1 pl-4 list-disc">
            {validation.heroGarmentCount === 0 && <li>No Hero garments selected.</li>}
            {validation.missing.map((s: any) => (
              <li key={s.slot}>Missing required slot: {s.label}</li>
            ))}
          </ul>
        </div>
      )}
      {validation && validation.ok && (
        <div className="border border-emerald-300 bg-emerald-50/40 p-3 text-xs text-emerald-800">
          All required slots filled. Ready to publish.
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={runValidate}
          className="border border-ink px-4 py-2 text-[0.65rem] tracking-[0.3em] uppercase"
        >
          Validate
        </button>
        <button
          disabled={!validation?.ok}
          onClick={async () => {
            if (!validation?.ok) return;
            try {
              const r = (await publishFn({
                data: { password, outfitId: outfit.id, title, notes },
              })) as { ok: boolean; founderLookId: string };
              toast.success("Founder Look published ✓");
              // Surface a deep link to the live moment page so the founder
              // can immediately verify the published look overrides the
              // legacy fallback. Mapped via normalizeMomentSlug on the
              // server, so we re-derive the slug from outfit.moment here.
              const momentSlug = (outfit.moment ?? "")
                .toLowerCase()
                .replace(/&/g, " and ")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
              const devSlugMap: Record<string, string> = {
                "arrival-day": "arrival",
                "market-morning": "espresso-morning",
                "beach-club-long-lunch": "beach-club",
                "pool-lounging-and-shopping": "pool-lounging",
                "pool-lounging-shopping": "pool-lounging",
                "explore-the-harbor": "exploring-the-harbor",
              };
              const canonicalMoment = devSlugMap[momentSlug] ?? momentSlug;
              const devUrl = `/portofino/${canonicalMoment}`;
              toast.success(
                <span>
                  View on Dev Page:{" "}
                  <a href={devUrl} className="underline" target="_blank" rel="noreferrer">
                    {devUrl}
                  </a>
                </span>,
                { duration: 10000 },
              );
              onChange();
              window.location.href = `/admin/founder-looks?focus=${r.founderLookId}`;
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
          className="bg-ink text-ivory px-5 py-2 text-[0.7rem] tracking-[0.3em] uppercase disabled:opacity-40"
        >
          Publish Founder Look
        </button>
      </div>
    </div>
  );
}

// ============================================================
// V3 — Current Founder Look summary
// ============================================================
function CurrentLookSummary({
  outfit,
  heroes,
  slotDefs,
  slotSelections,
  customComponents,
  password,
  onChangeSlot,
  onChange,
}: {
  outfit: any;
  heroes: any[];
  slotDefs: Array<{ slot: string; label: string; required: boolean }>;
  slotSelections: Map<string, any>;
  customComponents: Array<{ id: string; name: string; url: string; image_url?: string | null; brand?: string | null }>;
  password: string;
  onChangeSlot: (slot: string) => void;
  onChange: () => void;
}) {
  const heroImg = heroes.find((h) => !!h.image_url)?.image_url ?? null;
  const filled = slotDefs.filter((d) => slotSelections.has(d.slot));
  const remaining = slotDefs.filter((d) => d.required && !slotSelections.has(d.slot));

  return (
    <div className="border border-emerald-300 bg-emerald-50/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[0.6rem] tracking-[0.32em] uppercase text-emerald-800">
          Current Founder Look
        </div>
        <div className="text-[0.6rem] tracking-[0.25em] uppercase text-stone-500">
          {filled.length}/{slotDefs.filter((d) => d.required).length} required filled
          {remaining.length > 0 && (
            <span className="text-amber-700"> · {remaining.length} remaining</span>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="bg-stone-100 aspect-[3/4] flex items-center justify-center overflow-hidden">
          {heroImg ? (
            <img src={heroImg} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[0.6rem] text-stone-400">No hero image</span>
          )}
        </div>
        <div className="space-y-2 text-xs">
          <div>
            <div className="text-[0.55rem] tracking-[0.3em] uppercase text-stone-500">
              Hero Garments
            </div>
            <ul className="mt-1 space-y-0.5">
              {heroes.map((h) => (
                <li key={h.id}>
                  <span className="font-medium">{h.brand ?? "—"}</span>
                  {h.product_name ? <span className="text-stone-500"> — {h.product_name}</span> : null}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[0.55rem] tracking-[0.3em] uppercase text-stone-500">
              Accessories
            </div>
            <ul className="mt-1 space-y-0.5">
              {slotDefs.map((d) => {
                const sel = slotSelections.get(d.slot);
                return (
                  <li
                    key={d.slot}
                    className="flex items-center justify-between gap-2 border-b border-emerald-100 last:border-0 py-0.5"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-[0.55rem] tracking-[0.25em] uppercase text-stone-500 w-24 shrink-0">
                        {d.label}
                      </span>
                      {sel ? (
                        <span className="truncate">
                          <span className="font-medium">{sel.brand}</span>
                          {sel.product_name && (
                            <span className="text-stone-500"> — {sel.product_name}</span>
                          )}
                        </span>
                      ) : (
                        <span className="italic text-stone-400">
                          {d.required ? "needs decision" : "optional"}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => onChangeSlot(d.slot)}
                      className="text-[0.55rem] tracking-[0.25em] uppercase text-stone-500 hover:text-ink shrink-0"
                    >
                      {sel ? "Change" : "Open"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          {customComponents.length > 0 && (
            <div>
              <div className="text-[0.55rem] tracking-[0.3em] uppercase text-stone-500">
                Optional Components
              </div>
              <ul className="mt-1 space-y-0.5">
                {customComponents.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium">{c.name}</span>
                    {c.brand ? <span className="text-stone-500"> — {c.brand}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-[0.55rem] tracking-[0.25em] uppercase text-stone-500 pt-1">
            Status: {outfit.status}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// V3 — Optional / custom components editor
// ============================================================
function OptionalComponentsEditor({
  outfitId,
  password,
  components,
  onChange,
  disabled,
}: {
  outfitId: string;
  password: string;
  components: Array<{ id: string; name: string; url: string; image_url?: string | null; brand?: string | null; notes?: string | null; price?: number | null }>;
  onChange: () => void;
  disabled: boolean;
}) {
  const addFn = useServerFn(addCustomComponent);
  const removeFn = useServerFn(removeCustomComponent);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-dashed border-stone-300 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[0.6rem] tracking-[0.32em] uppercase text-stone-500">
            Optional Components
          </div>
          <div className="text-[0.65rem] text-stone-500 mt-1">
            Belt, suitcase, scarf, pareo, evening clutch, watch — anything the look needs.
          </div>
        </div>
        {!disabled && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-[0.6rem] tracking-[0.25em] uppercase border border-ink px-3 py-1"
          >
            {open ? "Cancel" : "Add Custom Item"}
          </button>
        )}
      </div>

      {components.length > 0 && (
        <ul className="divide-y divide-stone-200">
          {components.map((c) => (
            <li key={c.id} className="py-2 flex items-center gap-3">
              {c.image_url ? (
                <img src={c.image_url} alt="" className="w-10 h-10 object-cover border border-stone-200" />
              ) : (
                <div className="w-10 h-10 bg-stone-100" />
              )}
              <div className="flex-1 min-w-0 text-xs">
                <div className="font-medium truncate">
                  {c.name}
                  {c.brand ? <span className="text-stone-500 font-normal"> — {c.brand}</span> : null}
                </div>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[0.6rem] text-stone-500 underline truncate block"
                  >
                    {c.url}
                  </a>
                )}
              </div>
              {!disabled && (
                <button
                  onClick={async () => {
                    if (!confirm(`Remove ${c.name}?`)) return;
                    await removeFn({ data: { password, outfitId, componentId: c.id } });
                    onChange();
                  }}
                  className="text-[0.55rem] tracking-[0.25em] uppercase text-stone-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {open && !disabled && (
        <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-stone-200">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Component name (Suitcase, Belt, Pareo…)"
            className="border border-stone-300 px-2 py-1 text-xs"
          />
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand (optional)"
            className="border border-stone-300 px-2 py-1 text-xs"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Retail URL"
            className="border border-stone-300 px-2 py-1 text-xs sm:col-span-2"
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="border border-stone-300 px-2 py-1 text-xs sm:col-span-2"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="border border-stone-300 px-2 py-1 text-xs sm:col-span-2"
          />
          <button
            disabled={!name || !url}
            onClick={async () => {
              try {
                await addFn({
                  data: {
                    password,
                    outfitId,
                    component: {
                      name,
                      url,
                      brand: brand || null,
                      image_url: imageUrl || null,
                      notes: notes || null,
                    },
                  },
                });
                setName("");
                setUrl("");
                setBrand("");
                setImageUrl("");
                setNotes("");
                setOpen(false);
                onChange();
                toast.success("Custom component added.");
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="bg-ink text-ivory px-3 py-1 text-[0.6rem] tracking-[0.25em] uppercase disabled:opacity-40 sm:col-span-2"
          >
            Add to Outfit
          </button>
        </div>
      )}
    </div>
  );
}