import { useId, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeEmail } from "@/lib/subscribers.functions";

type Variant = "footer" | "inline-light";

const CONSENT_COPY = "Thoughtfully curated inspiration. Occasionally delivered.";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

const TIMEOUT = "resort-edit-timeout";

/** Bounded wait so a stalled request never leaves the form looking dead. */
function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(TIMEOUT)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function deriveDestination(pathname: string): string | undefined {
  // /portofino, /portofino/..., /destinations/portofino...
  const m =
    pathname.match(/^\/destinations\/([^/]+)/) || pathname.match(/^\/([a-z0-9-]+?)(?:[/.-]|$)/i);
  return m?.[1]?.toLowerCase();
}

export function NewsletterForm({
  ctaSource,
  variant = "footer",
  buttonLabel = "Get the Next Edit",
  placeholder = "Enter your email",
}: {
  ctaSource: string;
  variant?: Variant;
  buttonLabel?: string;
  placeholder?: string;
}) {
  const subscribe = useServerFn(subscribeEmail);
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "success"; alreadySubscribed: boolean }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const submit = async (raw: string) => {
    const value = raw.trim().toLowerCase();
    if (!EMAIL_RE.test(value) || value.length > 255) {
      setState({ kind: "error", message: "Please enter a valid email address." });
      return;
    }
    setState({ kind: "loading" });
    try {
      const pathname = typeof window !== "undefined" ? window.location.pathname : undefined;
      const res = await withTimeout(
        subscribe({
          data: {
            email: value,
          source_page: pathname,
          destination: pathname ? deriveDestination(pathname) : undefined,
            cta_source: ctaSource,
          },
        }),
      );
      if (res.ok) {
        setState({ kind: "success", alreadySubscribed: !!res.alreadySubscribed });
      } else {
        setState({ kind: "error", message: res.error });
      }
    } catch (err) {
      const msg =
        err instanceof Error && err.message === TIMEOUT
          ? "That took too long. Please try again."
          : "We couldn't reach us just now. Please try again.";
      setState({ kind: "error", message: msg });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(email);
  };

  const isFooter = variant === "footer";
  const isLoading = state.kind === "loading";

  // ── Success state ─────────────────────────────────────────────
  if (state.kind === "success") {
    const msg = state.alreadySubscribed
      ? "You're already on the list. We'll send the next Resort Edit to your inbox."
      : "You're on the list. We'll send the next Resort Edit to your inbox.";
    return isFooter ? (
      <div className="mt-7 w-full max-w-xl flex flex-col items-center text-center">
        <p role="status" aria-live="polite" className="font-serif italic text-lg text-gold max-w-md">
          {msg}
        </p>
        <p className="mt-2 text-[0.7rem] text-ivory/55 max-w-md leading-relaxed">
          Saved to the list — no need to submit again.
        </p>
      </div>
    ) : (
      <div className="w-full">
        <p role="status" aria-live="polite" className="font-serif italic text-[0.95rem] text-ink/80">
          {msg}
        </p>
        <p className="mt-1 text-[0.7rem] text-ink/55 leading-relaxed">
          Saved to the list — no need to submit again.
        </p>
      </div>
    );
  }

  // ── Footer variant ────────────────────────────────────────────
  if (isFooter) {
    return (
      <div className="w-full max-w-xl mt-7 flex flex-col items-center">
        <form
          onSubmit={onSubmit}
          aria-busy={isLoading}
          className="flex flex-col sm:flex-row gap-2 w-full"
        >
          <label htmlFor={inputId} className="sr-only">
            Email address
          </label>
          <input
            id={inputId}
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 h-14 bg-transparent border border-ivory/30 px-5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="eyebrow h-14 bg-gold text-ink px-10 hover:bg-ivory transition-colors whitespace-nowrap disabled:opacity-60"
          >
            {isLoading ? "Saving…" : `${buttonLabel} →`}
          </button>
        </form>
        <p className="mt-3 text-[0.7rem] text-ivory/55 max-w-md leading-relaxed">{CONSENT_COPY}</p>
        {state.kind === "error" && (
          <p role="alert" aria-live="assertive" className="mt-2 text-xs text-red-300">
            {state.message}
          </p>
        )}
      </div>
    );
  }

  // ── Inline-light variant (View Full Look bar) ─────────────────
  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        aria-busy={isLoading}
        className="flex flex-col sm:flex-row gap-2 w-full"
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 h-11 bg-transparent border border-ink/25 px-4 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="eyebrow h-11 bg-ink text-ivory px-5 hover:bg-gold hover:text-ink transition-colors whitespace-nowrap text-[0.7rem] tracking-[0.28em] disabled:opacity-60"
        >
          {isLoading ? "Saving…" : buttonLabel}
        </button>
      </form>
      <p className="mt-2 text-[0.7rem] text-ink/55 leading-relaxed">{CONSENT_COPY}</p>
      {state.kind === "error" && (
        <p role="alert" aria-live="assertive" className="mt-1 text-xs text-red-600">
          {state.message}
        </p>
      )}
    </div>
  );
}
