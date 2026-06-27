import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeEmail } from "@/lib/subscribers.functions";

type Variant = "footer" | "inline-light";

const CONSENT_COPY =
  "Be the first to receive new destination edits, hotel discoveries, curated packing guides, and exclusive Resort Edit releases.";

function deriveDestination(pathname: string): string | undefined {
  // /portofino, /portofino/..., /destinations/portofino...
  const m =
    pathname.match(/^\/destinations\/([^/]+)/) ||
    pathname.match(/^\/([a-z0-9-]+?)(?:[\/.-]|$)/i);
  return m?.[1]?.toLowerCase();
}

export function NewsletterForm({
  ctaSource,
  variant = "footer",
  buttonLabel = "Get the Next Edit",
  placeholder = "Email address",
}: {
  ctaSource: string;
  variant?: Variant;
  buttonLabel?: string;
  placeholder?: string;
}) {
  const subscribe = useServerFn(subscribeEmail);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "success"; alreadySubscribed: boolean }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TEMP DEBUG — remove after newsletter flow is confirmed working end-to-end.
    console.log("[newsletter] submit fired", { email, ctaSource });
    if (!email.trim()) return;
    setState({ kind: "loading" });
    try {
      const pathname =
        typeof window !== "undefined" ? window.location.pathname : undefined;
      const payload = {
        data: {
          email: email.trim(),
          source_page: pathname,
          destination: pathname ? deriveDestination(pathname) : undefined,
          cta_source: ctaSource,
        },
      };
      console.log("[newsletter] calling subscribeEmail", payload);
      const res = await subscribe(payload);
      console.log("[newsletter] subscribeEmail result", res);
      if (res.ok) {
        setState({ kind: "success", alreadySubscribed: !!res.alreadySubscribed });
      } else {
        setState({ kind: "error", message: res.error });
      }
    } catch (err) {
      console.error("[newsletter] subscribeEmail threw", err);
      const msg =
        err instanceof Error ? err.message : "Network error. Please try again.";
      setState({ kind: "error", message: msg });
    }
  };

  const isFooter = variant === "footer";

  // ── Success state ─────────────────────────────────────────────
  if (state.kind === "success") {
    const msg = state.alreadySubscribed
      ? "You're already on the list."
      : "You're on the list for the next edit.";
    return isFooter ? (
      <p className="mt-7 font-serif italic text-lg text-gold max-w-md">{msg}</p>
    ) : (
      <p className="font-serif italic text-[0.95rem] text-ink/80">{msg}</p>
    );
  }

  // ── Footer variant ────────────────────────────────────────────
  if (isFooter) {
    return (
      <div className="w-full max-w-xl mt-7 flex flex-col items-center">
        <form
          onSubmit={onSubmit}
          className="flex flex-col sm:flex-row gap-2 w-full"
        >
          <input
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            disabled={state.kind === "loading"}
            className="flex-1 h-14 bg-transparent border border-ivory/30 px-5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={state.kind === "loading"}
            className="eyebrow h-14 bg-gold text-ink px-10 hover:bg-ivory transition-colors whitespace-nowrap disabled:opacity-60"
          >
            {state.kind === "loading" ? "Saving…" : `${buttonLabel} →`}
          </button>
        </form>
        <p className="mt-3 text-[0.7rem] text-ivory/55 max-w-md leading-relaxed">
          {CONSENT_COPY}
        </p>
        {state.kind === "error" && (
          <p className="mt-2 text-xs text-red-300">{state.message}</p>
        )}
      </div>
    );
  }

  // ── Inline-light variant (View Full Look bar) ─────────────────
  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row gap-2 w-full"
      >
        <input
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={state.kind === "loading"}
          className="flex-1 h-11 bg-transparent border border-ink/25 px-4 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state.kind === "loading"}
          className="eyebrow h-11 bg-ink text-ivory px-5 hover:bg-gold hover:text-ink transition-colors whitespace-nowrap text-[0.7rem] tracking-[0.28em] disabled:opacity-60"
        >
          {state.kind === "loading" ? "Saving…" : buttonLabel}
        </button>
      </form>
      <p className="mt-2 text-[0.7rem] text-ink/55 leading-relaxed">
        {CONSENT_COPY}
      </p>
      {state.kind === "error" && (
        <p className="mt-1 text-xs text-red-600">{state.message}</p>
      )}
    </div>
  );
}