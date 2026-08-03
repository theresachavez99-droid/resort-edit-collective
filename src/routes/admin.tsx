import { useState } from "react";
import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { checkAdminSession, verifyAdmin } from "@/lib/admin-auth.functions";
import { getQueueBadge } from "@/lib/replacement-queue.functions";

/**
 * /admin layout — server-side gate for the whole Studio surface.
 *
 * Every admin server function already verifies the password, so no data can
 * leak without it. This layout closes the remaining gap: the admin shell HTML
 * itself is no longer served to an unauthenticated request. The check reads a
 * signed httpOnly cookie minted by `verifyAdmin`, so it cannot be faked from
 * the browser (unlike the per-page sessionStorage unlock it sits in front of).
 */
export const Route = createFileRoute("/admin")({
  loader: () => checkAdminSession(),
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { ok } = Route.useLoaderData();
  if (ok)
    return (
      <>
        <StudioNav />
        <Outlet />
      </>
    );
  return <AdminUnlock />;
}

/**
 * Persistent Studio nav strip. Its only job is the unresolved replacement
 * count, so a failed product link is never invisible while working elsewhere in
 * the Studio. Internal surface — never rendered on public pages.
 */
function StudioNav() {
  const badgeFn = useServerFn(getQueueBadge);
  const badge = useQuery({
    queryKey: ["queue-badge"],
    queryFn: () => badgeFn(),
    refetchInterval: 60_000,
  });
  const unresolved = badge.data?.unresolved ?? 0;

  return (
    <nav className="border-b border-stone-200 bg-ivory/90 backdrop-blur px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
      <Link to="/admin" className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500">
        Studio
      </Link>
      <Link
        to="/admin/product-health/queue"
        className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[0.65rem] tracking-[0.24em] uppercase ${
          unresolved > 0 ? "border-red-700 text-red-700" : "border-stone-300 text-stone-500"
        }`}
      >
        Editorial Queue
        <span
          className={`inline-flex min-w-6 justify-center px-1.5 py-0.5 text-[0.7rem] tracking-normal ${
            unresolved > 0 ? "bg-red-700 text-white" : "bg-stone-200 text-stone-600"
          }`}
        >
          {unresolved}
        </span>
      </Link>
    </nav>
  );
}

function AdminUnlock() {
  const router = useRouter();
  const verify = useServerFn(verifyAdmin);
  const [pw, setPw] = useState("");

  const auth = useMutation({
    mutationFn: () => verify({ data: { password: pw } }),
    onSuccess: async () => {
      // Child pages read this key for their own server-function calls.
      sessionStorage.setItem("admin_dashboard_pw", pw);
      await router.invalidate();
    },
  });

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-500 mb-2">
        Internal Only
      </p>
      <h1 className="font-serif text-3xl mb-6">Studio</h1>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Admin password"
        autoComplete="current-password"
        className="w-full border border-stone-300 px-3 py-2 mb-3"
        onKeyDown={(e) => {
          if (e.key === "Enter" && pw) auth.mutate();
        }}
      />
      <button
        onClick={() => auth.mutate()}
        disabled={!pw || auth.isPending}
        className="bg-ink text-ivory px-5 py-2 text-[0.7rem] tracking-[0.24em] uppercase disabled:opacity-40"
      >
        {auth.isPending ? "Checking…" : "Enter"}
      </button>
      {auth.error && (
        <p className="text-red-600 text-xs mt-3">Unauthorized</p>
      )}
    </main>
  );
}