/**
 * SSR-safe resolution of the preview-staging flag.
 *
 * The pure rules live in `./preview-staging`; this server function resolves
 * them against the actual request host so staged blocks are decided on the
 * server (no hydration dependency, no flash, and the production hostname's
 * HTML never contains staged markup).
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { queryOptions } from "@tanstack/react-query";
import { previewStagingDefault } from "./preview-staging";

export const getPreviewStaging = createServerFn({ method: "GET" }).handler(async () => {
  const host = getRequestHeader("host") ?? "";
  const hostname = host.split(":")[0] ?? "";
  return { staging: previewStagingDefault(hostname) };
});

export const previewStagingQuery = () =>
  queryOptions({
    queryKey: ["preview-staging"],
    queryFn: () => getPreviewStaging(),
    staleTime: Infinity,
  });
