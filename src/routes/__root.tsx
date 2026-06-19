import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import appCss from "../styles.css?url";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import heroMuseAsset from "@/assets/hero-muse-portofino-majolica.png.asset.json";
import { absoluteUrl } from "@/lib/site";
import { DayImageOverridesProvider } from "@/data/dayImageRegistry";
import { loadCanonicalDayImageOverrides } from "@/lib/day-images.functions";

const dayOverridesQueryOptions = queryOptions({
  queryKey: ["canonical-day-image-overrides"],
  queryFn: () => loadCanonicalDayImageOverrides(),
  staleTime: 5 * 60_000,
});

const SHARE_IMAGE = absoluteUrl(heroMuseAsset.url);

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dayOverridesQueryOptions).catch(() => ({})),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Resort Edit | Dressed for the destination." },
      { name: "description", content: "Resort Edit | Dressed for the destination. Discover destination guides, resort edits, and brands we love." },
      { name: "author", content: "Resort Edit" },
      { property: "og:title", content: "Resort Edit | Dressed for the destination." },
      { property: "og:description", content: "Resort Edit | Dressed for the destination. Discover destination guides, resort edits, and brands we love." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: SHARE_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ResortEdit" },
      { name: "twitter:image", content: SHARE_IMAGE },
      { name: "twitter:title", content: "Resort Edit | Dressed for the destination." },
      { name: "twitter:description", content: "Resort Edit | Dressed for the destination. Discover destination guides, resort edits, and brands we love." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { data: dayOverrides } = useSuspenseQuery(dayOverridesQueryOptions);

  return (
    <QueryClientProvider client={queryClient}>
      <DayImageOverridesProvider value={dayOverrides ?? {}}>
        <div className="min-h-screen flex flex-col bg-ivory">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </DayImageOverridesProvider>
    </QueryClientProvider>
  );
}
